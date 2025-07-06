"use client";
import { v4 as uuidv4 } from "uuid";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { Message, Conversation } from "../types";

export default function AdminDashboard() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showBlockModal, setShowBlockModal] = useState<string | null>(null);
  const [blockDuration, setBlockDuration] = useState(30);
  const [isBlocking, setIsBlocking] = useState(false);

  const blockDevice = async (fingerprint: string) => {
    try {
      setIsBlocking(true);
      const response = await fetch("/api/blocked-devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint,
          club: session?.user?.club,
          duration: blockDuration,
        }),
      });

      if (response.ok) {
        if (socket) {
          socket.emit("block-device", {
            fingerprint,
            timeRemaining: blockDuration * 60,
          });
          alert(
            `Device blocked successfully. User will be disconnected and blocked for ${blockDuration} minutes.`
          );
        }

        setShowBlockModal(null);
        loadConversations();

        if (selectedConversation?.fingerprint === fingerprint) {
          setSelectedConversation(null);
          setMessages([]);
        }
      } else {
        console.error("Failed to block device - server error");
      }
    } catch (error) {
      console.error("Failed to block device:", error);
    } finally {
      setIsBlocking(false);
    }
  };

  const loadConversations = useCallback(async () => {
    if (session?.user?.club) {
      try {
        const response = await fetch(
          `/api/conversations?club=${session.user.club}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setConversations(data);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user?.club) return;

    const socketInstance = io({ transports: ["websocket"] });
    setSocket(socketInstance);

    socketInstance.emit("user-join", {
      userName: `${session!.user!.club} Admin`,
      club: session!.user!.club,
      userType: "admin",
    });

    socketInstance.on("new-conversation", (conversation) => {
      console.log("New conversation received:", conversation);
      setConversations((prev) => [conversation, ...prev]);
      loadConversations();
    });

    socketInstance.on("receive-private-message", (message: Message) => {
      console.log("Admin received message:", message);
      setMessages((prev) => {
        const currentMessages = Array.isArray(prev) ? prev : [];
        return [...currentMessages, message];
      });

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === message.conversationId
            ? {
                ...conv,
                lastMessage: {
                  content: message.content,
                  timestamp: message.timestamp,
                },
              }
            : conv
        )
      );
    });

    loadConversations();

    const interval = setInterval(() => {
      loadConversations();
    }, 5000);

    return () => {
      socketInstance.disconnect();
      clearInterval(interval);
    };
  }, [session, loadConversations]);

  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/messages?conversationId=${selectedConversation._id}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to refresh messages:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);

    if (socket) {
      if (selectedConversation) {
        socket.emit("admin-leave-conversation", {
          conversationId: selectedConversation._id,
        });
      }

      socket.emit("admin-join-conversation", {
        conversationId: conversation._id,
        adminName: `${session?.user?.club} Admin`,
      });
    }

    try {
      const response = await fetch(
        `/api/messages?conversationId=${conversation._id}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (
      !newMessage.trim() ||
      !socket ||
      !selectedConversation ||
      !session?.user
    )
      return;

    if (!session.user.club) {
      console.error("Club is missing from session!");
      return;
    }

    const messageData: Message = {
      // Remove this line: _id: uuidv4(),
      content: newMessage,
      senderName: `${session.user.club} Admin`,
      senderType: "admin",
      club: session.user.club!,
      conversationId: selectedConversation._id,
      timestamp: new Date(),
    };

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      const savedMessage = await response.json();

      setMessages((prev) => {
        const currentMessages = Array.isArray(prev) ? prev : [];
        return [...currentMessages, savedMessage]; // Use the saved message with MongoDB-generated _id
      });

      socket.emit("send-private-message", savedMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setConversations((prev) =>
          prev.filter((conv) => conv._id !== conversationId)
        );

        if (selectedConversation?._id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);

          if (socket) {
            socket.emit("admin-leave-conversation", { conversationId });
          }
        }

        setShowDeleteConfirm(null);
      } else {
        console.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    if (socket) {
      socket.disconnect();
    }
    await signOut({ callbackUrl: "/admin/login" });
  };

  if (!session) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Fixed at top */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user!.club} Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage conversations and support requests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user!.email}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full height minus header */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Conversations Sidebar - Fixed width */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Conversations
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {conversations.length} conversation(s)
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {Array.isArray(conversations) &&
              conversations.map((conversation) => {
                const user =
                  conversation.participants &&
                  Array.isArray(conversation.participants)
                    ? conversation.participants.find((p) => p.type === "user")
                    : null;

                return (
                  <div
                    key={conversation._id ?? Math.random()}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 relative group transition-colors ${
                      selectedConversation?._id === conversation._id
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                  >
                    <div onClick={() => selectConversation(conversation)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">
                          {user?.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(conversation.updatedAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-mono mb-2">
                        ID:{" "}
                        {conversation.userId
                          ? conversation.userId.substring(0, 8) + "..."
                          : "No ID"}
                      </div>

                      {conversation.lastMessage && (
                        <div className="text-sm text-gray-600 truncate pr-16">
                          {conversation.lastMessage.content}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBlockModal(
                            conversation.fingerprint || conversation._id
                          );
                        }}
                        className="bg-orange-500 text-white p-1.5 rounded hover:bg-orange-600 transition-colors"
                        title="Block device"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(conversation._id);
                        }}
                        className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                        title="Delete conversation"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

            {conversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">💬</div>
                <div className="font-medium mb-2">No conversations yet</div>
                <div className="text-sm">New chats will appear here</div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window - Takes remaining space */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Chat with{" "}
                    {selectedConversation?.participants &&
                    Array.isArray(selectedConversation.participants)
                      ? selectedConversation.participants.find(
                          (p) => p.type === "user"
                        )?.name || "Unknown User"
                      : "Unknown User"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    User ID: {selectedConversation.userId?.substring(0, 8)}...
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setShowBlockModal(
                        selectedConversation.fingerprint ||
                          selectedConversation._id
                      )
                    }
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                      />
                    </svg>
                    <span>Block User</span>
                  </button>
                  <button
                    onClick={() =>
                      setShowDeleteConfirm(selectedConversation._id)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Delete Chat</span>
                  </button>
                </div>
              </div>

              {/* Messages Area - Flexible height */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {Array.isArray(messages) &&
                  messages.map((message, index) => (
                    <div
                      key={message._id ?? index}
                      className={`flex ${
                        message.senderType === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.senderType === "admin"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                        }`}
                      >
                        <div
                          className={`font-semibold text-xs mb-1 ${
                            message.senderType === "admin"
                              ? "text-blue-100"
                              : "text-blue-600"
                          }`}
                        >
                          {message.senderName}
                        </div>
                        <div className="text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-2 ${
                            message.senderType === "admin"
                              ? "text-blue-200"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <div className="text-2xl font-semibold mb-2 text-gray-700">
                  Select a conversation
                </div>
                <div className="text-gray-600">
                  Choose a conversation from the sidebar to start chatting
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same */}
      {/* Block Device Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Block Device</h3>
            <p className="text-gray-600 mb-4">
              Block this device from accessing the chat system. The user will be
              immediately disconnected.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block Duration (minutes)
              </label>
              <input
                type="number"
                value={blockDuration}
                onChange={(e) =>
                  setBlockDuration(parseInt(e.target.value) || 30)
                }
                min="1"
                max="1440"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: 1440 minutes (24 hours)
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBlockModal(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isBlocking}
              >
                Cancel
              </button>
              <button
                onClick={() => blockDevice(showBlockModal)}
                disabled={isBlocking}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {isBlocking && (
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <span>{isBlocking ? "Blocking..." : "Block Device"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Conversation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this conversation? This action
              cannot be undone and will remove all messages.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConversation(showDeleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting && (
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

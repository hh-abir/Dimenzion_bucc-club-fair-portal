"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types";

interface ChatModalProps {
  club: "BUCC" | "BURC" | "BUAC";
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ club, isOpen, onClose }: ChatModalProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection and event listeners
  useEffect(() => {
    if (isOpen) {
      console.log("Initializing socket connection...");
      const socketInstance = io();
      setSocket(socketInstance);

      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance.id);
      });

      socketInstance.on("receive-private-message", (message: Message) => {
        console.log("User received message from socket:", message);
        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          return [...currentMessages, message];
        });
      });

      socketInstance.on("admin-joined", ({ adminName }) => {
        console.log("Admin joined notification:", adminName);
        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          return [...currentMessages];
        });
      });

      return () => {
        console.log("Disconnecting socket...");
        socketInstance.disconnect();
      };
    }
  }, [isOpen, club]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (convId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?conversationId=${convId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error("API response is not an array:", data);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    if (userName.trim() && socket) {
      try {
        setIsLoading(true);

        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, club }),
        });

        const conversation = await response.json();
        setConversationId(conversation._id);

        socket.emit("user-join", { userName, club, userType: "user" });
        socket.emit("join-conversation", {
          conversationId: conversation._id,
          userName,
          userType: "user",
        });

        setIsJoined(true);
        await loadMessages(conversation._id);
      } catch (error) {
        console.error("Failed to start conversation:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() && socket && userName && conversationId) {
      const messageData = {
        content: newMessage,
        senderName: userName,
        senderType: "user" as const,
        club,
        conversationId,
        timestamp: new Date(),
      };

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageData),
        });

        if (!response.ok) {
          throw new Error("Failed to save message to database");
        }

        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          return [...currentMessages, messageData];
        });

        socket.emit("send-private-message", messageData);
        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Chat Widget Container */}
      <div
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-80 h-96"
        }`}
      >
        {/* Chat Header */}
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="font-semibold text-sm">{club} Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-gray-200 transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? "⬆️" : "⬇️"}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 flex flex-col h-80">
            {!isJoined ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Start Chat
                    </h3>
                    <p className="text-sm text-gray-600">
                      We&apos;re here to help!
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !isLoading && startConversation()
                    }
                    disabled={isLoading}
                  />
                  <button
                    onClick={startConversation}
                    disabled={isLoading || !userName.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading ? "Starting..." : "Start Chat"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                  {isLoading ? (
                    <div className="text-center text-gray-500 py-4">
                      <div className="animate-pulse">Loading messages...</div>
                    </div>
                  ) : Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={`${message.conversationId}-${index}`}
                        className={`flex ${
                          message.senderType === "user" &&
                          message.senderName === userName
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.senderType === "user" &&
                            message.senderName === userName
                              ? "bg-blue-600 text-white rounded-br-none"
                              : message.senderType === "admin"
                              ? "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                              : "bg-yellow-100 text-gray-800 border border-yellow-200"
                          }`}
                        >
                          {message.senderType === "admin" && (
                            <div className="font-semibold text-xs text-blue-600 mb-1">
                              {message.senderName}
                            </div>
                          )}
                          <div>{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.senderType === "user" &&
                              message.senderName === userName
                                ? "text-blue-200"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <div className="text-2xl mb-2">👋</div>
                      <div className="text-sm">
                        Welcome! How can we help you today?
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
        onClick={onClose}
      ></div>
    </>
  );
}

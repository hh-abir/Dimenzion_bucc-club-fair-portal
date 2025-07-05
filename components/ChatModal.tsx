"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import { Message } from "../types";

export interface ChatModalProps {
  club: string;
  isOpen: boolean;
  onClose: () => void;
}

const generateBrowserFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Browser fingerprint", 2, 2);
  }

  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
  };

  return btoa(JSON.stringify(fingerprint)).slice(0, 32);
};

const generateOrGetUserId = (club: string): string => {
  const storageKey = `chatUserId_${club}`;
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    userId = uuidv4() ?? "";
    localStorage.setItem(storageKey, userId);
  }

  return userId;
};

export default function ChatModal({ club, isOpen, onClose }: ChatModalProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<string>("");

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUserName = localStorage.getItem(`chatUserName_${club}`);
    if (savedUserName) {
      setUserName(savedUserName);
    }
    const userIdFromStorage = generateOrGetUserId(club);
    setUserId(userIdFromStorage);
  }, [club]);

  const checkDeviceStatus = useCallback(async () => {
    const fingerprint = generateBrowserFingerprint();
    try {
      const response = await fetch("/api/device-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint, club, userId }),
      });

      const data = await response.json();
      if (data.blocked) {
        setIsBlocked(true);
        setBlockTimeRemaining(data.timeRemaining);
      }
    } catch (error) {
      console.error("Failed to check device status:", error);
    }
  }, [club, userId]);
  useEffect(() => {
    if (isOpen) {
      checkDeviceStatus();
    }
  }, [checkDeviceStatus, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

  useEffect(() => {
    if (isOpen && !isBlocked) {
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
          return [
            ...currentMessages,
            {
              content: `${adminName} joined the conversation`,
              senderName: "System",
              senderType: "admin" as const,
              club,
              timestamp: new Date(),
              conversationId: conversationId || "",
              userId: userId,
            },
          ];
        });
      });

      return () => {
        console.log("Disconnecting socket...");
        socketInstance.disconnect();
      };
    }
  }, [isOpen, club, isBlocked, conversationId, userId]);

  useEffect(() => {
    if (!isJoined || !conversationId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/messages?conversationId=${conversationId}`
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          if (data.length !== messages.length) {
            setMessages(data);
          }
        }
      } catch (error) {
        console.error("Polling failed in ChatModal:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isJoined, conversationId, messages.length]);

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
    if (userName.trim() && socket && !isBlocked && userId) {
      try {
        setIsLoading(true);
        localStorage.setItem(`chatUserName_${club}`, userName);
        const fingerprint = generateBrowserFingerprint();

        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, club, fingerprint, userId }),
        });

        const conversation = await response.json();
        if (conversation.blocked) {
          setIsBlocked(true);
          setBlockTimeRemaining(conversation.timeRemaining);
          return;
        }
        setConversationId(conversation._id);

        socket.emit("user-join", {
          userName,
          club,
          userType: "user",
          fingerprint,
          userId,
        });
        socket.emit("join-conversation", {
          conversationId: conversation._id,
          userName,
          userType: "user",
          userId,
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
    if (
      newMessage.trim() &&
      socket &&
      userName &&
      conversationId &&
      !isBlocked &&
      userId
    ) {
      const fingerprint = generateBrowserFingerprint();

      const messageData = {
        content: newMessage,
        senderName: userName,
        senderType: "user" as const,
        club,
        conversationId,
        fingerprint,
        userId,
        timestamp: new Date(),
      };

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageData),
        });

        const result = await response.json();

        if (result.blocked) {
          setIsBlocked(true);
          setBlockTimeRemaining(result.timeRemaining);

          setMessages((prev) => {
            const currentMessages = Array.isArray(prev) ? prev : [];
            return [
              ...currentMessages,
              {
                content: `You have been blocked: ${result.reason}`,
                senderName: "System",
                senderType: "admin" as const,
                club,
                timestamp: new Date(),
                userId: userId,
                conversationId: conversationId,
              },
            ];
          });

          if (socket) {
            socket.disconnect();
          }
          return;
        }

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

        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          return [
            ...currentMessages,
            {
              content: "Failed to send message. Please try again.",
              senderName: "System",
              senderType: "admin" as const,
              club,
              timestamp: new Date(),
              userId: userId,
              conversationId: conversationId,
            },
          ];
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  if (isBlocked) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 h-64">
        <div className="bg-red-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="font-semibold text-sm">Device Blocked</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 p-6 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Access Blocked
          </h3>
          <p className="text-gray-600 mb-4">
            Your device has been temporarily blocked from accessing this chat.
          </p>
          <div className="text-2xl font-bold text-red-600">
            {formatTime(blockTimeRemaining)}
          </div>
          <p className="text-sm text-gray-500 mt-2">Time remaining</p>
          <div className="text-xs text-gray-400 mt-2">
            User ID: {userId.substring(0, 8)}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          isMinimized ? "w-80 h-16" : "w-80 h-96"
        }`}
      >
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="font-semibold text-sm">{club} Support</span>
            {userId && (
              <span className="text-xs bg-blue-500 px-2 py-1 rounded">
                ID: {userId.substring(0, 6)}
              </span>
            )}
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

        {!isMinimized && (
          <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 flex flex-col h-80">
            {!isJoined ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {userName ? `Welcome Back, ${userName}!` : "Start Chat"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      We&apos;re here to help!
                    </p>
                    {userId && (
                      <p className="text-xs text-gray-400 mt-1">
                        Your ID: {userId.substring(0, 8)}...
                      </p>
                    )}
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
                    {isLoading
                      ? "Starting..."
                      : userName
                      ? "Continue Chat"
                      : "Start Chat"}
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                          message.userId === userId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.senderType === "user" &&
                            message.userId === userId
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
                              message.userId === userId
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
                        Welcome back, {userName}! How can we help you today?
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                  {isBlocked ? (
                    <div className="text-center py-4">
                      <div className="text-red-600 font-semibold mb-2">
                        🚫 You have been blocked
                      </div>
                      <div className="text-sm text-gray-600">
                        Time remaining: {formatTime(blockTimeRemaining)}
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
        onClick={onClose}
      ></div>
    </>
  );
}

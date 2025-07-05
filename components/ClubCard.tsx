"use client";

import { useState } from "react";
import ChatModal from "./ChatModal";

interface ClubCardProps {
  club: "BUCC" | "BURC" | "BUAC";
  name: string;
  description: string;
}

export default function ClubCard({ club, name, description }: ClubCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <p className="text-gray-600 mb-4">{description}</p>

        {/* Regular button for desktop */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 mb-4"
        >
          💬 Chat with {club}
        </button>

        {/* Floating chat button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          title={`Chat with ${club}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.013 9.013 0 01-5.618-1.96l-3.675.975.975-3.675A8.959 8.959 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>

      <ChatModal
        club={club}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}

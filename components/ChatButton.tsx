"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Modal/Popup */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Chat with us</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                We&apos;d love to hear from you! Send us a message and
                we&apos;ll get back to you soon.
              </p>
              {/* You can integrate your actual chat system here */}
              <div className="text-center text-gray-500">
                Chat system integration coming soon...
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { useState } from "react";
import { ArrowRight, Calendar, X } from "lucide-react";

export default function EmbedToggle() {
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <button
          onClick={() => setShowEmbed(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 group"
        >
          <Calendar className="h-5 w-5" />
          View Schedule
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Overlay */}
      {showEmbed && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-white bg-opacity-30
            transition
          "
          style={{
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="
              relative
              bg-white
              border-4 border-blue-600
              rounded-xl
              shadow-2xl
              w-[98vw] max-w-6xl
              h-[92vh]
              flex flex-col
              overflow-hidden
              animate-fadeIn
            "
          >
            {/* Close Button */}
            <button
              onClick={() => setShowEmbed(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 bg-white bg-opacity-80 p-2 rounded-full shadow transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            {/* Iframe */}
            <iframe
              src="https://dimenzion.bracucc.org/" // Replace with your desired URL
              title="Embedded Site"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Play } from "lucide-react";

export default function ScrollToVideoButton() {
  const handleScrollToVideo = () => {
    document
      .getElementById("featured-video")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={handleScrollToVideo}
      className="group inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-white/20 hover:border-white/40"
    >
      <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
      <span>Watch Video</span>
    </button>
  );
}

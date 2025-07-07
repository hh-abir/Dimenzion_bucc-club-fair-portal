"use client";

import { FaSearch } from "react-icons/fa";
import { Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const router = useRouter();

  const handleScheduleClick = () => {
    router.push("/schedule");
  };

  return (
    <div className="w-full flex justify-center -mt-16 mb-10 z-20 relative px-4">
      <div className="relative w-full max-w-3xl flex items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search for clubs..."
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-4 py-3 rounded-md shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition-all duration-200 bg-white/80 backdrop-blur-md hover:shadow-md"
          />
        </div>

        {/* Reused Schedule Button */}
        <button
          onClick={handleScheduleClick}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg group"
        >
          <Calendar className="h-5 w-5" />
          <span>Schedule</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

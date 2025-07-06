import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full flex justify-center -mt-16 mb-10 z-20 relative px-4">
      <div className="relative w-full max-w-2xl">
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search for clubs..."
          value={value}
          onChange={onChange}
          className="w-full pl-12 pr-6 py-3 rounded-full shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all duration-200 hover:shadow-lg bg-white/80 backdrop-blur-md"
        />
      </div>
    </div>
  );
}

import { MessageCircle } from "lucide-react";
import ChatModal from "./ChatModal";
interface PageProp {
  club: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ChatButton({ club, isOpen, setIsOpen }: PageProp) {
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
      <ChatModal club={club} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

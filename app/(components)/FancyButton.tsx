import { ButtonHTMLAttributes } from "react";
import { FiArrowRight } from "react-icons/fi";

export function FancyButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`relative w-full py-2 px-6 rounded-full font-semibold flex items-center justify-center gap-2
        bg-white/10 backdrop-blur-md border border-white/30
        shadow-lg transition-all duration-300
        hover:scale-105 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600
        hover:text-white hover:shadow-2xl
        before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-blue-400 before:to-indigo-400 before:opacity-0 hover:before:opacity-30 before:transition-opacity before:-z-10
      `}
    >
      {children}
      <FiArrowRight className="ml-1" />
    </button>
  );
}

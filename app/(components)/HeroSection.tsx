import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaChevronDown,
} from "react-icons/fa";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      {/* GIF Background */}
      <div
        className="absolute inset-0 z-0 w-full h-full"
        style={{
          backgroundImage: "url('/cover.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          // Removed opacity to make the GIF vivid
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <Image src="/logo.png" alt="Logo" width={120} height={120} />
        <h1 className="mt-6 text-5xl font-extrabold tracking-wide text-center drop-shadow-lg">
          DIMENZION: <span className="block">Connect in New Dimension</span>
        </h1>
        <p className="mt-4 text-xl font-medium text-center">
          BRAC University Club Fair, Summer 2025
        </p>
        <p className="mt-2 text-lg font-semibold text-center">
          Performance Schedule – Stage Timeline
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6 text-lg font-medium">
          <span className="flex items-center gap-2">
            <FaCalendarAlt /> July 20, 2025
          </span>
          <span className="flex items-center gap-2">
            <FaClock /> 10:00 AM – 5:00 PM
          </span>
          <span className="flex items-center gap-2">
            <FaMapMarkerAlt /> BRAC University Auditorium
          </span>
        </div>
      </div>
      {/* Scroll Down Icon */}
      <a
        href="#search-bar"
        className="absolute left-1/2 -translate-x-1/2 bottom-8 z-20 animate-bounce cursor-pointer"
        aria-label="Scroll down"
      >
        <FaChevronDown size={36} />
      </a>
    </section>
  );
}

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IClub } from "@/types/club";
import { FancyButton } from "./FancyButton";

export default function ClubCard({ club }: { club: IClub }) {
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setShowPreview(true), 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setShowPreview(false);
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all hover:scale-105 hover:-translate-y-1 hover:shadow-2xl duration-300 border border-gray-100">
      {/* Cover Image */}
      <div className="relative w-full h-36 bg-gray-200">
        <Image
          src={club.clubPhoto || "/fallback-cover.jpg"}
          alt={club.clubName || "Club cover"}
          fill
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      {/* Club Logo */}
      <div className="flex justify-center -mt-12 z-10 relative">
        <Image
          src={club.clubLogo || "/fallback-logo.png"}
          alt={`${club.clubName || "Club"} Logo`}
          width={96}
          height={96}
          className="rounded-full border-4 border-white shadow-lg bg-white object-contain"
          loading="lazy"
        />
      </div>
      {/* Content */}
      <div className="p-4 text-center">
        <h3 className="text-xl font-extrabold text-gray-800">
          {club.clubName}
        </h3>
        {club.clubMotto && (
          <p className="text-gray-500 text-sm italic mt-1">{club.clubMotto}</p>
        )}
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {club.aboutSection ||
            "This club is a dynamic space where students explore, innovate, and grow together."}
        </p>
        <div className="relative mt-4">
          <Link href={`/${club.clubId}`} passHref>
            <FancyButton
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label={`View details for ${club.clubName}`}
              type="button"
            >
              View Details
            </FancyButton>
          </Link>
          {showPreview && (
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-20 animate-fade-in text-left">
              <h4 className="text-lg font-bold mb-2 text-gray-800">
                {club.clubName}
              </h4>
              <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                {club.aboutSection}
              </p>
              {club.clubMotto && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {club.clubMotto}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroSectionProps {
  clubPhoto: string;
  clubLogo: string;
  clubName: string;
  clubMotto?: string;
}

export default function HeroSection({
  clubPhoto,
  clubLogo,
  clubName,
  clubMotto,
}: HeroSectionProps) {
  const fallbackCover =
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80";
  const fallbackLogo =
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  const [logoError, setLogoError] = useState(false);
  const coverPhoto = clubPhoto || fallbackCover;
  const logoImage = logoError ? fallbackLogo : clubLogo || fallbackLogo;

  return (
    <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-gray-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={coverPhoto}
          alt="Club Cover"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Optional overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-50" />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      {/* Club Logo and Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
        <div className="max-w-6xl mx-auto flex items-end space-x-6">
          <div className="flex-shrink-0 relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden">
            {/* Logo fallback: we manually switch to <img> if next/image fails */}
            {!logoError ? (
              <Image
                src={logoImage}
                alt={`${clubName} Logo`}
                fill
                className="object-cover rounded-full"
                onError={() => setLogoError(true)}
              />
            ) : (
              <img
                src={fallbackLogo}
                alt="Fallback Logo"
                className="w-full h-full object-cover rounded-full"
              />
            )}
          </div>
          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
              {clubName || "Club Name"}
            </h1>
            {clubMotto && (
              <p className="text-lg md:text-xl text-gray-200 italic drop-shadow-md">
                {clubMotto}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

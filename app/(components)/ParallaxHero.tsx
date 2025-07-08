"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";

const ParallaxHero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Throttle scroll events for better performance
  const throttle = useCallback(
    <T extends (...args: unknown[]) => void>(func: T, limit: number) => {
      let inThrottle: boolean;
      return function (this: unknown, ...args: Parameters<T>) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },
    []
  );

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollY(window.scrollY);
    }, 10);

    const handleMouseMove = throttle((...args: unknown[]) => {
      const e = args[0] as MouseEvent;
      setMouseX((e.clientX - window.innerWidth / 2) / window.innerWidth);
      setMouseY((e.clientY - window.innerHeight / 2) / window.innerHeight);
    }, 16);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [throttle]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-purple-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Background Cover */}
      <div
        className="parallax-layer absolute inset-0 w-full h-full"
        style={{
          transform: `translate3d(${mouseX * 20}px, ${
            scrollY * 0.1 + mouseY * 20
          }px, 0) scale(1.1)`,
          zIndex: 1,
        }}
      >
        <Image
          src="/assets/dimenzion_hero/main-cover.png"
          alt="Dimensional background"
          fill
          className="object-cover object-center"
          priority
          quality={95}
        />
      </div>

      {/* Main Character - Bottom Center */}
      <div
        className="parallax-layer absolute inset-0 w-full h-full flex items-center justify-center mt-40"
        style={{
          transform: `translate3d(${mouseX * 30}px, ${
            scrollY * 0.2 + mouseY * 30
          }px, 0) scale(0.8)`,
          zIndex: 2,
        }}
      >
        <div className="relative w-full h-3/4 max-w-4xl">
          <Image
            src="/assets/dimenzion_hero/DIMENZON-MAIN-Character.png"
            alt="Main dimensional character"
            fill
            className="object-contain object-bottom"
            priority
            quality={95}
          />
        </div>
      </div>

      {/* Atmospheric overlay effects */}
      <div className="absolute inset-0 z-3 bg-gradient-to-t from-blue-500/20 via-transparent to-purple-500/20 pointer-events-none" />

      {/* Glowing portal effect in center */}
      <div
        className="absolute inset-0 z-4 flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate3d(${mouseX * 15}px, ${mouseY * 15}px, 0)`,
        }}
      >
        <div className="w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-white/10 to-cyan-300/10 blur-2xl animate-ping" />
      </div>

      {/* DIMENZON Title - Main Text */}
      <div
        className="parallax-layer absolute inset-0 z-10 flex items-center justify-center -mt-46 p-6 md:p-0"
        style={{
          transform: `translate3d(${mouseX * 25}px, ${
            scrollY * 0.3 + mouseY * 25
          }px, 0)`,
        }}
      >
        <div className="relative w-full h-full max-w-6xl">
          <Image
            src="/assets/dimenzion_hero/DIMENZON-TITLE-TEXT.png"
            alt="Dimenzion title"
            fill
            className="object-contain object-center"
            priority
            quality={95}
          />
        </div>
      </div>

      {/* Connect in New Dimension Text - Below Title */}
      <div
        className="parallax-layer absolute inset-0 z-11 flex items-center justify-center -mt-46 p-6 md:p-0"
        style={{
          transform: `translate3d(${mouseX * 20}px, ${
            scrollY * 0.4 + mouseY * 20 + 100
          }px, 0)`,
        }}
      >
        <div className="relative w-full h-full max-w-5xl">
          <Image
            src="/assets/dimenzion_hero/Connect-in-New-Dimension-Text.png"
            alt="Connect in new dimension"
            fill
            className="object-contain object-center opacity-90"
            priority
            quality={95}
          />
        </div>
      </div>

      {/* BRAC Logo - Top Section */}
      <div
        className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 z-20"
        style={{
          transform: `translate3d(${mouseX * 10}px, ${mouseY * 10}px, 0)`,
        }}
      >
        <div className="backdrop-blur-md bg-black/30 rounded-xl md:rounded-2xl p-3 md:p-6 border border-cyan-500/30">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-16 h-16 md:w-16 md:h-16 relative">
              <Image
                src="/assets/bracu-logo.webp"
                alt="BRAC University Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Details - Bottom Section - Responsive */}
      <div
        className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 md:px-8 z-20"
        style={{
          transform: `translate3d(${mouseX * 5}px, ${
            mouseY * 5 + scrollY * 0.1
          }px, 0)`,
        }}
      >
        {/* Mobile: Three Compact Columns */}
        <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
          <div className="backdrop-blur-md bg-black/10 rounded-lg p-2 border border-blue-500/20">
            <div className="flex flex-col items-center gap-1">
              <FiCalendar className="text-blue-400 text-sm" />
              <div className="text-center">
                <p className="text-white font-semibold text-xs">July 8-9</p>
                <p className="text-blue-300 text-xs">2025</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-md bg-black/10 rounded-lg p-2 border border-purple-500/20">
            <div className="flex flex-col items-center gap-1">
              <FiClock className="text-purple-400 text-sm" />
              <div className="text-center">
                <p className="text-white font-semibold text-xs">11AM-4:30PM</p>
                <p className="text-purple-300 text-xs">Full Day</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-md bg-black/10 rounded-lg p-2 border border-cyan-500/20">
            <div className="flex flex-col items-center gap-1">
              <FiMapPin className="text-cyan-400 text-sm" />
              <div className="text-center">
                <p className="text-white font-semibold text-xs">
                  Multipurpose Hall
                </p>
                <p className="text-cyan-300 text-xs">BRAC University</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Three Columns, Full Details */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-md bg-black/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <FiCalendar className="text-blue-400 text-2xl" />
              <div>
                <p className="text-white font-bold text-lg">July 8-9, 2025</p>
                <p className="text-blue-300 text-sm">Two Days Event</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-md bg-black/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <FiClock className="text-purple-400 text-2xl" />
              <div>
                <p className="text-white font-bold text-lg">
                  11:00 AM – 4:30 PM
                </p>
                <p className="text-purple-300 text-sm">Full Day Experience</p>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-md bg-black/20 rounded-xl p-6 border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <FiMapPin className="text-cyan-400 text-2xl" />
              <div>
                <p className="text-white font-bold text-lg">
                  Multipurpose Hall
                </p>
                <p className="text-cyan-300 text-sm">BRAC University</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-cyan-400 rounded-full flex justify-center bg-cyan-400/10 backdrop-blur-sm">
            <div className="w-1 h-2 md:h-3 bg-cyan-400 rounded-full mt-1 md:mt-2 animate-bounce"></div>
          </div>
          <p className="text-xs md:text-sm mt-2 text-cyan-300 font-medium">
            Enter the Dimension
          </p>
        </div>
      </div>

      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-5">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </div>
  );
};

export default ParallaxHero;

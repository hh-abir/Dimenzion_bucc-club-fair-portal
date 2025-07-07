"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import ImageCarousel from "@/components/ImageCarousel";
import Image from "next/image";

import { ExternalLink, ArrowRight, ExternalLinkIcon } from "lucide-react";
import { FaExternalLinkAlt } from "react-icons/fa";

import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaGithub,
  FaGlobe,
} from "react-icons/fa";

import type { IClub } from "@/models/Club";
import ChatButton from "@/components/ChatButton";
import EmbedToggle from "../EmbedToggle";

interface ClubPageClientProps {
  club: IClub;
}

function getRandomClubs(clubs: IClub[], count: number): IClub[] {
  const shuffled = [...clubs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function ClubPageClient({ club }: ClubPageClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const youtubeId = club.youtubeLink
    ? extractYouTubeId(club.youtubeLink)
    : null;

  const [otherClubs, setOtherClubs] = useState<IClub[]>([]);

  useEffect(() => {
    fetch("/api/clubs")
      .then((res) => res.json())
      .then((data) => setOtherClubs(data.clubs || []))
      .catch((err) => console.error("Error fetching clubs:", err));
  }, []);

  const importantLinks = [
    {
      title: "BRACU Website",
      link: "https://www.bracu.ac.bd/",
    },

    {
      title: "Report Bug",
      link: "",
    },
  ];

  const supportedPlatforms = [
    "twitter",
    "facebook",
    "instagram",
    "linkedin",
    "youtube",
    "github",
    "website",
  ];

  // Filter social links: only non-empty and supported
  const socialEntries = Object.entries(club.socialLinks || {}).filter(
    ([platform, url]) =>
      supportedPlatforms.includes(platform.toLowerCase()) &&
      url &&
      url.length > 0
  ) as [keyof typeof club.socialLinks, string][];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[48vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Cover Image */}
        <img
          src={club.clubPhoto}
          alt={`${club.clubName} Cover`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col justify-end">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8 px-4 sm:px-10 pb-6 sm:pb-10">
            {/* Club Logo */}
            <img
              src={club.clubLogo}
              alt={`${club.clubName} Logo`}
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg mb-3 sm:mb-0"
            />
            {/* Club Name, Motto, Socials */}
            <div className="text-white text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight">
                {club.clubName}
              </h1>
              {club.clubMotto && (
                <p className="text-xs sm:text-sm md:text-lg text-blue-100 mt-1">
                  {club.clubMotto}
                </p>
              )}
              {/* Social Links */}
              {socialEntries.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                  {socialEntries.map(([platform, url]) => {
                    const Icon = getSocialIcon(platform);
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-200 hover:text-white transition-colors"
                        aria-label={platform}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - 70-80% width */}
          <div className="lg:w-3/4 space-y-16">
            {/* About Section */}
            <section className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">About Us</h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown>{club.aboutSection}</ReactMarkdown>
              </div>
            </section>

            {/* Featured Video Section */}
            {youtubeId && (
              <section id="featured-video" className="rounded-3xl mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Featured Video
                </h2>
                <div className="aspect-video rounded-3xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Club Video"
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* Activities Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">★</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Our Activities
                </h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown>{club.activitiesSection}</ReactMarkdown>
              </div>
            </section>

            {/* Gallery Section */}
            {club.carouselImages.length > 0 && (
              <section className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">📸</span>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900">Gallery</h2>
                </div>
                <ImageCarousel images={club.carouselImages} />
              </section>
            )}

            {/* Why Join Us Section */}
            <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🚀</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Why Join Us?
                </h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ReactMarkdown>{club.whyJoinUsSection}</ReactMarkdown>
              </div>
            </section>
          </div>

          {/* Sidebar - 20-30% width */}
          <div className="lg:w-1/4 space-y-6">
            {/* Schedule Button */}
            <EmbedToggle shadow={true} />

            {/* Advertisement Section */}
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Ads</p>
                <a
                  href="https://bitbattles.bracucc.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <Image
                      src="https://i.ibb.co/HLXZd2Mz/515315613-1601477264572319-2541953006725104500-n.jpg"
                      alt="Advertisement"
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-3 text-sm text-blue-600 group-hover:text-blue-800 transition-colors">
                    Learn More →
                  </div>
                </a>
              </div>
            </div>

            {/* Other Clubs Section */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Other Clubs
              </h3>
              <div className="space-y-4">
                {otherClubs.length === 0 ? (
                  <div className="text-gray-500 text-sm italic">
                    No other clubs available yet.
                  </div>
                ) : (
                  getRandomClubs(otherClubs, 4).map((otherClub) => (
                    <a
                      key={otherClub.clubId}
                      href={`/${otherClub.clubId}`}
                      className="block group"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                        <img
                          src={otherClub.clubLogo}
                          alt={`${otherClub.clubName} Logo`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {otherClub.clubName}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {otherClub.clubMotto}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>

            {/* Important Link Section */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Important Links
                </h3>
              </div>

              <div className="space-y-3">
                {importantLinks.map((item, index) => (
                  <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
                          {item.title}
                        </h4>
                        <ExternalLinkIcon className="h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section - Full Width */}
        <section className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl px-8 py-6 md:px-12 md:py-8 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full opacity-5"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Join?
              </h2>
              <p className="text-sm md:text-base mb-6 text-blue-100 max-w-2xl mx-auto leading-snug">
                Take the first step towards an amazing journey with{" "}
                <span className="font-semibold text-white">
                  {club.clubName}
                </span>
              </p>
              <a
                href={club.registrationFormLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-3 bg-white text-blue-600 px-8 py-3 rounded-full text-base font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                <span>Register Now</span>
                <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </div>

      <ChatButton
        club={club.clubId}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />
    </div>
  );
}

// Helper function to extract YouTube ID
function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to get the correct icon for each platform
function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "twitter":
      return FaTwitter;
    case "facebook":
      return FaFacebook;
    case "instagram":
      return FaInstagram;
    case "linkedin":
      return FaLinkedin;
    case "youtube":
      return FaYoutube;
    case "github":
      return FaGithub;
    case "website":
      return FaGlobe;
    default:
      return FaExternalLinkAlt;
  }
}

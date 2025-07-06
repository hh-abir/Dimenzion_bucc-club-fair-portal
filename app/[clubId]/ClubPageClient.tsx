"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import ImageCarousel from "@/components/ImageCarousel";
import {
  ExternalLink,
  Calendar,
  ArrowRight,
  Newspaper,
  ExternalLinkIcon,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
} from "lucide-react";

import type { IClub } from "@/models/Club";
import ChatButton from "@/components/ChatButton";
import Link from "next/link";

interface ClubPageClientProps {
  club: IClub;
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

  const newsItems = [
    {
      title: "University Newsletter - July 2025",
      date: "2025-07-01",
      link: "/newsletter/july-2025",
    },
    {
      title: "Campus Weekly Updates",
      date: "2025-06-28",
      link: "/newsletter/campus-weekly",
    },
    {
      title: "Student Activities Report",
      date: "2025-06-25",
      link: "/newsletter/activities-report",
    },
  ];

  // Prepare socialLinks entries that actually exist
  const socialEntries = Object.entries(club.socialLinks || {}).filter(
    ([url]) => url && url.length > 0
  ) as [keyof typeof club.socialLinks, string][];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={club.clubPhoto}
            alt={`${club.clubName} Cover`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Bottom black gradient overlay for readability */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10" />

        {/* Content - Club Logo + Name + Motto + Social Links */}
        <div className="relative z-20 h-full flex items-end px-6 sm:px-12 pb-10">
          <div className="flex items-center space-x-6">
            {/* Club Logo */}
            <img
              src={club.clubLogo}
              alt={`${club.clubName} Logo`}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />

            {/* Club Name + Motto + Social Links */}
            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-bold">
                {club.clubName}
              </h1>
              <p className="text-sm md:text-lg text-blue-100 mt-1">
                {club.clubMotto}
              </p>

              {/* Social Links */}
              {socialEntries.length > 0 && (
                <div className="flex space-x-4 mt-4">
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
                        <Icon className="w-6 h-6" />
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
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <Link
                href="/schedule" // Replace with your schedule route
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 group"
              >
                <Calendar className="h-5 w-5" />
                <span>View Schedule</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

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
                    <img
                      src="https://scontent.fzyl2-2.fna.fbcdn.net/v/t39.30808-6/515315613_1601477264572319_2541953006725104500_n.png?stp=dst-jpg_tt6&_nc_cat=100&ccb=1-7&_nc_sid=2285d6&_nc_eui2=AeFYUywbEEeuuAB5DwOPp5KTDuf34ZTR3dcO5_fhlNHd178k-g9NhD7uSjbJMRZeZZZcjJlbutIWHH-Bq6Y1qBww&_nc_ohc=N5Qsos2RW3YQ7kNvwFjLebM&_nc_oc=AdmopBSk5ucXvxLlDsjxxCgvxsfclJ-Coizm_u2nJZtCRSxBg4x6kYg81YSJCacliGI&_nc_zt=23&_nc_ht=scontent.fzyl2-2.fna&_nc_gid=H1tUr87M3dwDjpTgmc6LCg&oh=00_AfSCer2ADMkUFGWm3XbHbeCLewLjiE35Lt949NRnW2unHQ&oe=68702327"
                      alt="Advertisement"
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
                  otherClubs.map((otherClub) => (
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

            {/* Newsletter Section */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Newspaper className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Newsletter</h3>
              </div>
              <div className="space-y-3">
                {newsItems.map((news, index) => (
                  <a key={index} href={news.link} className="block group">
                    <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm mb-1">
                        {news.title}
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          Monthly
                        </span>
                      </h4>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(news.date).toLocaleDateString()}
                        </span>
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
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full opacity-5"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Join?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Take the first step towards an amazing journey with{" "}
                <span className="font-semibold text-white">
                  {club.clubName}
                </span>
              </p>
              <a
                href={club.registrationFormLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-3 bg-white text-blue-600 px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
              >
                <span>Register Now</span>
                <ExternalLink className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
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

function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "twitter":
      return Twitter;
    case "facebook":
      return Facebook;
    case "instagram":
      return Instagram;
    case "linkedin":
      return Linkedin;
    case "youtube":
      return Youtube;

    case "github":
      return Github;
    case "website":
      return ExternalLink;
    default:
      return ExternalLink;
  }
}

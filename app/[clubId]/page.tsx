import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import connectDB from "@/lib/mongodb";
import Club, { IClub } from "@/models/Club";
import ImageCarousel from "@/components/ImageCarousel";
import ChatButton from "@/components/ChatButton";
import ScrollToVideoButton from "@/components/ScrollToVideoButton";
import { ExternalLink, Play } from "lucide-react";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const club = await getClubData(clubId);

  if (!club) {
    notFound();
  }

  const youtubeId = club.youtubeLink
    ? extractYouTubeId(club.youtubeLink)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${club.clubPhoto})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Club Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-110"></div>
              <img
                src={club.clubLogo}
                alt={`${club.clubName} Logo`}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl"
              />
            </div>
          </div>

          {/* Club Name with Animated Text */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {club.clubName}
            </span>
          </h1>

          {/* Club Motto */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            {club.clubMotto}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={club.registrationFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <span>Join Our Club</span>
              <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>

            {youtubeId && <ScrollToVideoButton />}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
            <span className="text-sm font-medium">Scroll Down</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* About Section */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
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
          <section
            id="featured-video"
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 md:p-12 shadow-xl"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">Featured Video</h2>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Club Video"
                className="w-full h-full"
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
            <h2 className="text-4xl font-bold text-gray-900">Our Activities</h2>
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
            <h2 className="text-4xl font-bold text-gray-900">Why Join Us?</h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown>{club.whyJoinUsSection}</ReactMarkdown>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center">
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

      <ChatButton />
    </div>
  );
}

// Helper functions remain the same
async function getClubData(clubId: string): Promise<IClub | null> {
  try {
    await connectDB();
    const club = await Club.findOne({ clubId }).lean();
    return club ? JSON.parse(JSON.stringify(club)) : null;
  } catch (error) {
    console.error("Error fetching club:", error);
    return null;
  }
}

function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

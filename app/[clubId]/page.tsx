import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import connectDB from "@/lib/mongodb";
import Club, { IClub } from "@/models/Club";
import ImageCarousel from "@/components/ImageCarousel";
import ChatButton from "@/components/ChatButton";
import HeroSection from "@/components/HeroSection"; // if you moved it to its own component
import { ExternalLink } from "lucide-react";

// Fetch club data from DB
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

// Extract YouTube ID from URL
function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// ✅ This is the correct and minimal Page Component type signature
export default async function ClubPage({
  params,
}: {
  params: { clubId: string };
}) {
  const club = await getClubData(params.clubId);

  if (!club) {
    notFound();
  }

  const youtubeId = club.youtubeLink
    ? extractYouTubeId(club.youtubeLink)
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <HeroSection
        clubPhoto={club.clubPhoto}
        clubLogo={club.clubLogo}
        clubName={club.clubName}
        clubMotto={club.clubMotto}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* About Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Us</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <ReactMarkdown>{club.aboutSection}</ReactMarkdown>
          </div>
        </section>

        {/* YouTube Video */}
        {youtubeId && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Featured Video
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
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
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Our Activities
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <ReactMarkdown>{club.activitiesSection}</ReactMarkdown>
          </div>
        </section>

        {/* Image Carousel */}
        {club.carouselImages.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Gallery</h2>
            <ImageCarousel images={club.carouselImages} />
          </section>
        )}

        {/* Why Join Us */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why Join Us?
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <ReactMarkdown>{club.whyJoinUsSection}</ReactMarkdown>
          </div>
        </section>

        {/* Registration Button */}
        <section className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Take the first step towards an amazing journey with{" "}
              {club.clubName}
            </p>
            <a
              href={club.registrationFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <span>Register Now</span>
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </section>
      </div>

      {/* Floating Chat Button */}
      <ChatButton />
    </div>
  );
}

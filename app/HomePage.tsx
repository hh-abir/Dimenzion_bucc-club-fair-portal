"use client";
import { useState, useEffect } from "react";
import HeroSection from "./(components)/HeroSection";
import SearchBar from "./(components)/SearchBar";
import ClubCard from "./(components)/ClubCard";
import { IClub } from "@/types/club";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/clubs");
        const data = await res.json();
        setClubs(data.clubs || []);
      } catch (err) {
        console.error("Failed to fetch clubs", err);
      }
      setLoading(false);
    };
    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter(
    (club) =>
      club.clubName.toLowerCase().includes(search.toLowerCase()) ||
      club.clubId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <HeroSection />
      {/* Add gap here properly */}
      <div className="h-16 sm:h-24 md:h-32" /> {/* adjustable spacing */}
      {/* Search Bar Section */}
      <div id="search-bar" className="container mx-auto px-4 pb-8">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        {loading ? (
          <p className="text-center text-gray-500">Loading clubs...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredClubs.length === 0 ? (
              <p className="col-span-3 text-center text-gray-500">
                No clubs found.
              </p>
            ) : (
              filteredClubs.map((club) => (
                <ClubCard key={club._id} club={club} />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

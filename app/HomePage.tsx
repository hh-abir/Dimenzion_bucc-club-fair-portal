"use client";
import { useState, useEffect } from "react";
import { motion, easeOut } from "framer-motion";
import HeroSection from "./(components)/HeroSection";
import SearchBar from "./(components)/SearchBar";
import ClubCard from "./(components)/ClubCard";
import { IClub } from "@/types/club";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState<IClub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);

      const cachedClubs = localStorage.getItem("cachedClubs");
      const cachedTimestamp = localStorage.getItem("cachedClubsTimestamp");
      const now = Date.now();
      const maxAge = 1000 * 60 * 10; // 10 minutes

      if (
        cachedClubs &&
        cachedTimestamp &&
        now - parseInt(cachedTimestamp) < maxAge
      ) {
        setClubs(JSON.parse(cachedClubs));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/clubs");
        const data = await res.json();

        if (data.clubs) {
          setClubs(data.clubs);
          localStorage.setItem("cachedClubs", JSON.stringify(data.clubs));
          localStorage.setItem("cachedClubsTimestamp", now.toString());
        }
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

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: easeOut },
    },
  };

  return (
    <main>
      <HeroSection />
      <div className="h-16 sm:h-24 md:h-32" />

      <div id="search-bar" className="container mx-auto px-4 pb-8">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        {loading ? (
          <p className="text-center text-gray-500">Loading clubs...</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredClubs.length === 0 ? (
              <p className="col-span-3 text-center text-gray-500">
                No clubs found.
              </p>
            ) : (
              shuffleArray(filteredClubs).map((club) => (
                <motion.div key={club._id} variants={cardVariants}>
                  <ClubCard club={club} />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}

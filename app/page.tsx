import ClubCard from "../components/ClubCard";

export default function Home() {
  const clubs = [
    {
      club: "BUCC",
      name: "BRAC University Computer Club",
      description: "Join our programming and tech community!",
    },
    {
      club: "BURC",
      name: "BRAC University Robotics Club",
      description: "Explore the world of robotics and automation!",
    },
    {
      club: "BUAC",
      name: "BRAC University Adventure Club",
      description: "Adventure awaits! Join our outdoor activities!",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          BRAC University Clubs
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard
              key={club.club}
              club={club.club}
              name={club.name}
              description={club.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

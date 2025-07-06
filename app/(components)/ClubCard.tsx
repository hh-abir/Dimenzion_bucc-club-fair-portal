import Image from "next/image";
import Link from "next/link";
import { IClub } from "@/types/club";

interface ClubCardProps {
  club: IClub;
}

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-4 transition-transform hover:scale-105">
      <div className="relative w-full h-32">
        <Image
          src={club.clubPhoto}
          alt={club.clubName}
          fill
          className="object-cover"
        />
      </div>
      <div className="relative -mt-10 mb-2">
        <Image
          src={club.clubLogo}
          alt={`${club.clubName} Logo`}
          width={80}
          height={80}
          className="rounded-full border-4 border-white shadow-md"
        />
      </div>
      <h3 className="text-xl font-bold text-center">{club.clubName}</h3>
      <p className="text-gray-600 text-center mb-4">{club.clubMotto}</p>
      <Link href={`/${club.clubId}`}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
          View Details
        </button>
      </Link>
    </div>
  );
}

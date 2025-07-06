import { notFound } from "next/navigation";
import ClubPageClient from "./ClubPageClient";
import connectDB from "@/lib/mongodb";
import Club from "@/models/Club";

export default async function ClubPage({
  params,
}: {
  params: { clubId: string };
}) {
  const { clubId } = params;
  await connectDB();
  const club = await Club.findOne({ clubId }).lean();

  if (!club) notFound();

  const clubData = JSON.parse(JSON.stringify(club));

  return <ClubPageClient club={clubData} />;
}

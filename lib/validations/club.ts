import { z } from "zod";

export const clubSchema = z.object({
  clubId: z.string().min(1, "Club ID is required"),
  clubPhoto: z.string().min(1, "Club photo is required"),
  clubLogo: z.string().min(1, "Club logo is required"),
  clubName: z.string().min(1, "Club name is required"),
  clubMotto: z.string().optional(),
  aboutSection: z.string().min(1, "About section is required"),
  youtubeLink: z
    .string()
    .url("Invalid YouTube URL")
    .optional()
    .or(z.literal("")),
  activitiesSection: z.string().min(1, "Activities section is required"),
  carouselImages: z
    .array(
      z.object({
        url: z.string(),
        id: z.string().optional(),
      })
    )
    .min(1, "At least one carousel image is required"),
  whyJoinUsSection: z.string().min(1, "Why join us section is required"),
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().optional(),
    youtube: z.string().optional(),
    discord: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  registrationFormLink: z.string().url("Invalid registration form URL"),
});

export type ClubFormData = z.infer<typeof clubSchema>;

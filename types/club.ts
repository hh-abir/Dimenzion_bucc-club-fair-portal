// types/club.ts
export interface IClub {
  _id?: string;
  clubId: string;
  clubPhoto: string;
  clubLogo: string;
  clubName: string;
  clubMotto?: string;
  aboutSection: string;
  youtubeLink?: string;
  activitiesSection: string;
  carouselImages: {
    url: string;
    id?: string;
  }[];
  whyJoinUsSection: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
    discord?: string;
    instagram?: string;
    linkedin?: string;
  };
  registrationFormLink: string;
  createdAt?: Date;
  updatedAt?: Date;
}

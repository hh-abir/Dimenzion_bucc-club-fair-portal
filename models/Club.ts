import mongoose from "mongoose";

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

const ClubSchema = new mongoose.Schema<IClub>(
  {
    clubId: { type: String, required: true, unique: true },
    clubPhoto: {
      type: String,
      required: true,
      default:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
    },
    clubLogo: {
      type: String,
      required: true,
      default:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    clubName: {
      type: String,
      required: true,
      default: "Your Club Name",
    },
    clubMotto: {
      type: String,
      default: "Your Club Motto",
    },
    aboutSection: {
      type: String,
      required: true,
      default: `# About Our Club

Welcome to our amazing club! We are dedicated to bringing together passionate individuals who share common interests and goals.

## Our Mission
- Foster a community of like-minded individuals
- Provide learning and growth opportunities
- Create lasting friendships and professional networks
- Make a positive impact in our community

## What We Offer
- Regular meetings and events
- Workshops and skill-building sessions
- Networking opportunities
- Community service projects

*Update this section with your club's specific information using the Page Builder.*`,
    },
    youtubeLink: { type: String },
    activitiesSection: {
      type: String,
      required: true,
      default: `# Our Activities

## Regular Events
- Weekly meetings and discussions
- Monthly workshops and seminars
- Quarterly social events
- Annual conferences and competitions

## Skill Development
- Hands-on workshops
- Expert guest speakers
- Peer learning sessions
- Mentorship programs

## Community Engagement
- Volunteer opportunities
- Community service projects
- Outreach programs
- Collaboration with other organizations

*Customize this section to reflect your club's specific activities and programs.*`,
    },
    carouselImages: [
      {
        url: { type: String, required: true },
        id: { type: String },
      },
    ],
    whyJoinUsSection: {
      type: String,
      required: true,
      default: `# Why Join Our Club?

## 🌟 Personal Growth
- Develop new skills and abilities
- Build confidence through participation
- Expand your knowledge and expertise
- Challenge yourself with new experiences

## 🤝 Community & Networking
- Meet like-minded individuals
- Build lasting friendships
- Create professional connections
- Be part of a supportive community

## 🚀 Opportunities
- Leadership roles and responsibilities
- Skill-building workshops and events
- Access to exclusive resources
- Recognition and awards

## 💡 Make an Impact
- Contribute to meaningful projects
- Give back to the community
- Create positive change
- Leave a lasting legacy

*Tell potential members what makes your club special and why they should join!*`,
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      website: String,
      youtube: String,
      discord: String,
      instagram: String,
      linkedin: String,
    },
    registrationFormLink: {
      type: String,
      required: true,
      default: "https://forms.google.com/your-registration-form",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Club ||
  mongoose.model<IClub>("Club", ClubSchema);

import type { ServicesCopy } from "./services";

/** The /music/ page, migrated from wiedel.me. */
export const musicIntro = {
  eyebrow: "Lincoln & Omaha, Nebraska · DJ & Music",
  heading: { lead: "The same care,", accent: "turned up loud." },
  body: "Away from the keyboard, I DJ weddings and events, teach people to DJ, and record, mix, and master music.",
  primaryCta: "Check my availability →",
  secondaryCta: "Book a call",
};

export const musicServices: ServicesCopy = {
  title: ["Music, events", "& lessons."],
  intro: "Planning a wedding or event, ready to learn to DJ, or finishing a track? Here’s how I can help.",
  services: [
    {
      num: "01 / EVENTS",
      title: "Wedding & Event DJ",
      body: "Professional music, MC services, sound, and energy for weddings, parties, private events, and corporate gatherings.",
      chips: ["Weddings", "MC", "Sound", "Events"],
    },
    {
      num: "02 / LEARN",
      title: "DJ Lessons",
      body: "Learn the gear, software, beatmatching, mixing, song selection, and fundamentals you need to start DJing confidently.",
      chips: ["Beginner", "Mixing", "Equipment"],
    },
    {
      num: "03 / MUSIC",
      title: "Music Production",
      body: "Available to record, mix, and master — from tracking a single part to finishing a full release. Clean, balanced results that hold up on headphones, car speakers, and a club system alike.",
      chips: ["Recording", "Mixing", "Mastering", "Production"],
    },
  ],
};

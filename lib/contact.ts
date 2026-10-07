/** Contact section copy, migrated from wiedel.me. Each page passes its own set to <Contact>. */

export interface ContactCopy {
  label: string;
  heading: string;
  body: string;
  /** Small line under the booking option, e.g. where the work happens. */
  footnote: string;
  /** Choices for the "What can I help with?" dropdown. */
  serviceOptions: string[];
  /** Email subject Formspree uses, so leads from each page are easy to tell apart. */
  subject: string;
}

export const homeContact: ContactCopy = {
  label: "Let’s talk",
  heading: "Your dream, done.",
  body: "Tell me about the project, the deadline, and what you need from me. I’ll get back to you with next steps and a quote.",
  footnote: "Lincoln · Omaha · Remote",
  serviceOptions: [
    "Web design / development",
    "Graphic / logo design",
    "Updates & fixes",
    "IT help",
    "DJ / music",
    "Agency / subcontract project",
    "Something else",
  ],
  subject: "New lead from wiedel.me",
};

export const musicContact: ContactCopy = {
  label: "Let’s talk",
  heading: "Let’s make some noise.",
  body: "Tell me the date, the venue, or the project, and I’ll get back to you with availability and a quote.",
  footnote: "DJ · Lessons · Recording · Mixing · Mastering",
  serviceOptions: ["Wedding / Event DJ", "DJ Lessons", "Music Production", "Something else"],
  subject: "New music inquiry from wiedel.me",
};

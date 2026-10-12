@AGENTS.md

## Planned work

- **"CONTACT" calls to action between every section on the home page.** The home page
  (`app/page.tsx`) runs OutrunHero, ClientLogos, Audiences, Work, About, Services (with Process), then
  Contact; each gap between them gets a CONTACT call to action.
- **Make the contact form at the bottom more inviting for user interaction.** The approach is still
  to be found. The form is `components/site/ContactForm.tsx`, inside `components/site/Contact.tsx`;
  its copy is in `lib/contact.ts`.
- **Case studies for the top sites in the portfolio.** Which sites count as "top" is still to be
  chosen. The portfolio is the Work section (`components/site/Work.tsx`), fed by `lib/projects.ts`;
  each card now links straight out to the live site. `Project` already has an unused `description`
  field that the card renders once it's set.

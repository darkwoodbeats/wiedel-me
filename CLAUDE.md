@AGENTS.md

## Planned work

- **"CONTACT" calls to action between every section on the home page.** The home page
  (`app/page.tsx`) runs OutrunHero, ClientLogos, Audiences, Work, About, Services (with Process), then
  Contact; each gap between them gets a CONTACT call to action.
- **Make the contact form at the bottom more inviting for user interaction.** The approach is still
  to be found. The form is `components/site/ContactForm.tsx`, inside `components/site/Contact.tsx`;
  its copy is in `lib/contact.ts`.
- **Add a call to action to the share image (og:image).** A social preview check flagged it: "Image
  is missing conversion text. No call-to-action was detected. Adding one can make the image more
  clickable." The image is `app/opengraph-image.jpg` (1200x630, also the X large card): a capture of
  the home hero without its buttons. Update its alt text, `app/opengraph-image.alt.txt`, to match.

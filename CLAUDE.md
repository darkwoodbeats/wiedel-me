@AGENTS.md

## Quotes, invoices and reports

Wiedel.me client documents (Letter PDFs on the wiedel.me letterhead, in the site's fonts) are built with
`docs/doc-template/`. Read its `README.md` first. The quote layout is in `example-quote.html`. Client documents go
in the client's own project folder, never in this public repo.

## Email signatures

`docs/email-signature/signatures.html` has the caleb@wiedel.me signature with copy buttons; see its `README.md`. Its
logo loads from `https://wiedel.me/email/wiedel-me-logo-black.png` (`public/email/`). Sent emails point at that URL,
so never move, rename or delete it.

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

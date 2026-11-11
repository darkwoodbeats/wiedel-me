# Email signature

The caleb@wiedel.me signature: the black print wordmark over a 2px rule (like the quote and invoice header), then name,
title, email, site, LinkedIn and city. Open `signatures.html` in a browser, press **Copy signature** and paste it into
your mail app's signature settings (the page has the steps for Gmail, Roundcube webmail, Apple Mail and Outlook).

The logo loads from `https://wiedel.me/email/wiedel-me-logo-black.png` (`public/email/` in this repo). A hosted image
works in every mail app; a logo embedded as base64 doesn't (Gmail and Outlook strip it). Every sent email points at
that URL, so keep the file and its name. Apps that hold back web images until the reader allows them (mainly Outlook
on Windows) show the image's alt text, "Wiedel.me" in bold italic, in its place. The details are text, so they always
show.

`node docs/email-signature/build.mjs` rebuilds the logo from `docs/brand`; deploy the site afterwards.

- 450 x 67 px, shown at 150 x 22 (3x for sharp screens), 16 grays, about 3.5 KB.
- On white, so it stays visible in dark-mode mail.

The signature is a table with inline styles and Arial, because mail apps drop `<style>` blocks and web fonts. To change
the wording, edit the `<template>` at the bottom of `signatures.html`.

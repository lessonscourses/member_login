# Legends - member gate (legends.app)

One-page landing: "Private Investors Network", Member login and the "Apply to join" modal.
Next.js (App Router) + React, plain CSS in `app/globals.css`.

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start
```

- `app/page.jsx` - the page.
- `components/Globe.jsx` - animated backdrop: gold-dot globe (land from `data/land.js`), investment hubs, deal-flow arcs and activity tags (edit `CITIES`, `ROUTES`, `TAGS`). One canvas, no libraries.
- `components/ApplyModal.jsx` - Member login modal (email + password; TODO: connect to platform auth) and apply modal: full name*, email*, phone*, LinkedIn (optional), consent (optional) -> "Application submitted".
  TODO: send the form data to the CRM in `onSubmit`.
- `data/links.js` - Member login URL (TODO: real URL), Privacy/Terms, contact phone, `track()` for GTM.

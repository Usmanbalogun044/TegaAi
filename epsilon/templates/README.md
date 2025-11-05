# Tega — Adaptive Learning Companion (static prototype)

This is a lightweight HTML/CSS/JS prototype of the UI screens shown in the mockups. Each flow step now lives on its own page.

- Landing page with three role cards (`index.html`)
- Sign‑up form on a dedicated page (`signup.html`)
- 4‑question personalization quiz on its own page (`path.html`)

## How to run

No build step is required.

1. Open `index.html` in your browser.
2. Click a role to go to `signup.html`. After filling the form, you'll be redirected to `path.html`.

## Files

- `index.html` — landing page with role cards.
- `signup.html` — stand‑alone sign‑up page.
- `path.html` — dedicated questionnaire page.
- `styles.css` — responsive styles, gradients, cards, buttons, and quiz components.
- `app.js` — shared script for routing, quiz logic, and basic form validation.

## Notes

- All assets are emoji/HTML/CSS, no external images required. A Google Font (Poppins) is loaded for better typography.
- The quiz stores answers in memory only (no backend). On completion, a summary is rendered with your selected choices.

Feel free to tweak the palette in `:root` CSS variables and the `questions`/`choices` arrays in `app.js`.
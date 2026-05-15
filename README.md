# Chas Hathaway Home Hub

This folder is a static GitHub Pages-friendly website. It is designed so most future edits happen in JSON files instead of layout code.

## Main Files

- `index.html` is the home page.
- `page.html` is the shared layout for category hub pages.
- `styles.css` controls the visual theme.
- `app.js` loads the JSON content into the pages.
- `assets/theme-reference.png` is the steampunk/fantasy reference image used as the home hero background.
- `assets/jesus-medallion.svg` is the small portrait-style medallion used where Christian-themed iconography is helpful.

## Content Files

- `data/site.json` edits the home page title, tagline, intro, current notes, lower notes, and quick links.
- `data/categories.json` edits the homepage cards.
- `data/pages/music.json` edits the Music hub.
- `data/pages/books-and-writings.json` edits the Books and Writings hub.
- `data/pages/education.json` edits the Education hub.
- `data/pages/art-and-design.json` edits the Art and Design hub.

## Adding a New Homepage Card

Edit `data/categories.json` and add another object:

```json
{
  "id": "new-page-id",
  "title": "New Page Title",
  "description": "Short description for the card.",
  "icon": "misc",
  "href": "page.html?page=new-page-id",
  "status": "Soon",
  "cta": "Placeholder"
}
```

To make that page real, create `data/pages/new-page-id.json` using one of the existing page JSON files as a pattern.

## Local Preview

Because the site loads JSON with JavaScript, preview it with a small local server instead of opening `index.html` directly. A tiny Node server is included for that.

From this folder:

```powershell
node dev-server.cjs
```

Then open:

```text
http://localhost:8080
```

# 🚀 Gulp.js Frontend Starter Kit

A minimal, flexible frontend workflow using Gulp.js for SCSS, HTML templating, raw JS & CSS, and auto reload.

---

## 🔧 Quick Start

```bash
git clone https://github.com/Muurtaja/gulpjs-starter-kit.git
cd gulpjs-starter-kit
npm install
gulp
```

---

## ✨ Features

- SCSS with partials, mixins, functions
- Raw CSS & JS support (no concatenation)
- HTML templating with layouts and partials
- Live reload with BrowserSync
- Page content separated for clean structure

---

## 📁 Folder Structure

```
src/
├── assets/
│   ├── css/          → Plain CSS (e.g., Bootstrap)
│   ├── js/           → JS files (not merged)
│   ├── img/          → Static images
│   └── scss/         → SCSS structured below
├── html/
│   ├── layouts/      → Layout templates (e.g. base.html)
│   ├── pages/        → Pages (e.g. index.html + _index.html)
│   └── partials/     → Shared sections like header/footer
```

---

## 🎨 SCSS Structure

```
scss/
├── base/
│   ├── _default.scss     → Reset/default styles
│   ├── _variables.scss   → Global variables
│   ├── _functions.scss   → Custom SCSS functions
│   ├── _mixins.scss      → Reusable mixins
├── components/
│   ├── _button.scss
│   └── _card.scss
└── style.scss            → Main entry, imports everything
```

> Modify `style.scss` to include your components.

---

## 🧩 How HTML Pages Work

Each page = 2 files:

### Example: Home page

- `index.html` → Wrapper that loads layout and section
- `_index.html` → Content only

```html
<!-- pages/index.html -->
@@include('../layouts/base.html', {
  "title": "Home",
  "section": "_index.html"
})
```

```html
<!-- pages/_index.html -->
<h3>This is from index page</h3>
```

Inside `base.html`, it uses:

```html
@@include('../pages/' + section)
```

> Files starting with `_` are **not built** directly (they are injected into layouts).

---

## ➕ How to Add a Page

1. Create `_about.html` in `pages/` — your page content
2. Create `about.html` in `pages/`:

```html
@@include('../layouts/base.html', {
  "title": "About",
  "section": "_about.html"
})
```

That’s it! It will build `dist/about.html`.

---

## 🛠 Customization Tips

- **Add SCSS?** → Create partial under `base/` or `components/`, then import in `style.scss`.
- **Add HTML?** → Use `partials/` for shared parts, and follow the 2-file structure for pages.

---

Happy coding! 🎨
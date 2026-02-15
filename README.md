# 📚 Curls & Contemplation

By **Michael David Warren**

This repository contains all materials for *Curls & Contemplation: A Freelance Hairstylist's Guide to Creative Excellence*.

---

## 📁 Repository Structure

```
├── web/                      # 🌐 Author website (Bun + React + TypeScript)
│   ├── server.ts             # Web server with routes & API
│   ├── frontend.tsx           # React SPA with all pages
│   ├── index.html            # HTML entry point
│   ├── lib/                  # Database, Stripe, email, content data
│   ├── components/           # React components
│   ├── styles/               # CSS design system
│   ├── public/               # Static assets (images, fonts, downloads)
│   ├── scripts/              # Utility scripts
│   ├── docs/                 # Website documentation
│   └── README.md             # Website setup & usage guide
│
├── pdf/                      # 📄 Print-ready PDF (LaTeX source)
├── pub/                      # 📖 EPUB publishing files (Prince XML)
├── canvas/                   # 🎨 Canvas workspace
├── bestseller-badge/         # 🏅 Badge & cover generation tools
├── media/                    # 🖼️  Media assets
│
├── railway.json              # 🚂 Railway deployment config
├── vercel.json               # ▲ Vercel deployment config
├── CurlsAndContemplation.epub          # eBook files
├── CurlsAndContemplationV2.epub
├── CurlsAndContemplationV3.epub
├── CurlsAndContemplationV4.epub
├── CurlsAndContemplation-POD-6x9.pdf   # Print-on-demand PDF
└── generate-pod-pdf.py                  # POD PDF generator
```

---

## 🌐 Website

The author website is a complete eBook sales platform with Stripe payments, email automation, blog, FAQ, and admin dashboard.

**📖 See [web/README.md](./web/README.md) for full setup and usage instructions.**

### Quick Start

```bash
cd web
bun install
cp .env.example .env
# Edit .env with your API keys
bun --hot server.ts
```

Visit: http://localhost:3000

---

## 📜 License

© 2025 Michael David Warren. All rights reserved.

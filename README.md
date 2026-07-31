# Faiz Insani - Personal Portfolio & Interactive Resume

A modern, futuristic landing page and interactive resume for Faiz Insani, Data Enthusiast & Engineer.

## Features
- **Vibe Coding Lab**: Showcase of intelligence modules and projects.
- **Interactive Resume**: Detailed professional record, experiences, education, and core capabilities.
- **Futuristic UI**: High-contrast, sleek design built with React, Tailwind CSS, and Framer Motion.
- **SEO Optimized**: Fully optimized for search engines with meta tags and Open Graph support.

## Local Development

1. Make sure you have Node.js installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

## Deployment to GitHub Pages (`faiznfi.github.io`)

This repository is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Instructions to Deploy:
1. **Download as ZIP** from Google AI Studio (using the three dots menu > "Export" or "Download").
2. **Extract** the ZIP file to a local folder on your computer.
3. **Initialize Git** (if it isn't already a git repository) and push to your GitHub repo `faiznfi/faiznfi.github.io`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit from AI Studio"
   git branch -M main
   git remote add origin https://github.com/faiznfi/faiznfi.github.io.git
   git push -u origin main
   ```
4. **Enable GitHub Pages via Actions**:
   - Go to your repository settings on GitHub (`https://github.com/faiznfi/faiznfi.github.io/settings`).
   - Navigate to **Pages** on the left sidebar.
   - Under **Build and deployment**, set the **Source** dropdown to **GitHub Actions**.
5. The included `.github/workflows/deploy.yml` will automatically build and deploy your site! It will run every time you push changes to the `main` or `master` branch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

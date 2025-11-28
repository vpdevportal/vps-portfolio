# Portfolio Website

A modern, responsive portfolio website built with Astro, TypeScript, and Tailwind CSS.

## Features

- Dark theme with modern gradients
- Fully responsive design
- Resume download functionality
- Contact form
- Smooth scrolling navigation
- Optimized for performance (static site)

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install --no-workspaces
```

2. Extract resume information (optional):
```bash
npm run extract-resume
```

This will parse your resume files (`public/resume.pdf` and `public/resume.docx`) and populate `src/data/resume.ts` with structured data.

### Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Build

Build the site for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Deployment

### Docker (Coolify)

The project includes a Dockerfile for deployment with Coolify:

1. Build the Docker image:
```bash
docker build -t portfolio .
```

2. Run the container:
```bash
docker run -p 80:80 portfolio
```

The site will be available at `http://localhost`

### Coolify Deployment

1. Connect your repository to Coolify
2. Coolify will automatically detect the Dockerfile
3. Deploy the application

## Project Structure

```
vps-portfolio/
├── src/
│   ├── components/     # Astro components
│   ├── layouts/        # Layout components
│   ├── pages/          # Page routes
│   ├── data/           # Data files (resume data)
│   ├── scripts/        # Utility scripts
│   └── styles/         # Global styles
├── public/             # Static assets
│   ├── resume.pdf      # PDF resume
│   ├── resume.docx     # DOCX resume
│   └── profile.png     # Profile image
└── Dockerfile          # Docker configuration
```

## Customization

1. Update `src/data/resume.ts` with your information
2. Replace `public/profile.png` with your profile image
3. Update `src/config.ts` with your site configuration
4. Customize colors in `tailwind.config.mjs`

## License

MIT


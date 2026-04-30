# Portfolio v2 - High-Fidelity Design & Engineering

A modern, high-performance portfolio built with React 19, Vite, Tailwind CSS, Framer Motion, and GSAP. Dynamic content is powered by Sanity CMS, and communications are handled via EmailJS.

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd portfolio-v2
pnpm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and populate it with your credentials:

```env
# Sanity Configuration
VITE_SANITY_PROJECT_ID=wov9veyj
VITE_SANITY_DATASET=production

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. Run Development Server
```bash
pnpm dev
```

---

## 🧠 Sanity Integration (CMS)

The project uses Sanity to manage projects, experience, skills, and site settings.

### Schema Structure
- **Site Settings**: Singleton document for global numbers (Experience years, Projects count) and the Hero tagline.
- **Projects**: Detailed project documents with image hotspots, technology tags, and categories.
- **Experience**: Professional timeline with "Current Role" toggles and responsibilities.
- **Toolkit (Skills)**: Categorized skills with proficiency levels (0-100).

### Implementation Details
- **Client Config**: Found in `src/lib/sanity.ts`.
- **Custom Hook**: `useSanity` hook in `src/hooks/useSanity.ts` handles fetching and loading states.
- **Image URL Builder**: Uses `@sanity/image-url` to serve optimized, cropped images.

---

## 📧 Email Service (EmailJS)

Contact form submissions are handled directly via the EmailJS Browser SDK.

### Setup Requirements
1. **Service**: Create an Email Service in your EmailJS dashboard (e.g., via Gmail).
2. **Template**: Create an Email Template. Use the following dynamic variables to match the form:
   - `{{from_name}}`: The sender's name.
   - `{{reply_to}}`: The sender's email address.
   - `{{subject}}`: The inquiry subject.
   - `{{message}}`: The message content.
3. **Public Key**: Found in the "Account" section of your EmailJS dashboard.

### Form Logic
The form uses `formRef` and `emailjs.sendForm` for robust, client-side delivery without a dedicated backend.

---

## 🌐 Deployment (Vercel)

The project is optimized for Vercel.

### SPA Routing
To allow page refreshes on deep routes (e.g., `/work`) without 404 errors, a `vercel.json` file is included:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🛠 Technologies Used
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (v4), Vanilla CSS
- **Animation**: Framer Motion, GSAP (ScrollTrigger)
- **CMS**: Sanity.io
- **Email**: EmailJS
- **Icons**: React Icons (Hi2, Fa, Md)
- **Patterns**: Magic UI (Hexagon, Particles, Noise)

## 📄 License
MIT

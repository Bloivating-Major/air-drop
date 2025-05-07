<div align="center">
  <br />
      <img src="./public/airdroplogo.svg" alt="Air Drop Logo" width="120">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Typescript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-Drizzle_ORM-black?style=for-the-badge&logoColor=white&logo=drizzle&color=224DBA" alt="drizzle" />
    <img src="https://img.shields.io/badge/-Clerk-black?style=for-the-badge&logoColor=white&logo=clerk&color=6C47FF" alt="clerk" />
    <img src="https://img.shields.io/badge/-ImageKit-black?style=for-the-badge&logoColor=white&logo=imagekit&color=FF8A00" alt="imagekit" />
  </div>

<h3 align="center">Air Drop - Secure Cloud Storage</h3>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🚀 [Deployment](#deployment)

## <a name="introduction">🤖 Introduction</a>

Air Drop is a modern cloud storage platform for securely storing and managing your images. Built with Next.js and powered by ImageKit, it provides a seamless experience for uploading, organizing, and sharing your files.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js 14
- TypeScript
- Drizzle ORM with NEON Database
- Clerk Authentication
- ImageKit for image storage and optimization
- React Hook Form
- Tailwind CSS

## <a name="features">🔋 Features</a>

👉 **Secure Authentication**: User authentication powered by Clerk with multiple sign-in options.

👉 **File Management**: Upload, download, star, and organize your files with ease.

👉 **Trash System**: Safely delete files with a recoverable trash system.

👉 **Folder Organization**: Create folders to organize your files efficiently.

👉 **Star Important Files**: Mark important files with a star for quick access.

👉 **Image Optimization**: Automatic image optimization through ImageKit integration.

👉 **Responsive Design**: Fully responsive interface that works on all devices.

👉 **Dark Mode**: Built-in dark mode for comfortable viewing.

👉 **Storage Quota**: Track your storage usage with a visual indicator.

👉 **Drag and Drop**: Intuitive drag and drop interface for file uploads.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git https://github.com/Bloivating-Major/air-drop.git
cd air-drop
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env.local` in the root of your project and add the following content:

```env
# Database
DATABASE_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_PRIVATE_KEY=
```

Replace the placeholder values with your actual credentials.

**Database Setup**

Run the database migrations:

```bash
npm run db:migrate
```

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## <a name="deployment">🚀 Deployment</a>

### Deploy on Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

1. Push your code to a GitHub repository
2. Visit [Vercel](https://vercel.com/new) and import your repository
3. Configure environment variables
4. Deploy

### Self-Hosting Options

For self-hosting instructions, see the [deployment guide](./deployment-guide.md).
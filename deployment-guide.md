# Air Drop Deployment Guide
This guide provides detailed instructions for deploying the Air Drop application using different methods.
## Table of Contents- [Vercel Deployment](#vercel-deployment)
- [Self-Hosting with Node.js](#self-hosting-with-nodejs)- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)
## Vercel Deployment
Vercel is the recommended platform for deploying Next.js applications, offering the best performance and developer experience.
### Steps:
1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)
2. **Connect your repository to Vercel**   - Go to [Vercel](https://vercel.com/new)
   - Import your repository   - Select the Air Drop project
3. **Configure environment variables**
   - Add all required environment variables in the Vercel dashboard   - See the [Environment Variables](#environment-variables) section for the complete list
4. **Configure build settings**
   - Framework Preset: Next.js   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Deploy**   - Click "Deploy" and wait for the build to complete
   - Vercel will provide you with a deployment URL
6. **Set up a custom domain (optional)**   - In the Vercel dashboard, go to your project settings
   - Navigate to "Domains"   - Add your custom domain and follow the DNS configuration instructions
## Self-Hosting with Node.js
### Prerequisites:
- Node.js 18 or later- npm or yarn
- A PostgreSQL database (e.g., Neon)
### Steps:
1. **Clone the repository**   ```bash
   git clone https://github.com/yourusername/air-drop.git   cd air-drop
   ```
2. **Install dependencies**   ```bash
   npm install   ```
3. **Create a production build**
   ```bash   npm run build
   ```
4. **Set up environment variables**   - Create a `.env` file in the root directory
   - Add all required environment variables   - See the [Environment Variables](#environment-variables) section
5. **Run database migrations**
   ```bash   npm run db:migrate
   ```
6. **Start the production server**   ```bash
   npm run start   ```
7. **Set up a process manager (recommended)**
      Using PM2:
   ```bash   npm install -g pm2
   pm2 start npm --name "air-drop" -- start   pm2 save
   pm2 startup   ```
## Docker Deployment
### Prerequisites:
- Docker and Docker Compose- A PostgreSQL database (can be containerized or external)
### Steps:
1. **Create a Dockerfile in the project root**
   ```dockerfile
   FROM node:18-alpine AS base
   # Install dependencies only when needed   FROM base AS deps
   WORKDIR /app   COPY package.json package-lock.json ./
   RUN npm ci
   # Rebuild the source code only when needed   FROM base AS builder
   WORKDIR /app   COPY --from=deps /app/node_modules ./node_modules
   COPY . .   
   # Set environment variables for build   ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL   ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
   ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL   ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
   ARG NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY   ARG NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
      ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL   ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
   ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL   ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
   ENV NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=$NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY   ENV NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=$NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
      RUN npm run build
   # Production image, copy all the files and run next
   FROM base AS runner   WORKDIR /app
   ENV NODE_ENV production
   # Create a non-root user
   RUN addgroup --system --gid 1001 nodejs   RUN adduser --system --uid 1001 nextjs
      # Copy necessary files
   COPY --from=builder /app/public ./public   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000   ENV HOSTNAME "0.0.0.0"
   CMD ["node", "server.js"]
   ```
2. **Create a docker-compose.yml file**
   ```yaml   version: '3'
      services:
     app:       build:
         context: .         args:
           - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}           - NEXT_PUBLIC_CLERK_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_SIGN_IN_URL}
           - NEXT_PUBLIC_CLERK_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_SIGN_UP_URL}           - NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
           - NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}           - NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=${NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
           - NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=${NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}       ports:
         - "3000:3000"       environment:
         - DATABASE_URL=${DATABASE_URL}         - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
         - IMAGEKIT_PRIVATE_KEY=${IMAGEKIT_PRIVATE_KEY}       restart: always
   ```
3. **Update next.config.js to enable standalone output**
   ```js   /** @type {import('next').NextConfig} */
   const nextConfig = {     output: 'standalone',
     reactStrictMode: true,     images: {
       remotePatterns: [         {
           protocol: "https",           hostname: "ik.imagekit.io",
           port: "",           pathname: "/**",
         },         {
           protocol: "https",           hostname: "images.unsplash.com",
           port: "",           pathname: "/**",
         },       ],
     },   };
      module.exports = nextConfig;
   ```
4. **Create a .env file for Docker**   - Copy all required environment variables
   - This file will be used by docker-compose
5. **Build and run the Docker container**   ```bash
   docker-compose up -d   ```
## Environment Variables
The following environment variables are required for the application to function properly:
### Database
- `DATABASE_URL`: Connection string for your PostgreSQL database
### Clerk Authentication- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public key from Clerk dashboard
- `CLERK_SECRET_KEY`: Secret key from Clerk dashboard- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Path to sign-in page (typically "/sign-in")
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Path to sign-up page (typically "/sign-up")- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: Redirect path after sign-in (typically "/dashboard")
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: Redirect path after sign-up (typically "/dashboard")
### ImageKit- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`: Public key from ImageKit dashboard
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`: URL endpoint from ImageKit dashboard- `IMAGEKIT_PRIVATE_KEY`: Private key from ImageKit dashboard
## Database Setup
Air Drop uses Drizzle ORM with a PostgreSQL database. We recommend using [Neon](https://neon.tech/) for serverless PostgreSQL.
1. **Create a database on Neon**
   - Sign up for a Neon account   - Create a new project
   - Create a new database   - Get the connection string
2. **Set the DATABASE_URL environment variable**
   - Add the connection string to your environment variables
3. **Run database migrations**   ```bash
   npm run db:migrate   ```
## Troubleshooting
### Common Issues
1. **Database Connection Errors**
   - Verify your DATABASE_URL is correct   - Ensure your IP is allowed in the database firewall settings
   - Check if the database user has the correct permissions
2. **Authentication Issues**   - Verify all Clerk environment variables are set correctly
   - Check if the Clerk application URLs match your deployment URLs
3. **Image Upload Failures**   - Verify ImageKit credentials are correct
   - Check if your ImageKit plan has sufficient storage and bandwidth
4. **Build Failures**   - Ensure all dependencies are installed
   - Check if the Node.js version is compatible (v18+)   - Verify all required environment variables are set
### Getting Help
If you encounter issues not covered in this guide, please:
1. Check the [GitHub repository issues](https://github.com/yourusername/air-drop/issues)
2. Open a new issue with detailed information about your problem


















































































































































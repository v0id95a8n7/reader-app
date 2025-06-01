# Reader App

A clean, distraction-free article reading application that lets you save and read articles from the web with a beautiful, customizable reading experience.

## Features

- Save articles from across the web
- Clean, distraction-free reading experience
- Customizable typography and layout
- User authentication system
- Responsive design for all devices
- Font size and family customization
- Table of contents for longer articles
- Toggle images for distraction-free reading

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom JWT-based auth
- **Styling**: Tailwind CSS
- **API**: tRPC for type-safe APIs
- **Content Parsing**: Mozilla Readability

## Getting Started

### Prerequisites

- Node.js 18+
- SQLite database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reader-app.git
   cd reader-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
4. Update the `.env.local` file with your database URL and JWT secret.

5. Set up the database:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## How It Works

1. **User Authentication**: Register and login to access your saved articles.
2. **Article Parsing**: Enter any URL, and the app will extract the main content using Mozilla's Readability.
3. **Saving Articles**: Articles are saved to your profile and accessible anytime.
4. **Reading Experience**: Enjoy a clean, customizable reading experience with adjustable fonts, sizes, and layout.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Mozilla Readability](https://github.com/mozilla/readability) for the article parsing technology
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Prisma](https://www.prisma.io/) for database access
- [tRPC](https://trpc.io/) for type-safe APIs


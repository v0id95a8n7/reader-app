# Reader App

A clean, distraction-free article reading application that lets you save and read articles from the web with a beautiful, customizable reading experience.

## Features

- **Clean Reading Experience**: Distraction-free interface for comfortable reading
- **Article Parsing**: Save articles from any website using Mozilla's Readability engine
- **User Accounts**: Secure authentication system to access your article library
- **Customizable Settings**: Adjust font size, font family, line height, and text alignment
- **Responsive Design**: Optimized for all devices - desktop, tablet, and mobile
- **Image & Video Control**: Toggle visibility of images and videos within articles
- **Keyboard Navigation**: Navigate between articles with keyboard shortcuts
- **Dark Mode Support**: Read comfortably in any lighting condition
- **Link Handling**: Smart handling of internal and external links
- **Article Management**: Save, organize, and delete articles in your library

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Custom JWT-based auth with [jose](https://github.com/panva/jose)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **API**: [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- **Content Parsing**: [Mozilla Readability](https://github.com/mozilla/readability) - Article extraction
- **DOM Sanitization**: [DOMPurify](https://github.com/cure53/DOMPurify) - XSS protection
- **State Management**: React Context and Hooks
- **UI Components**: Custom components with [Heroicons](https://heroicons.com/)
- **Fonts**: Google Fonts (Nunito, PT Serif, PT Sans)

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- SQLite database
- npm or yarn package manager

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
   
4. Update the `.env.local` file with your database URL and JWT secret:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secure-jwt-secret"
   ```

5. Set up the database:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development

```bash
# Run development server
npm run dev

# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix

# Type check
npm run typecheck

# Format code
npm run format:write

# Build for production
npm run build

# Start production server
npm run start
```

## How It Works

1. **User Authentication**: The app uses JWT tokens stored in HTTP-only cookies for secure authentication.
2. **Article Parsing**: When a user adds a new article URL, the server fetches the content, processes it with Mozilla's Readability, and sanitizes HTML with DOMPurify.
3. **Data Storage**: Articles are stored in a SQLite database through Prisma ORM, associated with the user's account.
4. **User Settings**: Reading preferences (font size, family, etc.) are persisted to both localStorage and the server.
5. **Rendering**: The content is rendered with custom React components that prioritize readability and accessibility.


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Mozilla Readability](https://github.com/mozilla/readability) for the article parsing technology
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Prisma](https://www.prisma.io/) for database access
- [tRPC](https://trpc.io/) for type-safe APIs


# Anyacursor - AI Assistant

A modern AI-powered chat assistant built with Next.js, Convex backend, AI SDK, and beautiful UI components.

## 🚀 Features

- **Next.js 15** with App Router and TypeScript
- **Convex** for real-time backend and database
- **AI SDK** with OpenAI integration
- **Modern UI** with Tailwind CSS and Radix UI components
- **Real-time chat** interface
- **Responsive design** for all devices
- **Dark/Light mode** support
- **Vercel deployment** ready

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database and functions)
- **AI**: OpenAI GPT-4 via AI SDK
- **UI Components**: Radix UI, Lucide React icons, Magic UI, React Bits
- **MCP Servers**: Magic UI MCP, React Bits MCP
- **Styling**: Tailwind CSS with design system
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd anyacursor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL
   - `CONVEX_DEPLOYMENT`: Your Convex deployment name
   - `OPENAI_API_KEY`: Your OpenAI API key

4. **Set up Convex**
   ```bash
   npx convex dev
   ```

5. **Set up MCP Servers (Optional)**
   ```bash
   # Install Magic UI MCP for your IDE
   npx @magicuidesign/cli@latest install cursor  # or windsurf, claude, cline, roo-cline

   # The React Bits MCP is pre-configured in mcp.json
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

The application uses Convex with the following schema:

- **Users**: Store user information and authentication
- **Conversations**: Manage chat conversations
- **Messages**: Store individual chat messages

## 🎨 UI Components

The project includes a comprehensive set of UI components:

- **Button**: Various button variants and sizes
- **Input**: Form input components
- **Card**: Container components for content
- **Chat Interface**: Real-time chat component

## 🤖 MCP Servers

This project includes two MCP (Model Context Protocol) servers for enhanced AI-assisted development:

### Magic UI MCP Server
- **Installation**: `npx @magicuidesign/cli@latest install cursor`
- **Usage**: Ask your IDE to generate Magic UI components like "Add a blur fade text animation"
- **Components**: Grid backgrounds, marquee effects, morphing animations, and more

### React Bits MCP Server
- **Configuration**: Pre-configured in `mcp.json`
- **Usage**: Generate animated React components and effects
- **Components**: Particle effects, morphing loaders, hover animations, and interactive cards

For detailed setup instructions, see [MCP_SETUP.md](./MCP_SETUP.md)

## 🚀 Deployment

### Vercel Deployment

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `OPENAI_API_KEY`

## 📁 Project Structure

```
anyacursor/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── chat/          # Chat-specific components
│   │   └── providers/     # Context providers
│   └── lib/               # Utility functions
│       ├── convex.ts      # Convex client
│       ├── ai.ts          # AI SDK configuration
│       └── utils.ts       # Utility functions
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── users.ts           # User functions
│   ├── conversations.ts   # Conversation functions
│   └── messages.ts        # Message functions
└── public/                # Static assets
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Convex Commands

- `npx convex dev` - Start Convex development server
- `npx convex deploy` - Deploy to production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Convex documentation](https://docs.convex.dev)
2. Check the [Next.js documentation](https://nextjs.org/docs)
3. Check the [AI SDK documentation](https://sdk.vercel.ai)
4. Open an issue in this repository

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Convex](https://convex.dev) for the real-time backend
- [Vercel AI SDK](https://sdk.vercel.ai) for AI integration
- [Radix UI](https://radix-ui.com) for accessible components
- [Tailwind CSS](https://tailwindcss.com) for styling

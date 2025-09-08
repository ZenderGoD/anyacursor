# Anyacursor Constitution

## Core Principles

### I. AI-First Development
Every feature leverages AI capabilities where appropriate; AI tools and agents are first-class citizens in the architecture; Human-AI collaboration patterns are prioritized over traditional automation

### II. Type Safety First (NON-NEGOTIABLE)
Never use `any` types; Always define proper interfaces and use Convex validators; Strict TypeScript settings enforced; Type guards required for runtime validation

### III. Convex-Native Architecture
All data operations go through Convex; Use proper indexes for efficient queries; Authentication and authorization handled at the database level; Real-time updates by default

### IV. Component-Driven UI
React components follow Raj's patterns; Feature-based organization over type-based; Proper memoization and performance optimization; Clean import organization

### V. Security & Performance
Authentication checks first in all operations; Input sanitization and validation required; Query result limits enforced; No console logs in production

## Technology Stack Requirements
- **Frontend**: Next.js 14+ with App Router, React 18+, TypeScript
- **Backend**: Convex for real-time database and serverless functions
- **Styling**: Tailwind CSS with custom design system
- **AI Integration**: Vercel AI SDK + OpenRouter API for multi-model AI capabilities
- **Tool Calling**: Vercel AI SDK tools for cursor generation and management
- **Authentication**: Convex Auth with proper session management
- **Deployment**: Vercel for frontend, Convex Cloud for backend

## Cursor Generation Platform Requirements
- **AI Cursor Generation**: Multi-model AI support for cursor design generation
- **Real-time Collaboration**: Live updates for cursor creation and sharing
- **Variant Management**: Multiple cursor variations from single prompts
- **User Collections**: Organize and manage cursor libraries
- **Export Capabilities**: Download cursors in various formats
- **Performance**: Fast generation and smooth user experience

## Development Workflow
- **Feature Development**: Use Spec-Driven Development with /specify, /plan, /tasks commands
- **Code Review**: All PRs must verify compliance with constitution principles
- **Testing**: Unit tests for utilities, integration tests for AI workflows
- **Performance**: Monitor query performance, implement proper caching strategies
- **Security**: Regular security audits, input validation, proper error handling

## Governance
Constitution supersedes all other practices; Amendments require documentation, approval, and migration plan; All PRs/reviews must verify compliance; Complexity must be justified with business value; Use RAJ_CODING_STYLE_GUIDE.md for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
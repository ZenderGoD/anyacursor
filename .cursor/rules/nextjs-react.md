# Next.js & React Implementation Rules (2025)

## Next.js 15 Specifics

- Use App Router (not Pages Router)
- Server Components by default, Client Components when needed
- Use `use client` directive only when necessary (forms, hooks, browser APIs)
- Prefer server-side data fetching with Convex queries

## React 19 Features

- Use new React 19 hooks where applicable
- React 19 form actions for form handling
- Prefer controlled components for forms

## Authentication Flow

- Wrap app with `ConvexAuthProvider` from `@convex-dev/auth/react`
- Use `Authenticated` and `Unauthenticated` components for conditional rendering
- Use `useAuthActions` hook for sign in/out functions
- Store auth state in Convex (not localStorage/cookies)

## Form Handling

- Use `react-hook-form` with `zod` validation
- Use shadcn form components
- Handle form errors gracefully with user feedback

## Component Structure

```tsx
// Good pattern
'use client';
import { useAuthActions } from '@convex-dev/auth/react';

export function AuthForm() {
  const { signIn } = useAuthActions();
  // ... component logic
}
```

## Error Boundaries

- Implement error boundaries for auth failures
- Show appropriate error messages to users
- Log errors appropriately (don't log sensitive data)

## Route Protection

- Use middleware for route protection
- Redirect unauthenticated users to login
- Redirect authenticated users away from auth pages

## Performance

- Use React.memo() for heavy components
- Lazy load non-critical components
- Optimize images with Next.js Image component

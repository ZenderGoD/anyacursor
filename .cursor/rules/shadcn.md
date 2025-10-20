# Shadcn UI Implementation Rules (2025)

## Installation & Setup

- Use `pnpm dlx shadcn@latest` commands (not npm)
- Tailwind CSS v4 is supported
- No need for tailwind.config.js with v4 - use @theme inline in globals.css

## Component Usage

- Import components from `@/components/ui/`
- Customize components directly in the ui/ folder (they're copied, not installed)
- Use the `cn()` utility for conditional classes

## Form Components

- Use Form component with react-hook-form integration
- Structure forms like this:

```tsx
<Form>
  <FormField>
    <FormItem>
      <FormLabel />
      <FormControl>
        <Input />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</Form>
```

## Button Variants

- Use semantic variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Use size variants: `default`, `sm`, `lg`, `icon`

## Card Components

- Structure cards with `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Use consistent spacing with Tailwind classes

## Input Components

- Always pair Input with Label for accessibility
- Use FormControl wrapper in forms
- Handle validation errors with FormMessage

## Styling Customization

- Modify CSS variables in globals.css for theme changes
- Use Tailwind utilities for component-specific styling
- Follow shadcn's design system principles

## Accessibility

- All shadcn components are accessible by default
- Don't remove ARIA attributes
- Maintain keyboard navigation support
- Use semantic HTML structure

## Best Practices

- Keep component files focused and single-responsibility
- Use TypeScript interfaces for prop types
- Test components with keyboard navigation
- Maintain consistent spacing and typography

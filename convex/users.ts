import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Raj's Error Types
export const ERROR_TYPES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
} as const;

// Raj's Input Validation
function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000); // Limit length
}

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('users'),
      name: v.string(),
      email: v.string(),
      image: v.optional(v.string()),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    // For demo purposes, return a demo user
    // In production, this would check authentication
    return {
      _id: "demo-user-id" as any,
      name: "Demo User",
      email: "demo@example.com",
      _creationTime: Date.now(),
    };
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    // 1. Validate inputs
    const emailValidation = validateEmail(args.email);
    if (!emailValidation.isValid) {
      throw new ConvexError(emailValidation.error || 'Invalid email');
    }

    const sanitizedName = sanitizeInput(args.name);
    if (sanitizedName.length < 1) {
      throw new ConvexError('Name is required');
    }

    // 2. Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new ConvexError(ERROR_TYPES.EMAIL_ALREADY_EXISTS);
    }

    // 3. Create user (Convex handles _creationTime automatically)
    const userId = await ctx.db.insert("users", {
      name: sanitizedName,
      email: args.email,
      image: args.image,
    });

    return userId;
  },
});

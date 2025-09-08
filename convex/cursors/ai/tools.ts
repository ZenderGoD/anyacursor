import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "../../_generated/api";
import { getAuthUserId } from "../../auth";

// Raj's AI Tool Pattern for Cursor Generation
export const generateCursorVariant = async (ctx: any, args: {
  versionId: string;
  prompt: string;
  model?: 'gpt-image-1' | 'gemini-image-edit' | 'flux-schnell';
  style?: string;
  colorScheme?: string;
  referenceVariantId?: string;
  isAnimationFrame?: boolean;
}) => {
    // 1. Authentication check first
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Validate permissions and get version
    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new ConvexError('VERSION_NOT_FOUND');
    }

    // 3. Get cursor and verify ownership
    const cursor = await ctx.db.get(version.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 4. Check credits before expensive operation
    const user = await ctx.db.get(userId);
    const creditsRequired = 5; // Base cost for cursor generation

    if (user && (user.credits || 0) < creditsRequired) {
      throw new ConvexError('INSUFFICIENT_CREDITS');
    }

    // 5. Create variant record with pending status
    const variantName = args.isAnimationFrame
      ? `frame_${Date.now()}`
      : `variant_${Date.now()}`;

    const variantId = await ctx.db.insert('variants', {
      versionId: args.versionId,
      name: variantName,
      prompt: args.prompt,
      status: 'pending',
      metadata: {
        model: args.model || 'gpt-image-1',
        generationTime: 0,
        fileSize: 0,
        format: 'png',
      },
    });

    // 6. Schedule async generation
    await ctx.scheduler.runAfter(0, internal.cursors.ai.node.actions.generateCursorImage, {
      variantId,
      prompt: args.prompt,
      referenceVariantId: args.referenceVariantId,
      model: args.model || 'gpt-image-1',
      style: args.style,
      colorScheme: args.colorScheme,
      isAnimationFrame: args.isAnimationFrame || false,
    });

    // 7. Deduct credits
    if (user) {
      await ctx.db.patch(userId, {
        credits: (user.credits || 0) - creditsRequired,
      });
    }

    return {
      variantId,
      status: 'pending' as const,
      message: 'Cursor generation started',
    };
};

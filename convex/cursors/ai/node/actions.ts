import { internalAction } from "../../../_generated/server";
import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { internal } from "../../../_generated/api";

// Raj's AI Processing Pattern for Cursor Generation
export const generateCursorImage = internalAction({
  args: {
    variantId: v.id('variants'),
    prompt: v.string(),
    referenceVariantId: v.optional(v.id('variants')),
    model: v.string(),
    style: v.optional(v.string()),
    colorScheme: v.optional(v.string()),
    isAnimationFrame: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    const startTime = Date.now();

    try {
      // 1. Update status to processing
      await ctx.runMutation(internal.cursors.mutations.updateVariantStatusInternal, {
        variantId: args.variantId,
        status: 'processing',
        processingTimeMs: 0,
      });

      // 2. Build enhanced prompt for cursor generation
      const cursorPrompt = buildCursorPrompt({
        basePrompt: args.prompt,
        style: args.style,
        colorScheme: args.colorScheme,
        isAnimationFrame: args.isAnimationFrame,
      });

      // 3. Get reference image if provided (for image-to-image)
      let referenceImageUrl: string | undefined;
      if (args.referenceVariantId) {
        const referenceVariant = await ctx.runQuery(internal.cursors.queries.getVariantInternal, {
          variantId: args.referenceVariantId,
        });

        if (referenceVariant?.storageId) {
          referenceImageUrl = await ctx.storage.getUrl(referenceVariant.storageId);
        }
      }

      // 4. TODO: Generate image using appropriate AI model
      // For now, simulate image generation
      const mockImageData = new Uint8Array(1024); // Mock image data

      // 5. Store in Convex storage
      const storageId = await ctx.storage.store(mockImageData);

      // 6. Update variant record with success
      const processingTime = Date.now() - startTime;
      await ctx.runMutation(internal.cursors.mutations.updateVariantStatusInternal, {
        variantId: args.variantId,
        status: 'completed',
        storageId,
        processingTimeMs: processingTime,
        fileSize: mockImageData.length,
      });

    } catch (error) {
      // 7. Handle errors and update status
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';

      await ctx.runMutation(internal.cursors.mutations.updateVariantStatusInternal, {
        variantId: args.variantId,
        status: 'failed',
        processingTimeMs: processingTime,
        errorMessage,
      });

      throw error;
    }
  },
});

// Helper function to build optimized cursor prompts
function buildCursorPrompt({
  basePrompt,
  style,
  colorScheme,
  isAnimationFrame,
}: {
  basePrompt: string;
  style?: string;
  colorScheme?: string;
  isAnimationFrame: boolean;
}): string {
  const parts = [
    'Create a cursor icon:',
    basePrompt,
  ];

  if (style) {
    parts.push(`Style: ${style}`);
  }

  if (colorScheme) {
    parts.push(`Color scheme: ${colorScheme}`);
  }

  // Cursor-specific optimizations
  parts.push(
    'Requirements:',
    '- 32x32 pixels optimized',
    '- High contrast for visibility',
    '- Simple, recognizable design',
    '- Suitable for cursor use',
    '- PNG format with transparency'
  );

  if (isAnimationFrame) {
    parts.push('- Single frame for animation sequence');
  }

  return parts.join('\n');
}

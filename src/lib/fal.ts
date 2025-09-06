import { fal } from "@fal-ai/client";

// Configure Fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

// Raj's Image Generation Patterns with Fal
export async function generateImageWithFal(prompt: string) {
  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: "landscape_4_3",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generating image...");
        }
      },
    });

    return result;
  } catch (error) {
    // Raj's Error Handling Pattern
    console.error('Fal Image Generation Error:', error);
    throw new Error('Failed to generate image with Fal');
  }
}

// Raj's Advanced Image Generation with Fal
export async function generateImageAdvanced(prompt: string, options?: {
  style?: string;
  aspectRatio?: string;
  numImages?: number;
}) {
  try {
    const result = await fal.subscribe("fal-ai/flux-pro", {
      input: {
        prompt,
        image_size: options?.aspectRatio || "landscape_4_3",
        num_inference_steps: 28,
        num_images: options?.numImages || 1,
        enable_safety_checker: true,
        style: options?.style,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`Generating ${options?.numImages || 1} image(s)...`);
        }
      },
    });

    return result;
  } catch (error) {
    console.error('Fal Advanced Image Generation Error:', error);
    throw new Error('Failed to generate advanced image with Fal');
  }
}

// Raj's Utility function for image URL extraction
export function extractImageUrls(result: any): string[] {
  if (!result?.data?.images) {
    return [];
  }

  return result.data.images.map((image: any) => image.url);
}

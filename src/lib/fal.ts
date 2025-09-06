import { fal } from "@fal-ai/client";

// Configure Fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

// Raj's Image Generation Patterns with Fal
export async function generateImageWithFal(prompt: string): Promise<FalResult> {
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

    return result as FalResult;
  } catch (error) {
    // Raj's Error Handling Pattern
    console.error('Fal Image Generation Error:', error);
    throw new Error('Failed to generate image with Fal');
  }
}

// Raj's Advanced Image Generation with Fal
export async function generateImageAdvanced(
  prompt: string,
  options?: {
    style?: string;
    aspectRatio?: string;
    numImages?: number;
  }
): Promise<FalResult> {
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

    return result as FalResult;
  } catch (error) {
    console.error('Fal Advanced Image Generation Error:', error);
    throw new Error('Failed to generate advanced image with Fal');
  }
}

// Fal result types
interface FalImage {
  url: string;
  width?: number;
  height?: number;
  content_type?: string;
}

interface FalResult {
  data: {
    images: FalImage[];
  };
}

// Raj's Utility function for image URL extraction
export function extractImageUrls(result: FalResult): string[] {
  if (!result?.data?.images) {
    return [];
  }

  return result.data.images.map((image: FalImage) => image.url);
}

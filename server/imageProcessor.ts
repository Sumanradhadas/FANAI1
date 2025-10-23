import sharp from "sharp";
import { promisify } from "util";
import fs from "fs";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Add a white margin/border around an image
 */
export async function addMargin(
  imagePath: string,
  marginSize: number = 200
): Promise<Buffer> {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  const newWidth = metadata.width + (marginSize * 2);
  const newHeight = metadata.height + (marginSize * 2);

  return await sharp({
    create: {
      width: newWidth,
      height: newHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{
      input: await image.toBuffer(),
      left: marginSize,
      top: marginSize
    }])
    .png()
    .toBuffer();
}

/**
 * Detect and crop white borders from an image
 */
export async function cropMargin(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // Use sharp's trim() to automatically detect and crop white borders
    return await sharp(imageBuffer)
      .trim({
        background: { r: 255, g: 255, b: 255 },
        threshold: 10 // Allow slight color variation
      })
      .png()
      .toBuffer();
  } catch (error) {
    // If trim fails, return original image
    console.error("Error cropping margin:", error);
    return imageBuffer;
  }
}

/**
 * Add watermark to an image
 */
export async function addWatermark(
  imageBuffer: Buffer,
  watermarkText: string = "FanAI"
): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  // Create watermark SVG
  const fontSize = Math.max(32, Math.floor(metadata.width / 20));
  const padding = 20;

  const watermarkSvg = Buffer.from(`
    <svg width="${metadata.width}" height="${metadata.height}">
      <style>
        .watermark {
          font-family: 'Inter', sans-serif;
          font-size: ${fontSize}px;
          font-weight: 600;
          fill: white;
          fill-opacity: 0.6;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
      </style>
      <text
        x="${metadata.width - padding}"
        y="${metadata.height - padding}"
        text-anchor="end"
        class="watermark"
      >${watermarkText}</text>
    </svg>
  `);

  return await sharp(imageBuffer)
    .composite([{
      input: watermarkSvg,
      gravity: 'southeast'
    }])
    .png()
    .toBuffer();
}

/**
 * Complete image processing pipeline
 */
export async function processGeneratedImage(
  generatedImagePath: string,
  outputPath: string
): Promise<void> {
  // Step 1: Read generated image
  const generatedImage = await readFile(generatedImagePath);

  // Step 2: Crop any white margins from AI generation
  const croppedImage = await cropMargin(generatedImage);

  // Step 3: Add watermark
  const finalImage = await addWatermark(croppedImage);

  // Step 4: Save final image
  await writeFile(outputPath, finalImage);
}

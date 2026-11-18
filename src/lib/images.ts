import type { Evidence } from "./model";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export function validateImageMetadata(type: string, size: number) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(type))
    throw new Error("Choose a JPEG, PNG or WebP image.");
  if (size <= 0 || size > MAX_IMAGE_BYTES)
    throw new Error("Choose an image between 1 byte and 8 MB.");
}
export function imageSignature(bytes: Uint8Array): string | undefined {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
    return "image/png";
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
}
export async function prepareImage(
  file: File,
  provenance: Evidence["provenance"] = "user supplied",
): Promise<Evidence> {
  validateImageMetadata(file.type, file.size);
  const buffer = await file.arrayBuffer();
  if (imageSignature(new Uint8Array(buffer)) !== file.type)
    throw new Error("The image contents do not match its file type.");
  const bitmap = await createImageBitmap(file);
  if (bitmap.width * bitmap.height > 40_000_000) {
    bitmap.close();
    throw new Error("Image exceeds 40 megapixels. Choose a smaller image.");
  }
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return {
    name: file.name,
    original,
    preview: canvas.toDataURL("image/jpeg", 0.82),
    bytes: file.size,
    hash: Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    addedAt: new Date().toISOString(),
    provenance,
  };
}

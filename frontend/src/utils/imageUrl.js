const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function getImageUrl(image) {
  if (!image) return "";

  // Full URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Backend upload path
  if (image.startsWith("/uploads/")) {
    return `${API_BASE_URL}${image}`;
  }

  // If database stores only filename
  // Example: "everest.jpg"
  if (!image.startsWith("/")) {
    return `${API_BASE_URL}/uploads/${image}`;
  }

  return `${API_BASE_URL}${image}`;
}
import { type PersonaKey } from "@/data/personas";

/**
 * Classifies Teachable Machine prediction labels into a normalized PersonaKey.
 * Handles multilingual classes, numbers, emojis, and common variations.
 */
export function classifyLabel(label: string): PersonaKey | null {
  if (!label) return null;
  const normalized = label.toLowerCase().trim();

  // Empty or whitespace
  if (!normalized) return null;

  // Career patterns (Karier, Tech, Business, Briefcase, Class 1, 1, 💼)
  if (/(^1$|\b1\b|career|karier|tech|teknologi|briefcase|bisnis|pemimpin|💼)/i.test(normalized)) {
    return "career";
  }

  // Creative patterns (Kreativitas, Design, Art, Palette, Class 2, 2, 🎨)
  if (
    /(^2$|\b2\b|creative|kreatif|kreativitas|design|desain|\bart\b|seni|palette|palet|🎨)/i.test(
      normalized,
    )
  ) {
    return "creative";
  }

  // Adventure patterns (Petualangan, Impact, Dampak, Global, World, Earth, Globe, Bumi, Class 3, 3, 🌎)
  if (
    /(^3$|\b3\b|adventure|petualangan|impact|dampak|global|world|earth|globe|bumi|jelajah|🌎)/i.test(
      normalized,
    )
  ) {
    return "adventure";
  }

  return null;
}

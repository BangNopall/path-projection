import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Daftarkan plugin GSAP hanya di sisi klien (SSR Nitro safe)
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export { gsap, useGSAP };

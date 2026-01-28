import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safely format a location field that may be either a string or an object
export function formatLocation(location: any): string {
  if (!location) return "";
  if (typeof location === "string") return location;

  const { venue, address, city, state, country } = location ?? {};
  return [venue, address, city, state, country].filter(Boolean).join(", ");
}

// Safely resolve an event image from different shapes (mock vs backend)
export function getEventImage(event: any): string {
  if (!event) return "/placeholder.svg";
  return (
    event.image ||
    event.bannerImage ||
    (Array.isArray(event.images) ? event.images[0] : null) ||
    "/placeholder.svg"
  );
}
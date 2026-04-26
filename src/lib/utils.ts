import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPKR(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(2)} Crore`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(2)} Lac`;
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Available": return "bg-green-100 text-green-800";
    case "Booked": return "bg-yellow-100 text-yellow-800";
    case "Sold": return "bg-red-100 text-red-800";
    case "Reserved": return "bg-blue-100 text-blue-800";
    case "Active": return "bg-green-100 text-green-800";
    case "Completed": return "bg-gray-100 text-gray-800";
    case "Upcoming": return "bg-purple-100 text-purple-800";
    case "New": return "bg-blue-100 text-blue-800";
    case "Contacted": return "bg-yellow-100 text-yellow-800";
    case "In Progress": return "bg-orange-100 text-orange-800";
    case "Closed": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-700";
  }
}

// Placeholder image URL - uses a data URI for a neutral gray placeholder
export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

// Hero background placeholder - dark theme
export const PLACEHOLDER_HERO_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='32' fill='%236b7280' text-anchor='middle' dy='.3em'%3ERavi Developers%3C/text%3E%3C/svg%3E";

// Default Google Maps embed URL - should be configured via site settings
export const DEFAULT_MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55054.88068695591!2d70.26987095!3d28.3974449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b56e4e8c71b31%3A0x7c4cb7e4a78c8e23!2sRahim%20Yar%20Khan%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1704000000000!5m2!1sen!2s";

// Format date to relative time (e.g., "2 hours ago", "3 days ago")
export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

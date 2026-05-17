import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatResponseTime(totalTime: number, count: number): string {
  if (!count || count === 0) return "Typically responds within 24h";
  
  const avgMs = totalTime / count;
  const avgHours = avgMs / (1000 * 60 * 60);

  if (avgHours < 1) return "Responds in under 1 hour";
  if (avgHours < 2) return "Responds in under 2 hours";
  if (avgHours < 5) return "Responds in under 5 hours";
  if (avgHours < 12) return "Responds in under 12 hours";
  if (avgHours < 24) return "Responds within a day";
  return "Responds in 1-2 days";
}

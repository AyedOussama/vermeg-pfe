import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine classes with tailwind-merge to handle conflicts
 * Utilise clsx pour la logique conditionnelle et tailwind-merge pour résoudre les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
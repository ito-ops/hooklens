/**
 * Tiny className combiner used by shadcn-style components.
 * Falsy values are dropped; truthy strings are space-joined.
 *
 * Kept dependency-free (no clsx/tailwind-merge) because the project doesn't
 * have those installed. Swap in `twMerge(clsx(inputs))` if conflict resolution
 * becomes important.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

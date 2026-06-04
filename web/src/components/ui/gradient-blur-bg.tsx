import { cn } from "@/lib/utils";

/**
 * Purple gradient grid background. Drop inside a `relative` parent.
 * - `variant="all"` glows on all four edges (default).
 * - `variant="right"` glows from the top-right corner only.
 *
 * Source: shadcn-style snippet provided by user.
 */
export type GradientBlurBgVariant = "all" | "right";

export function GradientBlurBg({
  variant = "all",
  className,
}: {
  variant?: GradientBlurBgVariant;
  className?: string;
}) {
  const allSidesImage = `
    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
    radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),
    radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent),
    radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),
    radial-gradient(circle 600px at 50% 100%, #d5c5ff, transparent)
  `;
  const allSidesSize = `
    96px 64px,
    96px 64px,
    100% 100%,
    100% 100%,
    100% 100%,
    100% 100%
  `;

  const rightImage = `
    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
    radial-gradient(circle 800px at 100% 200px, #d5c5ff, transparent)
  `;
  const rightSize = `96px 64px, 96px 64px, 100% 100%`;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={{
        backgroundImage: variant === "right" ? rightImage : allSidesImage,
        backgroundSize: variant === "right" ? rightSize : allSidesSize,
      }}
    />
  );
}

export default GradientBlurBg;

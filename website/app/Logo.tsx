/**
 * Placeholder mark. To swap in the real RHEAP logo, replace
 * `website/public/logo.svg` with the final file (same filename, any
 * square-ish aspect ratio works) — no code changes needed.
 */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="RHEAP logo"
      width={size}
      height={size}
      className="rounded-lg"
      style={{ width: size, height: size }}
    />
  );
}

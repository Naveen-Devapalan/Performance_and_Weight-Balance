export function BackgroundPattern({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-gray-200/40 dark:stroke-gray-600/20 [mask-image:radial-gradient(120%_120%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="aviation-grid-pattern"
            width="80"
            height="80"
            x="50%"
            y="-1"
            patternUnits="userSpaceOnUse"
          >
            <path d="M80 160V.5M.5 .5H160" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="-1" className="overflow-visible fill-gray-50/30 dark:fill-gray-800/20">
          <path
            d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M299.5 800h201v201h-201Z"
            strokeWidth="0"
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          strokeWidth="0"
          fill="url(#aviation-grid-pattern)"
        />
      </svg>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--background),0.5),rgba(var(--background),0.9))]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-background via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-96 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
}
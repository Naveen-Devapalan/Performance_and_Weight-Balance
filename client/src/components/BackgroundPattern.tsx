export function BackgroundPattern({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-gray-200/30 dark:stroke-gray-600/20 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
            width="100"
            height="100"
            x="50%"
            y="-1"
            patternUnits="userSpaceOnUse"
          >
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="-1" className="overflow-visible fill-gray-50/50 dark:fill-gray-800/20">
          <path
            d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M299.5 800h201v201h-201Z"
            strokeWidth="0"
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          strokeWidth="0"
          fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
        />
      </svg>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/80 to-background/40" />
    </div>
  );
}
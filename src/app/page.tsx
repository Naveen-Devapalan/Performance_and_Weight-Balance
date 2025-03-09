import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <svg 
          className="absolute inset-0 -z-10 h-full w-full stroke-slate-200 dark:stroke-slate-700 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="home-pattern"
              width="100"
              height="100"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            strokeWidth="0"
            fill="url(#home-pattern)"
          />
        </svg>
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <header className="w-full text-center mb-8 animate-in slide-in-from-top-10 duration-500">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
            Aircraft Performance Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-lg max-w-2xl mx-auto">
            Professional Performance & Weight-Balance Calculator for Tecnam P2008JC
          </p>
        </header>
        
        <main className="flex flex-col gap-12 row-start-2 items-center w-full max-w-4xl animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <Link href="/performance" className="group flex flex-col items-center border border-slate-200 dark:border-slate-700 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-full mb-6 ring-4 ring-blue-50 dark:ring-blue-900/10 group-hover:ring-blue-100 dark:group-hover:ring-blue-800/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <path d="M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"></path>
                  <path d="m2 12 5.5-2.4c.6-.3 1.1-.9 1.4-1.5L10.5 4"></path>
                  <path d="m5 12 4-1.8c.6-.3 1-1 1-1.7V5"></path>
                  <path d="m22 12-5.5-2.4c-.6-.3-1.1-.9-1.4-1.5L13.5 4"></path>
                  <path d="m19 12-4-1.8c-.6-.3-1-1-1-1.7V5"></path>
                  <path d="m10 19 2-2 2 2"></path>
                  <path d="M12 17v-5"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Performance Calculator</h2>
              <p className="text-center text-slate-600 dark:text-slate-300">Calculate takeoff and landing distances based on environmental conditions</p>
            </Link>
            
            <Link href="/weight-balance" className="group flex flex-col items-center border border-slate-200 dark:border-slate-700 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-green-100 dark:hover:shadow-green-900/20 hover:border-green-300 dark:hover:border-green-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <div className="bg-green-100 dark:bg-green-900/30 p-5 rounded-full mb-6 ring-4 ring-green-50 dark:ring-green-900/10 group-hover:ring-green-100 dark:group-hover:ring-green-800/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform">
                  <path d="M3 6h18"></path>
                  <path d="M7 12h10"></path>
                  <path d="M10 18h4"></path>
                  <path d="M4 3v4"></path>
                  <path d="M20 3v4"></path>
                  <path d="M12 13v8"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-3 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">Weight & Balance</h2>
              <p className="text-center text-slate-600 dark:text-slate-300">Calculate center of gravity and ensure the aircraft is within limits</p>
            </Link>
          </div>
          
          <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">About This Tool</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
              This application helps pilots calculate critical performance metrics and weight-balance for the Tecnam P2008JC aircraft.
              All calculations are based on the manufacturer&apos;s data and comply with aviation regulations.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
              <li className="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Accurate takeoff and landing distance calculations</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Precise weight and balance computations</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Center of gravity verification</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Environmental factors consideration</span>
              </li>
            </ul>
          </div>
        </main>
        
        <footer className="row-start-3 mt-12 text-center text-slate-500 dark:text-slate-400">
          <p className="font-medium">Aircraft Performance & Weight-Balance Calculator</p>
          <p className="mt-2 text-sm">© 2023 - Always verify calculations with official documentation</p>
        </footer>
      </div>
    </div>
  );
}

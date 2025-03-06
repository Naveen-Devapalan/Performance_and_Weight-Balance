import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold">Aircraft Performance Calculator</h1>
        <p className="text-gray-800 mt-2">Performance & Weight-Balance Calculator for Tecnam P2008JC</p>
      </header>
      
      <main className="flex flex-col gap-12 row-start-2 items-center w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <Link href="/performance" className="flex flex-col items-center border border-gray-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-blue-300">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                <path d="M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"></path>
                <path d="m2 12 5.5-2.4c.6-.3 1.1-.9 1.4-1.5L10.5 4"></path>
                <path d="m5 12 4-1.8c.6-.3 1-1 1-1.7V5"></path>
                <path d="m22 12-5.5-2.4c-.6-.3-1.1-.9-1.4-1.5L13.5 4"></path>
                <path d="m19 12-4-1.8c-.6-.3-1-1-1-1.7V5"></path>
                <path d="m10 19 2-2 2 2"></path>
                <path d="M12 17v-5"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Performance Calculator</h2>
            <p className="text-center text-gray-800">Calculate takeoff and landing distances based on environmental conditions</p>
          </Link>
          
          <Link href="/weight-balance" className="flex flex-col items-center border border-gray-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-green-300">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                <path d="M3 6h18"></path>
                <path d="M7 12h10"></path>
                <path d="M10 18h4"></path>
                <path d="M4 3v4"></path>
                <path d="M20 3v4"></path>
                <path d="M12 13v8"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Weight & Balance</h2>
            <p className="text-center text-gray-800">Calculate center of gravity and ensure the aircraft is within limits</p>
          </Link>
        </div>
        
        <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <p className="mb-4 text-gray-800">
            This application helps pilots calculate critical performance metrics and weight-balance for the Tecnam P2008JC aircraft.
            All calculations are based on the manufacturer's data and comply with aviation regulations.
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-2">
            <li>Accurate takeoff and landing distance calculations</li>
            <li>Precise weight and balance computations</li>
            <li>Center of gravity verification</li>
            <li>Environmental factors consideration</li>
          </ul>
        </div>
      </main>
      
      <footer className="row-start-3 mt-12 text-center text-sm text-gray-700">
        <p>Aircraft Performance & Weight-Balance Calculator</p>
        <p className="mt-1">© 2023 - Always verify calculations with official documentation</p>
      </footer>
    </div>
  );
}

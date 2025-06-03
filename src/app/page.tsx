"use client";

import { NewspaperIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center">
      <div className="font-nunito max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <NewspaperIcon className="h-20 w-20 text-gray-700" />
        </div>
        <h1 className="font-nunito mb-6 text-4xl font-bold text-gray-700">
          Welcome to Reedr
        </h1>
        <p className="font-nunito mb-10 text-xl text-gray-500">
          Select an article from the sidebar or add a new one to start reading.
        </p>
      </div>
    </div>
  );
}

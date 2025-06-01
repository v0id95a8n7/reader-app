"use client";

import { BookOpenIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="max-w-md text-center font-nunito">
        <div className="flex justify-center mb-8">
          <div className="bg-gray-400 p-4 shadow-sm rounded-full">
            <BookOpenIcon className="h-20 w-20 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-700 mb-6 font-nunito">Welcome to Reader</h1>
        <p className="text-gray-500 mb-10 text-xl font-nunito">
          Select an article from the sidebar or add a new one to start reading.
        </p>
      </div>
    </div>
  );
}

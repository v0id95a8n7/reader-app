import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

interface ArticleSearchInputProps {
  onSearch: (query: string) => void;
}

export function ArticleSearchInput({ onSearch }: ArticleSearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-4 px-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="font-nunito w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-gray-700 shadow-sm transition-all duration-200 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </form>
  );
} 
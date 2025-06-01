"use client";

import React from "react";

interface FontProviderProps {
  ptSerifFont: string;
  ptSansFont: string;
  ptMonoFont: string;
}

export function FontProvider({ ptSerifFont, ptSansFont, ptMonoFont }: FontProviderProps) {
  return (
    <style jsx global>{`
      :root {
        --font-pt-serif: ${ptSerifFont};
        --font-pt-sans: ${ptSansFont};
        --font-pt-mono: ${ptMonoFont};
      }
    `}</style>
  );
} 
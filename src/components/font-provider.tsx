"use client";

import React from "react";

interface FontProviderProps {
  ptSerifFont: string;
  ptSansFont: string;
}

export function FontProvider({ ptSerifFont, ptSansFont }: FontProviderProps) {
  return (
    <style jsx global>{`
      :root {
        --font-pt-serif: ${ptSerifFont};
        --font-pt-sans: ${ptSansFont};
      }
    `}</style>
  );
}

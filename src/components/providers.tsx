"use client";

import React from "react";
import { TRPCReactProvider } from "~/trpc/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TRPCReactProvider>
      {children}
    </TRPCReactProvider>
  );
} 
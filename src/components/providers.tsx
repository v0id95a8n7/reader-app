"use client";

import React from "react";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TRPCReactProvider headers={new Headers()}>{children}</TRPCReactProvider>
    </SessionProvider>
  );
}

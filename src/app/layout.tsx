import "~/styles/globals.css";

import { type Metadata } from "next";
import { PT_Serif, PT_Sans, Nunito_Sans } from "next/font/google";
import { Providers } from "../components/providers";
import { FontProvider } from "../components/font-provider";
import { AppLayout } from "../components/AppLayout";

const nunito = Nunito_Sans({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-nunito",
});

const ptSerif = PT_Serif({
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-pt-serif",
});

const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-pt-sans",
});

export const metadata: Metadata = {
  title: "Reedr",
  description: "Clean reading experience for web articles",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/newspaper-icon.svg", type: "image/svg+xml" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${nunito.variable} ${ptSerif.variable} ${ptSans.variable} font-nunito`}
      >
        <FontProvider
          ptSerifFont={ptSerif.style.fontFamily}
          ptSansFont={ptSans.style.fontFamily}
        />
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}

import "~/styles/globals.css";
import "@fontsource/nunito";

import { type Metadata } from "next";
import { Nunito, PT_Serif, PT_Sans, PT_Mono } from "next/font/google";
import { Providers } from "../components/providers";
import { FontProvider } from "../components/font-provider";
import { AppLayout } from "../components/AppLayout";

const nunito = Nunito({
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

const ptMono = PT_Mono({
  weight: ["400"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-pt-mono",
});

export const metadata: Metadata = {
  title: "Reader App",
  description: "Clean reading experience for web articles",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${ptSerif.variable} ${ptSans.variable} ${ptMono.variable} font-nunito`}>
        <FontProvider
          ptSerifFont={ptSerif.style.fontFamily}
          ptSansFont={ptSans.style.fontFamily}
          ptMonoFont={ptMono.style.fontFamily}
        />
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}

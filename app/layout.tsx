import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { PageViewTracker } from "@/components/page-view-tracker";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Baby Experience",
  description: "Публичные рекомендации вещей для мамы и новорождённого с подборками и админкой."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <PageViewTracker />
        <div className="app-shell">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}

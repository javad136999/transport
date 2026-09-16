import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalNavigation from "@/components/GlobalNavigation";

export const metadata: Metadata = {
  title: "سامانه مدیریت و نظارت بر حمل پساب",
  description:
    "زنجیره دیجیتال رهگیری حمل پساب صنعتی و بهداشتی پتروشیمی‌های منطقه ویژه اقتصادی پارس — شرکت پیمانکاران تصفیه صنعت",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E1416",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <GlobalNavigation />
        {children}
      </body>
    </html>
  );
}

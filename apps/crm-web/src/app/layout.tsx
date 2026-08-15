import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.scss";
import Auth_Provider from "@/modules/auth/Auth_Provider/Auth_Provider";

const jura_font = localFont({
  src: [
    {
      path: "../../public/fonts/jura/Jura_Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/jura/Jura_Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/jura/Jura_Semi_Bold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-jura",
  display: "swap",
});

const unbounded_font = localFont({
  src: "../../public/fonts/unbounded/Unbounded.woff2",
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CRM",
    template: "%s | CRM",
  },
  description: "Business management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jura_font.variable} ${unbounded_font.variable}`}
    >
      <body>
        <Auth_Provider>{children}</Auth_Provider>
      </body>
    </html>
  );
}

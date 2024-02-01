import "./globals.css";

/* next */
import { Inter } from "next/font/google";

/* 3rd pary library */
import { Toaster } from "react-hot-toast";

/* components */
import Users from "@/components/Users"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chat2Chat",
  description: "an instant messenger that brings up your communication to a incredible awesome level 😍",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="valentine">
      <body className={`${inter.className} bg-base-100`} suppressHydrationWarning={true}>
        <Toaster position="bottom-center" />
        {children}
      </body>
    </html>
  );
}

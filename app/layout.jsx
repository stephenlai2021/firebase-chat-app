import "./globals.css";

/* next */
import { Inter } from "next/font/google";

/* 3rd pary library */
import { Toaster } from "react-hot-toast";

/* components */
import Users from "@/components/users/Users";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chat2Chat",
  description:
    "an instant messenger that brings up your communication to a incredible awesome level 😍",
  icons: {
    icon: "/chat-icon.png",
  },
  content: {
    width: "device-width",
    "user-scalable": "no",
    "initial-scale": "1.0",
    "maximum-scale": "1.0"
  }

};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="aqua">
      <body
        className={`${inter.className} bg-base-100`}
        suppressHydrationWarning={true}
      >
        <Toaster position="bottom-center" />
        {children}
      </body>
    </html>
  );
}

import "./globals.css";

/* next */
import { Inter } from "next/font/google";

/* 3rd pary library */
import { Toaster } from "react-hot-toast";

/* components */
import Users from "@/components/Users"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "WeChat",
  description: "an instant messenger that brings up your communication to a incredible awesome level 😍",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`{inter.className} dark`} suppressHydrationWarning={true}>
        <Toaster position="bottom-center" />
        {children}
      </body>
    </html>
  );
}

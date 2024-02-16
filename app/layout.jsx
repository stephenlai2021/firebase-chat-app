import "./globals.css";

/* next */
import { Inter } from "next/font/google";

/* daisyui + next-themes */
import DaisyUIThemeProvider from "@/providers/daisyui-theme-provider";

/* utils */
import { Toaster } from "react-hot-toast";

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
    userScalable: "no",
    initialScale: "1.0",
    maximumScale: "1.0",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`} suppressHydrationWarning>
        <DaisyUIThemeProvider>
          <div className="max-w-[1200px] mx-auto bg-base-200">
            <Toaster position="bottom-center" />
            {children}
          </div>
        </DaisyUIThemeProvider>
      </body>
    </html>
  );
}

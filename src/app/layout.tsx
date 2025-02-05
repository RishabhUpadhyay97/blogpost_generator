import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/lib/themeContext"
import BackgroundSVG from "./components/BackgroundSVG"
import ThemeCustomizer from "./components/ThemeCustomizer"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Blog Post Generator",
  description: "Generate blog posts with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <BackgroundSVG />
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeCustomizer />
          </div>
          <main className="relative min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}


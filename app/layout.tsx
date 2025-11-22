import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import RootProviders from "@/components/providers/root-providers"

// Using system font fallbacks instead of Google Fonts to avoid network dependency
const audiowide = {
  variable: "--font-audiowide",
}

const rajdhani = {
  variable: "--font-rajdhani",
}

export const metadata: Metadata = {
  title: "VOID Metaverse | PSX Agency Protocol",
  description:
    "Enter the VOID - A cyberpunk metaverse powered by PSX Agency Protocol with DEX trading, casino games, and urban exploration",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${audiowide.variable} ${rajdhani.variable}`}
      style={{ width: "100vw", height: "100vh", overflow: "hidden", margin: 0, padding: 0 }}
    >
      <body
        className="font-sans antialiased bg-black"
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  )
}

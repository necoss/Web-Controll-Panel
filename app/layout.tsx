import type React from "react"
import "@/app/globals.css"
import { Rubik } from "next/font/google"

const inter = Rubik({ subsets: ["latin"] })

export const metadata = {
  title: "Wep Panel - HACKATHON WITH INDEV - Команда Лазарук",
  description: "Веб панель для управления номерами в отеле сделанная в рамках SPACE HACKATHON WITH InDev Solutions",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

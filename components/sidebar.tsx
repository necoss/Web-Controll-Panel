"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Settings, BarChart2, Calendar } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const menuItems = [
    { name: "Главная", path: "/", icon: Home },
    { name: "Гости", path: "/guests", icon: Users },
    { name: "Бронирования", path: "/bookings", icon: Calendar },
    { name: "Статистика", path: "/statistics", icon: BarChart2 },
    { name: "Настройки", path: "/settings", icon: Settings },
  ]

  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Отель "Комфорт"</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive(item.path) ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
            <span className="font-bold">А</span>
          </div>
          <div>
            <p className="text-sm font-medium">Администратор</p>
            <p className="text-xs text-gray-400">admin@hotel.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

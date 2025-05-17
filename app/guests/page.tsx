"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, Search, User } from "lucide-react"
import axios from "axios"

interface Guest {
  id: number
  name: string
  [key: string]: any // Для других полей, которые могут быть в API
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get("https://roomplus.onrender.com/guests/")
        setGuests(response.data)
      } catch (err) {
        console.error("Ошибка при загрузке данных о гостях:", err)
        setError("Не удалось загрузить данные о гостях")
      } finally {
        setLoading(false)
      }
    }

    fetchGuests()
  }, [])

  // Фильтрация гостей по поисковому запросу
  const filteredGuests = guests.filter((guest) => {
    if (!searchTerm) return true

    // Поиск по имени и другим полям, если они есть
    const searchLower = searchTerm.toLowerCase()
    return (
      guest.name.toLowerCase().includes(searchLower) ||
      (guest.email && guest.email.toLowerCase().includes(searchLower)) ||
      (guest.phone && guest.phone.includes(searchTerm))
    )
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p>Загрузка данных о гостях...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Список гостей</h1>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Поиск гостей..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden">
        {filteredGuests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Имя</TableHead>
                {guests[0].email && <TableHead>Email</TableHead>}
                {guests[0].phone && <TableHead>Телефон</TableHead>}
                {guests[0].room_number && <TableHead>Номер комнаты</TableHead>}
                {guests[0].check_in_date && <TableHead>Дата заезда</TableHead>}
                {guests[0].check_out_date && <TableHead>Дата выезда</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>{guest.id}</TableCell>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  {guests[0].email && <TableCell>{guest.email}</TableCell>}
                  {guests[0].phone && <TableCell>{guest.phone}</TableCell>}
                  {guests[0].room_number && <TableCell>{guest.room_number}</TableCell>}
                  {guests[0].check_in_date && (
                    <TableCell>{new Date(guest.check_in_date).toLocaleDateString("ru-RU")}</TableCell>
                  )}
                  {guests[0].check_out_date && (
                    <TableCell>{new Date(guest.check_out_date).toLocaleDateString("ru-RU")}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <User className="h-12 w-12 mb-4" />
            <p>{searchTerm ? "Гости по вашему запросу не найдены" : "Список гостей пуст"}</p>
          </div>
        )}
      </Card>
    </div>
  )
}

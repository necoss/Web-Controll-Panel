"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Loader2 } from "lucide-react"

interface Room {
  id: number
  number?: number
  floor?: number
  type?: string
  isOccupied?: boolean
  capacity?: number
  price?: number
}

interface HotelLayoutProps {
  rooms: Room[]
  onRoomSelect: (roomId: number) => void
  selectedRoomId: number | null
  loading?: boolean
}

export function HotelLayout({ rooms, onRoomSelect, selectedRoomId, loading = false }: HotelLayoutProps) {
  // Проверка наличия данных
  const hasRooms = rooms && rooms.length > 0

  // Получаем уникальные этажи из списка комнат
  const floors = hasRooms
    ? [...new Set(rooms.map((room) => room.floor || Math.floor((room.number || 0) / 100)))].sort()
    : []

  const [activeFloor, setActiveFloor] = useState<number>(floors[0] || 1)

  // Обновляем активный этаж, если изменился список этажей
  useEffect(() => {
    if (floors.length > 0 && !floors.includes(activeFloor)) {
      setActiveFloor(floors[0])
    }
  }, [floors, activeFloor])

  // Фильтруем комнаты по выбранному этажу
  const roomsOnFloor = hasRooms
    ? rooms.filter((room) => {
        const roomFloor = room.floor || Math.floor((room.number || 0) / 100)
        return roomFloor === activeFloor
      })
    : []

  if (!hasRooms) {
    return <div className="text-center p-4">Нет доступных номеров для отображения на схеме</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Схема отеля</h2>
        {loading && (
          <span className="text-xs text-gray-500 flex items-center">
            <Loader2 className="h-3 w-3 animate-spin mr-1" /> Обновление...
          </span>
        )}
      </div>

      <Tabs
        value={activeFloor.toString()}
        onValueChange={(value) => setActiveFloor(Number.parseInt(value))}
        className="mb-4"
      >
        <TabsList className="w-full">
          {floors.map((floor) => (
            <TabsTrigger key={floor} value={floor.toString()} className="flex-1">
              Этаж {floor}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex mb-4">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span className="text-sm">Свободно</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span className="text-sm">Занято</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-sm">Выбрано</span>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <Card className="p-4 relative">
          <div className="relative bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
            {/* Коридор */}
            <div className="absolute top-1/2 left-0 right-0 h-16 bg-gray-200 -translate-y-1/2"></div>

            {/* Комнаты */}
            <div className="grid grid-cols-5 gap-4 relative">
              {/* Верхний ряд комнат */}
              {roomsOnFloor
                .filter((room) => {
                  const roomNumber = room.number || 0
                  return roomNumber % 10 <= 5 && roomNumber % 10 > 0
                })
                .sort((a, b) => (a.number || 0) - (b.number || 0))
                .map((room) => {
                  const isSelected = room.id === selectedRoomId
                  return (
                    <div
                      key={room.id}
                      onClick={() => onRoomSelect(room.id)}
                      className={`
                        h-32 border-2 rounded-md p-2 cursor-pointer transition-all
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : room.isOccupied
                              ? "border-red-500 bg-red-50"
                              : "border-green-500 bg-green-50"
                        }
                      `}
                    >
                      <div className="text-center font-bold">{room.number}</div>
                      <div className="text-xs text-center mt-1">{room.type}</div>
                      <div className="text-xs text-center mt-1">
                        {room.capacity} {room.capacity === 1 ? "место" : room.capacity < 5 ? "места" : "мест"}
                      </div>
                      {room.price && (
                        <div className="flex items-center justify-center mt-1 text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {room.price}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Нижний ряд комнат */}
            <div className="grid grid-cols-5 gap-4 mt-20 relative">
              {roomsOnFloor
                .filter((room) => {
                  const roomNumber = room.number || 0
                  return roomNumber % 10 > 5 || roomNumber % 10 === 0
                })
                .sort((a, b) => (a.number || 0) - (b.number || 0))
                .map((room) => {
                  const isSelected = room.id === selectedRoomId
                  return (
                    <div
                      key={room.id}
                      onClick={() => onRoomSelect(room.id)}
                      className={`
                        h-32 border-2 rounded-md p-2 cursor-pointer transition-all
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : room.isOccupied
                              ? "border-red-500 bg-red-50"
                              : "border-green-500 bg-green-50"
                        }
                      `}
                    >
                      <div className="text-center font-bold">{room.number}</div>
                      <div className="text-xs text-center mt-1">{room.type}</div>
                      <div className="text-xs text-center mt-1">
                        {room.capacity} {room.capacity === 1 ? "место" : room.capacity < 5 ? "места" : "мест"}
                      </div>
                      {room.price && (
                        <div className="flex items-center justify-center mt-1 text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {room.price}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Лифт и лестница */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                Л
              </div>
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                С
              </div>
            </div>
          </div>
        </Card>
      </ScrollArea>
    </div>
  )
}

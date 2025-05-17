"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, DollarSign } from "lucide-react"

interface Room {
  id: number
  number?: number
  floor?: number
  type?: string
  isOccupied?: boolean
  capacity?: number
  price?: number
}

interface RoomListProps {
  rooms: Room[]
  onRoomSelect: (roomId: number) => void
  selectedRoomId: number | null
  loading?: boolean
}

export function RoomList({ rooms, onRoomSelect, selectedRoomId, loading = false }: RoomListProps) {
  // Проверка наличия данных
  if (!rooms || rooms.length === 0) {
    return <div className="text-center p-4">Нет доступных номеров</div>
  }

  // Сортировка номеров по номеру и этажу
  const sortedRooms = [...rooms].sort((a, b) => {
    if ((a.floor || 0) !== (b.floor || 0)) {
      return (a.floor || 0) - (b.floor || 0)
    }
    return (a.number || 0) - (b.number || 0)
  })

  // Группировка номеров по этажам
  const roomsByFloor = sortedRooms.reduce((acc, room) => {
    const floor = room.floor || Math.floor((room.number || 0) / 100)
    if (!acc[floor]) {
      acc[floor] = []
    }
    acc[floor].push(room)
    return acc
  }, {})

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Номера</h2>
        {loading && (
          <span className="text-xs text-gray-500 flex items-center">
            <Loader2 className="h-3 w-3 animate-spin mr-1" /> Обновление...
          </span>
        )}
      </div>

      <div className="flex mb-4">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          <span className="text-sm">Свободно</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span className="text-sm">Занято</span>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        {Object.keys(roomsByFloor)
          .sort((a, b) => Number(a) - Number(b))
          .map((floor) => (
            <div key={floor} className="mb-4">
              <h3 className="font-bold text-sm text-gray-500 mb-2">Этаж {floor}</h3>
              <div className="grid grid-cols-2 gap-2">
                {roomsByFloor[floor].map((room) => (
                  <div
                    key={room.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRoomId === room.id
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-white border hover:bg-gray-50"
                    }`}
                    onClick={() => onRoomSelect(room.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">№ {room.number}</span>
                      <Badge variant={room.isOccupied ? "destructive" : "success"}>
                        {room.isOccupied ? "Занят" : "Свободен"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                      <span>
                        {room.type} ({room.capacity}{" "}
                        {room.capacity === 1 ? "место" : room.capacity < 5 ? "места" : "мест"})
                      </span>
                      {room.price && (
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {room.price}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </ScrollArea>
    </div>
  )
}

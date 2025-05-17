"use client"

import { useState, useEffect, useCallback } from "react"
import { RoomList } from "@/components/room-list"
import { RoomDetails } from "@/components/room-details"
import { Dashboard } from "@/components/dashboard"
import { HotelLayout } from "@/components/hotel-layout"
import { fetchRooms, fetchOccupancy, fetchSensorData, fetchRoomOrders } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

// Определение типов данных на основе API
interface Room {
  room_id: number
  number: string
  capacity: number
  is_available: boolean
  light_status: boolean
  temperature: number
  humidity: number
  pressure: number
  door_status: boolean
  price_per_night: number
  sensors?: any // Для совместимости с существующим кодом
  [key: string]: any // Для других полей, которые могут быть в API
}

interface Order {
  order_id: number
  room_id: number
  guest_id: number
  check_in_date: string
  check_out_date: string
}

interface Guest {
  guest_id: number
  name: string
  email: string
  phone: string
}

export default function HotelDashboard() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [occupancy, setOccupancy] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    freeRooms: 0,
    totalGuests: 0,
  })
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null)
  const [selectedRoomOrders, setSelectedRoomOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "layout">("list")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Функция для нормализации данных комнаты для совместимости с UI
  const normalizeRoomData = (room: Room): any => {
    return {
      id: room.room_id,
      number: Number.parseInt(room.number),
      floor: Math.floor(Number.parseInt(room.number) / 100),
      type: room.capacity <= 2 ? "Стандарт" : room.capacity <= 4 ? "Люкс" : "Апартаменты",
      isOccupied: !room.is_available,
      capacity: room.capacity,
      price: room.price_per_night,
      // Сохраняем оригинальные данные
      originalData: { ...room },
    }
  }

  // Функция для загрузки данных о выбранной комнате
  const loadSelectedRoomData = useCallback(
    async (roomId: number) => {
      if (!roomId) return

      try {
        console.log(`Загрузка данных для комнаты ${roomId}...`)

        // Находим базовую информацию о комнате из списка
        const roomFromList = rooms.find((r) => r.id === roomId)

        if (!roomFromList) {
          console.error(`Комната с ID ${roomId} не найдена в списке`)
          return
        }

        // Получаем свежие данные датчиков
        const timestamp = new Date().getTime()
        const sensorData = await fetchSensorData(roomId)
        console.log(`Получены данные датчиков для комнаты ${roomId}:`, sensorData)

        // Получаем заказы для комнаты
        const orders = await fetchRoomOrders(roomId)
        console.log(`Получены заказы для комнаты ${roomId}:`, orders)

        // Обновляем состояние
        setSelectedRoomOrders(orders)
        setSelectedRoom({
          ...roomFromList,
          sensors: sensorData,
          _lastUpdated: timestamp,
        })
      } catch (error) {
        console.error(`Ошибка при загрузке данных для комнаты ${roomId}:`, error)
      }
    },
    [rooms],
  )

  // Функция для обновления всех данных
  const refreshAllData = useCallback(async () => {
    try {
      console.log("Обновление всех данных...", new Date().toISOString())

      // Загружаем данные о комнатах
      const roomsData = await fetchRooms()
      const normalizedRooms = Array.isArray(roomsData) ? roomsData.map(normalizeRoomData) : []
      setRooms(normalizedRooms)

      // Загружаем данные о заполненности
      try {
        const occupancyData = await fetchOccupancy()
        setOccupancy(occupancyData)
      } catch (occupancyError) {
        console.error("Ошибка при загрузке данных о заполненности:", occupancyError)

        // Рассчитываем заполненность на основе данных о номерах
        const totalRooms = normalizedRooms.length
        const occupiedRooms = normalizedRooms.filter((room) => room.isOccupied).length
        const freeRooms = totalRooms - occupiedRooms

        setOccupancy({
          totalRooms,
          occupiedRooms,
          freeRooms,
          totalGuests: occupancy.totalGuests,
        })
      }

      // Если выбрана комната, обновляем данные о ней
      if (selectedRoomId) {
        await loadSelectedRoomData(selectedRoomId)
      }

      // Обновляем время последнего обновления
      setLastUpdate(new Date())
      console.log("Все данные успешно обновлены")
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error)
    }
  }, [selectedRoomId, loadSelectedRoomData, occupancy.totalGuests])

  // Начальная загрузка данных
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true)
        setError(null)
        await refreshAllData()
      } catch (error) {
        console.error("Ошибка при начальной загрузке данных:", error)
        setError("Не удалось загрузить данные. Пожалуйста, проверьте подключение к серверу.")
      } finally {
        setLoading(false)
      }
    }

    initialLoad()
  }, [refreshAllData])

  // Настраиваем интервал обновления данных
  useEffect(() => {
    console.log("Настройка интервала обновления данных (каждые 5 секунд)")

    const intervalId = setInterval(() => {
      console.log("Запуск планового обновления данных...")
      refreshAllData()
    }, 5000)

    return () => {
      console.log("Очистка интервала обновления данных")
      clearInterval(intervalId)
    }
  }, [refreshAllData])

  // Обработчик выбора комнаты
  const handleRoomSelect = async (roomId: number) => {
    console.log(`Выбрана комната с ID ${roomId}`)
    setSelectedRoomId(roomId)
    await loadSelectedRoomData(roomId)
  }

  // Показываем экран загрузки только при начальной загрузке
  if (loading && rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-200 mb-4" />
        <p>Загрузка данных...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded ${
                  viewMode === "list" ? "bg-[#414141] text-white" : "bg-gray-200 text-[#414141]"
                }`}
              >
                Список
              </button>
              <button
                onClick={() => setViewMode("layout")}
                className={`px-3 py-1 rounded ${
                  viewMode === "layout" ? "bg-[#414141] text-white" : "bg-gray-200 text-[#414141]"
                }`}
              >
                Схема
              </button>
            </div>

            {viewMode === "list" ? (
              <RoomList rooms={rooms} onRoomSelect={handleRoomSelect} selectedRoomId={selectedRoomId} loading={false} />
            ) : (
              <HotelLayout
                rooms={rooms}
                onRoomSelect={handleRoomSelect}
                selectedRoomId={selectedRoomId}
                loading={false}
              />
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <Dashboard occupancy={occupancy} loading={false} />

          <div className="flex-1 p-4 overflow-y-auto">
            {selectedRoom ? (
              <RoomDetails
                key={`room-${selectedRoom.id}-${selectedRoom._lastUpdated}`}
                room={selectedRoom}
                orders={selectedRoomOrders}
                loading={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Выберите номер для просмотра подробной информации
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

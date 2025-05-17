"use client"

import { useState, useEffect } from "react"
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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedRoomOrders, setSelectedRoomOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "layout">("list")
  const [refreshing, setRefreshing] = useState(false)

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Загрузка данных о номерах
        const roomsData = await fetchRooms()
        console.log("Данные с сервера:", roomsData)

        const normalizedRooms = Array.isArray(roomsData) ? roomsData.map(normalizeRoomData) : []
        console.log("Нормализованные данные:", normalizedRooms)

        setRooms(normalizedRooms)

        // Загрузка данных о заполненности
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
            totalGuests: 0, // Без данных о заказах не можем определить
          })
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
        setError("Не удалось загрузить данные. Пожалуйста, проверьте подключение к серверу.")
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Обновление данных каждые 30 секунд без полной перезагрузки UI
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRoomSelect = async (roomId: number) => {
    try {
      // Сбрасываем текущую выбранную комнату, чтобы избежать отображения старых данных
      setSelectedRoom(null)
      setSelectedRoomOrders([])

      // Находим комнату в текущем списке
      const roomFromList = rooms.find((r) => r.id === roomId)

      if (!roomFromList) {
        setError(`Комната с ID ${roomId} не найдена`)
        return
      }

      console.log("Выбрана комната:", roomFromList)

      // Получаем данные датчиков
      let sensorData = {}
      try {
        sensorData = await fetchSensorData(roomId)
      } catch (sensorError) {
        console.error("Ошибка при загрузке данных датчиков:", sensorError)
        // Продолжаем без данных датчиков
      }

      // Получаем заказы для комнаты
      try {
        const orders = await fetchRoomOrders(roomId)
        setSelectedRoomOrders(orders)
      } catch (ordersError) {
        console.error("Ошибка при загрузке заказов:", ordersError)
        // Продолжаем без данных о заказах
      }

      // Создаем новый объект для выбранной комнаты
      const updatedRoom = {
        ...roomFromList,
        sensors: sensorData,
      }

      console.log("Обновленная комната:", updatedRoom)

      // Устанавливаем выбранную комнату с данными датчиков
      setSelectedRoom(updatedRoom)
    } catch (error) {
      console.error("Ошибка при выборе номера:", error)
      setError(`Не удалось загрузить информацию о номере ${roomId}`)
    }
  }

  const refreshData = async () => {
    try {
      setError(null)

      // Set a local loading state for background refresh
      const [roomsData, occupancyData] = await Promise.all([
        fetchRooms(),
        fetchOccupancy().catch((err) => {
          console.error("Error fetching occupancy during refresh:", err)
          return null
        }),
      ])

      const normalizedRooms = Array.isArray(roomsData) ? roomsData.map(normalizeRoomData) : []
      setRooms(normalizedRooms)

      if (occupancyData) {
        setOccupancy(occupancyData)
      } else {
        // Calculate occupancy from room data if API fails
        const totalRooms = normalizedRooms.length
        const occupiedRooms = normalizedRooms.filter((room) => room.isOccupied).length
        const freeRooms = totalRooms - occupiedRooms

        setOccupancy({
          totalRooms,
          occupiedRooms,
          freeRooms,
          totalGuests: occupancy.totalGuests, // Keep existing value
        })
      }

      // If a room is selected, refresh its data too
      if (selectedRoom) {
        const roomId = selectedRoom.id
        const roomFromList = normalizedRooms.find((r) => r.id === roomId)

        if (roomFromList) {
          try {
            const sensorData = await fetchSensorData(roomId)
            const orders = await fetchRoomOrders(roomId).catch(() => selectedRoomOrders)

            setSelectedRoomOrders(orders)
            setSelectedRoom({
              ...roomFromList,
              sensors: sensorData,
            })
          } catch (error) {
            console.error("Error refreshing selected room data:", error)
            // Keep existing selected room data if refresh fails
          }
        }
      }

      console.log("Data refreshed successfully")
    } catch (error) {
      console.error("Error during data refresh:", error)
      // Don't set error state to avoid disrupting the UI during background refresh
    }
  }

  // Only show loading screen on initial load, not during refreshes
  if (loading && rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p>Загрузка данных...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Система управления отелем</h1>
        <button
          onClick={async () => {
            setRefreshing(true)
            await refreshData()
            setRefreshing(false)
          }}
          className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
          disabled={refreshing}
        >
          <Loader2 className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Обновление..." : "Обновить данные"}
        </button>
      </header>

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
                  viewMode === "list" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                Список
              </button>
              <button
                onClick={() => setViewMode("layout")}
                className={`px-3 py-1 rounded ${
                  viewMode === "layout" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                Схема
              </button>
            </div>

            {viewMode === "list" ? (
              <RoomList
                rooms={rooms}
                onRoomSelect={handleRoomSelect}
                selectedRoomId={selectedRoom?.id}
                loading={refreshing}
              />
            ) : (
              <HotelLayout
                rooms={rooms}
                onRoomSelect={handleRoomSelect}
                selectedRoomId={selectedRoom?.id}
                loading={refreshing}
              />
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <Dashboard occupancy={occupancy} loading={refreshing} />

          <div className="flex-1 p-4 overflow-y-auto">
            {selectedRoom ? (
              <RoomDetails room={selectedRoom} orders={selectedRoomOrders} loading={refreshing} />
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

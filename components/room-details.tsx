"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Thermometer, Droplets, Lock, Unlock, Calendar, Clock, AlertTriangle, Lightbulb, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Sensors {
  temperature?: number
  humidity?: number
  pressure?: number
  doorOpen?: boolean
  lightOn?: boolean
  windowOpen?: boolean
  motion?: boolean
  smoke?: boolean
}

interface Room {
  id: number
  number?: number
  floor?: number
  type?: string
  isOccupied?: boolean
  capacity?: number
  price?: number
  sensors?: Sensors
  originalData?: any // Для отладки
}

interface Order {
  order_id: number
  room_id: number
  guest_id: number
  check_in_date: string
  check_out_date: string
}

export function RoomDetails({
  room,
  orders = [],
  loading = false,
}: { room: Room; orders?: Order[]; loading?: boolean }) {
  // Используем локальное состояние для отслеживания изменений props
  const [currentRoom, setCurrentRoom] = useState<Room>(room)
  const [currentOrders, setCurrentOrders] = useState<Order[]>(orders)

  // Обновляем локальное состояние при изменении props
  useEffect(() => {
    console.log("Room details updated:", room)
    setCurrentRoom(room)
  }, [room])

  useEffect(() => {
    console.log("Orders updated:", orders)
    setCurrentOrders(orders)
  }, [orders])

  // Извлекаем данные из текущей комнаты
  const {
    id,
    number = 0,
    floor = 0,
    type = "Стандарт",
    isOccupied = false,
    capacity = 2,
    price = 0,
    sensors = {},
    originalData,
  } = currentRoom || {}

  // Выводим отладочную информацию
  useEffect(() => {
    console.log("Отображение комнаты:", {
      id,
      number,
      isOccupied,
      originalData,
    })
  }, [id, number, isOccupied, originalData])

  const {
    temperature = 22,
    humidity = 45,
    pressure = 760,
    doorOpen = false,
    lightOn = false,
    windowOpen = false,
    motion = false,
    smoke = false,
  } = sensors || {}

  // Определение статуса датчиков
  const getSensorStatus = (value, thresholds) => {
    if (value <= thresholds.low) return "low"
    if (value >= thresholds.high) return "high"
    return "normal"
  }

  const temperatureStatus = getSensorStatus(temperature, { low: 18, high: 26 })
  const humidityStatus = getSensorStatus(humidity, { low: 30, high: 60 })

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU").format(date)
  }

  // Находим текущий активный заказ (если есть)
  const today = new Date()
  const activeOrder = currentOrders.find((order) => {
    const checkInDate = new Date(order.check_in_date)
    const checkOutDate = new Date(order.check_out_date)
    return checkInDate <= today && checkOutDate >= today
  })

  // Находим ближайший будущий заказ (если есть)
  const futureOrders = currentOrders
    .filter((order) => new Date(order.check_in_date) > today)
    .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())

  const nextOrder = futureOrders.length > 0 ? futureOrders[0] : null

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Номер {number}</h2>
          <p className="text-gray-500">
            Этаж {floor} • {type} • {capacity} {capacity === 1 ? "место" : capacity < 5 ? "места" : "мест"}
          </p>
        </div>
        <div className="flex items-center">
          {loading && (
            <span className="text-xs text-gray-500 flex items-center mr-3">
              <Loader2 className="h-3 w-3 animate-spin mr-1" /> Обновление...
            </span>
          )}
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOccupied ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {isOccupied ? "Занят" : "Свободен"}
          </div>
        </div>
      </div>

      <Tabs defaultValue="sensors">
        <TabsList className="mb-4">
          <TabsTrigger value="sensors">Датчики</TabsTrigger>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="orders">Бронирования</TabsTrigger>
          {process.env.NODE_ENV === "development" && <TabsTrigger value="debug">Отладка</TabsTrigger>}
        </TabsList>

        <TabsContent value="sensors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    temperatureStatus === "normal"
                      ? "bg-green-100"
                      : temperatureStatus === "high"
                        ? "bg-red-100"
                        : "bg-blue-100"
                  }`}
                >
                  <Thermometer
                    className={`h-5 w-5 ${
                      temperatureStatus === "normal"
                        ? "text-green-600"
                        : temperatureStatus === "high"
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Температура</p>
                  <p className="text-xl font-bold">{temperature}°C</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    humidityStatus === "normal"
                      ? "bg-green-100"
                      : humidityStatus === "high"
                        ? "bg-blue-100"
                        : "bg-yellow-100"
                  }`}
                >
                  <Droplets
                    className={`h-5 w-5 ${
                      humidityStatus === "normal"
                        ? "text-green-600"
                        : humidityStatus === "high"
                          ? "text-blue-600"
                          : "text-yellow-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Влажность</p>
                  <p className="text-xl font-bold">{humidity}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <div className="bg-gray-100 p-2 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Давление</p>
                  <p className="text-xl font-bold">{pressure} мм рт.ст.</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${doorOpen ? "bg-red-100" : "bg-green-100"}`}>
                  {doorOpen ? <Unlock className="h-5 w-5 text-red-600" /> : <Lock className="h-5 w-5 text-green-600" />}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Дверь</p>
                  <p className="text-xl font-bold">{doorOpen ? "Открыта" : "Закрыта"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${lightOn ? "bg-yellow-100" : "bg-gray-100"}`}>
                  <Lightbulb className={`h-5 w-5 ${lightOn ? "text-yellow-600" : "text-gray-600"}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Свет</p>
                  <p className="text-xl font-bold">{lightOn ? "Включен" : "Выключен"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${smoke ? "bg-red-100" : "bg-green-100"}`}>
                  <AlertTriangle className={`h-5 w-5 ${smoke ? "text-red-600" : "text-green-600"}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Дым</p>
                  <p className="text-xl font-bold">{smoke ? "Обнаружен!" : "Не обнаружен"}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-4">Информация о номере</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Тип номера:</span>
                  <span className="font-medium">{type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Вместимость:</span>
                  <span className="font-medium">
                    {capacity} {capacity === 1 ? "место" : capacity < 5 ? "места" : "мест"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Цена за ночь:</span>
                  <span className="font-medium">{price} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Статус:</span>
                  <span className={`font-medium ${isOccupied ? "text-red-600" : "text-green-600"}`}>
                    {isOccupied ? "Занят" : "Свободен"}
                  </span>
                </div>
                {activeOrder && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Текущее бронирование:</span>
                      <span className="font-medium">Заказ #{activeOrder.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Дата заезда:</span>
                      <span className="font-medium">{formatDate(activeOrder.check_in_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Дата выезда:</span>
                      <span className="font-medium">{formatDate(activeOrder.check_out_date)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Финансовая информация</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Базовая цена:</span>
                  <span className="font-medium">{price} ₽ / ночь</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Месячный доход:</span>
                  <span className="font-medium">{price * 30} ₽</span>
                </div>
                {activeOrder && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Текущий заказ:</span>
                    <span className="font-medium">
                      {(() => {
                        const checkIn = new Date(activeOrder.check_in_date)
                        const checkOut = new Date(activeOrder.check_out_date)
                        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                        return `${nights} ${nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"} (${price * nights} ₽)`
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {nextOrder && (
                <>
                  <h3 className="font-bold mt-6 mb-4">Следующее бронирование</h3>
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <div>Заезд: {formatDate(nextOrder.check_in_date)}</div>
                      <div>Выезд: {formatDate(nextOrder.check_out_date)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          {currentOrders.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-bold mb-2">История бронирований</h3>
              {currentOrders
                .sort((a, b) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime())
                .map((order) => {
                  const checkIn = new Date(order.check_in_date)
                  const checkOut = new Date(order.check_out_date)
                  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                  const isActive = checkIn <= today && checkOut >= today
                  const isFuture = checkIn > today
                  const isPast = checkOut < today

                  return (
                    <Card
                      key={order.order_id}
                      className={`p-4 ${isActive ? "border-green-500" : isFuture ? "border-blue-500" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">Заказ #{order.order_id}</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.check_in_date)} - {formatDate(order.check_out_date)} ({nights}{" "}
                            {nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"})
                          </p>
                          <p className="text-sm mt-1">Гость ID: {order.guest_id}</p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : isFuture
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isActive ? "Текущий" : isFuture ? "Будущий" : "Прошлый"}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm text-gray-500">Сумма:</span>
                        <span className="font-medium">{price * nights} ₽</span>
                      </div>
                    </Card>
                  )
                })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <Calendar className="h-12 w-12 mb-4" />
              <p>Нет данных о бронированиях для этого номера</p>
            </div>
          )}
        </TabsContent>

        {process.env.NODE_ENV === "development" && (
          <TabsContent value="debug">
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-bold mb-2">Отладочная информация</h3>
              <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(currentRoom, null, 2)}</pre>
              <h3 className="font-bold mt-4 mb-2">Заказы</h3>
              <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(currentOrders, null, 2)}</pre>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  )
}

import axios from "axios"

const API_BASE_URL = "https://roomplus.onrender.com"

// Создаем экземпляр axios с отключенным кэшированием
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
})

// Функция для получения данных о гостях
export async function fetchGuests() {
  try {
    const timestamp = new Date().getTime()
    const response = await api.get(`/guests/?_t=${timestamp}`)
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке данных о гостях:", error)
    throw new Error("Не удалось загрузить данные о гостях")
  }
}

// Функция для получения данных о номерах
export async function fetchRooms() {
  try {
    const timestamp = new Date().getTime()
    const response = await api.get(`/rooms/?_t=${timestamp}`)
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке данных о номерах:", error)
    throw new Error("Не удалось загрузить данные о номерах")
  }
}

// Функция для получения данных о заказах
export async function fetchOrders() {
  try {
    const timestamp = new Date().getTime()
    const response = await api.get(`/orders/?_t=${timestamp}`)
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке данных о заказах:", error)
    throw new Error("Не удалось загрузить данные о заказах")
  }
}

// Функция для получения данных о заполненности отеля
export async function fetchOccupancy() {
  try {
    // Получаем данные о номерах
    const rooms = await fetchRooms()

    // Рассчитываем заполненность на основе данных о номерах
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((room) => !room.is_available).length
    const freeRooms = totalRooms - occupiedRooms

    // Получаем данные о гостях через заказы
    const orders = await fetchOrders()
    const activeOrders = orders.filter((order) => {
      const checkInDate = new Date(order.check_in_date)
      const checkOutDate = new Date(order.check_out_date)
      const today = new Date()
      return checkInDate <= today && checkOutDate >= today
    })

    // Считаем уникальных гостей в активных заказах
    const activeGuestIds = [...new Set(activeOrders.map((order) => order.guest_id))]
    const totalGuests = activeGuestIds.length

    return {
      totalRooms,
      occupiedRooms,
      freeRooms,
      totalGuests,
    }
  } catch (error) {
    console.error("Ошибка при расчете данных о заполненности:", error)
    throw new Error("Не удалось получить данные о заполненности отеля")
  }
}

// Функция для получения данных датчиков для конкретного номера
export async function fetchSensorData(roomId) {
  try {
    // Добавляем случайный параметр для предотвращения кэширования
    const timestamp = new Date().getTime()
    console.log(`Запрос данных датчиков для комнаты ${roomId} в ${new Date().toISOString()}`)

    const response = await api.get(`/rooms/${roomId}?_t=${timestamp}`)
    const room = response.data

    console.log(`Получены данные для комнаты ${roomId}:`, room)

    // Извлекаем данные датчиков из полей комнаты
    const sensorData = {
      temperature: room.temperature || 22,
      humidity: room.humidity || 45,
      pressure: room.pressure || 760,
      doorOpen: room.door_status === false, // Инвертируем, т.к. door_status=false означает открытую дверь
      lightOn: room.light_status === true,
      // Дополнительные поля, которые могут не быть в API
      windowOpen: false,
      motion: false,
      smoke: false,
    }

    console.log(`Обработанные данные датчиков для комнаты ${roomId}:`, sensorData)
    return sensorData
  } catch (error) {
    console.error(`Ошибка при загрузке данных датчиков для номера ${roomId}:`, error)

    // Если API для датчиков не существует, возвращаем заглушку
    console.warn("Используются демо-данные для датчиков")

    // Генерация случайных значений для датчиков
    const randomTemp = Math.floor(Math.random() * 8) + 19 // 19-26°C
    const randomHumidity = Math.floor(Math.random() * 30) + 35 // 35-65%
    const randomPressure = Math.floor(Math.random() * 20) + 750 // 750-770 мм рт.ст.

    // Случайные значения для других датчиков
    const doorOpen = Math.random() > 0.7
    const lightOn = Math.random() > 0.5
    const windowOpen = Math.random() > 0.8
    const motion = Math.random() > 0.5
    const smoke = Math.random() > 0.95

    return {
      temperature: randomTemp,
      humidity: randomHumidity,
      pressure: randomPressure,
      doorOpen,
      lightOn,
      windowOpen,
      motion,
      smoke,
    }
  }
}

// Функция для получения данных о конкретном госте
export async function fetchGuestDetails(guestId) {
  try {
    const timestamp = new Date().getTime()
    const response = await api.get(`/guests/${guestId}?_t=${timestamp}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке данных о госте ${guestId}:`, error)
    throw new Error("Не удалось загрузить данные о госте")
  }
}

// Функция для получения данных о конкретном номере
export async function fetchRoomDetails(roomId) {
  try {
    const timestamp = new Date().getTime()
    const response = await api.get(`/rooms/${roomId}?_t=${timestamp}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке данных о номере ${roomId}:`, error)
    throw new Error("Не удалось загрузить данные о номере")
  }
}

// Функция для получения заказов для конкретного номера
export async function fetchRoomOrders(roomId) {
  try {
    const allOrders = await fetchOrders()
    return allOrders.filter((order) => order.room_id === roomId)
  } catch (error) {
    console.error(`Ошибка при загрузке заказов для номера ${roomId}:`, error)
    throw new Error("Не удалось загрузить заказы для номера")
  }
}

import { Card } from "@/components/ui/card"
import { Users, DoorOpen, DoorClosed, Loader2 } from "lucide-react"

interface OccupancyProps {
  totalRooms: number
  occupiedRooms: number
  freeRooms: number
  totalGuests: number
}

interface DashboardProps {
  occupancy: OccupancyProps
  loading?: boolean
}

export function Dashboard({ occupancy, loading = false }: DashboardProps) {
  const { totalRooms, occupiedRooms, freeRooms, totalGuests } = occupancy

  return (
    <div className="bg-white p-4 border-b">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Общая информация</h2>
        {loading && (
          <span className="text-xs text-gray-500 flex items-center">
            <Loader2 className="h-3 w-3 animate-spin mr-1" /> Обновление...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Всего номеров</p>
              <p className="text-2xl font-bold">{totalRooms}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <DoorClosed className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          {loading && (
            <div className="mt-2 w-full h-0.5 bg-blue-100 overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse" style={{ width: "100%" }}></div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Занято</p>
              <p className="text-2xl font-bold">{occupiedRooms}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <DoorClosed className="h-6 w-6 text-red-600" />
            </div>
          </div>
          {loading && (
            <div className="mt-2 w-full h-0.5 bg-red-100 overflow-hidden">
              <div className="h-full bg-red-500 animate-pulse" style={{ width: "100%" }}></div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Свободно</p>
              <p className="text-2xl font-bold">{freeRooms}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <DoorOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
          {loading && (
            <div className="mt-2 w-full h-0.5 bg-green-100 overflow-hidden">
              <div className="h-full bg-green-500 animate-pulse" style={{ width: "100%" }}></div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Гостей</p>
              <p className="text-2xl font-bold">{totalGuests}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          {loading && (
            <div className="mt-2 w-full h-0.5 bg-purple-100 overflow-hidden">
              <div className="h-full bg-purple-500 animate-pulse" style={{ width: "100%" }}></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

import { Card } from "@/components/ui/card"
import { Users, DoorOpen, DoorClosed } from "lucide-react"

interface OccupancyProps {
  totalRooms: number
  occupiedRooms: number
  freeRooms: number
  totalGuests: number
}

export function Dashboard({ occupancy }: { occupancy: OccupancyProps }) {
  const { totalRooms, occupiedRooms, freeRooms, totalGuests } = occupancy

  return (
    <div className="bg-white p-4 border-b">
      <h2 className="text-xl font-bold mb-4">Общая информация</h2>

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
        </Card>
      </div>
    </div>
  )
}

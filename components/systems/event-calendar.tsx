"use client"

import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function EventCalendar() {
  const events = [
    {
      name: "District Raid",
      time: "Today, 8:00 PM",
      location: "Neon District",
      participants: 156,
      type: "Combat",
    },
    {
      name: "Trading Festival",
      time: "Tomorrow, 2:00 PM",
      location: "Marketplace",
      participants: 89,
      type: "Social",
    },
    {
      name: "Boss Battle",
      time: "Friday, 9:00 PM",
      location: "VOID Arena",
      participants: 234,
      type: "Combat",
    },
  ]

  return (
    <MobileOptimizedWrapper
      title="Events"
      preventPullToRefresh={true}
      adjustForKeyboard={false}
    >
    <div className="space-y-4">
      {events.map((event, i) => (
        <div
          key={i}
          className="p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{event.name}</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {event.participants} participants
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/30 text-sm font-bold">{event.type}</span>
          </div>
          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold">
            Join Event
          </button>
        </div>
      ))}

      <div className="p-6 rounded-xl bg-white/5 border-2 border-white/10 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">World Events</h3>
        <p className="text-gray-300">Join community events and earn exclusive rewards</p>
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}

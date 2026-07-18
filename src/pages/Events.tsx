import { useState, useEffect } from 'react'
import { getEvents, setEvents } from '../lib/data'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import { Plus, X, Calendar as CalendarIcon, MapPin } from 'lucide-react'
import { Event } from '../types'

function Events() {
  const [events, setEventsState] = useState<Event[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    event_type: 'date' as Event['event_type'],
    date: '',
    time: '',
    location: '',
    description: '',
    repeat_yearly: false,
    status: 'upcoming' as Event['status'],
  })

  useEffect(() => {
    setEventsState(getEvents())
  }, [])

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    
    const event: Event = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      event_type: newEvent.event_type,
      date: newEvent.date,
      time: newEvent.time || null,
      location: newEvent.location || null,
      description: newEvent.description || null,
      repeat_yearly: newEvent.repeat_yearly,
      status: newEvent.status,
      created_at: new Date().toISOString(),
    }

    const updatedEvents = [...events, event].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    setEvents(updatedEvents)
    setEventsState(updatedEvents)

    setShowAddForm(false)
    setNewEvent({
      title: '',
      event_type: 'date',
      date: '',
      time: '',
      location: '',
      description: '',
      repeat_yearly: false,
      status: 'upcoming',
    })
  }

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      birthday: 'Birthday',
      anniversary: 'Anniversary',
      date: 'Date',
      trip: 'Trip',
      important_day: 'Important Day',
      custom: 'Custom',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64">
      <ResponsiveNav />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm pt-4">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Events</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Events</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Event
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add Event Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Add New Event</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as Event['event_type'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="date">Date</option>
                  <option value="trip">Trip</option>
                  <option value="important_day">Important Day</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time (optional)</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (optional)</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="repeat"
                  checked={newEvent.repeat_yearly}
                  onChange={(e) => setNewEvent({ ...newEvent, repeat_yearly: e.target.checked })}
                  className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                />
                <label htmlFor="repeat" className="text-sm text-gray-700">Repeat yearly</label>
              </div>
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Save Event
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-medium text-red-500 uppercase">
                    {getEventTypeLabel(event.event_type)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800 mt-1">{event.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon size={16} />
                  <span>{formatDate(event.date)}</span>
                  {event.time && <span>at {event.time}</span>}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-gray-600 text-sm">{event.description}</p>
              )}

              {event.repeat_yearly && (
                <div className="mt-3">
                  <span className="text-xs text-gray-500">Repeats yearly</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Events

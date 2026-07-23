import { useState, useEffect } from 'react'
import { getEvents, setEvents } from '../lib/data'
import { formatDate } from '../lib/utils'
import ResponsiveNav from '../components/ResponsiveNav'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { FormInput, FormTextarea } from '../components/FormInput'
import MediaUpload from '../components/MediaUpload'
import MediaGallery from '../components/MediaGallery'
import { Plus, X, Calendar as CalendarIcon, MapPin, Gift, Cake, Heart, Plane, Star, Map, Edit2, Trash2 } from 'lucide-react'
import { Event } from '../types'
import { MediaFile } from '../lib/storage'

function Events() {
  const [events, setEventsState] = useState<Event[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsUploading(true)
    setUploadProgress(0)

    const eventId = editingEventId || `evt-${Date.now()}`
    
    // Upload media files if any
    let uploadedMedia: any[] = []
    if (mediaFiles.length > 0) {
      try {
        const { uploadMultipleMediaFiles } = await import('../lib/storage')
        uploadedMedia = await uploadMultipleMediaFiles(
          mediaFiles.map(f => f.file),
          'user-id', // TODO: Get actual user ID
          eventId,
          'event',
          (progress) => setUploadProgress(progress)
        )
      } catch (error) {
        console.error('Failed to upload media:', error)
      }
    }

    const event: Event = {
      id: eventId,
      title: newEvent.title,
      event_type: newEvent.event_type,
      date: newEvent.date,
      time: newEvent.time || null,
      location: newEvent.location || null,
      description: newEvent.description || null,
      repeat_yearly: newEvent.repeat_yearly,
      status: newEvent.status,
      created_by: editingEventId ? events.find(e => e.id === editingEventId)?.created_by || 'user-id' : 'user-id',
      created_at: editingEventId ? events.find(e => e.id === editingEventId)?.created_at || new Date().toISOString() : new Date().toISOString(),
      media: uploadedMedia.length > 0 ? uploadedMedia : events.find(e => e.id === editingEventId)?.media || []
    }

    let updatedEvents
    if (editingEventId) {
      updatedEvents = events.map(e => e.id === editingEventId ? event : e)
    } else {
      updatedEvents = [...events, event]
    }
    
    updatedEvents = updatedEvents.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    setEvents(updatedEvents)
    setEventsState(updatedEvents)

    setIsUploading(false)
    setShowAddForm(false)
    setEditingEventId(null)
    setMediaFiles([])
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

  const handleEditEvent = (event: Event) => {
    setNewEvent({
      title: event.title,
      event_type: event.event_type,
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      description: event.description || '',
      repeat_yearly: event.repeat_yearly,
      status: event.status,
    })
    setEditingEventId(event.id)
    setShowAddForm(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      setEvents(updatedEvents)
      setEventsState(updatedEvents)
    }
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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <Cake size={24} className="text-rose-600" />
      case 'anniversary': return <Heart size={24} className="text-rose-600" />
      case 'date': return <Heart size={24} className="text-coral-600" />
      case 'trip': return <Plane size={24} className="text-purple-600" />
      case 'important_day': return <Star size={24} className="text-yellow-600" />
      default: return <Map size={24} className="text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-background-primary md:ml-64">
      <ResponsiveNav />
      
      <PageHeader 
        title="Events" 
        action={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Add Event</span>
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Add/Edit Event Form */}
        {showAddForm && (
          <div className="card mb-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800 text-lg">
                {editingEventId ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddForm(false)
                  setEditingEventId(null)
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
                  setMediaFiles([])
                }} 
                className="p-2 hover:bg-background-secondary rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <FormInput
                label="Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="What's the event?"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as Event['event_type'] })}
                  className="input-field"
                >
                  <option value="birthday">🎂 Birthday</option>
                  <option value="anniversary">💕 Anniversary</option>
                  <option value="date">💝 Date</option>
                  <option value="trip">✈️ Trip</option>
                  <option value="important_day">⭐ Important Day</option>
                  <option value="custom">📌 Custom</option>
                </select>
              </div>
              <FormInput
                label="Date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
              <FormInput
                label="Time (optional)"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
              <FormInput
                label="Location (optional)"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Where?"
              />
              <FormTextarea
                label="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={2}
                placeholder="Add details..."
              />
              <div className="flex items-center gap-3 p-4 bg-background-secondary rounded-2xl">
                <input
                  type="checkbox"
                  id="repeat"
                  checked={newEvent.repeat_yearly}
                  onChange={(e) => setNewEvent({ ...newEvent, repeat_yearly: e.target.checked })}
                  className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
                />
                <label htmlFor="repeat" className="text-sm font-medium text-gray-700">Repeat yearly</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Photos & Videos</label>
                <MediaUpload 
                  mediaFiles={mediaFiles}
                  onMediaChange={setMediaFiles}
                  maxFiles={10}
                />
              </div>

              {isUploading && (
                <div className="p-4 bg-rose-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-rose-700">Uploading media...</span>
                    <span className="text-sm text-rose-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-rose-200 rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={isUploading}>
                {isUploading ? 'Uploading...' : (editingEventId ? 'Update Event' : 'Save Event')}
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No events yet"
            description="Plan your special moments together"
            action={{
              label: 'Add First Event',
              onClick: () => setShowAddForm(true)
            }}
          />
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const eventTypeIcon = getEventTypeIcon(event.event_type)
              return (
                <div 
                  key={event.id} 
                  className={`card animate-slide-up ${
                    event.status === 'completed' ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      event.event_type === 'birthday' ? 'bg-gradient-to-br from-peach-200 to-coral-200' :
                      event.event_type === 'anniversary' ? 'bg-gradient-to-br from-rose-200 to-purple-200' :
                      'bg-gradient-to-br from-peach-100 to-rose-100'
                    }`}>
                      {eventTypeIcon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                            {getEventTypeLabel(event.event_type)}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-800 mt-1">{event.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Created by {event.created_by === 'user-id' ? 'you' : 'your partner'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon size={16} className="text-rose-500" />
                          <span className="font-medium">{formatDate(event.date)}</span>
                          {event.time && <span className="text-gray-400">at {event.time}</span>}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={16} className="text-rose-500" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      )}

                      {event.media && event.media.length > 0 && (
                        <div className="mb-3">
                          <MediaGallery media={event.media} />
                        </div>
                      )}

                      {event.repeat_yearly && (
                        <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full w-fit">
                          <Gift size={14} />
                          <span>Repeats yearly</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 hover:bg-background-secondary rounded-xl transition-colors"
                          title="Edit event"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete event"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events

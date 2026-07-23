import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { formatDate } from '../lib/utils'
import { getRelationship, calculateDaysTogether } from '../lib/data'
import type { Relationship } from '../types'

function CoupleHeaderCard() {
  const [relationship, setRelationship] = useState<Relationship | null>(null)
  const [daysTogether, setDaysTogether] = useState(0)

  useEffect(() => {
    getRelationship().then(setRelationship)
    calculateDaysTogether().then(setDaysTogether)
  }, [])

  if (!relationship) {
    return (
      <div className="bg-gradient-to-br from-peach-400 via-coral-400 to-rose-400 rounded-3xl p-6 md:p-8 animate-pulse h-44" />
    )
  }

  return (
    <div className="bg-gradient-to-br from-peach-400 via-coral-400 to-rose-400 rounded-3xl p-6 md:p-8 text-white shadow-soft-lg animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex -space-x-4">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center border-4 border-white/50 backdrop-blur-sm">
            <span className="text-2xl font-bold">A</span>
          </div>
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center border-4 border-white/50 backdrop-blur-sm">
            <span className="text-2xl font-bold">R</span>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold">{relationship.name}</h2>
          <p className="text-white/90 text-sm md:text-base">{relationship.type}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
          <Heart size={28} className="text-white" />
        </div>
      </div>

      <div className="glass-card bg-white/20 backdrop-blur-md rounded-2xl p-4 md:p-6">
        <p className="text-white/90 text-sm mb-2">Together since {formatDate(relationship.start_date)}</p>
        <p className="text-4xl md:text-5xl font-bold">{daysTogether}</p>
        <p className="text-white/80 text-sm mt-1">days together</p>
      </div>
    </div>
  )
}

export default CoupleHeaderCard

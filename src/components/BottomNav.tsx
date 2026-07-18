import { Link, useLocation } from 'react-router-dom'
import { Home, Heart, Calendar, MessageSquare, User } from 'lucide-react'
import { cn } from '../lib/utils'

function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/memories', icon: Heart, label: 'Memories' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/notes', icon: MessageSquare, label: 'Notes' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "text-red-500" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon size={24} />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav

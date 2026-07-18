import { Link, useLocation } from 'react-router-dom'
import { Home, Heart, Calendar, MessageSquare, User, LogOut } from 'lucide-react'
import { cn } from '../lib/utils'
import { logout } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

function ResponsiveNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/memories', icon: Heart, label: 'Memories' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/notes', icon: MessageSquare, label: 'Notes' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Our Space</h1>
          <p className="text-sm text-gray-500 mt-1">Ali & Roma</p>
        </div>

        <nav className="flex-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
                  isActive ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
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
    </>
  )
}

export default ResponsiveNav

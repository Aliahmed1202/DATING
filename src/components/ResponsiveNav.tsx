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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-soft fixed left-0 top-0 bottom-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-peach-400 to-coral-400 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Our Space</h1>
          </div>
          <p className="text-sm text-gray-500 ml-13">Ali & Roma</p>
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
                  "flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-peach-100 to-coral-100 text-rose-700 font-semibold" 
                    : "text-gray-600 hover:bg-background-secondary"
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-soft">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-background-secondary w-full transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-soft px-2 py-2 z-50 shadow-soft">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200",
                  isActive ? "text-rose-600 bg-rose-50" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default ResponsiveNav

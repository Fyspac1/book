import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, BookOpen, Users, Calendar } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()

  const navigation = [
    { name: 'Панель управления', href: '/admin', icon: BarChart3 },
    { name: 'Книги', href: '/admin/books', icon: BookOpen },
    { name: 'Аренда', href: '/admin/rentals', icon: Calendar },
    { name: 'Пользователи', href: '/admin/users', icon: Users },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Администрирование</h2>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
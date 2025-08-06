import React, { useState, useEffect } from 'react'
import { supabase, Book, Rental, Purchase } from '../../lib/supabase'
import { BarChart3, BookOpen, Users } from 'lucide-react'

// Создаем кастомный компонент для иконки рубля
const RubleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 3H7v18h2v-6h4.5c3.04 0 5.5-2.46 5.5-5.5S16.54 3 13.5 3zm0 9H9V5h4.5C15.43 5 17 6.57 17 8.5S15.43 12 13.5 12z"/>
    <path d="M7 13h6v2H7z"/>
  </svg>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalRentals: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    activeRentals: 0,
    overdueRentals: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch books count
      const { count: booksCount } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })

      // Fetch rentals data
      const { data: rentalsData, count: rentalsCount } = await supabase
        .from('rentals')
        .select('*, books(title)', { count: 'exact' })

      // Fetch purchases data
      const { data: purchasesData, count: purchasesCount } = await supabase
        .from('purchases')
        .select('*, books(title)', { count: 'exact' })

      // Calculate revenue
      const rentalRevenue = rentalsData?.reduce((sum, rental) => sum + Number(rental.price_paid), 0) || 0
      const purchaseRevenue = purchasesData?.reduce((sum, purchase) => sum + Number(purchase.price_paid), 0) || 0

      // Calculate active and overdue rentals
      const activeRentals = rentalsData?.filter(rental => rental.status === 'active').length || 0
      const overdueRentals = rentalsData?.filter(rental => {
        return rental.status === 'active' && new Date(rental.end_date) < new Date()
      }).length || 0

      // Prepare recent activity
      const recentRentals = rentalsData?.slice(-5).map(rental => ({
        type: 'rental',
        action: 'Аренда',
        book: rental.books?.title,
        date: rental.created_at,
        amount: rental.price_paid
      })) || []

      const recentPurchases = purchasesData?.slice(-5).map(purchase => ({
        type: 'purchase',
        action: 'Покупка',
        book: purchase.books?.title,
        date: purchase.created_at,
        amount: purchase.price_paid
      })) || []

      const allActivity = [...recentRentals, ...recentPurchases]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)

      setStats({
        totalBooks: booksCount || 0,
        totalRentals: rentalsCount || 0,
        totalPurchases: purchasesCount || 0,
        totalRevenue: rentalRevenue + purchaseRevenue,
        activeRentals,
        overdueRentals,
      })

      setRecentActivity(allActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
        <p className="text-gray-600">Обзор статистики книжного магазина</p>
      </div>

      {/* Упрощенные карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Всего книг</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Активные аренды</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeRentals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Всего транзакций</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalRentals + stats.totalPurchases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <RubleIcon className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Общая выручка</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} ₽</p>
            </div>
          </div>
        </div>
      </div>

      {/* Упрощенное уведомление о просроченных арендах */}
      {stats.overdueRentals > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-red-800">
                Внимание: {stats.overdueRentals} просроченных аренд
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Упрощенная таблица последней активности */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Последняя активность</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              Нет недавней активности
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.type === 'rental' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.action}
                    </span>
                    <span className="ml-2 text-sm text-gray-900">{activity.book}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{activity.amount} ₽</span>
                    <span className="ml-2">{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


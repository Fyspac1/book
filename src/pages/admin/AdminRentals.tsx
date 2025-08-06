import React, { useState, useEffect } from 'react'
import { supabase, Rental } from '../../lib/supabase'
import { Search, Calendar, AlertTriangle } from 'lucide-react'

export default function AdminRentals() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchRentals()
  }, [])

  useEffect(() => {
    let filtered = rentals.filter(rental => {
      const matchesSearch = rental.books?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rental.books?.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || rental.status === statusFilter
      return matchesSearch && matchesStatus
    })

    // Check for overdue rentals
    filtered = filtered.map(rental => {
      if (rental.status === 'active' && new Date(rental.end_date) < new Date()) {
        return { ...rental, status: 'overdue' as const }
      }
      return rental
    })

    setFilteredRentals(filtered)
  }, [rentals, searchTerm, statusFilter])

  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          books (*),
          user_profiles (full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRentals(data || [])
    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (rentalId: string, newStatus: 'active' | 'returned' | 'overdue') => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status: newStatus })
        .eq('id', rentalId)

      if (error) throw error

      // If returning a book, update available copies
      if (newStatus === 'returned') {
        const rental = rentals.find(r => r.id === rentalId)
        if (rental) {
          await supabase
            .from('books')
            .update({
              available_copies: (rental.books?.available_copies || 0) + 1
            })
            .eq('id', rental.book_id)
        }
      }

      fetchRentals()
    } catch (error) {
      console.error('Error updating rental status:', error)
      alert('Ошибка при обновлении статуса аренды')
    }
  }

  const sendReminder = async (rentalId: string, userId: string) => {
    try {
      const rental = rentals.find(r => r.id === rentalId)
      if (!rental) return

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Напоминание об аренде',
          message: `Напоминаем, что срок аренды книги "${rental.books?.title}" истекает ${new Date(rental.end_date).toLocaleDateString()}`,
          type: 'rental_reminder'
        })

      alert('Напоминание отправлено!')
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Ошибка при отправке напоминания')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'returned':
        return 'bg-gray-100 text-gray-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активная'
      case 'returned':
        return 'Возвращена'
      case 'overdue':
        return 'Просрочена'
      default:
        return status
    }
  }

  const getRentalTypeText = (type: string) => {
    switch (type) {
      case '2weeks':
        return '2 недели'
      case '1month':
        return '1 месяц'
      case '3months':
        return '3 месяца'
      default:
        return type
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
        <h1 className="text-2xl font-bold text-gray-900">Управление арендой</h1>
        <p className="text-gray-600">Отслеживайте и управляйте арендой книг</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Поиск по книге или автору..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Все статусы</option>
          <option value="active">Активная</option>
          <option value="returned">Возвращена</option>
          <option value="overdue">Просрочена</option>
        </select>
      </div>

      {/* Rentals Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Книга
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Период
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата окончания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRentals.map((rental: any) => {
                const isOverdue = rental.status === 'active' && new Date(rental.end_date) < new Date()
                return (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={rental.books?.cover_image_url}
                          alt={rental.books?.title}
                          className="h-10 w-8 rounded object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{rental.books?.title}</div>
                          <div className="text-sm text-gray-500">{rental.books?.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rental.user_profiles?.full_name}</div>
                      <div className="text-sm text-gray-500">{rental.user_profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getRentalTypeText(rental.rental_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {new Date(rental.end_date).toLocaleDateString()}
                        {isOverdue && <AlertTriangle className="h-4 w-4 inline ml-1" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(isOverdue ? 'overdue' : rental.status)}`}>
                        {getStatusText(isOverdue ? 'overdue' : rental.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {rental.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(rental.id, 'returned')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Возвратить
                            </button>
                            <button
                              onClick={() => sendReminder(rental.id, rental.user_id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Напомнить
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredRentals.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Аренды не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
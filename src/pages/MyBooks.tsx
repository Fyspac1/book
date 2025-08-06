import React, { useState, useEffect } from 'react'
import { supabase, Rental, Purchase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Calendar, ShoppingCart, Clock, CheckCircle } from 'lucide-react'

export default function MyBooks() {
  const { user } = useAuth()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rentals' | 'purchases'>('rentals')

  useEffect(() => {
    if (user) {
      fetchUserBooks()
    }
  }, [user])

  const fetchUserBooks = async () => {
    if (!user) return

    try {
      // Fetch rentals
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select(`
          *,
          books (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (rentalsError) throw rentalsError

      // Fetch purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          books (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (purchasesError) throw purchasesError

      setRentals(rentalsData || [])
      setPurchases(purchasesData || [])
    } catch (error) {
      console.error('Error fetching user books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (rentalId: string) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status: 'returned' })
        .eq('id', rentalId)

      if (error) throw error

      // Find the rental and update book availability
      const rental = rentals.find(r => r.id === rentalId)
      if (rental) {
        await supabase
          .from('books')
          .update({
            available_copies: (rental.books?.available_copies || 0) + 1
          })
          .eq('id', rental.book_id)
      }

      alert('Книга успешно возвращена!')
      fetchUserBooks()
    } catch (error) {
      console.error('Error returning book:', error)
      alert('Ошибка при возвращении книги')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'returned':
        return 'text-gray-600 bg-gray-100'
      case 'overdue':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
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

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои книги</h1>
        <p className="text-gray-600">Управляйте своими арендованными и купленными книгами</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rentals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rentals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Аренда ({rentals.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'purchases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Покупки ({purchases.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          {rentals.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">У вас нет арендованных книг</p>
            </div>
          ) : (
            rentals.map((rental) => (
              <div key={rental.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <img
                    src={rental.books?.cover_image_url}
                    alt={rental.books?.title}
                    className="w-16 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{rental.books?.title}</h3>
                        <p className="text-sm text-gray-600">{rental.books?.author}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                        {getStatusText(rental.status)}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Срок аренды:</span>
                        <p className="text-gray-600">{getRentalTypeText(rental.rental_type)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Дата окончания:</span>
                        <p className={`${isOverdue(rental.end_date) && rental.status === 'active' ? 'text-red-600' : 'text-gray-600'}`}>
                          {new Date(rental.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Оплачено:</span>
                        <p className="text-gray-600">{rental.price_paid} ₽</p>
                      </div>
                      <div>
                        <span className="font-medium">Дата аренды:</span>
                        <p className="text-gray-600">{new Date(rental.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {rental.status === 'active' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleReturnBook(rental.id)}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Вернуть книгу</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">У вас нет купленных книг</p>
            </div>
          ) : (
            purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <img
                    src={purchase.books?.cover_image_url}
                    alt={purchase.books?.title}
                    className="w-16 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{purchase.books?.title}</h3>
                        <p className="text-sm text-gray-600">{purchase.books?.author}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Куплена
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Дата покупки:</span>
                        <p className="text-gray-600">{new Date(purchase.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Цена:</span>
                        <p className="text-gray-600">{purchase.price_paid} ₽</p>
                      </div>
                      <div>
                        <span className="font-medium">Категория:</span>
                        <p className="text-gray-600">{purchase.books?.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
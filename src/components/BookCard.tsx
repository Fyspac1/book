import React from 'react'
import { ShoppingCart, Calendar, Eye } from 'lucide-react'
import { Book } from '../lib/supabase'

interface BookCardProps {
  book: Book
  onPurchase?: (book: Book) => void
  onRent?: (book: Book) => void
  onView?: (book: Book) => void
}

export default function BookCard({ book, onPurchase, onRent, onView }: BookCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative">
        <img
          src={book.cover_image_url || 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg'}
          alt={book.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            book.available_copies > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {book.available_copies > 0 ? 'Доступно' : 'Нет в наличии'}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        <p className="text-xs text-gray-500 mb-3">{book.category} • {book.year_published}</p>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow">{book.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="font-medium">Покупка: </span>
            <span className="text-green-600 font-semibold">{book.purchase_price} ₽</span>
          </div>
          <div className="text-xs text-gray-600">
            <span>Аренда: 2 нед - {book.rental_price_2weeks} ₽ | 1 мес - {book.rental_price_1month} ₽ | 3 мес - {book.rental_price_3months} ₽</span>
          </div>
        </div>
        
        <div className="space-y-2 mt-auto">
          {/* Кнопка просмотра сверху */}
          {onView && (
            <button
              onClick={() => onView(book)}
              className="w-full flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Просмотр</span>
            </button>
          )}
          
          {/* Кнопки покупки и аренды снизу */}
          {(onPurchase || onRent) && book.available_copies > 0 && (
            <div className="flex space-x-2">
              {onPurchase && (
                <button
                  onClick={() => onPurchase(book)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Купить</span>
                </button>
              )}
              {onRent && (
                <button
                  onClick={() => onRent(book)}
                  className="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Арендовать</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



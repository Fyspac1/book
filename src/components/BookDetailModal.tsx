import React from 'react'
import { X, Calendar, ShoppingCart } from 'lucide-react'
import { Book } from '../lib/supabase'

interface BookDetailModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onPurchase?: (book: Book) => void
  onRent?: (book: Book) => void
}

export default function BookDetailModal({ book, isOpen, onClose, onPurchase, onRent }: BookDetailModalProps) {
  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Информация о книге</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Автор:</span> {book.author}</div>
                <div><span className="font-medium">Категория:</span> {book.category}</div>
                <div><span className="font-medium">Год издания:</span> {book.year_published}</div>
                <div><span className="font-medium">Доступно копий:</span> {book.available_copies} из {book.total_copies}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Цены</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Покупка:</span>
                  <span className="font-semibold text-green-600">{book.purchase_price} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Аренда (2 недели):</span>
                  <span className="font-semibold">{book.rental_price_2weeks} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Аренда (1 месяц):</span>
                  <span className="font-semibold">{book.rental_price_1month} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Аренда (3 месяца):</span>
                  <span className="font-semibold">{book.rental_price_3months} ₽</span>
                </div>
              </div>
            </div>
            
            {book.available_copies > 0 && (onPurchase || onRent) && (
              <div className="flex space-x-3">
                {onPurchase && (
                  <button
                    onClick={() => onPurchase(book)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Купить</span>
                  </button>
                )}
                {onRent && (
                  <button
                    onClick={() => onRent(book)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Арендовать</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание</h3>
          <p className="text-gray-700 leading-relaxed">{book.description}</p>
        </div>
      </div>
    </div>
  )
}
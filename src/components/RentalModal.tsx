import React, { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { Book } from '../lib/supabase'

interface RentalModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (rentalType: '2weeks' | '1month' | '3months') => void
}

export default function RentalModal({ book, isOpen, onClose, onConfirm }: RentalModalProps) {
  const [selectedType, setSelectedType] = useState<'2weeks' | '1month' | '3months'>('2weeks')

  if (!isOpen || !book) return null

  const rentalOptions = [
    { type: '2weeks' as const, label: '2 недели', price: book.rental_price_2weeks },
    { type: '1month' as const, label: '1 месяц', price: book.rental_price_1month },
    { type: '3months' as const, label: '3 месяца', price: book.rental_price_3months },
  ]

  const handleConfirm = () => {
    onConfirm(selectedType)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Аренда книги</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-20 h-28 object-cover rounded-md float-left mr-4 mb-2"
          />
          <div>
            <h4 className="font-medium text-gray-900">{book.title}</h4>
            <p className="text-sm text-gray-600">{book.author}</p>
          </div>
          <div className="clear-both"></div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Выберите срок аренды:</h4>
          <div className="space-y-2">
            {rentalOptions.map((option) => (
              <label
                key={option.type}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="rentalType"
                    value={option.type}
                    checked={selectedType === option.type}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium">{option.label}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {option.price} ₽
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>Арендовать</span>
          </button>
        </div>
      </div>
    </div>
  )
}
import React from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { Book } from '../lib/supabase'

interface PurchaseModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function PurchaseModal({ book, isOpen, onClose, onConfirm }: PurchaseModalProps) {
  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Подтверждение покупки</h3>
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
            <p className="text-lg font-semibold text-green-600 mt-2">
              {book.purchase_price} ₽
            </p>
          </div>
          <div className="clear-both"></div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Купить</span>
          </button>
        </div>
      </div>
    </div>
  )
}
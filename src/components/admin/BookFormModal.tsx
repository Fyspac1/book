import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase, Book } from '../../lib/supabase'

interface BookFormModalProps {
  isOpen: boolean
  onClose: () => void
  book?: Book | null
}

export default function BookFormModal({ isOpen, onClose, book }: BookFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    year_published: new Date().getFullYear(),
    description: '',
    cover_image_url: '',
    purchase_price: 0,
    rental_price_2weeks: 0,
    rental_price_1month: 0,
    rental_price_3months: 0,
    total_copies: 1,
    available_copies: 1,
    is_available: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        category: book.category,
        year_published: book.year_published,
        description: book.description,
        cover_image_url: book.cover_image_url,
        purchase_price: book.purchase_price,
        rental_price_2weeks: book.rental_price_2weeks,
        rental_price_1month: book.rental_price_1month,
        rental_price_3months: book.rental_price_3months,
        total_copies: book.total_copies,
        available_copies: book.available_copies,
        is_available: book.is_available,
      })
    } else {
      setFormData({
        title: '',
        author: '',
        category: '',
        year_published: new Date().getFullYear(),
        description: '',
        cover_image_url: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
        purchase_price: 0,
        rental_price_2weeks: 0,
        rental_price_1month: 0,
        rental_price_3months: 0,
        total_copies: 1,
        available_copies: 1,
        is_available: true,
      })
    }
  }, [book, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (book) {
        // Update existing book
        const { error } = await supabase
          .from('books')
          .update(formData)
          .eq('id', book.id)

        if (error) throw error
        alert('Книга успешно обновлена!')
      } else {
        // Create new book
        const { error } = await supabase
          .from('books')
          .insert([formData])

        if (error) throw error
        alert('Книга успешно добавлена!')
      }

      onClose()
    } catch (error) {
      console.error('Error saving book:', error)
      alert('Ошибка при сохранении книги')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {book ? 'Редактировать книгу' : 'Добавить новую книгу'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название книги *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Автор *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите категорию</option>
                <option value="Классика">Классика</option>
                <option value="Фэнтези">Фэнтези</option>
                <option value="Научная фантастика">Научная фантастика</option>
                <option value="Детектив">Детектив</option>
                <option value="Роман">Роман</option>
                <option value="Драма">Драма</option>
                <option value="Биография">Биография</option>
                <option value="История">История</option>
                <option value="Наука">Наука</option>
                <option value="Философия">Философия</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Год издания *
              </label>
              <input
                type="number"
                name="year_published"
                value={formData.year_published}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL обложки
            </label>
            <input
              type="url"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена покупки (₽) *
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Аренда 2 нед (₽)
              </label>
              <input
                type="number"
                name="rental_price_2weeks"
                value={formData.rental_price_2weeks}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Аренда 1 мес (₽)
              </label>
              <input
                type="number"
                name="rental_price_1month"
                value={formData.rental_price_1month}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Аренда 3 мес (₽)
              </label>
              <input
                type="number"
                name="rental_price_3months"
                value={formData.rental_price_3months}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Всего копий *
              </label>
              <input
                type="number"
                name="total_copies"
                value={formData.total_copies}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Доступно копий *
              </label>
              <input
                type="number"
                name="available_copies"
                value={formData.available_copies}
                onChange={handleChange}
                min="0"
                max={formData.total_copies}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Книга доступна для покупки/аренды
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : (book ? 'Обновить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


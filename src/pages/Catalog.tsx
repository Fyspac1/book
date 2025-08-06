import React, { useState, useEffect } from 'react'
import { supabase, Book } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import BookCard from '../components/BookCard'
import BookFilters from '../components/BookFilters'
import BookDetailModal from '../components/BookDetailModal'
import PurchaseModal from '../components/PurchaseModal'
import RentalModal from '../components/RentalModal'


export default function Catalog() {
  const { user, profile } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [sortBy, setSortBy] = useState('title')
  
  // Состояния модальных окон
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showRentalModal, setShowRentalModal] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterAndSortBooks()
  }, [books, searchTerm, selectedCategory, selectedAuthor, sortBy])

  /**
   * Получает список всех книг из базы данных
   */
  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, category, year_published, description, cover_image_url, purchase_price, rental_price_2weeks, rental_price_1month, rental_price_3months, available_copies, total_copies, is_available, created_at, updated_at')
        .order('title')

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Фильтрует и сортирует книги согласно выбранным критериям
   */
  const filterAndSortBooks = () => {
    let filtered = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || book.category === selectedCategory
      const matchesAuthor = !selectedAuthor || book.author === selectedAuthor
      
      return matchesSearch && matchesCategory && matchesAuthor
    })

    // Сортируем книги
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'author':
          return a.author.localeCompare(b.author)
        case 'year_published':
          return b.year_published - a.year_published
        case 'category':
          return a.category.localeCompare(b.category)
        case 'purchase_price':
          return a.purchase_price - b.purchase_price
        default:
          return a.title.localeCompare(b.title)
      }
    })

    setFilteredBooks(filtered)
  }

  /**
   * Обрабатывает просмотр детальной информации о книге
   */
  const handleViewBook = (book: Book) => {
    setSelectedBook(book)
    setShowDetailModal(true)
  }

  /**
   * Обрабатывает клик по кнопке покупки
   */
  const handlePurchaseClick = (book: Book) => {
    if (!user) {
      alert('Пожалуйста, войдите в систему для покупки книг')
      return
    }
    setSelectedBook(book)
    setShowPurchaseModal(true)
  }

  /**
   * Обрабатывает клик по кнопке аренды
   */
  const handleRentClick = (book: Book) => {
    if (!user) {
      alert('Пожалуйста, войдите в систему для аренды книг')
      return
    }
    setSelectedBook(book)
    setShowRentalModal(true)
  }

  /**
   * Подтверждает покупку книги
   */
  const handlePurchaseConfirm = async () => {
    if (!selectedBook || !user) return

    try {
      // Создаем запись о покупке
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          book_id: selectedBook.id,
          price_paid: selectedBook.purchase_price
        })

      if (purchaseError) throw purchaseError

      // Обновляем доступность книги
      const { error: updateError } = await supabase
        .from('books')
        .update({
          available_copies: selectedBook.available_copies - 1
        })
        .eq('id', selectedBook.id)

      if (updateError) throw updateError

      alert('Книга успешно куплена!')
      setShowPurchaseModal(false)
      setSelectedBook(null)
      fetchBooks() // Обновляем список книг
    } catch (error) {
      console.error('Error purchasing book:', error)
      alert('Ошибка при покупке книги')
    }
  }

  /**
   * Подтверждает аренду книги
   */
  const handleRentalConfirm = async (rentalType: '2weeks' | '1month' | '3months') => {
    if (!selectedBook || !user) return

    let pricePaid = 0
    let endDate = new Date()

    switch (rentalType) {
      case '2weeks':
        pricePaid = selectedBook.rental_price_2weeks
        endDate.setDate(endDate.getDate() + 14)
        break
      case '1month':
        pricePaid = selectedBook.rental_price_1month
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case '3months':
        pricePaid = selectedBook.rental_price_3months
        endDate.setMonth(endDate.getMonth() + 3)
        break
    }

    try {
      const { error: rentalError } = await supabase
        .from('rentals')
        .insert({
          user_id: user.id,
          book_id: selectedBook.id,
          rental_type: rentalType,
          end_date: endDate.toISOString(),
          price_paid: pricePaid
        })

      if (rentalError) throw rentalError

      const { error: updateError } = await supabase
        .from('books')
        .update({
          available_copies: selectedBook.available_copies - 1
        })
        .eq('id', selectedBook.id)

      if (updateError) throw updateError

      alert('Книга успешно арендована!')
      setShowRentalModal(false)
      setSelectedBook(null)
      fetchBooks()
    } catch (error) {
      console.error('Error renting book:', error)
      alert('Ошибка при аренде книги')
    }
  }

  // Получаем уникальные категории и авторов для фильтров
  const categories = [...new Set(books.map(book => book.category))]
  const authors = [...new Set(books.map(book => book.author))]

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог книг</h1>
        <p className="text-gray-600">Найдите и купите или арендуйте ваши любимые книги</p>
      </div>

      <BookFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedAuthor={selectedAuthor}
        onAuthorChange={setSelectedAuthor}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        authors={authors}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onView={handleViewBook}
            onPurchase={handlePurchaseClick}
            onRent={handleRentClick}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Книги не найдены</p>
        </div>
      )}

      {/* Модальные окна */}
      <BookDetailModal
        book={selectedBook}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedBook(null)
        }}
        onPurchase={handlePurchaseClick}
        onRent={handleRentClick}
      />

      <PurchaseModal
        book={selectedBook}
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false)
          setSelectedBook(null)
        }}
        onConfirm={handlePurchaseConfirm}
      />

      <RentalModal
        book={selectedBook}
        isOpen={showRentalModal}
        onClose={() => {
          setShowRentalModal(false)
          setSelectedBook(null)
        }}
        onConfirm={handleRentalConfirm}
      />
    </div>
  )
}


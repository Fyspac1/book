import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName)
        if (error) throw error
        alert('Аккаунт создан! Теперь вы можете войти в систему.')
        setIsSignUp(false)
      } else {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
        navigate('/')
      }
    } catch (error: any) {
      setError('Введен неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Создать аккаунт' : 'Войти в BookStore'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? (
              <>
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => { setIsSignUp(false); navigate("?mode=signin"); }}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Войти
                </button>
              </>
            ) : (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => { setIsSignUp(true); navigate("?mode=signup"); }}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Зарегистрироваться
                </button>
              </>
            )}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Полное имя
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Введите ваше полное имя"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите email адрес"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите пароль"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : (isSignUp ? 'Создать аккаунт' : 'Войти')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
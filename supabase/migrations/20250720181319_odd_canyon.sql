/*
  # Создание схемы книжного магазина

  1. Новые таблицы
    - `books` - каталог книг
      - `id` (uuid, первичный ключ)
      - `title` (text, название книги)
      - `author` (text, автор)
      - `category` (text, категория)
      - `year_published` (integer, год издания)
      - `description` (text, описание)
      - `cover_image_url` (text, URL обложки)
      - `purchase_price` (decimal, цена покупки)
      - `rental_price_2weeks` (decimal, цена аренды на 2 недели)
      - `rental_price_1month` (decimal, цена аренды на месяц)
      - `rental_price_3months` (decimal, цена аренды на 3 месяца)
      - `available_copies` (integer, доступные копии)
      - `total_copies` (integer, общее количество копий)
      - `is_available` (boolean, доступность)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_profiles` - профили пользователей
      - `id` (uuid, связь с auth.users)
      - `email` (text)
      - `full_name` (text)
      - `is_admin` (boolean, права администратора)
      - `created_at` (timestamp)

    - `rentals` - записи об аренде
      - `id` (uuid, первичный ключ)
      - `user_id` (uuid, ссылка на пользователя)
      - `book_id` (uuid, ссылка на книгу)
      - `rental_type` (text, тип аренды: '2weeks', '1month', '3months')
      - `start_date` (date, дата начала аренды)
      - `end_date` (date, дата окончания аренды)
      - `price_paid` (decimal, оплаченная сумма)
      - `status` (text, статус: 'active', 'returned', 'overdue')
      - `created_at` (timestamp)

    - `purchases` - записи о покупках
      - `id` (uuid, первичный ключ)
      - `user_id` (uuid, ссылка на пользователя)
      - `book_id` (uuid, ссылка на книгу)
      - `price_paid` (decimal, оплаченная сумма)
      - `created_at` (timestamp)

    - `notifications` - уведомления
      - `id` (uuid, первичный ключ)
      - `user_id` (uuid, ссылка на пользователя)
      - `title` (text, заголовок уведомления)
      - `message` (text, текст уведомления)
      - `type` (text, тип: 'rental_reminder', 'rental_overdue')
      - `is_read` (boolean, прочитано ли)
      - `created_at` (timestamp)

  2. Безопасность
    - Включить RLS для всех таблиц
    - Добавить политики для пользователей и администраторов
*/

-- Создание таблицы книг
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  year_published integer NOT NULL,
  description text DEFAULT '',
  cover_image_url text DEFAULT '',
  purchase_price decimal(10,2) NOT NULL DEFAULT 0,
  rental_price_2weeks decimal(10,2) NOT NULL DEFAULT 0,
  rental_price_1month decimal(10,2) NOT NULL DEFAULT 0,
  rental_price_3months decimal(10,2) NOT NULL DEFAULT 0,
  available_copies integer NOT NULL DEFAULT 1,
  total_copies integer NOT NULL DEFAULT 1,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы аренды
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  rental_type text NOT NULL CHECK (rental_type IN ('2weeks', '1month', '3months')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  price_paid decimal(10,2) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы покупок
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  price_paid decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('rental_reminder', 'rental_overdue')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Включение RLS для всех таблиц
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы books (все могут читать, админы могут изменять)
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update books"
  ON books
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete books"
  ON books
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Политики для таблицы user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Политики для таблицы rentals
CREATE POLICY "Users can read own rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rentals"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update rentals"
  ON rentals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Политики для таблицы purchases
CREATE POLICY "Users can read own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Политики для таблицы notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в таблице books
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
INSERT INTO books (title, author, category, year_published, description, cover_image_url, purchase_price, rental_price_2weeks, rental_price_1month, rental_price_3months, available_copies, total_copies) VALUES
('1984', 'Джордж Оруэлл', 'Научная фантастика', 1949, 'Антиутопический роман о тotalitarian обществе', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 25.99, 3.99, 6.99, 15.99, 5, 10),
('Мастер и Маргарита', 'Михаил Булгаков', 'Классика', 1967, 'Мистический роман о добре и зле', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 29.99, 4.99, 8.99, 19.99, 3, 8),
('Гарри Поттер и философский камень', 'Дж.К. Роулинг', 'Фэнтези', 1997, 'Первая книга о юном волшебнике', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 22.99, 3.49, 5.99, 13.99, 8, 15),
('Преступление и наказание', 'Фёдор Достоевский', 'Классика', 1866, 'Психологический роман о моральном выборе', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 27.99, 4.49, 7.99, 17.99, 4, 12),
('Дюна', 'Фрэнк Герберт', 'Научная фантастика', 1965, 'Эпическая сага о далеком будущем', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 31.99, 5.99, 9.99, 24.99, 2, 6),
('Властелин колец', 'Дж.Р.Р. Толкин', 'Фэнтези', 1954, 'Эпическое фэнтези о Средиземье', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 35.99, 6.99, 11.99, 29.99, 6, 10),
('Война и мир', 'Лев Толстой', 'Классика', 1869, 'Исторический роман о России XIX века', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 33.99, 5.49, 9.49, 22.99, 3, 8),
('Убить пересмешника', 'Харпер Ли', 'Драма', 1960, 'Роман о расовых предрассудках в американском обществе', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 24.99, 3.99, 6.49, 14.99, 7, 12);
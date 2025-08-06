/*
  # Complete Bookstore Database Schema

  1. New Tables
    - `user_profiles` - User profile information with admin flags
    - `books` - Book catalog with pricing and availability
    - `rentals` - Book rental records with different durations
    - `purchases` - Book purchase records
    - `notifications` - System notifications for users

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Admin-only policies for management operations

  3. Sample Data
    - Popular books across different categories
    - Test user profiles including admin account
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  year_published integer NOT NULL,
  description text DEFAULT '',
  cover_image_url text DEFAULT '',
  purchase_price numeric(10,2) DEFAULT 0,
  rental_price_2weeks numeric(10,2) DEFAULT 0,
  rental_price_1month numeric(10,2) DEFAULT 0,
  rental_price_3months numeric(10,2) DEFAULT 0,
  available_copies integer DEFAULT 1,
  total_copies integer DEFAULT 1,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rental_type text NOT NULL CHECK (rental_type IN ('2weeks', '1month', '3months')),
  start_date date DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  price_paid numeric(10,2) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  created_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  price_paid numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('rental_reminder', 'rental_overdue')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for books table
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
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

-- Books Policies
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  TO anon, authenticated
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

-- Rentals Policies
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

-- Purchases Policies
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

-- Notifications Policies
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

-- Insert sample books data
INSERT INTO books (title, author, category, year_published, description, cover_image_url, purchase_price, rental_price_2weeks, rental_price_1month, rental_price_3months, available_copies, total_copies) VALUES
('Война и мир', 'Лев Толстой', 'Классическая литература', 1869, 'Эпический роман о русском обществе в эпоху наполеоновских войн', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 25.99, 3.99, 6.99, 12.99, 5, 5),
('Преступление и наказание', 'Федор Достоевский', 'Классическая литература', 1866, 'Психологический роман о студенте Раскольникове и его внутренней борьбе', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 22.99, 3.49, 6.49, 11.99, 3, 5),
('Мастер и Маргарита', 'Михаил Булгаков', 'Фантастика', 1967, 'Мистический роман о дьяволе в советской Москве', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 24.99, 3.79, 6.79, 12.49, 4, 5),
('Анна Каренина', 'Лев Толстой', 'Классическая литература', 1877, 'Трагическая история любви Анны Карениной', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 23.99, 3.69, 6.69, 12.29, 2, 5),
('Евгений Онегин', 'Александр Пушкин', 'Поэзия', 1833, 'Роман в стихах о жизни русского дворянства', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 19.99, 2.99, 5.99, 10.99, 6, 6),
('Гарри Поттер и философский камень', 'Дж.К. Роулинг', 'Фэнтези', 1997, 'Первая книга о юном волшебнике Гарри Поттере', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 18.99, 2.89, 5.89, 10.89, 8, 10),
('Властелин колец: Братство кольца', 'Дж.Р.Р. Толкин', 'Фэнтези', 1954, 'Эпическое фэнтези о путешествии хоббита Фродо', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 26.99, 4.19, 7.19, 13.49, 4, 6),
('1984', 'Джордж Оруэлл', 'Антиутопия', 1949, 'Дистопический роман о тоталитарном обществе', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 21.99, 3.39, 6.39, 11.79, 5, 7),
('Убить пересмешника', 'Харпер Ли', 'Драма', 1960, 'История о расовых предрассудках в американском Юге', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 20.99, 3.19, 6.19, 11.49, 3, 5),
('Великий Гэтсби', 'Фрэнсис Скотт Фицджеральд', 'Классическая литература', 1925, 'История о богатстве и любви в эпоху джаза', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 19.99, 2.99, 5.99, 10.99, 4, 6),
('Гордость и предубеждение', 'Джейн Остин', 'Романтика', 1813, 'Классический роман о любви и социальных предрассудках', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 18.99, 2.89, 5.89, 10.89, 5, 7),
('Дюна', 'Фрэнк Герберт', 'Научная фантастика', 1965, 'Эпическая сага о планете Арракис и специи', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 27.99, 4.39, 7.39, 13.99, 3, 5),
('Автостопом по галактике', 'Дуглас Адамс', 'Юмористическая фантастика', 1979, 'Комедийная научная фантастика о путешествиях по вселенной', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 17.99, 2.69, 5.69, 10.49, 6, 8),
('Сто лет одиночества', 'Габриэль Гарсиа Маркес', 'Магический реализм', 1967, 'Семейная сага рода Буэндиа в вымышленном городе Макондо', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 24.99, 3.79, 6.79, 12.49, 2, 4),
('Над пропастью во ржи', 'Дж.Д. Сэлинджер', 'Современная литература', 1951, 'История подростка Холдена Колфилда в Нью-Йорке', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 20.99, 3.19, 6.19, 11.49, 4, 6),
('Маленький принц', 'Антуан де Сент-Экзюпери', 'Философская сказка', 1943, 'Аллегорическая повесть о маленьком принце с астероида', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 16.99, 2.49, 5.49, 9.99, 7, 10),
('Алхимик', 'Пауло Коэльо', 'Философская литература', 1988, 'Притча о пастухе, ищущем свою мечту', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 19.99, 2.99, 5.99, 10.99, 5, 8),
('Код да Винчи', 'Дэн Браун', 'Триллер', 2003, 'Детективный триллер о тайнах христианства', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 22.99, 3.49, 6.49, 11.99, 3, 6),
('Девочка с татуировкой дракона', 'Стиг Ларссон', 'Детектив', 2005, 'Скандинавский детектив о журналисте и хакере', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 21.99, 3.39, 6.39, 11.79, 4, 7),
('Игра престолов', 'Джордж Р.Р. Мартин', 'Фэнтези', 1996, 'Эпическое фэнтези о борьбе за Железный трон', 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', 28.99, 4.59, 7.59, 14.49, 2, 5);
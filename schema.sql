-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  coverUrl TEXT,
  description TEXT,
  publishedYear INTEGER,
  totalCopies INTEGER DEFAULT 1,
  availableCopies INTEGER DEFAULT 1,
  popularity INTEGER DEFAULT 0
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  membershipDate TEXT NOT NULL
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  bookId TEXT NOT NULL,
  userId TEXT NOT NULL,
  loanDate TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  returnDate TEXT,
  overdueDays INTEGER DEFAULT 0,
  fineAmount REAL DEFAULT 0.0,
  FOREIGN KEY (bookId) REFERENCES books(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Insert sample data
INSERT OR IGNORE INTO books (id, title, author, isbn, category, coverUrl, description, publishedYear, totalCopies, availableCopies, popularity) VALUES
('1', 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Classic Literature', 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg?default=true', 'A portrait of the Jazz Age in all of its decadence and excess, following the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.', 1925, 6, 6, 95),
('2', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '9780062316097', 'History', 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg?default=true', 'A groundbreaking narrative of humanity''s creation and evolution that explores how biology and history have defined us.', 2014, 7, 7, 92),
('3', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg?default=true', NULL, NULL, 10, 10, 0),
('4', 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'Computer Science', 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg?default=true', NULL, NULL, 8, 8, 0),
('5', 'The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Software Development', 'https://covers.openlibrary.org/b/isbn/9780201616224-M.jpg?default=true', NULL, NULL, 7, 7, 0),
('6', 'JavaScript: The Good Parts', 'Douglas Crockford', '9780596517748', 'Web Development', 'https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('7', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '9780136042594', 'Artificial Intelligence', 'https://covers.openlibrary.org/b/isbn/9780136042594-M.jpg?default=true', NULL, NULL, 5, 5, 0),
('8', 'Database System Concepts', 'Abraham Silberschatz', '9780073523323', 'Database', 'https://covers.openlibrary.org/b/isbn/9780073523323-M.jpg?default=true', NULL, NULL, 9, 9, 0),
('9', 'Computer Networks', 'Andrew S. Tanenbaum', '9780132126953', 'Networking', 'https://covers.openlibrary.org/b/isbn/9780132126953-M.jpg?default=true', NULL, NULL, 8, 8, 0),
('10', 'Operating System Concepts', 'Abraham Silberschatz', '9781118063330', 'Operating Systems', 'https://covers.openlibrary.org/b/isbn/9781118063330-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('11', 'You Don''t Know JS', 'Kyle Simpson', '9781491904244', 'Web Development', 'https://covers.openlibrary.org/b/isbn/9781491904244-M.jpg?default=true', NULL, NULL, 7, 7, 0),
('12', 'Eloquent JavaScript', 'Marijn Haverbeke', '9781593279509', 'Programming', 'https://covers.openlibrary.org/b/isbn/9781593279509-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('13', 'Python Crash Course', 'Eric Matthes', '9781593276034', 'Programming', 'https://covers.openlibrary.org/b/isbn/9781593276034-M.jpg?default=true', NULL, NULL, 8, 8, 0),
('14', 'Learning React', 'Alex Banks', '9781492051725', 'Web Development', 'https://covers.openlibrary.org/b/isbn/9781492051725-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('15', 'Head First Java', 'Kathy Sierra', '9780596009205', 'Programming', 'https://covers.openlibrary.org/b/isbn/9780596009205-M.jpg?default=true', NULL, NULL, 9, 9, 0),
('16', 'Blockchain Basics', 'Daniel Drescher', '9781484226032', 'Blockchain', 'https://covers.openlibrary.org/b/isbn/9781484226032-M.jpg?default=true', NULL, NULL, 5, 5, 0),
('17', 'Mastering Bitcoin', 'Andreas M. Antonopoulos', '9781491954386', 'Blockchain', 'https://covers.openlibrary.org/b/isbn/9781491954386-M.jpg?default=true', NULL, NULL, 5, 5, 0),
('18', 'Cybersecurity Essentials', 'Charles J. Brooks', '9781119362395', 'Cybersecurity', 'https://covers.openlibrary.org/b/isbn/9781119362395-M.jpg?default=true', NULL, NULL, 7, 7, 0),
('19', 'Ethical Hacking', 'Daniel G. Graham', '9780789751270', 'Cybersecurity', 'https://covers.openlibrary.org/b/isbn/9780789751270-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('20', 'Machine Learning Basics', 'Sebastian Raschka', '9781789955750', 'Machine Learning', 'https://covers.openlibrary.org/b/isbn/9781789955750-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('21', 'Data Structures and Algorithms in Java', 'Robert Lafore', '9780672324536', 'Algorithms', 'https://covers.openlibrary.org/b/isbn/9780672324536-M.jpg?default=true', NULL, NULL, 8, 8, 0),
('22', 'Web Development with Node.js', 'David Herron', '9781785885587', 'Web Development', 'https://covers.openlibrary.org/b/isbn/9781785885587-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('23', 'A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Physics', 'https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('24', 'The Selfish Gene', 'Richard Dawkins', '9780199291151', 'Biology', 'https://covers.openlibrary.org/b/isbn/9780199291151-M.jpg?default=true', NULL, NULL, 5, 5, 0),
('25', 'The Origin of Species', 'Charles Darwin', '9781509827695', 'Biology', 'https://covers.openlibrary.org/b/isbn/9781509827695-M.jpg?default=true', NULL, NULL, 4, 4, 0),
('26', 'The Alchemist', 'Paulo Coelho', '9780062315007', 'Fiction', 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg?default=true', NULL, NULL, 8, 8, 0),
('27', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Literature', 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg?default=true', NULL, NULL, 7, 7, 0),
('28', 'Pride and Prejudice', 'Jane Austen', '9780141439518', 'Classic Literature', 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('29', 'Guns, Germs, and Steel', 'Jared Diamond', '9780393317558', 'History', 'https://covers.openlibrary.org/b/isbn/9780393317558-M.jpg?default=true', NULL, NULL, 5, 5, 0),
('30', 'The Art of War', 'Sun Tzu', '9781590302255', 'Strategy', 'https://covers.openlibrary.org/b/isbn/9781590302255-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('31', 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Psychology', 'https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg?default=true', NULL, NULL, 7, 7, 0),
('32', 'The Power of Habit', 'Charles Duhigg', '9780812981605', 'Self-Help', 'https://covers.openlibrary.org/b/isbn/9780812981605-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('33', 'Rich Dad Poor Dad', 'Robert Kiyosaki', '9781612680194', 'Finance', 'https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg?default=true', NULL, NULL, 8, 8, 0),
('34', 'The Lean Startup', 'Eric Ries', '9780307887894', 'Business', 'https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('35', 'Zero to One', 'Peter Thiel', '9780804139298', 'Entrepreneurship', 'https://covers.openlibrary.org/b/isbn/9780804139298-M.jpg?default=true', NULL, NULL, 6, 6, 0),
('36', 'The Intelligent Investor', 'Benjamin Graham', '9780060555665', 'Finance', 'https://covers.openlibrary.org/b/isbn/9780060555665-M.jpg?default=true', NULL, NULL, 7, 7, 0),
('37', 'Cosmos', 'Carl Sagan', '9780345331359', 'Astronomy', 'https://covers.openlibrary.org/b/isbn/9780345331359-M.jpg?default=true', NULL, NULL, 5, 5, 0),
('38', 'The Gene: An Intimate History', 'Siddhartha Mukherjee', '9781476733500', 'Genetics', 'https://covers.openlibrary.org/b/isbn/9781476733500-M.jpg?default=true', NULL, NULL, 5, 5, 0),
('39', 'The Hobbit', 'J. R. R. Tolkien', '9780547928227', 'Fantasy', 'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg?default=true', NULL, NULL, 9, 9, 0),
('40', 'Harry Potter and the Philosopher''s Stone', 'J. K. Rowling', '9780747532699', 'Fantasy', 'https://covers.openlibrary.org/b/isbn/9780747532699-M.jpg?default=true', NULL, NULL, 10, 10, 0);

-- Ensure seeded books match expected availability and have cover URLs
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg?default=true' WHERE id = '1';
UPDATE books SET totalCopies = 7, availableCopies = 7, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg?default=true' WHERE id = '2';
UPDATE books SET totalCopies = 10, availableCopies = 10, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg?default=true' WHERE id = '3';
UPDATE books SET totalCopies = 8, availableCopies = 8, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg?default=true' WHERE id = '4';
UPDATE books SET totalCopies = 7, availableCopies = 7, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780201616224-M.jpg?default=true' WHERE id = '5';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg?default=true' WHERE id = '6';
UPDATE books SET totalCopies = 5, availableCopies = 5, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780136042594-M.jpg?default=true' WHERE id = '7';
UPDATE books SET totalCopies = 9, availableCopies = 9, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780073523323-M.jpg?default=true' WHERE id = '8';
UPDATE books SET totalCopies = 8, availableCopies = 8, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780132126953-M.jpg?default=true' WHERE id = '9';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781118063330-M.jpg?default=true' WHERE id = '10';
UPDATE books SET totalCopies = 7, availableCopies = 7, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781491904244-M.jpg?default=true' WHERE id = '11';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781593279509-M.jpg?default=true' WHERE id = '12';
UPDATE books SET totalCopies = 8, availableCopies = 8, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781593276034-M.jpg?default=true' WHERE id = '13';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781492051725-M.jpg?default=true' WHERE id = '14';
UPDATE books SET totalCopies = 9, availableCopies = 9, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780596009205-M.jpg?default=true' WHERE id = '15';
UPDATE books SET totalCopies = 5, availableCopies = 5, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781484226032-M.jpg?default=true' WHERE id = '16';
UPDATE books SET totalCopies = 5, availableCopies = 5, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781491954386-M.jpg?default=true' WHERE id = '17';
UPDATE books SET totalCopies = 7, availableCopies = 7, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781119362395-M.jpg?default=true' WHERE id = '18';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780789751270-M.jpg?default=true' WHERE id = '19';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781789955750-M.jpg?default=true' WHERE id = '20';
UPDATE books SET totalCopies = 8, availableCopies = 8, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780672324536-M.jpg?default=true' WHERE id = '21';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781785885587-M.jpg?default=true' WHERE id = '22';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg?default=true' WHERE id = '23';
UPDATE books SET totalCopies = 5, availableCopies = 5, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780199291151-M.jpg?default=true' WHERE id = '24';
UPDATE books SET totalCopies = 4, availableCopies = 4, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781509827695-M.jpg?default=true' WHERE id = '25';
UPDATE books SET totalCopies = 8, availableCopies = 8, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg?default=true' WHERE id = '26';
UPDATE books SET totalCopies = 7, availableCopies = 7, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg?default=true' WHERE id = '27';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg?default=true' WHERE id = '28';
UPDATE books SET totalCopies = 5, availableCopies = 5, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780393317558-M.jpg?default=true' WHERE id = '29';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781590302255-M.jpg?default=true' WHERE id = '30';
UPDATE books SET totalCopies = 7, availableCopies = 7, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg?default=true' WHERE id = '31';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780812981605-M.jpg?default=true' WHERE id = '32';
UPDATE books SET totalCopies = 8, availableCopies = 8, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg?default=true' WHERE id = '33';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg?default=true' WHERE id = '34';
UPDATE books SET totalCopies = 6, availableCopies = 6, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780804139298-M.jpg?default=true' WHERE id = '35';
UPDATE books SET totalCopies = 7, availableCopies = 7, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780060555665-M.jpg?default=true' WHERE id = '36';
UPDATE books SET totalCopies = 5, availableCopies = 5, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780345331359-M.jpg?default=true' WHERE id = '37';
UPDATE books SET totalCopies = 5, availableCopies = 5, coverUrl = 'https://covers.openlibrary.org/b/isbn/9781476733500-M.jpg?default=true' WHERE id = '38';
UPDATE books SET totalCopies = 9, availableCopies = 9, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg?default=true' WHERE id = '39';
UPDATE books SET totalCopies = 10, availableCopies = 10, coverUrl = 'https://covers.openlibrary.org/b/isbn/9780747532699-M.jpg?default=true' WHERE id = '40';

-- Ensure all books have descriptions (only update if missing)
UPDATE books SET description = 'A portrait of the Jazz Age in all of its decadence and excess, following Jay Gatsby''s obsession with Daisy Buchanan.' WHERE id = '1' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A sweeping history of humankind that explores how biology and culture shaped the world as we know it.' WHERE id = '2' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A handbook of agile software craftsmanship that teaches the principles of writing clean, maintainable code.' WHERE id = '3' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A comprehensive textbook on algorithms, covering design, analysis, and practical implementation.' WHERE id = '4' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A classic guide to building pragmatic and professional software with practical best practices.' WHERE id = '5' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A deep dive into the strengths of JavaScript and how to use the language effectively.' WHERE id = '6' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A comprehensive introduction to the theory and practice of artificial intelligence.' WHERE id = '7' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A foundational book on database systems, including design, implementation, and theory.' WHERE id = '8' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'An in-depth look at network architecture, protocols, and communication.' WHERE id = '9' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A comprehensive guide to operating system design and implementation.' WHERE id = '10' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A deep dive into core JavaScript concepts for developers seeking mastery.' WHERE id = '11' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A modern introduction to programming using JavaScript with practical examples.' WHERE id = '12' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A fast-paced introduction to Python for beginners with real-world projects.' WHERE id = '13' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A practical guide to building modern web apps with React and its ecosystem.' WHERE id = '14' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A visually rich introduction to Java that makes learning fun and effective.' WHERE id = '15' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A non-technical introduction to blockchain technology and its real-world uses.' WHERE id = '16' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A deep technical dive into Bitcoin and decentralized systems for developers.' WHERE id = '17' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A thorough overview of cybersecurity principles, risks, and defensive strategies.' WHERE id = '18' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A practical guide to penetration testing and ethical hacking methodologies.' WHERE id = '19' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'An entry-level introduction to machine learning concepts and practical tools.' WHERE id = '20' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A solid introduction to data structures and algorithm design in Java.' WHERE id = '21' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A practical guide to building scalable web apps using Node.js.' WHERE id = '22' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'An accessible exploration of cosmology, black holes, and the nature of the universe.' WHERE id = '23' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A landmark book on evolution and the role of genes in shaping behavior.' WHERE id = '24' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'The foundational text on evolution and natural selection.' WHERE id = '25' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A philosophical tale about following your dreams and finding your destiny.' WHERE id = '26' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A classic novel about justice, morality, and childhood in the American South.' WHERE id = '27' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A witty novel about love, family, and social expectations in Regency England.' WHERE id = '28' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'An analysis of how geography and environment shaped the modern world.' WHERE id = '29' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'An ancient treatise on strategy, leadership, and conflict management.' WHERE id = '30' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A deep dive into how our minds work and how we make decisions.' WHERE id = '31' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A practical guide to understanding and changing habits for better outcomes.' WHERE id = '32' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A personal finance book about investing, assets, and achieving financial independence.' WHERE id = '33' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A guide for entrepreneurs on how to build startups more efficiently using lean principles.' WHERE id = '34' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'Insights on building innovative startups that go from zero to one.' WHERE id = '35' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A classic investing guide focused on value investing and long-term strategy.' WHERE id = '36' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A sweeping tour of the universe from a celebrated astrophysicist.' WHERE id = '37' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A narrative history of the gene and its influence on human identity and disease.' WHERE id = '38' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'A fantasy adventure that follows Bilbo Baggins on a journey filled with dragons and dwarves.' WHERE id = '39' AND (description IS NULL OR TRIM(description) = '');
UPDATE books SET description = 'The first book in the Harry Potter series introduces Hogwarts and the boy wizard.' WHERE id = '40' AND (description IS NULL OR TRIM(description) = '');

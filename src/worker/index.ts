import { Hono } from "hono";
import { cors } from "hono/cors";
import { Book, User, Loan } from "./types";

interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_COVER_URL = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=true`;

const SEED_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    category: "Classic Literature",
    coverUrl: DEFAULT_COVER_URL("9780743273565"),
    description:
      "A portrait of the Jazz Age in all of its decadence and excess, following Jay Gatsby's obsession with Daisy Buchanan.",
    publishedYear: 1925,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 95,
  },
  {
    id: "2",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    category: "History",
    coverUrl: DEFAULT_COVER_URL("9780062316097"),
    description:
      "A sweeping history of humankind that explores how biology and culture shaped the world as we know it.",
    publishedYear: 2014,
    totalCopies: 7,
    availableCopies: 7,
    popularity: 92,
  },
  {
    id: "3",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    category: "Programming",
    coverUrl: DEFAULT_COVER_URL("9780132350884"),
    description:
      "A handbook of agile software craftsmanship that teaches the principles of writing clean, maintainable code.",
    publishedYear: 2008,
    totalCopies: 10,
    availableCopies: 10,
    popularity: 88,
  },
  {
    id: "4",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "9780262033848",
    category: "Computer Science",
    coverUrl: DEFAULT_COVER_URL("9780262033848"),
    description:
      "A comprehensive textbook on algorithms, covering design, analysis, and practical implementation.",
    publishedYear: 2009,
    totalCopies: 8,
    availableCopies: 8,
    popularity: 85,
  },
  {
    id: "5",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    isbn: "9780201616224",
    category: "Software Development",
    coverUrl: DEFAULT_COVER_URL("9780201616224"),
    description:
      "A classic guide to building pragmatic and professional software with practical best practices.",
    publishedYear: 1999,
    totalCopies: 7,
    availableCopies: 7,
    popularity: 90,
  },
  {
    id: "6",
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    isbn: "9780596517748",
    category: "Web Development",
    coverUrl: DEFAULT_COVER_URL("9780596517748"),
    description:
      "A deep dive into the strengths of JavaScript and how to use the language effectively.",
    publishedYear: 2008,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 88,
  },
  {
    id: "7",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell",
    isbn: "9780136042594",
    category: "Artificial Intelligence",
    coverUrl: DEFAULT_COVER_URL("9780136042594"),
    description:
      "A comprehensive introduction to the theory and practice of artificial intelligence.",
    publishedYear: 2010,
    totalCopies: 5,
    availableCopies: 5,
    popularity: 86,
  },
  {
    id: "8",
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    isbn: "9780073523323",
    category: "Database",
    coverUrl: DEFAULT_COVER_URL("9780073523323"),
    description:
      "A foundational book on database systems, including design, implementation, and theory.",
    publishedYear: 2010,
    totalCopies: 9,
    availableCopies: 9,
    popularity: 84,
  },
  {
    id: "9",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    isbn: "9780132126953",
    category: "Networking",
    coverUrl: DEFAULT_COVER_URL("9780132126953"),
    description:
      "An in-depth look at network architecture, protocols, and communication.",
    publishedYear: 2010,
    totalCopies: 8,
    availableCopies: 8,
    popularity: 83,
  },
  {
    id: "10",
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    isbn: "9781118063330",
    category: "Operating Systems",
    coverUrl: DEFAULT_COVER_URL("9781118063330"),
    description:
      "A comprehensive guide to operating system design and implementation.",
    publishedYear: 2012,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 82,
  },
  {
    id: "11",
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    isbn: "9781491904244",
    category: "Web Development",
    coverUrl: DEFAULT_COVER_URL("9781491904244"),
    description:
      "A deep dive into core JavaScript concepts for developers seeking mastery.",
    publishedYear: 2015,
    totalCopies: 7,
    availableCopies: 7,
    popularity: 86,
  },
  {
    id: "12",
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    isbn: "9781593279509",
    category: "Programming",
    coverUrl: DEFAULT_COVER_URL("9781593279509"),
    description:
      "A modern introduction to programming using JavaScript with practical examples.",
    publishedYear: 2018,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 84,
  },
  {
    id: "13",
    title: "Python Crash Course",
    author: "Eric Matthes",
    isbn: "9781593276034",
    category: "Programming",
    coverUrl: DEFAULT_COVER_URL("9781593276034"),
    description:
      "A fast-paced introduction to Python for beginners with real-world projects.",
    publishedYear: 2015,
    totalCopies: 8,
    availableCopies: 8,
    popularity: 85,
  },
  {
    id: "14",
    title: "Learning React",
    author: "Alex Banks",
    isbn: "9781492051725",
    category: "Web Development",
    coverUrl: DEFAULT_COVER_URL("9781492051725"),
    description:
      "A practical guide to building modern web apps with React and its ecosystem.",
    publishedYear: 2020,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 83,
  },
  {
    id: "15",
    title: "Head First Java",
    author: "Kathy Sierra",
    isbn: "9780596009205",
    category: "Programming",
    coverUrl: DEFAULT_COVER_URL("9780596009205"),
    description:
      "A visually rich introduction to Java that makes learning fun and effective.",
    publishedYear: 2005,
    totalCopies: 9,
    availableCopies: 9,
    popularity: 82,
  },
  {
    id: "16",
    title: "Blockchain Basics",
    author: "Daniel Drescher",
    isbn: "9781484226032",
    category: "Blockchain",
    coverUrl: DEFAULT_COVER_URL("9781484226032"),
    description:
      "A non-technical introduction to blockchain technology and its real-world uses.",
    publishedYear: 2017,
    totalCopies: 5,
    availableCopies: 5,
    popularity: 80,
  },
  {
    id: "17",
    title: "Mastering Bitcoin",
    author: "Andreas M. Antonopoulos",
    isbn: "9781491954386",
    category: "Blockchain",
    coverUrl: DEFAULT_COVER_URL("9781491954386"),
    description:
      "A deep technical dive into Bitcoin and decentralized systems for developers.",
    publishedYear: 2014,
    totalCopies: 5,
    availableCopies: 5,
    popularity: 81,
  },
  {
    id: "18",
    title: "Cybersecurity Essentials",
    author: "Charles J. Brooks",
    isbn: "9781119362395",
    category: "Cybersecurity",
    coverUrl: DEFAULT_COVER_URL("9781119362395"),
    description:
      "A thorough overview of cybersecurity principles, risks, and defensive strategies.",
    publishedYear: 2018,
    totalCopies: 7,
    availableCopies: 7,
    popularity: 79,
  },
  {
    id: "19",
    title: "Ethical Hacking",
    author: "Daniel G. Graham",
    isbn: "9780789751270",
    category: "Cybersecurity",
    coverUrl: DEFAULT_COVER_URL("9780789751270"),
    description:
      "A practical guide to penetration testing and ethical hacking methodologies.",
    publishedYear: 2012,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 78,
  },
  {
    id: "20",
    title: "Machine Learning Basics",
    author: "Sebastian Raschka",
    isbn: "9781789955750",
    category: "Machine Learning",
    coverUrl: DEFAULT_COVER_URL("9781789955750"),
    description:
      "An entry-level introduction to machine learning concepts and practical tools.",
    publishedYear: 2015,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 80,
  },
  {
    id: "21",
    title: "Data Structures and Algorithms in Java",
    author: "Robert Lafore",
    isbn: "9780672324536",
    category: "Algorithms",
    coverUrl: DEFAULT_COVER_URL("9780672324536"),
    description:
      "A solid introduction to data structures and algorithm design in Java.",
    publishedYear: 2002,
    totalCopies: 8,
    availableCopies: 8,
    popularity: 79,
  },
  {
    id: "22",
    title: "Web Development with Node.js",
    author: "David Herron",
    isbn: "9781785885587",
    category: "Web Development",
    coverUrl: DEFAULT_COVER_URL("9781785885587"),
    description:
      "A practical guide to building scalable web apps using Node.js.",
    publishedYear: 2017,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 77,
  },
  {
    id: "23",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    category: "Physics",
    coverUrl: DEFAULT_COVER_URL("9780553380163"),
    description:
      "An accessible exploration of cosmology, black holes, and the nature of the universe.",
    publishedYear: 1988,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 90,
  },
  {
    id: "24",
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    isbn: "9780199291151",
    category: "Biology",
    coverUrl: DEFAULT_COVER_URL("9780199291151"),
    description:
      "A landmark book on evolution and the role of genes in shaping behavior.",
    publishedYear: 1976,
    totalCopies: 5,
    availableCopies: 5,
    popularity: 88,
  },
  {
    id: "25",
    title: "The Origin of Species",
    author: "Charles Darwin",
    isbn: "9781509827695",
    category: "Biology",
    coverUrl: DEFAULT_COVER_URL("9781509827695"),
    description:
      "The foundational text on evolution and natural selection.",
    publishedYear: 1859,
    totalCopies: 4,
    availableCopies: 4,
    popularity: 87,
  },
  {
    id: "26",
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "9780062315007",
    category: "Fiction",
    coverUrl: DEFAULT_COVER_URL("9780062315007"),
    description:
      "A philosophical tale about following your dreams and finding your destiny.",
    publishedYear: 1988,
    totalCopies: 8,
    availableCopies: 8,
    popularity: 91,
  },
  {
    id: "27",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    category: "Literature",
    coverUrl: DEFAULT_COVER_URL("9780061120084"),
    description:
      "A classic novel about justice, morality, and childhood in the American South.",
    publishedYear: 1960,
    totalCopies: 7,
    availableCopies: 7,
    popularity: 92,
  },
  {
    id: "28",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    category: "Classic Literature",
    coverUrl: DEFAULT_COVER_URL("9780141439518"),
    description:
      "A witty novel about love, family, and social expectations in Regency England.",
    publishedYear: 1813,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 90,
  },
  {
    id: "29",
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    isbn: "9780393317558",
    category: "History",
    coverUrl: DEFAULT_COVER_URL("9780393317558"),
    description:
      "An analysis of how geography and environment shaped the modern world.",
    publishedYear: 1997,
    totalCopies: 5,
    availableCopies: 5,
    popularity: 89,
  },
  {
    id: "30",
    title: "The Art of War",
    author: "Sun Tzu",
    isbn: "9781590302255",
    category: "Strategy",
    coverUrl: DEFAULT_COVER_URL("9781590302255"),
    description:
      "An ancient treatise on strategy, leadership, and conflict management.",
    publishedYear: -500,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 88,
  },
  {
    id: "31",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "9780374533557",
    category: "Psychology",
    coverUrl: DEFAULT_COVER_URL("9780374533557"),
    description:
      "A deep dive into how our minds work and how we make decisions.",
    publishedYear: 2011,
    totalCopies: 7,
    availableCopies: 7,
    popularity: 90,
  },
  {
    id: "32",
    title: "The Power of Habit",
    author: "Charles Duhigg",
    isbn: "9780812981605",
    category: "Self-Help",
    coverUrl: DEFAULT_COVER_URL("9780812981605"),
    description:
      "A practical guide to understanding and changing habits for better outcomes.",
    publishedYear: 2012,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 88,
  },
  {
    id: "33",
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    isbn: "9781612680194",
    category: "Finance",
    coverUrl: DEFAULT_COVER_URL("9781612680194"),
    description:
      "A personal finance book about investing, assets, and achieving financial independence.",
    publishedYear: 1997,
    totalCopies: 8,
    availableCopies: 8,
    popularity: 87,
  },
  {
    id: "34",
    title: "The Lean Startup",
    author: "Eric Ries",
    isbn: "9780307887894",
    category: "Business",
    coverUrl: DEFAULT_COVER_URL("9780307887894"),
    description:
      "A guide for entrepreneurs on how to build startups more efficiently using lean principles.",
    publishedYear: 2011,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 86,
  },
  {
    id: "35",
    title: "Zero to One",
    author: "Peter Thiel",
    isbn: "9780804139298",
    category: "Entrepreneurship",
    coverUrl: DEFAULT_COVER_URL("9780804139298"),
    description:
      "Insights on building innovative startups that go from zero to one.",
    publishedYear: 2014,
    totalCopies: 6,
    availableCopies: 6,
    popularity: 85,
  },
  {
    id: "36",
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    isbn: "9780060555665",
    category: "Finance",
    coverUrl: DEFAULT_COVER_URL("9780060555665"),
    description:
      "A classic investing guide focused on value investing and long-term strategy.",
    publishedYear: 1949,
    totalCopies: 7,
    availableCopies: 7,
    popularity: 89,
  },
  {
    id: "37",
    title: "Cosmos",
    author: "Carl Sagan",
    isbn: "9780345331359",
    category: "Astronomy",
    coverUrl: DEFAULT_COVER_URL("9780345331359"),
    description:
      "A sweeping tour of the universe from a celebrated astrophysicist.",
    publishedYear: 1980,
    totalCopies: 5,
    availableCopies: 5,
    popularity: 88,
  },
  {
    id: "38",
    title: "The Gene: An Intimate History",
    author: "Siddhartha Mukherjee",
    isbn: "9781476733500",
    category: "Genetics",
    coverUrl: DEFAULT_COVER_URL("9781476733500"),
    description:
      "A narrative history of the gene and its influence on human identity and disease.",
    publishedYear: 2016,
    totalCopies: 5,
    availableCopies: 5,
    popularity: 87,
  },
  {
    id: "39",
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
    isbn: "9780547928227",
    category: "Fantasy",
    coverUrl: DEFAULT_COVER_URL("9780547928227"),
    description:
      "A fantasy adventure that follows Bilbo Baggins on a journey filled with dragons and dwarves.",
    publishedYear: 1937,
    totalCopies: 9,
    availableCopies: 9,
    popularity: 93,
  },
  {
    id: "40",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J. K. Rowling",
    isbn: "9780747532699",
    category: "Fantasy",
    coverUrl: DEFAULT_COVER_URL("9780747532699"),
    description:
      "The first book in the Harry Potter series introduces Hogwarts and the boy wizard.",
    publishedYear: 1997,
    totalCopies: 10,
    availableCopies: 10,
    popularity: 95,
  },
];

const SEED_USERS: User[] = [
  {
    id: "admin",
    name: "Admin",
    email: "admin@library.com",
    membershipDate: new Date().toISOString().split("T")[0],
  },
];

let isSeeded = false;

async function ensureSeeded(db: D1Database) {
  if (isSeeded) return;
  try {
    // Ensure initial seed data exists.
    for (const book of SEED_BOOKS) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO books
            (id, title, author, isbn, category, coverUrl, description, publishedYear, totalCopies, availableCopies, popularity)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          book.id,
          book.title,
          book.author,
          book.isbn,
          book.category,
          book.coverUrl,
          book.description,
          book.publishedYear,
          book.totalCopies,
          book.availableCopies,
          book.popularity
        )
        .run();
    }

    // Ensure every book has a cover URL.
    await db
      .prepare(`
        UPDATE books
        SET coverUrl = 'https://covers.openlibrary.org/b/isbn/' || isbn || '-M.jpg?default=true'
        WHERE coverUrl IS NULL OR TRIM(coverUrl) = ''
      `)
      .run();

    // Ensure every book has a description.
    await db
      .prepare(`
        UPDATE books
        SET description = 'A classic title from our collection.'
        WHERE description IS NULL OR TRIM(description) = ''
      `)
      .run();

    // Ensure admin user exists for demo purposes.
    for (const user of SEED_USERS) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO users (id, name, email, membershipDate)
          VALUES (?, ?, ?, ?)
        `)
        .bind(user.id, user.name, user.email, user.membershipDate)
        .run();
    }
  } catch (_err) {
    // If seeding fails, we ignore and allow runtime to continue.
  } finally {
    isSeeded = true;
  }
}

app.use("*", cors());

app.use("*", async (c, next) => {
  await ensureSeeded(c.env.DB);
  return next();
});

// Books API
app.get("/api/books", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM books").all();
    const books = results.map((book: any) => ({
      ...book,
      coverUrl:
        book.coverUrl ||
        `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=true`,
    }));
    return c.json(books);
  } catch (error) {
    return c.json({ error: "Failed to fetch books" }, 500);
  }
});

app.get("/api/books/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).all();
    if (results.length === 0) {
      return c.json({ error: "Book not found" }, 404);
    }
    const book = results[0];
    return c.json({
      ...book,
      coverUrl:
        book.coverUrl ||
        `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=true`,
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch book" }, 500);
  }
});

app.post("/api/books/refresh-cover-urls", async (c) => {
  try {
    const { success } = await c.env.DB.prepare(`
      UPDATE books
      SET coverUrl = 'https://covers.openlibrary.org/b/isbn/' || isbn || '-M.jpg?default=true'
      WHERE coverUrl IS NULL OR TRIM(coverUrl) = ''
    `).run();
    return c.json({ message: "Cover URLs refreshed", success });
  } catch (error) {
    return c.json({ error: "Failed to refresh cover URLs" }, 500);
  }
});

app.post("/api/books", async (c) => {
  try {
    const book: Book = await c.req.json();
    const { success } = await c.env.DB.prepare(`
      INSERT INTO books (id, title, author, isbn, category, coverUrl, description, publishedYear, totalCopies, availableCopies, popularity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      book.id,
      book.title,
      book.author,
      book.isbn,
      book.category,
      book.coverUrl,
      book.description,
      book.publishedYear,
      book.totalCopies,
      book.availableCopies,
      book.popularity
    ).run();
    if (success) {
      return c.json({ message: "Book created successfully" }, 201);
    } else {
      return c.json({ error: "Failed to create book" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create book" }, 500);
  }
});

app.put("/api/books/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const book: Partial<Book> = await c.req.json();
    const updates = [];
    const values = [];
    for (const [key, value] of Object.entries(book)) {
      if (key !== 'id') {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    values.push(id);
    const { success } = await c.env.DB.prepare(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
    if (success) {
      return c.json({ message: "Book updated successfully" });
    } else {
      return c.json({ error: "Failed to update book" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to update book" }, 500);
  }
});

app.delete("/api/books/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { success } = await c.env.DB.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
    if (success) {
      return c.json({ message: "Book deleted successfully" });
    } else {
      return c.json({ error: "Failed to delete book" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to delete book" }, 500);
  }
});

// Users API
app.get("/api/users", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM users").all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

app.delete("/api/users/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { success } = await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    if (success) {
      return c.json({ message: "User deleted successfully" });
    } else {
      return c.json({ error: "Failed to delete user" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

app.post("/api/users", async (c) => {
  try {
    const user: User = await c.req.json();
    const { success } = await c.env.DB.prepare(`
      INSERT INTO users (id, name, email, membershipDate)
      VALUES (?, ?, ?, ?)
    `).bind(
      user.id,
      user.name,
      user.email,
      user.membershipDate
    ).run();
    if (success) {
      return c.json({ message: "User created successfully" }, 201);
    } else {
      return c.json({ error: "Failed to create user" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Login API
app.post("/api/login", async (c) => {
  try {
    const { email, password: _password } = await c.req.json();

    // For demo purposes, we'll just check if the user exists
    // In a real app, you'd hash passwords and verify them
    const { results } = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();

    if (results.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = results[0];

    // For demo, accept any password for existing users
    // In production, you'd verify the hashed password

    const role = user.email === "admin@library.com" ? "admin" : "user";
    return c.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        membershipDate: user.membershipDate,
        role,
      }
    });
  } catch (error) {
    return c.json({ error: "Login failed" }, 500);
  }
});

// Loans API
app.get("/api/loans", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT loans.*, books.title as bookTitle, users.name as userName
      FROM loans
      JOIN books ON loans.bookId = books.id
      JOIN users ON loans.userId = users.id
    `).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: "Failed to fetch loans" }, 500);
  }
});

app.post("/api/loans", async (c) => {
  try {
    const loan: Loan = await c.req.json();
    const { success } = await c.env.DB.prepare(`
      INSERT INTO loans (id, bookId, userId, loanDate, dueDate, returnDate, overdueDays, fineAmount)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0.0)
    `).bind(
      loan.id,
      loan.bookId,
      loan.userId,
      loan.loanDate,
      loan.dueDate,
      loan.returnDate || null
    ).run();
    if (success) {
      return c.json({ message: "Loan created successfully" }, 201);
    } else {
      return c.json({ error: "Failed to create loan" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create loan" }, 500);
  }
});

// Return a book and calculate fine
app.put("/api/loans/:id/return", async (c) => {
  const id = c.req.param("id");
  try {
    const { returnDate } = await c.req.json();
    const returnDateObj = new Date(returnDate);
    const returnDateStr = returnDateObj.toISOString().split('T')[0];

    // Get the loan details
    const loanResult = await c.env.DB.prepare("SELECT * FROM loans WHERE id = ?").bind(id).first();
    if (!loanResult) {
      return c.json({ error: "Loan not found" }, 404);
    }

    const dueDateObj = new Date(loanResult.dueDate as string);
    const overdueDays = Math.max(0, Math.ceil((returnDateObj.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24)));
    const fineAmount = overdueDays * 5; // ₹5 per day

    // Update the loan with return date, overdue days, and fine
    const { success } = await c.env.DB.prepare(`
      UPDATE loans
      SET returnDate = ?, overdueDays = ?, fineAmount = ?
      WHERE id = ?
    `).bind(returnDateStr, overdueDays, fineAmount, id).run();

    if (success) {
      // Update book availability
      await c.env.DB.prepare(`
        UPDATE books
        SET availableCopies = availableCopies + 1
        WHERE id = ?
      `).bind(loanResult.bookId).run();

      return c.json({
        message: "Book returned successfully",
        overdueDays,
        fineAmount
      });
    } else {
      return c.json({ error: "Failed to return book" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to return book" }, 500);
  }
});

// Admin return a book
app.put("/api/loans/:id/admin-return", async (c) => {
  const id = c.req.param("id");
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayObj = new Date(today);

    // Get the loan details
    const loanResult = await c.env.DB.prepare("SELECT * FROM loans WHERE id = ?").bind(id).first();
    if (!loanResult) {
      return c.json({ error: "Loan not found" }, 404);
    }

    const dueDateObj = new Date(loanResult.dueDate as string);
    const overdueDays = Math.max(0, Math.ceil((todayObj.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24)));
    const fineAmount = overdueDays * 5; // ₹5 per day

    // Update the loan with return date, overdue days, and fine
    const { success } = await c.env.DB.prepare(`
      UPDATE loans
      SET returnDate = ?, overdueDays = ?, fineAmount = ?
      WHERE id = ?
    `).bind(today, overdueDays, fineAmount, id).run();

    if (success) {
      // Update book availability
      await c.env.DB.prepare(`
        UPDATE books
        SET availableCopies = availableCopies + 1
        WHERE id = ?
      `).bind(loanResult.bookId).run();

      return c.json({
        message: "Book returned successfully",
        overdueDays,
        fineAmount
      });
    } else {
      return c.json({ error: "Failed to return book" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to return book" }, 500);
  }
});

app.get("/api/stats", async (c) => {
  try {
    const { results: bookResults } = await c.env.DB.prepare("SELECT COUNT(*) as totalBooks, SUM(availableCopies) as totalAvailable FROM books").all();
    const { results: userResults } = await c.env.DB.prepare("SELECT COUNT(*) as totalUsers FROM users").all();
    const { results: loanResults } = await c.env.DB.prepare("SELECT COUNT(*) as totalLoans FROM loans WHERE returnDate IS NULL").all();
    const { results: overdueResults } = await c.env.DB.prepare(`
      SELECT COUNT(*) as overdueLoans
      FROM loans
      WHERE returnDate IS NULL AND dueDate < ?
    `).bind(new Date().toISOString().split("T")[0]).all();

    return c.json({
      totalBooks: bookResults[0]?.totalBooks || 0,
      totalAvailable: bookResults[0]?.totalAvailable || 0,
      totalUsers: userResults[0]?.totalUsers || 0,
      activeLoans: loanResults[0]?.totalLoans || 0,
      overdueLoans: overdueResults[0]?.overdueLoans || 0,
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Admin helper for testing: set the due date of a loan (or loans for a given book) to today
app.post("/api/loans/set-due-date", async (c) => {
  try {
    const { bookId, dueDate } = await c.req.json();
    const targetDate = dueDate || new Date().toISOString().split("T")[0];

    const { success } = await c.env.DB.prepare(
      "UPDATE loans SET dueDate = ? WHERE bookId = ? AND returnDate IS NULL"
    )
      .bind(targetDate, bookId)
      .run();

    if (!success) {
      return c.json({ error: "Failed to update due dates" }, 500);
    }

    return c.json({ message: "Due dates updated", dueDate: targetDate });
  } catch (error) {
    return c.json({ error: "Failed to update due dates" }, 500);
  }
});

// Admin: Get system overview stats
app.get("/api/admin/stats", async (c) => {
  try {
    const [booksResult, loansResult, usersResult, finesResult] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as totalBooks, SUM(availableCopies) as totalAvailable FROM books").first(),
      c.env.DB.prepare("SELECT COUNT(*) as totalLoans, COUNT(CASE WHEN returnDate IS NULL THEN 1 END) as activeLoans FROM loans").first(),
      c.env.DB.prepare("SELECT COUNT(*) as totalUsers FROM users").first(),
      c.env.DB.prepare("SELECT SUM(fineAmount) as totalFines, COUNT(CASE WHEN fineAmount > 0 THEN 1 END) as usersWithFines FROM loans WHERE returnDate IS NOT NULL").first(),
    ]);

    return c.json({
      totalBooks: booksResult.totalBooks,
      totalAvailable: booksResult.totalAvailable,
      totalLoans: loansResult.totalLoans,
      activeLoans: loansResult.activeLoans,
      totalUsers: usersResult.totalUsers,
      totalFines: finesResult.totalFines || 0,
      usersWithFines: finesResult.usersWithFines || 0,
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Admin: Get all users with their loan status
app.get("/api/admin/users", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.membershipDate,
        COUNT(l.id) as totalLoans,
        COUNT(CASE WHEN l.returnDate IS NULL THEN 1 END) as activeLoans,
        SUM(CASE WHEN l.returnDate IS NULL AND DATE(l.dueDate) < DATE('now') THEN (julianday('now') - julianday(l.dueDate)) ELSE 0 END) as overdueDays
      FROM users u
      LEFT JOIN loans l ON u.id = l.userId
      GROUP BY u.id, u.name, u.email, u.membershipDate
    `).all();

    return c.json(results);
  } catch (error) {
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Admin: Update book availability
app.put("/api/admin/books/:id/availability", async (c) => {
  const id = c.req.param("id");
  try {
    const { totalCopies, availableCopies } = await c.req.json();

    const { success } = await c.env.DB.prepare(
      "UPDATE books SET totalCopies = ?, availableCopies = ? WHERE id = ?"
    )
      .bind(totalCopies, availableCopies, id)
      .run();

    if (!success) {
      return c.json({ error: "Failed to update book availability" }, 500);
    }

    return c.json({ message: "Book availability updated" });
  } catch (error) {
    return c.json({ error: "Failed to update book availability" }, 500);
  }
});

// Admin: Add new book
app.post("/api/admin/books", async (c) => {
  try {
    const book: Book = await c.req.json();
    const newId = book.id || `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { success } = await c.env.DB.prepare(`
      INSERT INTO books (id, title, author, isbn, category, coverUrl, description, publishedYear, totalCopies, availableCopies, popularity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      newId,
      book.title,
      book.author,
      book.isbn,
      book.category,
      book.coverUrl || DEFAULT_COVER_URL(book.isbn),
      book.description,
      book.publishedYear,
      book.totalCopies,
      book.availableCopies,
      book.popularity || 0
    ).run();

    if (!success) {
      return c.json({ error: "Failed to add book" }, 500);
    }

    return c.json({ message: "Book added successfully", bookId: newId }, 201);
  } catch (error) {
    return c.json({ error: "Failed to add book" }, 500);
  }
});

// Admin: Get user details with loans and fines
app.get("/api/admin/users/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const [userResult, loansResult] = await Promise.all([
      c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first(),
      c.env.DB.prepare(`
        SELECT l.*, b.title as bookTitle
        FROM loans l
        JOIN books b ON l.bookId = b.id
        WHERE l.userId = ?
        ORDER BY l.loanDate DESC
      `).bind(id).all(),
    ]);

    if (!userResult) {
      return c.json({ error: "User not found" }, 404);
    }

    const loans = loansResult.results.map((loan: any) => ({
      ...loan,
      fine: loan.returnDate ? 0 : Math.max(0, Math.floor((Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24))) * 1,
    }));

    return c.json({
      user: userResult,
      loans,
      totalFines: loans.reduce((sum: number, loan: any) => sum + loan.fine, 0),
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch user details" }, 500);
  }
});

export default app;

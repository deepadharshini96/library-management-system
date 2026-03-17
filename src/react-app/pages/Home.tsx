import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Badge } from "@/react-app/components/ui/badge";
import BookCard from "@/react-app/components/BookCard";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import { ApiService } from "@/react-app/lib/api";
import { Book } from "@/data/books";
import {
  Search,
  BookOpen,
  Users,
  Clock,
  QrCode,
  ArrowRight,
  Sparkles,
  Library,
  CalendarCheck,
  Shield,
} from "lucide-react";

const categories = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Philosophy",
  "Art & Design",
  "Business",
  "Self-Help",
];

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const fetchedBooks = await ApiService.getBooks();
        setBooks(fetchedBooks);
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .slice(0, 8);

  const popularBooks = [...books].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

  const handleBookUpdate = (updatedBook: Book) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === updatedBook.id ? updatedBook : book
      )
    );
  };

  const stats = [
    { icon: BookOpen, value: books.length.toString(), label: "Books" },
    { icon: Users, value: "5,000+", label: "Members" },
    { icon: Clock, value: "24/7", label: "Access" },
    { icon: Library, value: "10+", label: "Categories" },
  ];

  const features = [
    {
      icon: QrCode,
      title: "QR Code Scanning",
      description: "Instantly access book details by scanning QR codes throughout the library.",
    },
    {
      icon: CalendarCheck,
      title: "Easy Reservations",
      description: "Reserve books online and get notified when they're ready for pickup.",
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description: "Discover your next favorite book based on your reading history.",
    },
    {
      icon: Shield,
      title: "Member Benefits",
      description: "Enjoy extended borrowing periods, priority reservations, and more.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
              <Sparkles className="w-3 h-3 mr-1" />
              {loading ? "Loading books..." : `Over ${books.length} books available`}
            </Badge>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Discover Your Next{" "}
              <span className="text-primary">Great Read</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore our curated collection of books, from timeless classics to modern bestsellers.
              Reserve, borrow, and expand your horizons.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-border/60 focus-visible:ring-primary"
                />
              </div>
              <Link to={searchQuery ? `/catalog?search=${encodeURIComponent(searchQuery)}` : "/catalog"}>
                <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  {searchQuery ? "Search Books" : "Browse Catalog"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="font-display font-bold text-2xl">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Popular This Week
              </h2>
              <p className="text-muted-foreground">
                Most borrowed books by our community
              </p>
            </div>
            <Link to="/catalog">
              <Button variant="outline" className="gap-2">
                View All Books
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-3"></div>
                </div>
              ))
            ) : (
              popularBooks.map((book) => (
                <BookCard key={book.id} book={book} onBookUpdate={handleBookUpdate} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Category Filter & Browse */}
      <section className="py-16 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-2">
              Browse by Category
            </h2>
            <p className="text-muted-foreground">
              Find books in your favorite genres
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-primary hover:bg-primary/90" : ""}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-primary hover:bg-primary/90" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Filtered Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-3"></div>
                </div>
              ))
            ) : (
              filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onBookUpdate={handleBookUpdate} />
              ))
            )}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No books found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-2">
              Why Choose Biblion?
            </h2>
            <p className="text-background/70">
              Modern library experience with powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-background/5 border border-background/10 hover:bg-background/10 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-background/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Reading?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of readers who have already discovered their next favorite book through Biblion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 px-8">
                Become a Member
              </Button>
            </Link>
            <Link to="/catalog">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                Explore Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

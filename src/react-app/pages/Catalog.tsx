import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import BookCard from "@/react-app/components/BookCard";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import { ApiService } from "@/react-app/lib/api";
import { Book } from "@/data/books";
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
} from "lucide-react";

type SortOption = "popularity" | "title" | "author" | "newest";
type AvailabilityFilter = "all" | "available" | "unavailable";

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

export default function Catalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const fetchedBooks = await ApiService.getBooks();
        setBooks(fetchedBooks);
        setError(null);
      } catch (err) {
        setError("Failed to load books");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Set initial search query from URL params
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const handleBookUpdate = (updatedBook: Book) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === updatedBook.id ? updatedBook : book
      )
    );
  };

  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((book) => book.category === selectedCategory);
    }

    // Availability filter
    if (availability === "available") {
      result = result.filter((book) => book.availableCopies > 0);
    } else if (availability === "unavailable") {
      result = result.filter((book) => book.availableCopies === 0);
    }

    // Sorting
    switch (sortBy) {
      case "popularity":
        result.sort((a, b) => b.popularity - a.popularity);
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        result.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "newest":
        result.sort((a, b) => b.publishedYear - a.publishedYear);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, availability]);

  const activeFiltersCount = [
    selectedCategory,
    availability !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setAvailability("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Book Catalog
          </h1>
          <p className="text-muted-foreground">
            Explore our collection of {books.length} books across {categories.length} categories
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="h-12 w-[180px] bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="author">Author (A-Z)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-white border border-border rounded-xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Category Filter */}
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-3">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className={selectedCategory === null ? "bg-primary" : ""}
                    >
                      All
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? "bg-primary" : ""}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="lg:w-48">
                  <label className="block text-sm font-medium mb-3">Availability</label>
                  <Select
                    value={availability}
                    onValueChange={(v) => setAvailability(v as AvailabilityFilter)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Books</SelectItem>
                      <SelectItem value="available">Available Only</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {filteredBooks.length} book{filteredBooks.length !== 1 && "s"} found
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
                    <X className="w-4 h-4" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Active Filters Tags */}
          {(selectedCategory || availability !== "all" || searchQuery) && !showFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {availability !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {availability === "available" ? "Available" : "Unavailable"}
                  <button onClick={() => setAvailability("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                Clear all
              </Button>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading books...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Error loading books</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Try again</Button>
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredBooks.length} of {books.length} books
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} onBookUpdate={handleBookUpdate} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={clearAllFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

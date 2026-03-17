import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Separator } from "@/react-app/components/ui/separator";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import { ApiService } from "@/react-app/lib/api";
import { Book } from "@/data/books";
import { useAuth } from "@/react-app/contexts/AuthContext";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Calendar,
  User,
  Hash,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const fetchedBook = await ApiService.getBook(id);
        setBook(fetchedBook);
        setError(null);
      } catch (err) {
        setError("Failed to load book details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleBorrow = async () => {
    if (!book || !isAvailable || isBorrowing) return;

    if (!user) {
      alert("Please sign in to borrow books.");
      return;
    }

    setIsBorrowing(true);
    try {
      // Create loan
      await ApiService.borrowBook(book.id, user.id);

      // Update book availability
      const newAvailableCopies = Math.max(0, book.availableCopies - 1);
      await ApiService.updateBookAvailability(book.id, newAvailableCopies);

      // Update local state
      setBook({ ...book, availableCopies: newAvailableCopies });

      // Navigate to a confirmation page
      navigate(`/borrow/${book.id}`);
      alert(`Successfully borrowed "${book.title}"! Due date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
    } catch (error) {
      console.error("Failed to borrow book:", error);
      alert("Failed to borrow book. Please try again.");
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleReserve = async () => {
    if (!book || !isAvailable || isReserving) return;

    if (!user) {
      alert("Please sign in to reserve books.");
      return;
    }

    setIsReserving(true);
    try {
      const reservations = JSON.parse(localStorage.getItem("reservations") || "{}") as Record<
        string,
        { reservedAt: string; userId: string }
      >;

      reservations[book.id] = {
        reservedAt: new Date().toISOString(),
        userId: user.id,
      };

      localStorage.setItem("reservations", JSON.stringify(reservations));

      navigate(`/reserve/${book.id}`);
    } catch (error) {
      console.error("Failed to reserve book:", error);
      alert("Failed to reserve book. Please try again.");
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The requested book could not be found."}</p>
            <Link to="/catalog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Catalog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const coverSrc =
    book.coverUrl?.trim() ||
    `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=true`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Link to="/catalog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Button>
          </Link>
        </div>

        {/* Book Details */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Book Cover */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative max-w-sm w-full">
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={coverSrc}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Availability Badge */}
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={isAvailable ? "default" : "secondary"}
                    className={`${
                      isAvailable
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground text-white"
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Unavailable
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Book Information */}
            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                {/* Category and Rating */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-sm">
                    {book.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{book.popularity}% Popular</span>
                  </div>
                </div>

                {/* Title and Author */}
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-2">
                    {book.title}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    by {book.author}
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>

                <Separator />

                {/* Book Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">ISBN</p>
                      <p className="font-medium">{book.isbn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Published</p>
                      <p className="font-medium">{book.publishedYear}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Copies</p>
                      <p className="font-medium">{book.totalCopies}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="font-medium">{book.availableCopies}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    disabled={!isAvailable || isBorrowing || !user}
                    onClick={handleBorrow}
                  >
                    {isBorrowing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Processing...
                      </>
                    ) : !user ? (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Sign in to Borrow
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        {isAvailable ? "Borrow Book" : "Unavailable"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    disabled={!isAvailable || isReserving || !user}
                    onClick={handleReserve}
                  >
                    {isReserving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Processing...
                      </>
                    ) : !user ? (
                      <>
                        <User className="w-5 h-5" />
                        Sign in to Reserve
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        Reserve
                      </>
                    )}
                  </Button>
                </div>

                {/* Note */}
                <p className="text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Borrowing requires a valid library membership. Please sign in to continue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
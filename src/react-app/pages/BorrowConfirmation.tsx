import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import { Button } from "@/react-app/components/ui/button";
import { AlertCircle, BookOpen, CheckCircle } from "lucide-react";
import { ApiService } from "@/react-app/lib/api";
import { useAuth } from "@/react-app/contexts/AuthContext";
import type { Book } from "@/data/books";

export default function BorrowConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const fetchedBook = await ApiService.getBook(id);
        setBook(fetchedBook);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load book details");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
            <h1 className="text-2xl font-bold mb-2">Borrowing Failed</h1>
            <p className="text-muted-foreground mb-6">{error || "Unable to load the book you borrowed."}</p>
            <Link to="/catalog">
              <Button>Back to Catalog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-10">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Borrow Confirmed</h1>
                <p className="text-muted-foreground mb-6">
                  Your loan has been recorded. You can pick up the book from the library.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{book.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Author</p>
                    <p className="font-medium">{book.author}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ISBN</p>
                    <p className="font-medium">{book.isbn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Borrower</p>
                    <p className="font-medium">{user?.name ?? "Guest"}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    <BookOpen className="w-4 h-4" />
                    View Book Details
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/catalog")}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Back to Catalog
                  </Button>
                </div>
              </div>

              <div className="w-40 h-56 rounded-xl overflow-hidden shadow">
                <img
                  src={
                    book.coverUrl ||
                    `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=true`
                  }
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

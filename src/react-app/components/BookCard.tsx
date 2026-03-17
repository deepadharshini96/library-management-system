import { Link, useNavigate } from "react-router";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import { BookOpen, Star, User } from "lucide-react";
import { ApiService } from "@/react-app/lib/api";
import { useState } from "react";
import type { Book } from "@/data/books";
import { useAuth } from "@/react-app/contexts/AuthContext";

interface BookCardProps {
  book: Book;
  onBookUpdate?: (updatedBook: Book) => void;
}

export default function BookCard({ book, onBookUpdate }: BookCardProps) {
  const isAvailable = book.availableCopies > 0;
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const { user } = useAuth();

  const coverSrc =
    book.coverUrl?.trim() ||
    `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=true`;

  const handleBorrow = async () => {
    if (!isAvailable || isBorrowing) return;

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
      const updatedBook = { ...book, availableCopies: newAvailableCopies };
      if (onBookUpdate) {
        onBookUpdate(updatedBook);
      }

      // Navigate to confirmation
      navigate(`/borrow/${book.id}`);
    } catch (error) {
      console.error("Failed to borrow book:", error);
      alert("Failed to borrow book. Please try again.");
    } finally {
      setIsBorrowing(false);
    }
  };

  const navigate = useNavigate();

  const handleReserve = async () => {
    if (!isAvailable || isReserving) return;

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

  return (
    <div className="group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={coverSrc}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isAvailable ? "default" : "secondary"}
            className={`${
              isAvailable
                ? "bg-primary/90 text-primary-foreground"
                : "bg-muted-foreground/80 text-white"
            }`}
          >
            {isAvailable ? `${book.availableCopies} Available` : "Unavailable"}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="flex gap-2">
            <Link to={`/book/${book.id}`} className="flex-1">
              <Button className="w-full bg-white/95 text-foreground hover:bg-white gap-2">
                <BookOpen className="w-4 h-4" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-xs font-normal shrink-0">
            {book.category}
          </Badge>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-medium">{book.popularity}%</span>
          </div>
        </div>

        <h3 className="font-display font-semibold text-base leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {book.author}
        </p>

        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {book.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            className="flex-1 gap-1"
            disabled={!isAvailable || isBorrowing || !user}
            onClick={handleBorrow}
          >
            {isBorrowing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                Borrowing...
              </>
            ) : !user ? (
              <>
                <BookOpen className="w-3 h-3" />
                Sign In to Borrow
              </>
            ) : (
              <>
                <BookOpen className="w-3 h-3" />
                {isAvailable ? "Borrow" : "Unavailable"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!isAvailable || isReserving || !user}
            onClick={handleReserve}
          >
            {isReserving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                Reserving...
              </>
            ) : !user ? (
              <>
                <User className="w-3 h-3" />
                Sign in to Reserve
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                Reserve
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

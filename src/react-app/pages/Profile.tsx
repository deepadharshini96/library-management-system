import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { ApiService } from "@/react-app/lib/api";
import { useAuth } from "@/react-app/contexts/AuthContext";
import { BookOpen, DollarSign, CheckCircle, AlertTriangle, User, CreditCard, TrendingUp, Loader2, Sparkles, RefreshCcw, Clock } from "lucide-react";
import type { Book } from "@/data/books";

interface LoanWithBook {
  id: string;
  bookId: string;
  userId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  bookTitle: string;
}

function parseDate(dateStr: string) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(dateStr: string) {
  const d = parseDate(dateStr);
  if (!d) return "—";
  return d.toLocaleDateString();
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function calculateOverdue(dueDateStr: string) {
  const due = parseDate(dueDateStr);
  if (!due) return { days: 0, fine: 0 };
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.floor((Date.now() - due.getTime()) / msPerDay);
  const daysOverdue = Math.max(0, diff);
  const fine = daysOverdue * 1; // $1 per day
  return { days: daysOverdue, fine };
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<LoanWithBook[]>([]);
  const [allLoans, setAllLoans] = useState<LoanWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshingCovers, setRefreshingCovers] = useState(false);
  const [settingDueDate, setSettingDueDate] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
    availableCopies: 1,
  });
  const [editingBook, setEditingBook] = useState<any>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allBooks, allLoans] = await Promise.all([ApiService.getBooks(), ApiService.getLoans()]);
        setBooks(allBooks);
        const myLoans: LoanWithBook[] = (allLoans as LoanWithBook[])
          .filter((loan) => loan.userId === userId && !loan.returnDate)
          .map((loan) => ({ ...loan }));
        setLoans(myLoans);

        if (user?.role === 'admin') {
          setAllLoans(allLoans as LoanWithBook[]);
          // Fetch admin data
          const [stats, users] = await Promise.all([
            ApiService.getAdminStats(),
            ApiService.getAdminUsers(),
          ]);
          setAdminStats(stats);
          setAdminUsers(users);
        }

        // Generate basic notifications
        const notes: string[] = [];
        myLoans.forEach((loan) => {
          const { days, fine } = calculateOverdue(loan.dueDate);
          if (days > 0) {
            notes.push(`Overdue: ${loan.bookTitle} (${days} day${days === 1 ? "" : "s"} overdue). Fine: $${fine}`);
          } else {
            const due = parseDate(loan.dueDate);
            if (due) {
              const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              if (diffDays <= 3) {
                notes.push(`${loan.bookTitle} is due in ${diffDays} day${diffDays === 1 ? "" : "s"}.`);
              }
            }
          }
        });

        // Reservation notifications
        const reservations = safeJsonParse<Record<string, { reservedAt: string; userId: string }>>(
          localStorage.getItem("reservations"),
          {}
        );
        const myReservations = Object.entries(reservations).filter(([, value]) => value.userId === userId);
        myReservations.forEach(([bookId]) => {
          const book = allBooks.find((b) => b.id === bookId);
          if (book && book.availableCopies > 0) {
            notes.push(`Your reservation for "${book.title}" is now available.`);
          }
        });

        setNotifications(notes);
      } catch (err) {
        console.error("Failed to load profile data", err);
        setError("There was an issue loading your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, user?.role]);

  const totalFines = useMemo(() => {
    return loans.reduce((total, loan) => {
      const { fine } = calculateOverdue(loan.dueDate);
      return total + (isLoanFinePaid(loan.id) ? 0 : fine);
    }, 0);
  }, [loans]);

  const reservedBooks = useMemo(() => {
    if (!userId) return [];
    const reservations = safeJsonParse<Record<string, { reservedAt: string; userId: string }>>(
      localStorage.getItem("reservations"),
      {}
    );
    const myReservations = Object.entries(reservations).filter(([, value]) => value.userId === userId);
    return myReservations.map(([bookId, data]) => {
      const book = books.find((b) => b.id === bookId);
      return {
        bookId,
        reservedAt: data.reservedAt,
        title: book?.title || "Unknown Book",
      };
    });
  }, [books, userId]);

  const handlePayFine = (loanId: string) => {
    setActionLoading(`pay-${loanId}`);
    const paidFines = JSON.parse(localStorage.getItem("paidFines") || "{}") as Record<string, boolean>;
    paidFines[loanId] = true;
    localStorage.setItem("paidFines", JSON.stringify(paidFines));
    setNotifications((prev) => prev.filter((note) => !note.includes(loanId)));
    setTimeout(() => setActionLoading(null), 500); // Small delay for visual feedback
  };

  const handleRenewLoan = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      await ApiService.renewLoan(loanId);
      // Refresh the loans data
      const allLoans = await ApiService.getLoans();
      const myLoans: LoanWithBook[] = (allLoans as LoanWithBook[])
        .filter((loan) => loan.userId === userId && !loan.returnDate)
        .map((loan) => ({ ...loan }));
      setLoans(myLoans);
      setNotifications((prev) => [...prev, "Book renewed successfully!"]);
    } catch (error) {
      console.error("Failed to renew loan", error);
      setNotifications((prev) => [...prev, "Failed to renew book. Please try again."]);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshCoverUrls = async () => {
    setRefreshingCovers(true);
    try {
      await ApiService.refreshCoverUrls();
      setNotifications((prev) => [...prev, "Book cover URLs refreshed successfully."]);
    } catch (error) {
      console.error("Failed to refresh cover URLs", error);
      setNotifications((prev) => [...prev, "Failed to refresh book cover URLs."]);
    } finally {
      setRefreshingCovers(false);
    }
  };

  const handleSetEthicalHackingDueToday = async () => {
    setSettingDueDate(true);
    try {
      await ApiService.setLoanDueDate("19");
      setNotifications((prev) => [...prev, "Ethical Hacking due date set to today."]);

      // Refresh loan data so the UI reflects the updated due date
      const allLoans = await ApiService.getLoans();
      const myLoans: LoanWithBook[] = (allLoans as LoanWithBook[])
        .filter((loan) => loan.userId === userId && !loan.returnDate)
        .map((loan) => ({ ...loan }));
      setLoans(myLoans);

      if (user?.role === "admin") {
        setAllLoans(allLoans as LoanWithBook[]);
      }
    } catch (error) {
      console.error("Failed to set due date", error);
      setNotifications((prev) => [...prev, "Failed to set due date."]);
    } finally {
      setSettingDueDate(false);
    }
  };

  const handleViewUserDetails = async (userId: string) => {
    try {
      const userDetails = await ApiService.getUserDetails(userId);
      setSelectedUser(userDetails);
    } catch (error) {
      console.error("Failed to fetch user details", error);
      setNotifications((prev) => [...prev, "Failed to fetch user details."]);
    }
  };

  const handleUpdateBookAvailability = async (bookId: string, availableCopies: number) => {
    try {
      await ApiService.updateBookAvailability(bookId, availableCopies);
      setNotifications((prev) => [...prev, "Book availability updated."]);
      // Refresh books data
      const allBooks = await ApiService.getBooks();
      setBooks(allBooks);
      setEditingBook(null);
    } catch (error) {
      console.error("Failed to update book availability", error);
      setNotifications((prev) => [...prev, "Failed to update book availability."]);
    }
  };

  const handleAddBook = async () => {
    try {
      await ApiService.addBook(newBook);
      setNotifications((prev) => [...prev, "Book added successfully."]);
      // Refresh books data
      const allBooks = await ApiService.getBooks();
      setBooks(allBooks);
      setShowAddBookForm(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        category: '',
        description: '',
        publishedYear: new Date().getFullYear(),
        totalCopies: 1,
        availableCopies: 1,
      });
    } catch (error) {
      console.error("Failed to add book", error);
      setNotifications((prev) => [...prev, "Failed to add book."]);
    }
  };

  function isLoanFinePaid(loanId: string) {
    const paidFines = safeJsonParse<Record<string, boolean>>(localStorage.getItem("paidFines"), {});
    return paidFines[loanId];
  }

  const handleCancelReservation = (bookId: string) => {
    const reservations = safeJsonParse<Record<string, { reservedAt: string; userId: string }>>(
      localStorage.getItem("reservations"),
      {}
    );
    delete reservations[bookId];
    localStorage.setItem("reservations", JSON.stringify(reservations));
    window.location.reload();
  };

  const handleRenewReservation = (bookId: string) => {
    const reservations = safeJsonParse<Record<string, { reservedAt: string; userId: string }>>(
      localStorage.getItem("reservations"),
      {}
    );
    if (reservations[bookId]) {
      reservations[bookId].reservedAt = new Date().toISOString().split('T')[0];
      localStorage.setItem("reservations", JSON.stringify(reservations));
      setNotifications((prev) => [...prev, "Reservation renewed successfully!"]);
      window.location.reload();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
            <Link to="/login">
              <Button>Go to Sign In</Button>
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
        <div className="container mx-auto px-4 py-12">
          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Oops!</strong> {error}
            </div>
          ) : null}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in-50 duration-500">
            {/* Profile Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                  {user?.role === 'admin' && (
                    <Badge className="bg-purple-500 text-white animate-in zoom-in-50 duration-500">Admin</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-500" style={{ animationDelay: '200ms' }}>
                  <User className="w-4 h-4 text-blue-600" />
                  <p className="text-gray-700"><span className="font-medium">Name:</span> {user.name}</p>
                </div>
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-500" style={{ animationDelay: '300ms' }}>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
                </div>
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-500" style={{ animationDelay: '400ms' }}>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <p className="text-gray-700"><span className="font-medium">Member since:</span> {user.membershipDate}</p>
                </div>
              </div>

              <div className="mt-6 animate-in fade-in-50 duration-500" style={{ animationDelay: '500ms' }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />
                  Notifications
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No new notifications.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((note, idx) => (
                      <div
                        key={idx}
                        className="border border-amber-200 rounded-xl p-3 bg-amber-50/50 animate-in slide-in-from-right-2 duration-300"
                        style={{ animationDelay: `${600 + idx * 100}ms` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-700">{note}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-muted-foreground hover:text-gray-600 transition-colors duration-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 animate-in fade-in-50 duration-500" style={{ animationDelay: '650ms' }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 animate-pulse" />
                  Borrowed Books
                </h3>
                {loans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No borrowed books currently.</p>
                ) : (
                  <div className="space-y-2">
                    {loans.slice(0, 3).map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{loan.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">Due: {formatDate(loan.dueDate)}</p>
                        </div>
                        <Badge className={loan.returnDate ? "bg-gray-500 text-white" : "bg-emerald-500 text-white"}>
                          {loan.returnDate ? "Returned" : "Borrowed"}
                        </Badge>
                      </div>
                    ))}
                    {loans.length > 3 && (
                      <Button
                        variant="ghost"
                        className="text-sm"
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                      >
                        View all borrowed books
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Loans and Fines */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-right-4 duration-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-emerald-600 animate-pulse" />
                      My Loans
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Track due dates, fines and make payments.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                      <span className="text-sm text-muted-foreground animate-pulse">Loading your loans...</span>
                    </div>
                  </div>
                ) : loans.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-muted-foreground">You currently have no active loans.</p>
                    <p className="text-xs text-muted-foreground mt-2">Browse our catalog to borrow books!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {loans.map((loan) => {
                      const { days, fine } = calculateOverdue(loan.dueDate);
                      const paid = isLoanFinePaid(loan.id);

                      return (
                        <div key={loan.id} className="border border-emerald-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{loan.bookTitle}</h3>
                              <p className="text-sm text-muted-foreground">Loaned on: {formatDate(loan.loanDate)}</p>
                              <p className="text-sm text-muted-foreground">Due date: {formatDate(loan.dueDate)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {days > 0 ? (
                                <Badge className="bg-red-500 text-white animate-pulse">Overdue</Badge>
                              ) : (
                                <Badge className="bg-emerald-500 text-white">On Time</Badge>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <div className="text-sm text-muted-foreground">Fine</div>
                              <div className="text-lg font-semibold flex items-center gap-2 text-red-600">
                                <DollarSign className="w-4 h-4" /> ${fine.toFixed(2)}
                                {paid && (
                                  <Badge className="bg-emerald-500 text-white animate-in zoom-in-50">Paid</Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                className="gap-2 border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
                                onClick={() => navigate(`/book/${loan.bookId}`)}
                              >
                                <BookOpen className="w-4 h-4" />
                                View Book
                              </Button>
                              <Button
                                variant="outline"
                                className="gap-2 border-blue-300 hover:bg-blue-50 transition-all duration-200"
                                onClick={() => handleRenewLoan(loan.id)}
                                disabled={actionLoading === loan.id}
                              >
                                {actionLoading === loan.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Renew Book
                              </Button>
                              {fine > 0 && !paid ? (
                                <Button
                                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
                                  onClick={() => handlePayFine(loan.id)}
                                  disabled={actionLoading === `pay-${loan.id}`}
                                >
                                  {actionLoading === `pay-${loan.id}` ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <DollarSign className="w-4 h-4" />
                                  )}
                                  Pay Fine
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {totalFines > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-lg animate-in fade-in-50 slide-in-from-bottom-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-red-600 animate-pulse" />
                        Payment Method
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Pay your outstanding fines securely.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Total Outstanding Fines</h3>
                        <p className="text-sm text-muted-foreground">Pay now to avoid additional charges</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600 animate-pulse">${totalFines.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Due immediately</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        className="gap-2 bg-red-600 hover:bg-red-700 transition-all duration-200 flex-1 animate-pulse"
                        onClick={() => {
                          setActionLoading('payment');
                          // Simulate payment
                          loans.forEach(loan => {
                            const { fine } = calculateOverdue(loan.dueDate);
                            if (fine > 0 && !isLoanFinePaid(loan.id)) {
                              handlePayFine(loan.id);
                            }
                          });
                          setNotifications((prev) => [...prev, "Payment processed successfully!"]);
                          setTimeout(() => setActionLoading(null), 1000);
                        }}
                        disabled={actionLoading === 'payment'}
                      >
                        {actionLoading === 'payment' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Pay ${totalFines.toFixed(2)}
                      </Button>
                      <Button variant="outline" className="gap-2 border-red-300 hover:bg-red-50 transition-all duration-200">
                        <DollarSign className="w-4 h-4" />
                        Pay with PayPal
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-amber-600 animate-bounce" />
                      Reserved Books
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      View and cancel your current reservations.
                    </p>
                  </div>
                </div>

                {reservedBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-muted-foreground">You have no reserved books.</p>
                    <p className="text-xs text-muted-foreground mt-2">Reserve books to secure them for pickup!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {reservedBooks.map((reservation, index) => (
                      <div
                        key={reservation.bookId}
                        className="border border-amber-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{reservation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Reserved on: {formatDate(reservation.reservedAt)}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          <Button
                            variant="outline"
                            className="gap-2 border-amber-300 hover:bg-amber-50 transition-all duration-200"
                            onClick={() => navigate(`/book/${reservation.bookId}`)}
                          >
                            <BookOpen className="w-4 h-4" />
                            View Book
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 border-blue-300 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => handleRenewReservation(reservation.bookId)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Renew Reservation
                          </Button>
                          <Button
                            className="gap-2 bg-amber-600 hover:bg-amber-700 transition-all duration-200"
                            onClick={() => handleCancelReservation(reservation.bookId)}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Cancel Reservation
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {user?.role === 'admin' && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-in zoom-in-50 duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-purple-600 animate-pulse" />
                        Admin Payment Management
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        View and manage all outstanding fines and payments.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleRefreshCoverUrls}
                        disabled={refreshingCovers}
                      >
                        {refreshingCovers ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="w-4 h-4" />
                        )}
                        Refresh Covers
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleSetEthicalHackingDueToday}
                        disabled={settingDueDate}
                      >
                        {settingDueDate ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        Set Ethical Hacking Due Today
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {allLoans
                      .filter((loan) => !loan.returnDate && calculateOverdue(loan.dueDate).fine > 0)
                      .map((loan, index) => {
                        const { days, fine } = calculateOverdue(loan.dueDate);
                        const paid = isLoanFinePaid(loan.id);

                        return (
                          <div
                            key={loan.id}
                            className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">{loan.bookTitle}</h3>
                                <p className="text-sm text-muted-foreground">Borrower: {loan.userId}</p>
                                <p className="text-sm text-muted-foreground">Due date: {formatDate(loan.dueDate)}</p>
                                <p className="text-sm text-red-600">Overdue: {days} days</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-red-500 text-white animate-pulse">Unpaid Fine</Badge>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <div className="text-sm text-muted-foreground">Fine Amount</div>
                                <div className="text-lg font-semibold flex items-center gap-2 text-red-600">
                                  <DollarSign className="w-4 h-4" /> ${fine.toFixed(2)}
                                  {paid && (
                                    <Badge className="bg-emerald-500 text-white animate-in zoom-in-50">Paid</Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  variant="outline"
                                  className="gap-2 border-purple-300 hover:bg-purple-50 transition-all duration-200"
                                  onClick={() => navigate(`/book/${loan.bookId}`)}
                                >
                                  <BookOpen className="w-4 h-4" />
                                  View Book
                                </Button>
                                {!paid && (
                                  <Button
                                    className="gap-2 bg-purple-600 hover:bg-purple-700 transition-all duration-200"
                                    onClick={() => handlePayFine(loan.id)}
                                    disabled={actionLoading === `pay-${loan.id}`}
                                  >
                                    {actionLoading === `pay-${loan.id}` ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <DollarSign className="w-4 h-4" />
                                    )}
                                    Mark as Paid
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {allLoans.filter((loan) => !loan.returnDate && calculateOverdue(loan.dueDate).fine > 0).length === 0 && (
                      <div className="text-center py-12 text-sm text-muted-foreground bg-white rounded-xl border border-purple-200">
                        <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-50" />
                        No outstanding fines to manage.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user?.role === 'admin' && adminStats && (
                <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-in zoom-in-50 duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-600 animate-pulse" />
                        System Overview
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Library statistics and system health.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                      <div className="text-2xl font-bold text-green-600">{adminStats.totalBooks}</div>
                      <div className="text-sm text-muted-foreground">Total Books</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                      <div className="text-2xl font-bold text-blue-600">{adminStats.totalAvailable}</div>
                      <div className="text-sm text-muted-foreground">Available Copies</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                      <div className="text-2xl font-bold text-orange-600">{adminStats.activeLoans}</div>
                      <div className="text-sm text-muted-foreground">Active Loans</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                      <div className="text-2xl font-bold text-purple-600">{adminStats.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">Registered Users</div>
                    </div>
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-in zoom-in-50 duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <User className="w-6 h-6 text-blue-600 animate-pulse" />
                        User Management
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        View all users and their loan status.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setShowAddBookForm(!showAddBookForm)}
                    >
                      <BookOpen className="w-4 h-4" />
                      {showAddBookForm ? 'Cancel' : 'Add Book'}
                    </Button>
                  </div>

                  {showAddBookForm && (
                    <div className="mb-6 bg-white border border-blue-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Add New Book</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Title"
                          value={newBook.title}
                          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Author"
                          value={newBook.author}
                          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="ISBN"
                          value={newBook.isbn}
                          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Category"
                          value={newBook.category}
                          onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="number"
                          placeholder="Published Year"
                          value={newBook.publishedYear}
                          onChange={(e) => setNewBook({ ...newBook, publishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="number"
                          placeholder="Total Copies"
                          value={newBook.totalCopies}
                          onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) || 1 })}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="number"
                          placeholder="Available Copies"
                          value={newBook.availableCopies}
                          onChange={(e) => setNewBook({ ...newBook, availableCopies: parseInt(e.target.value) || 1 })}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <textarea
                          placeholder="Description"
                          value={newBook.description}
                          onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md md:col-span-2"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={handleAddBook} className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          Add Book
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddBookForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {adminUsers.map((adminUser, index) => (
                      <div
                        key={adminUser.id}
                        className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{adminUser.name}</h3>
                            <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                            <p className="text-sm text-muted-foreground">Member since: {formatDate(adminUser.membershipDate)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">{adminUser.activeLoans}</div>
                              <div className="text-xs text-muted-foreground">Active Loans</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-red-600">{adminUser.overdueDays}</div>
                              <div className="text-xs text-muted-foreground">Overdue Days</div>
                            </div>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => handleViewUserDetails(adminUser.id)}
                            >
                              <User className="w-4 h-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-in zoom-in-50 duration-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-yellow-600 animate-pulse" />
                        Book Management
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Manage book inventory and availability.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {books.slice(0, 10).map((book, index) => (
                      <div
                        key={book.id}
                        className="bg-white border border-yellow-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">by {book.author}</p>
                            <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">{book.availableCopies}</div>
                              <div className="text-xs text-muted-foreground">Available</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">{book.totalCopies}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => setEditingBook(book)}
                            >
                              <RefreshCcw className="w-4 h-4" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editingBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Edit Book Availability</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Copies</label>
                        <input
                          type="number"
                          value={editingBook.totalCopies}
                          onChange={(e) => setEditingBook({ ...editingBook, totalCopies: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Copies</label>
                        <input
                          type="number"
                          value={editingBook.availableCopies}
                          onChange={(e) => setEditingBook({ ...editingBook, availableCopies: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Button
                        onClick={() => handleUpdateBookAvailability(editingBook.id, editingBook.availableCopies)}
                        className="gap-2"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Update
                      </Button>
                      <Button variant="outline" onClick={() => setEditingBook(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">User Details: {selectedUser.user.name}</h3>
                      <Button variant="outline" onClick={() => setSelectedUser(null)}>
                        Close
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Email:</strong> {selectedUser.user.email}
                        </div>
                        <div>
                          <strong>Member Since:</strong> {formatDate(selectedUser.user.membershipDate)}
                        </div>
                        <div>
                          <strong>Total Loans:</strong> {selectedUser.loans.length}
                        </div>
                        <div>
                          <strong>Total Fines:</strong> ${selectedUser.totalFines.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Loan History</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedUser.loans.map((loan: any) => (
                            <div key={loan.id} className="border rounded p-3">
                              <div className="flex justify-between">
                                <span className="font-medium">{loan.bookTitle}</span>
                                <span className={loan.returnDate ? 'text-green-600' : loan.fine > 0 ? 'text-red-600' : 'text-blue-600'}>
                                  {loan.returnDate ? 'Returned' : loan.fine > 0 ? `Fine: $${loan.fine}` : 'Active'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Loaned: {formatDate(loan.loanDate)} | Due: {formatDate(loan.dueDate)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

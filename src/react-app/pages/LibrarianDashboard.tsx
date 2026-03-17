import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Input } from "@/react-app/components/ui/input";
import { ApiService } from "@/react-app/lib/api";
import { useAuth } from "@/react-app/contexts/AuthContext";
import {
  BookOpen,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Download,
  QrCode,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { QRCodeSVG } from "qrcode.react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  coverUrl: string;
  description: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  popularity: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  membershipDate: string;
}

interface Loan {
  id: string;
  bookId: string;
  userId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  bookTitle: string;
  userName: string;
}

interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  reservedAt: string;
  status: "pending" | "approved" | "rejected";
  bookTitle: string;
  userName: string;
}

export default function LibrarianDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState<Partial<Book>>({});
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, booksData, usersData, loansData] = await Promise.all([
        ApiService.getStats(),
        ApiService.getBooks(),
        ApiService.getUsers(),
        ApiService.getLoans(),
      ]);
      setStats(statsData);
      setBooks(booksData);
      setUsers(usersData);
      setLoans(loansData);
      // Mock reservations for now
      setReservations([]);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    try {
      const bookToAdd = {
        ...newBook,
        id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        coverUrl: newBook.coverUrl || `https://covers.openlibrary.org/b/isbn/${newBook.isbn}-M.jpg?default=true`,
        totalCopies: newBook.totalCopies || 1,
        availableCopies: newBook.availableCopies || 1,
        popularity: newBook.popularity || 0,
      } as Book;
      await ApiService.createBook(bookToAdd);
      setNewBook({});
      fetchData();
    } catch (error) {
      console.error("Failed to add book", error);
    }
  };

  const handleUpdateBook = async (book: Book) => {
    try {
      await ApiService.updateBook(book.id, book);
      fetchData();
    } catch (error) {
      console.error("Failed to update book", error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await ApiService.deleteBook(bookId);
        fetchData();
      } catch (error) {
        console.error("Failed to delete book", error);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await ApiService.deleteUser(userId);
        fetchData();
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportToPDF = (data: any[], columns: string[], filename: string) => {
    const doc = new jsPDF();
    (doc as any).autoTable({
      head: [columns],
      body: data.map(item => columns.map(col => item[col] || "")),
    });
    doc.save(filename);
  };

  const categoryData = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 p-4 border-r">
          <h2 className="text-xl font-bold mb-4">Librarian Dashboard</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left p-2 rounded ${activeTab === "dashboard" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              <BarChart3 className="inline mr-2" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("books")}
              className={`w-full text-left p-2 rounded ${activeTab === "books" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              <BookOpen className="inline mr-2" /> Books
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`w-full text-left p-2 rounded ${activeTab === "members" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              <Users className="inline mr-2" /> Members
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`w-full text-left p-2 rounded ${activeTab === "loans" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              <Clock className="inline mr-2" /> Loans
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`w-full text-left p-2 rounded ${activeTab === "reservations" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              <CheckCircle className="inline mr-2" /> Reservations
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full text-left p-2 rounded ${activeTab === "reports" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              <TrendingUp className="inline mr-2" /> Reports
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <div>
                  <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
                      <h3 className="text-lg font-semibold">Total Books</h3>
                      <p className="text-2xl font-bold">{stats?.totalBooks || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <Users className="w-8 h-8 text-green-500 mb-2" />
                      <h3 className="text-lg font-semibold">Total Members</h3>
                      <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <Clock className="w-8 h-8 text-orange-500 mb-2" />
                      <h3 className="text-lg font-semibold">Active Loans</h3>
                      <p className="text-2xl font-bold">{stats?.activeLoans || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                      <h3 className="text-lg font-semibold">Overdue Books</h3>
                      <p className="text-2xl font-bold">{stats?.overdueLoans || 0}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4">Books by Category</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4">Most Popular Books</h3>
                      <div className="space-y-2">
                        {books.sort((a, b) => b.popularity - a.popularity).slice(0, 5).map((book) => (
                          <div key={book.id} className="flex justify-between">
                            <span>{book.title}</span>
                            <Badge>{book.popularity}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "books" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Book Management</h1>
                    <Button onClick={() => setEditingBook({} as Book)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Book
                    </Button>
                  </div>
                  <div className="mb-4 flex gap-4">
                    <Input
                      placeholder="Search books..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button onClick={() => exportToCSV(books, "books.csv")}>
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {books.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase())).map((book) => (
                      <div key={book.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-gray-600">{book.author} - {book.category}</p>
                          <p className="text-sm">Available: {book.availableCopies}/{book.totalCopies}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowQR(book.id)}>
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingBook(book)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBook(book.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "members" && (
                <div>
                  <h1 className="text-3xl font-bold mb-6">Member Management</h1>
                  <div className="mb-4">
                    <Button onClick={() => exportToCSV(users, "members.csv")}>
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {users.map((member) => (
                      <div key={member.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-sm">Member since: {member.membershipDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View History
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteUser(member.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "loans" && (
                <div>
                  <h1 className="text-3xl font-bold mb-6">Loan Management</h1>
                  <div className="grid gap-4">
                    {loans.map((loan) => (
                      <div key={loan.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{loan.bookTitle}</h3>
                            <p className="text-sm text-gray-600">Borrowed by: {loan.userName}</p>
                            <p className="text-sm">Due: {loan.dueDate}</p>
                          </div>
                          <div className="flex gap-2">
                            {!loan.returnDate && <Button variant="outline" size="sm">Return Book</Button>}
                            <Badge className={loan.returnDate ? "bg-green-500" : "bg-yellow-500"}>
                              {loan.returnDate ? "Returned" : "Active"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reservations" && (
                <div>
                  <h1 className="text-3xl font-bold mb-6">Reservation Management</h1>
                  <div className="grid gap-4">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{reservation.bookTitle}</h3>
                            <p className="text-sm text-gray-600">Requested by: {reservation.userName}</p>
                            <p className="text-sm">Status: {reservation.status}</p>
                          </div>
                          <div className="flex gap-2">
                            {reservation.status === "pending" && (
                              <>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button variant="outline" size="sm">
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <div>
                  <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4">Monthly Borrowing Trends</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="loans" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4">Most Borrowed Books</h3>
                      <div className="space-y-2">
                        {books.sort((a, b) => b.popularity - a.popularity).slice(0, 10).map((book, index) => (
                          <div key={book.id} className="flex justify-between">
                            <span>{index + 1}. {book.title}</span>
                            <Badge>{book.popularity} borrows</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <Button onClick={() => exportToPDF(books, ["title", "author", "category", "availableCopies"], "books_report.pdf")}>
                      <Download className="w-4 h-4 mr-2" /> Export Books PDF
                    </Button>
                    <Button onClick={() => exportToPDF(users, ["name", "email", "membershipDate"], "members_report.pdf")}>
                      <Download className="w-4 h-4 mr-2" /> Export Members PDF
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Edit/Add Book Modal */}
          {editingBook && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">{editingBook.id ? 'Edit Book' : 'Add New Book'}</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={editingBook.title || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  />
                  <Input
                    placeholder="Author"
                    value={editingBook.author || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  />
                  <Input
                    placeholder="ISBN"
                    value={editingBook.isbn || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                  />
                  <Input
                    placeholder="Category"
                    value={editingBook.category || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Total Copies"
                    value={editingBook.totalCopies || 0}
                    onChange={(e) => setEditingBook({ ...editingBook, totalCopies: parseInt(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Available Copies"
                    value={editingBook.availableCopies || 0}
                    onChange={(e) => setEditingBook({ ...editingBook, availableCopies: parseInt(e.target.value) })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      if (editingBook.id) {
                        handleUpdateBook(editingBook);
                      } else {
                        setNewBook(editingBook);
                        handleAddBook();
                      }
                      setEditingBook(null);
                    }}>
                      {editingBook.id ? 'Update' : 'Add'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingBook(null)}>Cancel</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Modal */}
          {showQR && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Book QR Code</h3>
                <QRCodeSVG value={showQR} size={256} />
                <Button className="mt-4" onClick={() => setShowQR(null)}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
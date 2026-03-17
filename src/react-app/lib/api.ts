import { Book } from "../../data/books";

const API_BASE_URL = "/api";

export class ApiService {
  static async getBooks(): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    return response.json();
  }

  static async getBook(id: string): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch book");
    }
    return response.json();
  }

  static async createBook(book: Book): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });
    if (!response.ok) {
      throw new Error("Failed to create book");
    }
  }

  static async updateBook(id: string, book: Partial<Book>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });
    if (!response.ok) {
      throw new Error("Failed to update book");
    }
  }

  static async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete book");
    }
  }

  // Users API
  static async getUsers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  }

  static async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  }

  // Loans API
  static async getLoans(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/loans`);
    if (!response.ok) {
      throw new Error("Failed to fetch loans");
    }
    return response.json();
  }

  static async createLoan(loan: any): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loan),
    });
    if (!response.ok) {
      throw new Error("Failed to create loan");
    }
  }

  static async returnBook(loanId: string, returnDate: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/return`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ returnDate }),
    });
    if (!response.ok) {
      throw new Error("Failed to return book");
    }
  }

  // Renew loan functionality
  static async renewLoan(loanId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/renew`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error("Failed to renew loan");
    }
  }

  static async setLoanDueDate(bookId: string, dueDate?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/loans/set-due-date`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookId, dueDate }),
    });

    if (!response.ok) {
      throw new Error("Failed to set due date");
    }
  }

  static async getStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }
    return response.json();
  }

  static async adminReturnLoan(loanId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/loans/${loanId}/admin-return`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error("Failed to return loan");
    }
  }

  // Admin APIs
  static async getAdminStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!response.ok) {
      throw new Error("Failed to fetch admin stats");
    }
    return response.json();
  }

  static async getAdminUsers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`);
    if (!response.ok) {
      throw new Error("Failed to fetch admin users");
    }
    return response.json();
  }

  static async getUserDetails(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }
    return response.json();
  }

  // Borrow book functionality
  static async borrowBook(bookId: string, userId: string = "guest"): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const loanData = {
      id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      userId,
      loanDate: today, // YYYY-MM-DD format
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 15 days from now
    };

    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loanData),
    });

    if (!response.ok) {
      throw new Error("Failed to borrow book");
    }

    return response.json();
  }

  // Update book availability
  static async updateBookAvailability(bookId: string, availableCopies: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ availableCopies }),
    });

    if (!response.ok) {
      throw new Error("Failed to update book availability");
    }
  }

  // Authentication
  static async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    return response.json();
  }

  static async createUser(userData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    return response.json();
  }

  static async refreshCoverUrls(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/refresh-covers`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh cover URLs");
    }
  }

  static async addBook(book: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });

    if (!response.ok) {
      throw new Error("Failed to add book");
    }

    return response.json();
  }
}
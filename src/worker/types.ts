export interface Book {
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

export interface User {
  id: string;
  name: string;
  email: string;
  membershipDate: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  overdueDays?: number;
  fineAmount?: number;
}
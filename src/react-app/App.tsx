import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import CatalogPage from "@/react-app/pages/Catalog";
import BookDetailsPage from "@/react-app/pages/BookDetails";
import ReservationPage from "@/react-app/pages/Reservation";
import AboutPage from "@/react-app/pages/About";
import BorrowConfirmationPage from "@/react-app/pages/BorrowConfirmation";
import ProfilePage from "@/react-app/pages/Profile";
import LoginPage from "@/react-app/pages/Login";
import RegisterPage from "@/react-app/pages/Register";
import LibrarianDashboard from "@/react-app/pages/LibrarianDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/book/:id" element={<BookDetailsPage />} />
        <Route path="/borrow/:id" element={<BorrowConfirmationPage />} />
        <Route path="/reserve/:id" element={<ReservationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/librarian" element={<LibrarianDashboard />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

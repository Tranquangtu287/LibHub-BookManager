import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookProvider, BookContext } from './context/BookContext';
import MainLayout from './components/MainLayout';
import DashboardPage from './pages/DashboardPage';
import BookListPage from './pages/BookListPage';
import BookFormPage from './pages/BookFormPage';
import BorrowManagementPage from './pages/BorrowManagementPage';
import LoginPage from './pages/LoginPage';

// Chặn truy cập nếu chưa đăng nhập -> Tự động đưa về /login khi Reload
function PrivateRoute({ children }) {
  const { state } = useContext(BookContext);
  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Chặn truy cập nếu không phải Admin
function AdminRoute({ children }) {
  const { state } = useContext(BookContext);
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    return <Navigate to="/books" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Route gốc mặc định đưa về /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Các route yêu cầu đã đăng nhập */}
      <Route element={<MainLayout />}>
        {/* Kho sách: Cả Admin và Reader đều xem được */}
        <Route
          path="/books"
          element={
            <PrivateRoute>
              <BookListPage />
            </PrivateRoute>
          }
        />

        {/* Các trang dành riêng cho Quản trị viên */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/books/create"
          element={
            <AdminRoute>
              <BookFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/books/edit/:id"
          element={
            <AdminRoute>
              <BookFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/borrow"
          element={
            <AdminRoute>
              <BorrowManagementPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Bất kỳ đường dẫn nào khác đều trả về /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BookProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </BookProvider>
  );
}

export default App;
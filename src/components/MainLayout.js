import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import { BookContext } from '../context/BookContext';
import Navbar from './Navbar';

function MainLayout() {
  const { state } = useContext(BookContext);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      {/* Hiển thị thông báo nếu có */}
      {state.notification && (
        <div className="container mt-3">
          <Alert 
            variant={state.notification.variant} 
            className="shadow-sm border-0 d-flex align-items-center mb-0"
          >
            {state.notification.message}
          </Alert>
        </div>
      )}

      {/* Nội dung chính tràn viền */}
      <main className="flex-grow-1 w-100">
        <Outlet />
      </main>

      {/* FOOTER ĐÃ ĐỔI MÀU NỀN TỐI NỔI BẬT & BỎ CHỮ DỰ ÁN FER202 */}
      <footer 
        className="py-3 mt-auto shadow-inner text-center border-top border-secondary border-opacity-25"
        style={{ backgroundColor: '#111827' }}
      >
        <Container fluid>
          <span className="text-light fw-medium">
            © Hệ thống Quản lý Thư viện <strong className="text-warning">LibHub BookManager</strong>
          </span>
        </Container>
      </footer>
    </div>
  );
}

export default MainLayout;
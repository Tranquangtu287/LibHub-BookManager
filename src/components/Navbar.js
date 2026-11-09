import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { BookContext } from '../context/BookContext';

function Navbar() {
  const { state, logout } = useContext(BookContext);
  const user = state.currentUser;
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow py-3" style={{ minHeight: '75px' }}>
      <Container fluid className="px-lg-5 px-3">
        {/* LOGO TO HƠN */}
        <BsNavbar.Brand as={Link} to={isAdmin ? "/dashboard" : "/books"} className="fw-bold d-flex align-items-center gap-2">
          <span style={{ fontSize: '1.8rem' }}>📚</span>
          <span style={{ fontSize: '1.45rem', letterSpacing: '0.5px' }}>
            <span className="text-primary">Lib</span>
            <span className="text-white">Hub</span>
            <span className="text-warning ms-1">BookManager</span>
          </span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar-nav" />

        <BsNavbar.Collapse id="main-navbar-nav">
          {/* MENU CỠ CHỮ TO HƠN */}
          <Nav className="me-auto ms-lg-4 gap-lg-3 my-2 my-lg-0" style={{ fontSize: '1.05rem' }}>
            {isAdmin ? (
              <>
                <Nav.Link as={NavLink} to="/dashboard" className={({ isActive }) => (isActive ? 'active fw-bold text-white' : '')}>
                  📊 Thống Kê
                </Nav.Link>
                <Nav.Link as={NavLink} to="/books" className={({ isActive }) => (isActive ? 'active fw-bold text-white' : '')}>
                  📖 Kho Sách
                </Nav.Link>
                <Nav.Link as={NavLink} to="/borrow" className={({ isActive }) => (isActive ? 'active fw-bold text-white' : '')}>
                  📋 Mượn & Trả Sách
                </Nav.Link>
              </>
            ) : (
              <Nav.Link as={NavLink} to="/books" className={({ isActive }) => (isActive ? 'active fw-bold text-white' : '')}>
                📖 Sách Bán
              </Nav.Link>
            )}
          </Nav>

          {/* CỤM NÚT BÊN PHẢI TO HƠN */}
          <div className="d-flex align-items-center gap-3 mt-2 mt-lg-0">
            {isAdmin && (
              <Button as={Link} to="/books/create" variant="primary" className="rounded-3 px-3 py-2 fw-semibold shadow-sm">
                + Thêm Sách Mới
              </Button>
            )}

            <span className="text-light" style={{ fontSize: '0.95rem' }}>
              {isAdmin ? user.fullName : (user?.fullName || 'Khách Vãng Lai')}{' '}
              <Badge bg={isAdmin ? 'danger' : 'info'} className="ms-1 px-2 py-1 fs-6">
                {isAdmin ? 'Quản Trị Viên' : 'Độc Giả'}
              </Badge>
            </span>

            <Button 
              variant="danger" 
              onClick={handleLogout} 
              className="rounded-3 px-3 py-2 fw-bold shadow-sm d-flex align-items-center gap-1"
            >
              <span>🚪</span> Đăng Xuất
            </Button>
          </div>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

export default Navbar;
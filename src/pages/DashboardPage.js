import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import { getBooks, getBorrowRecords } from '../services/api';
import { BookContext } from '../context/BookContext';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalBooksInStock: 0,
    availableBooks: 0,
    borrowingCount: 0,
    pendingCount: 0,
    overdueCount: 0
  });

  const { notify } = useContext(BookContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookRes, borrowRes] = await Promise.all([
          getBooks(),
          getBorrowRecords().catch(() => ({ data: [] }))
        ]);

        const books = bookRes.data || [];
        const borrows = borrowRes.data || [];

        const totalTitles = books.length;
        const totalBooksInStock = books.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
        const availableBooks = books.reduce((sum, b) => sum + Number(b.available || 0), 0);

        const now = new Date();
        let borrowingCount = 0;
        let pendingCount = 0;
        let overdueCount = 0;

        borrows.forEach((r) => {
          if (r.status === 'APPROVED') {
            borrowingCount += 1;
            if (r.returnDate && new Date(r.returnDate) < now) {
              overdueCount += 1;
            }
          } else if (r.status === 'PENDING') {
            pendingCount += 1;
          }
        });

        setStats({
          totalTitles,
          totalBooksInStock,
          availableBooks,
          borrowingCount,
          pendingCount,
          overdueCount
        });
      } catch (err) {
        notify('Lỗi tải dữ liệu báo cáo thống kê!', 'danger');
      }
    };

    fetchDashboardData();
  }, [notify]);

  return (
    <div
      className="w-100 min-vh-100 py-5 px-3 px-lg-5"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.88)), url('/images/anhbia.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Container fluid className="px-lg-4">
        {/* Tiêu đề trang to rõ ràng */}
        <div className="mb-5 text-white">
          <h2 className="fw-bold mb-2 d-flex align-items-center gap-2">
            <span>📊</span> Báo cáo tình hình hoạt động thư viện
          </h2>
          <p className="text-light opacity-75 fs-6 mb-0">
            Tổng hợp dữ liệu theo thời gian thực về số lượng đầu sách và các phiếu mượn tài liệu
          </p>
        </div>

        {/* Hàng 1: 3 Thẻ thống kê */}
        <Row className="g-4 mb-4">
          <Col lg={4} md={6}>
            <Card className="border-0 rounded-4 text-white p-4 shadow h-100" style={{ backgroundColor: '#0d6efd' }}>
              <Card.Body className="p-0">
                <div className="fs-6 fw-semibold opacity-90 mb-2">Tổng số đầu sách</div>
                <h1 className="display-4 fw-bold mb-3">{stats.totalTitles}</h1>
                <div className="small opacity-75">Tổng cộng {stats.totalBooksInStock} cuốn trong kho</div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6}>
            <Card className="border-0 rounded-4 text-white p-4 shadow h-100" style={{ backgroundColor: '#198754' }}>
              <Card.Body className="p-0">
                <div className="fs-6 fw-semibold opacity-90 mb-2">Sách sẵn sàng cho mượn</div>
                <h1 className="display-4 fw-bold mb-3">{stats.availableBooks}</h1>
                <div className="small opacity-75">Đang lưu hành trong kho</div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={12}>
            <Card className="border-0 rounded-4 text-white p-4 shadow h-100" style={{ backgroundColor: '#0dcaf0' }}>
              <Card.Body className="p-0">
                <div className="fs-6 fw-semibold text-dark opacity-90 mb-2">Số sách đang được mượn</div>
                <h1 className="display-4 fw-bold text-dark mb-3">{stats.borrowingCount}</h1>
                <div className="small text-dark opacity-75">Phiếu mượn trạng thái APPROVED</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Hàng 2: 2 Thẻ phê duyệt */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="border-0 rounded-4 text-dark p-4 shadow h-100" style={{ backgroundColor: '#ffc107' }}>
              <Card.Body className="p-0">
                <div className="fs-6 fw-semibold opacity-90 mb-2">Phiếu chờ phê duyệt (PENDING)</div>
                <h1 className="display-4 fw-bold mb-3">{stats.pendingCount}</h1>
                <div className="small opacity-75">Cần thủ thư xử lý</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 rounded-4 text-white p-4 shadow h-100" style={{ backgroundColor: '#dc3545' }}>
              <Card.Body className="p-0">
                <div className="fs-6 fw-semibold opacity-90 mb-2">Phiếu mượn quá hạn (OVERDUE)</div>
                <h1 className="display-4 fw-bold mb-3">{stats.overdueCount}</h1>
                <div className="small opacity-75">Cần gửi thông báo nhắc trả</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DashboardPage;
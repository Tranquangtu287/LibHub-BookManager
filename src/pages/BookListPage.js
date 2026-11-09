import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Row, Col, Badge, Card, Pagination, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getBooks, getCategories, getAuthors, deleteBook, createBorrowRecord, getBorrowRecords } from '../services/api';
import { BookContext } from '../context/BookContext';
 
function BookListPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
 
  // State Modal Mượn Sách
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
 
  // Form đăng ký mượn sách chi tiết
  const [borrowForm, setBorrowForm] = useState({
    nationalityType: 'VN', // 'VN' hoặc 'INTL'
    readerName: '',
    idCardNumber: '',      // CCCD (VN) hoặc Passport (Quốc tế)
    phone: '',
    borrowDays: 14
  });
  const [formErrors, setFormErrors] = useState({});
 
  const { notify, state } = useContext(BookContext);
  const user = state.currentUser;
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
 
  const fetchData = async () => {
    try {
      const [bookRes, catRes, authorRes] = await Promise.all([
        getBooks(),
        getCategories(),
        getAuthors().catch(() => ({ data: [] }))
      ]);
      setBooks(bookRes.data);
      setCategories(catRes.data);
      setAuthors(authorRes.data || []);
    } catch (err) {
      notify('Lỗi tải dữ liệu danh sách sách!', 'danger');
    }
  };
 
  useEffect(() => {
    fetchData();
  }, []);
 
  const handleDelete = async (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa cuốn sách "${title}"?`)) {
      try {
        await deleteBook(id);
        notify('Đã xóa sách thành công!');
        fetchData();
      } catch (err) {
        notify('Xóa sách thất bại!', 'danger');
      }
    }
  };
 
  // Mở modal mượn sách
  const handleOpenBorrow = (book) => {
    setSelectedBook(book);
    setBorrowForm({
      nationalityType: 'VN',
      readerName: '', // Để trống để hiện placeholder "nhập họ và tên ở đây"
      idCardNumber: '',
      phone: '',
      borrowDays: 14
    });
    setFormErrors({});
    setShowBorrowModal(true);
  };
 
  // Kiểm tra tính hợp lệ từng trường dữ liệu
  const validateField = (name, value, nationalityType) => {
    let error = '';
    const trimmed = String(value || '').trim();
 
    if (name === 'readerName') {
      if (!trimmed) {
        error = 'Vui lòng nhập họ và tên người mượn!';
      }
    }
 
    if (name === 'idCardNumber') {
      if (nationalityType === 'VN') {
        const vnIdRegex = /^[0-9]{12}$/;
        if (!trimmed) {
          error = 'Vui lòng nhập số CCCD để xác minh!';
        } else if (!vnIdRegex.test(trimmed)) {
          error = 'Số CCCD không hợp lệ (phải đúng 12 chữ số)!';
        }
      } else {
        const passportRegex = /^[a-zA-Z0-9]{6,12}$/;
        if (!trimmed) {
          error = 'Vui lòng nhập số Hộ chiếu (Passport) để xác minh!';
        } else if (!passportRegex.test(trimmed)) {
          error = 'Số Hộ chiếu không hợp lệ (gồm 6 - 12 ký tự chữ và số)!';
        }
      }
    }
 
    if (name === 'phone') {
      if (nationalityType === 'VN') {
        const vnPhoneRegex = /^0[0-9]{9}$/;
        if (!trimmed) {
          error = 'Vui lòng nhập số điện thoại!';
        } else if (!vnPhoneRegex.test(trimmed)) {
          error = 'Số điện thoại Việt Nam phải đúng 10 chữ số và bắt đầu bằng số 0!';
        }
      } else {
        const intlPhoneRegex = /^\+[0-9]{7,15}$/;
        if (!trimmed) {
          error = 'Vui lòng nhập số điện thoại quốc tế!';
        } else if (!intlPhoneRegex.test(trimmed)) {
          error = 'Số điện thoại quốc tế không hợp lệ (phải có mã vùng dấu + và gồm 7-15 chữ số)!';
        }
      }
    }
 
    return error;
  };
 
  // Xử lý thay đổi input: chặn ký tự lạ và chặn nhập tràn số
  const handleInputChange = (field, rawValue) => {
    let cleanValue = rawValue;
 
    if (borrowForm.nationalityType === 'VN') {
      if (field === 'phone') {
        cleanValue = rawValue.replace(/\D/g, '').slice(0, 10);
      }
      if (field === 'idCardNumber') {
        cleanValue = rawValue.replace(/\D/g, '').slice(0, 12);
      }
    } else {
      if (field === 'phone') {
        cleanValue = rawValue.replace(/[^0-9+]/g, '').slice(0, 16);
      }
      if (field === 'idCardNumber') {
        cleanValue = rawValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      }
    }
 
    const updatedForm = { ...borrowForm, [field]: cleanValue };
    setBorrowForm(updatedForm);
 
    const error = validateField(field, cleanValue, updatedForm.nationalityType);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };
 
  const handleNationalityChange = (type) => {
    const updatedForm = { ...borrowForm, nationalityType: type, idCardNumber: '', phone: '' };
    setBorrowForm(updatedForm);
    setFormErrors({});
  };
 
  // Xác nhận tạo phiếu mượn
  const handleConfirmBorrow = async (e) => {
    e.preventDefault();
 
    const nameErr = validateField('readerName', borrowForm.readerName, borrowForm.nationalityType);
    const idErr = validateField('idCardNumber', borrowForm.idCardNumber, borrowForm.nationalityType);
    const phoneErr = validateField('phone', borrowForm.phone, borrowForm.nationalityType);
 
    const errors = {};
    if (nameErr) errors.readerName = nameErr;
    if (idErr) errors.idCardNumber = idErr;
    if (phoneErr) errors.phone = phoneErr;
 
    setFormErrors(errors);
 
    if (Object.keys(errors).length > 0) {
      return;
    }
 
    try {
      const allRecordsRes = await getBorrowRecords();
      const records = allRecordsRes.data || [];
      const numIds = records.map((r) => parseInt(r.id, 10)).filter((n) => !isNaN(n));
      const nextId = numIds.length > 0 ? Math.max(...numIds) + 1 : 1;
 
      const now = new Date();
      const borrowDateStr = now.toISOString().split('T')[0];
      const returnDate = new Date();
      returnDate.setDate(now.getDate() + Number(borrowForm.borrowDays));
      const returnDateStr = returnDate.toISOString().split('T')[0];
 
      const newBorrow = {
        id: String(nextId),
        readerName: borrowForm.readerName.trim(),
        readerPhone: borrowForm.phone.trim(),
        idCardNumber: borrowForm.idCardNumber.trim(),
        nationalityType: borrowForm.nationalityType === 'VN' ? 'Việt Nam' : 'Quốc tế',
        bookId: String(selectedBook.id),
        borrowDate: borrowDateStr,
        returnDate: returnDateStr,
        status: 'PENDING'
      };
 
      await createBorrowRecord(newBorrow);
      notify(`Đã gửi yêu cầu mượn cuốn sách "${selectedBook.title}" thành công! Vui lòng chờ duyệt.`);
      setShowBorrowModal(false);
    } catch (err) {
      notify('Gửi yêu cầu mượn sách thất bại, vui lòng thử lại!', 'danger');
    }
  };
 
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
 
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };
 
  const filteredBooks = books.filter((b) => {
    const matchTitle = b.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory ? String(b.categoryId) === String(selectedCategory) : true;
    return matchTitle && matchCategory;
  });
 
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
 
  return (
    <div className="pb-4">
      {/* Header: Admin là 'Kho Sách Thư Viện', Khách là 'Sách Bán Thư Viện' */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {isAdmin ? '📖 Kho Sách Thư Viện' : '📖 Sách Bán Thư Viện'}
          </h3>
          <p className="text-muted mb-0 small">
            Hiển thị <strong>{filteredBooks.length}</strong> cuốn sách | Quyền hiện tại:{' '}
            <Badge bg={isAdmin ? 'danger' : 'info'}>
              {isAdmin ? 'Quản Trị Viên' : 'Độc Giả'}
            </Badge>
          </p>
        </div>
 
        {/* Nút thêm mới chỉ có Quản trị viên */}
        {isAdmin && (
          <Link to="/books/create" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-3 py-2 rounded-3">
            <span className="fs-5 lh-1">+</span>
            <span className="fw-semibold">Thêm Sách Mới</span>
          </Link>
        )}
      </div>
 
      {/* Tìm kiếm & Lọc */}
      <Card className="border-0 shadow-sm rounded-3 mb-4 bg-white p-3">
        <Row className="g-3">
          <Col md={7}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary mb-1">Tìm kiếm sách</Form.Label>
              <Form.Control
                type="text"
                placeholder="nhập tại đây"
                value={search}
                onChange={handleSearchChange}
                className="py-2 rounded-3"
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary mb-1">Danh mục</Form.Label>
              <Form.Select value={selectedCategory} onChange={handleCategoryChange} className="py-2 rounded-3">
                <option value="">-- Tất cả danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card>
 
      {/* Bảng sách */}
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Table hover responsive className="align-middle mb-0 text-nowrap">
          <thead className="bg-light text-secondary border-bottom">
            <tr className="small text-uppercase fw-bold">
              <th className="ps-3 py-3">Mã Sách</th>
              <th>Tên Sách</th>
              <th>Tác Giả</th>
              <th>Danh Mục</th>
              <th>Giá Bìa</th>
              {/* CHỈ ADMIN MỚI THẤY CỘT TỔNG KHO */}
              {isAdmin && <th className="text-center">Tổng Kho</th>}
              <th className="text-center">Sẵn Có</th>
              <th className="text-end pe-3">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {currentBooks.length > 0 ? (
              currentBooks.map((book) => {
                const cat = categories.find((c) => String(c.id) === String(book.categoryId));
                const authorObj = authors.find((a) => String(a.id) === String(book.authorId));
                let displayAuthor = book.author;
                if (!displayAuthor || displayAuthor.trim() === '?' || displayAuthor.trim() === '') {
                  displayAuthor = authorObj ? authorObj.name : 'Đang cập nhật';
                }
 
                return (
                  <tr key={book.id}>
                    <td className="ps-3 text-muted small font-monospace">#{book.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={`/images/${book.image || 'anhbia.jpg'}`}
                          alt={book.title}
                          style={{ width: 45, height: 62, objectFit: 'cover', borderRadius: 4 }}
                          onError={(e) => { e.target.onerror = null; e.target.src = '/images/anhbia.jpg'; }}
                        />
                        <div>
                          <span className="fw-bold text-dark d-block text-truncate" style={{ maxWidth: '240px' }}>
                            {book.title}
                          </span>
                          {book.publishedYear && <small className="text-muted">NXB: {book.publishedYear}</small>}
                        </div>
                      </div>
                    </td>
                    <td className="text-secondary fw-semibold">{displayAuthor}</td>
                    <td>
                      <Badge bg="light" className="text-primary border border-primary-subtle px-2 py-1">
                        {cat ? cat.name : 'Chưa phân loại'}
                      </Badge>
                    </td>
                    <td className="fw-semibold text-secondary">{Number(book.price || 0).toLocaleString('vi-VN')} đ</td>
                    
                    {/* GIÁ TRỊ TỔNG KHO CHỈ HIỂN THỊ VỚI ADMIN */}
                    {isAdmin && (
                      <td className="text-center fw-semibold text-muted">{book.quantity}</td>
                    )}
 
                    <td className="text-center">
                      <Badge bg={book.available > 0 ? 'success' : 'danger'} className="rounded-pill px-3 py-1">
                        {book.available > 0 ? `${book.available} cuốn` : 'Hết hàng'}
                      </Badge>
                    </td>
                    <td className="text-end pe-3">
                      {isAdmin ? (
                        <>
                          <Link to={`/books/edit/${book.id}`} className="btn btn-sm btn-outline-warning me-2 px-2 py-1 rounded-2">
                            ✏️ Sửa
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="px-2 py-1 rounded-2"
                            onClick={() => handleDelete(book.id, book.title)}
                          >
                            🗑️ Xóa
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={book.available <= 0}
                          className="px-3 py-1 rounded-2 fw-semibold"
                          onClick={() => handleOpenBorrow(book)}
                        >
                          {book.available > 0 ? '📥 Mượn Sách' : 'Đã Hết'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="text-center py-5 text-muted">
                  Không tìm thấy cuốn sách nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
 
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination className="shadow-sm">
            <Pagination.Prev onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}
 
      {/* MODAL MƯỢN SÁCH: CÓ XÁC MINH CCCD/PASSPORT VÀ SĐT */}
      <Modal show={showBorrowModal} onHide={() => setShowBorrowModal(false)} centered backdrop="static">
        <Form onSubmit={handleConfirmBorrow} noValidate>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold text-dark d-flex align-items-center gap-2">
              <span>📥</span> Đăng Ký Mượn Sách
            </Modal.Title>
          </Modal.Header>
 
          <Modal.Body className="px-4 py-3">
            <div className="bg-light p-3 rounded-3 mb-3 border">
              <div className="fw-bold text-primary">{selectedBook?.title}</div>
              <div className="small text-muted">Tác giả: {selectedBook?.author || 'Đang cập nhật'}</div>
            </div>
 
            {/* 1. Chọn vùng đối tượng */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">
                Khu Vực Độc Giả <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex gap-4 align-items-center">
                <Form.Check
                  type="radio"
                  id="radio-vn"
                  name="nationalityType"
                  label={<span className="fw-semibold text-dark">VN - Công dân Việt Nam</span>}
                  checked={borrowForm.nationalityType === 'VN'}
                  onChange={() => handleNationalityChange('VN')}
                />
                <Form.Check
                  type="radio"
                  id="radio-intl"
                  name="nationalityType"
                  label={<span className="fw-semibold text-dark">Quốc Tế / Nước Ngoài</span>}
                  checked={borrowForm.nationalityType === 'INTL'}
                  onChange={() => handleNationalityChange('INTL')}
                />
              </div>
            </Form.Group>
 
            {/* 2. Họ và tên người mượn */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Họ và Tên Người Mượn <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="nhập họ và tên ở đây"
                value={borrowForm.readerName}
                isInvalid={!!formErrors.readerName}
                onChange={(e) => handleInputChange('readerName', e.target.value)}
                className="rounded-3"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.readerName}
              </Form.Control.Feedback>
            </Form.Group>
 
            {/* 3. Bắt buộc CCCD hoặc Passport để xác minh */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                {borrowForm.nationalityType === 'VN' ? 'Số CCCD Xác Minh (12 số)' : 'Số Hộ Chiếu (Passport)'} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="nhập tại đây"
                maxLength={12}
                value={borrowForm.idCardNumber}
                isInvalid={!!formErrors.idCardNumber}
                onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
                className="rounded-3"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.idCardNumber}
              </Form.Control.Feedback>
              <Form.Text className="text-muted small">
                {borrowForm.nationalityType === 'VN'
                  ? 'Bắt buộc đúng 12 chữ số theo thẻ CCCD gắn chip.'
                  : 'Từ 6 đến 12 ký tự chữ và số.'}
              </Form.Text>
            </Form.Group>
 
            {/* 4. Số điện thoại */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Số Điện Thoại Liên Hệ <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="nhập tại đây"
                maxLength={borrowForm.nationalityType === 'VN' ? 10 : 16}
                value={borrowForm.phone}
                isInvalid={!!formErrors.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="rounded-3"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phone}
              </Form.Control.Feedback>
              <Form.Text className="text-muted small">
                {borrowForm.nationalityType === 'VN'
                  ? 'Số điện thoại Việt Nam bắt buộc đúng 10 chữ số (bắt đầu bằng số 0).'
                  : 'Số điện thoại quốc tế gồm mã vùng dấu + và từ 7 đến 15 chữ số.'}
              </Form.Text>
            </Form.Group>
 
            {/* 5. Thời hạn mượn */}
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">Thời Hạn Mượn Sách</Form.Label>
              <Form.Select
                value={borrowForm.borrowDays}
                onChange={(e) => setBorrowForm({ ...borrowForm, borrowDays: e.target.value })}
                className="rounded-3"
              >
                <option value={7}>7 ngày (1 tuần)</option>
                <option value={14}>14 ngày (2 tuần)</option>
                <option value={30}>30 ngày (1 tháng)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
 
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-3 px-3" onClick={() => setShowBorrowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4 fw-semibold shadow-sm">
              Xác Nhận Mượn
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
 
export default BookListPage;
 
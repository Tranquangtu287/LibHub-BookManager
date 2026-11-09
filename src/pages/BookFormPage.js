import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getBookById, addBook, updateBook, getCategories, getBooks } from '../services/api';
import { BookContext } from '../context/BookContext';

function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useContext(BookContext);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    categoryId: '',
    price: '',
    quantity: '',
    available: '',
    publishedYear: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data));
    if (id) {
      getBookById(id).then((res) => {
        const data = res.data;
        setFormData({
          title: data.title || '',
          author: (data.author && data.author !== '?') ? data.author : '',
          categoryId: data.categoryId || '',
          price: data.price || '',
          quantity: data.quantity || '',
          available: data.available !== undefined ? data.available : data.quantity,
          publishedYear: data.publishedYear || '',
          description: data.description || ''
        });
      });
    }
  }, [id]);

  const validate = () => {
    const err = {};
    if (!formData.title.trim()) err.title = 'Vui lòng nhập tên sách!';
    if (!formData.author.trim() || formData.author.trim() === '?') {
      err.author = 'Vui lòng nhập tên tác giả!';
    }
    if (!formData.categoryId) err.categoryId = 'Vui lòng chọn danh mục!';
    if (!formData.price || Number(formData.price) <= 0) {
      err.price = 'Giá bìa phải lớn hơn 0!';
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      err.quantity = 'Số lượng kho phải từ 1 trở lên!';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const qty = Number(formData.quantity);

      if (id) {
        // TRƯỜNG HỢP CẬP NHẬT: Giữ nguyên ID đang có
        const payload = {
          ...formData,
          id: String(id),
          title: formData.title.trim(),
          author: formData.author.trim(),
          price: Number(formData.price),
          quantity: qty,
          publishedYear: Number(formData.publishedYear) || 2026,
          available: Math.min(Number(formData.available), qty)
        };

        await updateBook(id, payload);
        notify('Cập nhật thông tin sách thành công!');
      } else {
        // TRƯỜNG HỢP TẠO MỚI: Tự tính ID số nguyên kế tiếp
        const allBooksRes = await getBooks();
        const allBooks = allBooksRes.data || [];

        // Lấy tất cả ID hợp lệ và tìm số lớn nhất
        const numericIds = allBooks
          .map((b) => parseInt(b.id, 10))
          .filter((val) => !isNaN(val));

        const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

        const payload = {
          id: String(nextId), // Gửi kèm ID số nguyên tự tăng
          title: formData.title.trim(),
          author: formData.author.trim(),
          categoryId: formData.categoryId,
          price: Number(formData.price),
          quantity: qty,
          available: qty,
          publishedYear: Number(formData.publishedYear) || 2026,
          description: formData.description.trim()
        };

        await addBook(payload);
        notify(`Tạo sách thành công với mã #${nextId}!`);
      }

      navigate('/books');
    } catch (err) {
      notify('Lưu thông tin thất bại!', 'danger');
    }
  };

  return (
    <div className="py-2">
      <Card className="border-0 shadow-sm rounded-4 mx-auto p-4 bg-white" style={{ maxWidth: '780px' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div>
            <h4 className="fw-bold mb-1 text-dark">
              {id ? '✏️ Cập Nhật Thông Tin Sách' : '📖 Thêm Sách Mới Vào Thư Viện'}
            </h4>
            <p className="text-muted small mb-0">
              Điền thông tin sách, ID sẽ tự động sinh tuần tự
            </p>
          </div>
          <Link to="/books" className="btn btn-outline-secondary btn-sm rounded-3">
            ← Quay lại
          </Link>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Tên sách */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">
              Tên Sách <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="VD: Lập Trình ReactJS..."
              value={formData.title}
              isInvalid={!!errors.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="py-2 rounded-3"
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>

          {/* Tác giả & Danh mục */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  Tác Giả <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: Nguyễn Nhật Ánh..."
                  value={formData.author}
                  isInvalid={!!errors.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="py-2 rounded-3"
                />
                <Form.Control.Feedback type="invalid">{errors.author}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  Danh Mục <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.categoryId}
                  isInvalid={!!errors.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="py-2 rounded-3"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.categoryId}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Giá bìa, Số lượng & Năm xuất bản */}
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  Giá Bìa (VNĐ) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VD: 150000"
                  value={formData.price}
                  isInvalid={!!errors.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="py-2 rounded-3"
                />
                <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  Tổng Số Lượng <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VD: 10"
                  value={formData.quantity}
                  isInvalid={!!errors.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="py-2 rounded-3"
                />
                <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Năm Xuất Bản</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VD: 2026"
                  value={formData.publishedYear}
                  onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                  className="py-2 rounded-3"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Mô tả */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small">Mô Tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập mô tả tóm tắt..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-3"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Button variant="light" className="px-4 py-2 rounded-3 text-secondary" onClick={() => navigate('/books')}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" className="px-4 py-2 rounded-3 shadow-sm fw-semibold">
              {id ? 'Lưu Thay Đổi' : 'Tạo Sách Mới'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default BookFormPage;
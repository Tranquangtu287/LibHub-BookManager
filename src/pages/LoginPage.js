import React, { useState, useContext } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BookContext } from '../context/BookContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginAsGuest } = useContext(BookContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const loggedUser = await login(username, password);
      setLoading(false);

      if (loggedUser) {
        if (loggedUser.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/books');
        }
      } else {
        setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Đã xảy ra lỗi hệ thống, vui lòng thử lại!');
    }
  };

  const handleContinueAsGuest = () => {
    loginAsGuest();
    navigate('/books');
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center min-vh-100 position-relative px-3"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url('/images/anhbia.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Khung đăng nhập nổi đè lên nền ảnh */}
      <Card 
        className="border-0 shadow-lg p-4 p-md-5 rounded-4 position-relative"
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">📚</div>
          <h4 className="fw-bold text-dark mb-1">LibHub BookManager</h4>
          <p className="text-muted small mb-0">Đăng nhập tài khoản để vào hệ thống</p>
        </div>

        {errorMsg && (
          <Alert variant="danger" className="py-2 small text-center rounded-3 mb-3 border-0">
            {errorMsg}
          </Alert>
        )}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold text-secondary">Tên đăng nhập</Form.Label>
            <Form.Control
              type="text"
              placeholder="nhập tại đây"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="py-2 rounded-3"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-semibold text-secondary">Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="nhập tại đây"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="py-2 rounded-3"
              required
            />
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 fw-bold py-2 rounded-3 shadow-sm mb-3"
            disabled={loading}
          >
            {loading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
          </Button>

          <div className="text-center border-top pt-3">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="w-100 rounded-3 py-2 fw-semibold"
              onClick={handleContinueAsGuest}
            >
              👀 Xem sách với tư cách Khách
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
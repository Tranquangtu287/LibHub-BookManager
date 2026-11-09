import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form } from 'react-bootstrap';
import { getBorrowRecords, updateBorrowStatus, getBooks, patchBook } from '../services/api';
import { BookContext } from '../context/BookContext';

function BorrowManagementPage() {
  const [records, setRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const { notify } = useContext(BookContext);

  const loadData = async () => {
    try {
      const [recordRes, bookRes] = await Promise.all([getBorrowRecords(), getBooks()]);
      setRecords(recordRes.data);
      setBooks(bookRes.data);
    } catch (err) {
      notify('Lỗi khi tải thông tin phiếu mượn', 'danger');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (record) => {
    const book = books.find((b) => b.id === record.bookId);
    if (!book || book.available <= 0) {
      notify('Sách này trong kho đã hết, không thể duyệt mượn!', 'danger');
      return;
    }

    try {
      await Promise.all([
        updateBorrowStatus(record.id, 'APPROVED'),
        patchBook(book.id, { available: book.available - 1 })
      ]);
      notify(`Đã duyệt phiếu mượn #${record.id}!`);
      loadData();
    } catch (err) {
      notify('Duyệt phiếu thất bại', 'danger');
    }
  };

  const handleReturn = async (record) => {
    const book = books.find((b) => b.id === record.bookId);
    try {
      const promises = [updateBorrowStatus(record.id, 'RETURNED')];
      if (book) {
        promises.push(patchBook(book.id, { available: book.available + 1 }));
      }
      await Promise.all(promises);
      notify(`Đã xác nhận trả sách cho phiếu #${record.id}!`);
      loadData();
    } catch (err) {
      notify('Xác nhận trả thất bại', 'danger');
    }
  };

  const filteredRecords = filterStatus
    ? records.filter((r) => r.status === filterStatus)
    : records;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Duyệt phiếu mượn & Theo dõi trả sách ({filteredRecords.length})</h3>
      </div>

      <Card className="p-3 mb-4 shadow-sm">
        <Row>
          <Col md={5}>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">-- Tất cả trạng thái phiếu --</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="APPROVED">Đang mượn (APPROVED)</option>
              <option value="RETURNED">Đã trả (RETURNED)</option>
              <option value="OVERDUE">Quá hạn (OVERDUE)</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Mã phiếu</th>
            <th>Tên độc giả</th>
            <th>Số điện thoại</th>
            <th>Tên sách mượn</th>
            <th>Ngày mượn</th>
            <th>Hạn trả</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((r) => {
            const book = books.find((b) => b.id === r.bookId);
            return (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td><strong>{r.readerName}</strong></td>
                <td>{r.readerPhone}</td>
                <td>{book ? book.title : `Sách #${r.bookId}`}</td>
                <td>{r.borrowDate}</td>
                <td>{r.returnDate}</td>
                <td>
                  <Badge
                    bg={
                      r.status === 'APPROVED'
                        ? 'primary'
                        : r.status === 'RETURNED'
                        ? 'success'
                        : r.status === 'OVERDUE'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {r.status}
                  </Badge>
                </td>
                <td>
                  {r.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(r)}
                    >
                      Duyệt mượn
                    </Button>
                  )}
                  {(r.status === 'APPROVED' || r.status === 'OVERDUE') && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleReturn(r)}
                    >
                      Xác nhận trả
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default BorrowManagementPage;
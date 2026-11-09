import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9999'
});

// Sách
export const getBooks = () => api.get('/books');
export const getBookById = (id) => api.get(`/books/${id}`);
export const addBook = (book) => api.post('/books', book);
export const updateBook = (id, book) => api.put(`/books/${id}`, book);
export const patchBook = (id, patchData) => api.patch(`/books/${id}`, patchData);
export const deleteBook = (id) => api.delete(`/books/${id}`);

// Danh mục & Tác giả
export const getCategories = () => api.get('/categories');
export const getAuthors = () => api.get('/authors');

// Quản lý mượn trả
export const getBorrowRecords = () => api.get('/borrowRecords');
export const createBorrowRecord = (record) => api.post('/borrowRecords', record);
export const updateBorrowStatus = (id, status) => api.patch(`/borrowRecords/${id}`, { status });
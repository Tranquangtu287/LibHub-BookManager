import React, { createContext, useReducer } from 'react';
import axios from 'axios';

export const BookContext = createContext();

// Khởi tạo luôn là null -> Bấm Reload (F5) là bắt buộc về /login
const initialState = {
  notification: null,
  currentUser: null
};

function bookReducer(state, action) {
  switch (action.type) {
    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'HIDE_NOTIFICATION':
      return { ...state, notification: null };
    case 'LOGIN_SUCCESS':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    default:
      return state;
  }
}

export function BookProvider({ children }) {
  const [state, dispatch] = useReducer(bookReducer, initialState);

  const notify = (message, variant = 'success') => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message, variant } });
    setTimeout(() => {
      dispatch({ type: 'HIDE_NOTIFICATION' });
    }, 3000);
  };

  const login = async (username, password) => {
    const u = String(username).trim();
    const p = String(password).trim();

    try {
      let res;
      try {
        res = await axios.get(`http://localhost:9999/users?username=${u}&password=${p}`);
      } catch {
        res = await axios.get(`http://localhost:9000/users?username=${u}&password=${p}`);
      }

      if (res && res.data && res.data.length > 0) {
        const found = res.data[0];
        dispatch({ type: 'LOGIN_SUCCESS', payload: found });
        notify(`Chào mừng ${found.fullName}!`);
        return found;
      }
    } catch (e) {
      console.warn("Lỗi gọi API, dùng tài khoản mặc định.");
    }

    if (u === 'admin' && p === '123') {
      const adminData = {
        id: "1",
        username: "admin",
        fullName: "Quản Trị Viên",
        role: "admin"
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: adminData });
      notify("Đăng nhập thành công với quyền Quản Trị Viên!");
      return adminData;
    }

    if (u === 'khach' && p === '123') {
      const readerData = {
        id: "2",
        username: "khach",
        fullName: "Độc Giả Khách",
        role: "reader"
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: readerData });
      notify("Đăng nhập thành công với quyền Độc Giả!");
      return readerData;
    }

    return null;
  };

  // Cấp quyền khách tạm thời để vào xem và mượn sách
  const loginAsGuest = () => {
    const guestUser = {
      id: "guest",
      username: "guest",
      fullName: "",
      role: "guest"
    };
    dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    notify('Đã thoát phiên làm việc.');
  };

  return (
    <BookContext.Provider value={{ state, notify, login, loginAsGuest, logout }}>
      {children}
    </BookContext.Provider>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import { useAuth } from '../contexts/AuthContext';
import { can } from '../utils/permissions';

export default function NavBar() {
  const { isLoggedIn, displayName, communityName, role, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  // 滑鼠移入時顯示選單
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsMenuOpen(true);
  };

  // 滑鼠移出時延遲隱藏選單
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 200); // 200ms 延遲，讓用戶有時間移動到選單上
  };

  // 清理定時器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 路由變化時關閉選單
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          {isLoggedIn && communityName ? communityName : '社區系統'}
        </Link>

        <ul className="nav-links">
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/">首頁</Link>
          </li>

          {isLoggedIn && (
            <>
              <li className={location.pathname.startsWith('/meetings') ? 'active' : ''}>
                <Link to="/meetings">進入會議</Link>
              </li>

              {(role === 'admin' || role === 'manager') && (
                <li className={location.pathname === '/residents' ? 'active' : ''}>
                  <Link to="/residents">住戶清單</Link>
                </li>
              )}
            </>
          )}
        </ul>

        <div className="user-section">
          {!isLoggedIn ? (
            <Link to="/login" className="btn-login">登入</Link>
          ) : (
            <div
              className="user-dropdown"
              ref={menuRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="user-btn"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <span className="user-avatar">
                  {displayName?.charAt(0)?.toUpperCase()}
                </span>
                <span className="user-name">{displayName}</span>
              </button>
              {isMenuOpen && (
                <ul className="dropdown-menu show">
                  <li>
                    <Link
                      to="/profile"
                      onClick={handleMenuItemClick}
                    >
                      個人資料
                    </Link>
                  </li>
                  {role === 'admin' && (
                    <li className={location.pathname === '/communities' ? 'active' : ''}>
                      <Link
                        to="/communities"
                        onClick={handleMenuItemClick}
                      >
                        社區管理
                      </Link>
                    </li>
                  )}
                  {can(role, 'admin.manage') && (
                    <li className={location.pathname === '/admin/users' ? 'active' : ''}>
                      <Link
                        to="/admin/users"
                        onClick={handleMenuItemClick}
                      >
                        帳號管理
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="logout-btn"
                    >
                      登出
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

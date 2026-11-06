//src/components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

function MainLayout() {
  return (
    <div>
      {/* 共用的導覽列 */}
      <NavBar />

      {/* 這裡就是子路由顯示的地方 */}
      <Outlet />
    </div>
  );
}

export default MainLayout;

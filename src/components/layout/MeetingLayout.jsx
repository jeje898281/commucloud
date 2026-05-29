// src/components/layout/MeetingLayout.jsx
import React from 'react';
import { Outlet, NavLink, useParams } from 'react-router-dom';
import { MeetingProvider, useMeeting } from '../../contexts/MeetingContext';
import '../../styles/MeetingNav.css';

function InnerLayout() {
  const { meeting, loading, error } = useMeeting();
  const { id } = useParams();

  if (loading) {
    return (
      <div className="meeting-layout-state">
        <p>載入會議資訊...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="meeting-layout-state">
        <p>{error || '查無此會議'}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <>
      <div className="meeting-info-header">
        <div className="meeting-nav-container">
          <h2 className="meeting-info-title">{meeting.name}</h2>
          {meeting.date && (
            <p className="meeting-info-sub">{formatDate(meeting.date)}</p>
          )}
        </div>
      </div>

      <nav className="meeting-nav">
        <div className="meeting-nav-container">
          <ul className="meeting-nav-tabs">
            <li className="meeting-nav-tab">
              <NavLink to={`/meetings/${id}/scan`}>掃描報到</NavLink>
            </li>
            <li className="meeting-nav-tab">
              <NavLink to={`/meetings/${id}/manual`}>手動報到</NavLink>
            </li>
            <li className="meeting-nav-tab">
              <NavLink to={`/meetings/${id}/summary`}>統計</NavLink>
            </li>
            <li className="meeting-nav-tab">
              <NavLink to={`/meetings/${id}/qrcodes`}>QR Code</NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <Outlet />
    </>
  );
}

export default function MeetingLayout() {
  const { id } = useParams();
  return (
    <MeetingProvider meetingId={id}>
      <InnerLayout />
    </MeetingProvider>
  );
}

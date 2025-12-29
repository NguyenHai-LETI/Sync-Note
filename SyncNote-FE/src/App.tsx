import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RequireAuth } from './components/RequireAuth';
import { DashboardLayout } from './components/DashboardLayout';
import { NoteList } from './components/NoteList';
import { NoteDetail } from './components/NoteDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<div style={{ padding: '2rem', color: '#888' }}>Select a category to view notes</div>} />
            <Route path="categories/:categoryId" element={<NoteList />} />
            <Route path="notes/:noteId" element={<NoteDetail />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

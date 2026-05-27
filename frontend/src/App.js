import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

// Marketing
import MarketingLayout from '@/pages/marketing/layout';
import MarketingPage from '@/pages/marketing/page';

// Auth
import AuthLayout from '@/pages/auth/layout';
import SignInPage from '@/pages/auth/sign-in/page';
import SignUpPage from '@/pages/auth/sign-up/page';

// Main App
import MainLayout from '@/pages/main/layout';
import LearnPage from '@/pages/main/learn/page';
import SousThemeDetailPage from '@/pages/main/learn/[sousThemeId]/page';
import CoursesPage from '@/pages/main/courses/page';

// Lesson
import LessonLayout from '@/pages/lesson/layout';
import LessonPage from '@/pages/lesson/page';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Marketing Routes */}
          <Route element={<MarketingLayout />}>
            <Route index element={<MarketingPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
          </Route>

          {/* Main App Routes */}
          <Route path="/main" element={<MainLayout />}>
            <Route path="learn" element={<LearnPage />} />
            <Route path="learn/:sousThemeId" element={<SousThemeDetailPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route index element={<Navigate to="/main/learn" replace />} />
          </Route>

          {/* Lesson Routes */}
          <Route path="/lesson" element={<LessonLayout />}>
            <Route index element={<LessonPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
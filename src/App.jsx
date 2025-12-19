import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import HackathonExplorer from '@/pages/HackathonExplorer';
import HackathonDetail from '@/pages/HackathonDetail';
import Dashboard from '@/pages/Dashboard';
import TeamMatchmaking from '@/pages/TeamMatchmaking';
import AICoach from '@/pages/AICoach';
import Profile from '@/pages/Profile';
import Messages from '@/pages/Messages';
import Projects from '@/pages/Projects';
import ProjectRoom from '@/pages/ProjectRoom';
import LearningHub from '@/pages/LearningHub';
import Community from '@/pages/Community';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminHackathons from '@/pages/admin/AdminHackathons';
import AdminTeams from '@/pages/admin/AdminTeams';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import MyHackathonTeams from '@/pages/MyHackathonTeams';
import ChatWidget from '@/components/ai/ChatWidget';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';

// ✅ Toastify imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/learning" element={<LearningHub />} />
          <Route path="/community" element={<Community />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/explorer" element={
            <ProtectedRoute>
              <HackathonExplorer />
            </ProtectedRoute>
          } />
          <Route path="/hackathon/:hackathonId" element={
            <ProtectedRoute>
              <HackathonDetail />
            </ProtectedRoute>
          } />
          <Route path="/my-teams" element={
            <ProtectedRoute>
              <MyHackathonTeams />
            </ProtectedRoute>
          } />
          <Route path="/matchmaking" element={
            <ProtectedRoute>
              <TeamMatchmaking />
            </ProtectedRoute>
          } />
          <Route path="/ai-coach" element={
            <ProtectedRoute>
              <AICoach />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId" element={
            <ProtectedRoute>
              <ProjectRoom />
            </ProtectedRoute>
          } />
          <Route path="/project-room/:teamId" element={
            <ProtectedRoute>
              <ProjectRoom />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/hackathons" element={
            <AdminRoute>
              <AdminHackathons />
            </AdminRoute>
          } />
          <Route path="/admin/teams" element={
            <AdminRoute>
              <AdminTeams />
            </AdminRoute>
          } />
          <Route path="/admin/announcements" element={
            <AdminRoute>
              <AdminAnnouncements />
            </AdminRoute>
          } />
        </Routes>
      </main>

      <Footer />
      <ChatWidget />
      <Toaster />

      {/* ✅ This is required for react-toastify */}
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
    </div>
  );
}

export default App;

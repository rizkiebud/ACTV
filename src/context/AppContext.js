import React, {createContext, useContext, useState, useCallback} from 'react';
import {DEMO_USER, CAMERAS, ALERTS, getStats} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({children}) {
  // ─── Auth State ─────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ─── App State ──────────────────────────────────────────────────────────────
  const [isArmed, setIsArmed] = useState(false);
  const [motionDetection, setMotionDetection] = useState(true);
  const [cameras, setCameras] = useState(CAMERAS);
  const [alerts, setAlerts] = useState(ALERTS);

  // ─── Auth Actions ────────────────────────────────────────────────────────────
  const login = useCallback(async (identifier, password) => {
    await new Promise(r => setTimeout(r, 1200));

    const emailMatch =
      identifier.toLowerCase().trim() ===
        DEMO_USER.email.toLowerCase() && password === DEMO_USER.password;
    const phoneMatch =
      (identifier.replace(/\s/g, '') === DEMO_USER.phone ||
        identifier.replace(/\s/g, '') === DEMO_USER.phone.replace('+62', '0')) &&
      password === DEMO_USER.password;

    if (emailMatch || phoneMatch) {
      setCurrentUser(DEMO_USER);
      setIsAuthenticated(true);
      return {success: true};
    }
    return {success: false, message: 'Email/nomor atau password salah'};
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  const register = useCallback(async _formData => {
    await new Promise(r => setTimeout(r, 1500));
    return {success: true, message: 'Akun berhasil dibuat!'};
  }, []);

  // ─── Security Actions ────────────────────────────────────────────────────────
  const toggleArmed = useCallback(() => {
    setIsArmed(prev => !prev);
  }, []);

  const toggleMotionDetection = useCallback(() => {
    setMotionDetection(prev => !prev);
  }, []);

  // ─── Camera Actions ──────────────────────────────────────────────────────────
  const updateCamera = useCallback((cameraId, updates) => {
    setCameras(prev =>
      prev.map(cam => (cam.id === cameraId ? {...cam, ...updates} : cam)),
    );
  }, []);

  const getCameraById = useCallback(
    id => cameras.find(c => c.id === id),
    [cameras],
  );

  const stats = getStats(cameras);

  // ─── Alert Actions ───────────────────────────────────────────────────────────
  const unreadCount = alerts.filter(a => !a.isRead).length;

  const markAlertRead = useCallback(alertId => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? {...a, isRead: true} : a)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({...a, isRead: true})));
  }, []);

  const deleteAlert = useCallback(alertId => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // ─── User Profile ────────────────────────────────────────────────────────────
  const updateUserNotifications = useCallback(updates => {
    setCurrentUser(prev => ({
      ...prev,
      notifications: {...prev.notifications, ...updates},
    }));
  }, []);

  const updateUser = useCallback(updates => {
    setCurrentUser(prev => ({...prev, ...updates}));
  }, []);

  const value = {
    // Auth
    isAuthenticated,
    currentUser,
    login,
    logout,
    register,

    // Security
    isArmed,
    toggleArmed,
    motionDetection,
    toggleMotionDetection,

    // Cameras
    cameras,
    stats,
    updateCamera,
    getCameraById,

    // Alerts
    alerts,
    unreadCount,
    markAlertRead,
    markAllRead,
    deleteAlert,
    clearAllAlerts,

    // User
    updateUserNotifications,
    updateUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

export default AppContext;

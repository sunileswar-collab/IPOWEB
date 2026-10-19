import React, { useState, useEffect, useRef } from 'react';
import { Navbar as BSNavbar, Nav, Container, Button, Modal, Form, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import { authService, notificationService } from '../services/api';

const Navbar = () => {
  const { user, token, login, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const stompClient = useRef(null);

  // Fetch unread count on login
  useEffect(() => {
    if (!isLoggedIn) { setUnreadCount(0); setNotifications([]); return; }
    notificationService.getUnreadCount().then(r => setUnreadCount(r.data.count)).catch(() => {});
    notificationService.getAll().then(r => setNotifications(r.data.slice(0, 5))).catch(() => {});
  }, [isLoggedIn]);

  // WebSocket connection
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/user/queue/notifications`, (msg) => {
          const n = JSON.parse(msg.body);
          setUnreadCount(c => c + 1);
          setNotifications(prev => [{ id: Date.now(), message: n.message, read: false, createdAt: new Date() }, ...prev.slice(0, 4)]);
        });
      },
      reconnectDelay: 5000,
    });
    client.activate();
    stompClient.current = client;
    return () => client.deactivate();
  }, [isLoggedIn, token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authService.login(loginData);
      login(res.data);
      setShowLogin(false);
      setLoginData({ email: '', password: '' });
    } catch {
      setError('Invalid email or password');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authService.register(registerData);
      login(res.data);
      setShowRegister(false);
      setRegisterData({ email: '', password: '', fullName: '' });
    } catch {
      setError('Registration failed. Email may already exist.');
    }
  };

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const roleBadgeColor = { ADMIN: 'danger', ANALYST: 'warning', VIEWER: 'info' };

  return (
    <>
      <BSNavbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container>
          <BSNavbar.Brand as={Link} to="/" className="fw-bold">
            <i className="fas fa-chart-line me-2"></i>Bluestock
          </BSNavbar.Brand>
          <BSNavbar.Toggle aria-controls="main-nav" />
          <BSNavbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/ipos">All IPOs</Nav.Link>
              {isLoggedIn && <Nav.Link as={Link} to="/watchlist">Watchlist</Nav.Link>}
            </Nav>

            <div className="d-flex align-items-center gap-2">
              {isLoggedIn ? (
                <>
                  {/* Notification Bell */}
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-light" size="sm" id="notif-dropdown" className="position-relative">
                      <i className="fas fa-bell"></i>
                      {unreadCount > 0 && (
                        <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                          {unreadCount}
                        </Badge>
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ minWidth: '300px', maxHeight: '350px', overflowY: 'auto' }}>
                      <Dropdown.Header>Notifications</Dropdown.Header>
                      {notifications.length === 0 ? (
                        <Dropdown.Item disabled>No notifications</Dropdown.Item>
                      ) : (
                        notifications.map(n => (
                          <Dropdown.Item key={n.id} onClick={() => !n.read && handleMarkRead(n.id)}
                            className={n.read ? 'text-muted' : 'fw-semibold'} style={{ whiteSpace: 'normal', fontSize: '0.85rem' }}>
                            {!n.read && <span className="text-primary me-1">●</span>}
                            {n.message}
                          </Dropdown.Item>
                        ))
                      )}
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/notifications" className="text-center text-primary small">
                        View all
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* User Menu */}
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-light" size="sm">
                      <i className="fas fa-user me-1"></i>
                      {user?.fullName?.split(' ')[0]}
                      <Badge bg={roleBadgeColor[user?.role] || 'secondary'} className="ms-2" style={{ fontSize: '0.65rem' }}>
                        {user?.role}
                      </Badge>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to="/watchlist"><i className="fas fa-star me-2"></i>My Watchlist</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/notifications"><i className="fas fa-bell me-2"></i>Notifications</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout} className="text-danger"><i className="fas fa-sign-out-alt me-2"></i>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <>
                  <Button variant="outline-light" size="sm" onClick={() => { setError(''); setShowLogin(true); }}>Login</Button>
                  <Button variant="light" size="sm" onClick={() => { setError(''); setShowRegister(true); }}>Register</Button>
                </>
              )}
            </div>
          </BSNavbar.Collapse>
        </Container>
      </BSNavbar>

      {/* Login Modal */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton><Modal.Title>Login to Bluestock</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Control type="email" placeholder="Email" value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="password" placeholder="Password" value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">Login</Button>
          </Form>
          <p className="text-center mt-3 mb-0 small">
            No account? <span className="text-primary" style={{ cursor: 'pointer' }}
              onClick={() => { setShowLogin(false); setShowRegister(true); setError(''); }}>Register</span>
          </p>
        </Modal.Body>
      </Modal>

      {/* Register Modal */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton><Modal.Title>Join Bluestock</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Control type="text" placeholder="Full Name" value={registerData.fullName}
                onChange={e => setRegisterData({ ...registerData, fullName: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="email" placeholder="Email" value={registerData.email}
                onChange={e => setRegisterData({ ...registerData, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="password" placeholder="Password (min 6 chars)" value={registerData.password}
                onChange={e => setRegisterData({ ...registerData, password: e.target.value })} required minLength={6} />
            </Form.Group>
            <Button type="submit" variant="success" className="w-100">Create Account</Button>
          </Form>
          <p className="text-center mt-3 mb-0 small">
            Already have an account? <span className="text-primary" style={{ cursor: 'pointer' }}
              onClick={() => { setShowRegister(false); setShowLogin(true); setError(''); }}>Login</span>
          </p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Navbar;

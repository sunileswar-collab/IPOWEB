import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(loginData);
      localStorage.setItem('token', response.access);
      setShowLogin(false);
      window.location.reload();
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(registerData);
      localStorage.setItem('token', response.access);
      setShowRegister(false);
      window.location.reload();
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <>
      <BootstrapNavbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container>
          <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
            <i className="fas fa-chart-line me-2"></i>
            Bluestock
          </BootstrapNavbar.Brand>
          
          <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
          
          <BootstrapNavbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/ipos">All IPOs</Nav.Link>
              <Nav.Link href="/admin/" target="_blank">Admin</Nav.Link>
            </Nav>
            
            <div className="d-flex">
              <Button 
                variant="outline-light" 
                className="me-2"
                onClick={() => setShowLogin(true)}
              >
                <i className="fas fa-sign-in-alt me-1"></i>
                Login
              </Button>
              <Button 
                variant="light"
                onClick={() => setShowRegister(true)}
              >
                <i className="fas fa-user-plus me-1"></i>
                Register
              </Button>
            </div>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>

      {/* Login Modal */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login to Bluestock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Username"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Login
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Register Modal */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Join Bluestock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Username"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
              />
            </Form.Group>
            <Button type="submit" variant="success" className="w-100">
              Register
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Navbar;
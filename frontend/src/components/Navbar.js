import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="shadow">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          <i className="fas fa-chart-line me-2"></i>
          IPO Portal
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle />
        <BootstrapNavbar.Collapse>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link href="http://127.0.0.1:8000/admin/" target="_blank">Admin</Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
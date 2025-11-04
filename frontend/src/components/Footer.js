import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <h5 className="mb-3">
              <i className="fas fa-chart-line me-2"></i>
              Bluestock Fintech
            </h5>
            <p className="mb-0">
              Your trusted partner for IPO investments and market insights.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="mb-3">
              <a href="#" className="text-light me-3">
                <i className="fab fa-twitter fa-lg"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="fab fa-linkedin fa-lg"></i>
              </a>
              <a href="#" className="text-light">
                <i className="fab fa-facebook fa-lg"></i>
              </a>
            </div>
            <p className="mb-0">
              &copy; 2024 Bluestock Fintech. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
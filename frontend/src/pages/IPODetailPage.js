import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { ipoService } from '../services/api';

const IPODetailPage = () => {
  const { id } = useParams();
  const [ipo, setIpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIPODetails();
  }, [id]);

  const fetchIPODetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ipoService.getById(id);
      setIpo(response.data);
    } catch (error) {
      console.error('Error fetching IPO details:', error);
      setError('Failed to load IPO details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'warning';
      case 'listed': return 'success';
      default: return 'secondary';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button as={Link} to="/ipos" variant="outline-danger">
            Back to IPO List
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!ipo) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>IPO Not Found</Alert.Heading>
          <p>The requested IPO could not be found.</p>
          <Button as={Link} to="/ipos" variant="outline-warning">
            Back to IPO List
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {/* IPO Header */}
      <div className="ipo-detail-header">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-3">
                {ipo.logo && (
                  <img 
                    src={ipo.logo} 
                    alt={`${ipo.company_name} logo`}
                    className="company-logo me-4"
                  />
                )}
                <div>
                  <h1 className="mb-2">{ipo.company_name}</h1>
                  <Badge bg={getStatusVariant(ipo.status)} className="fs-6">
                    {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <p className="lead mb-0">
                {ipo.issue_type || 'Book Building'} • {ipo.issue_size || 'N/A'}
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button as={Link} to="/ipos" variant="outline-light" className="me-2">
                <i className="fas fa-arrow-left me-1"></i>
                Back to List
              </Button>
              {ipo.rhp_pdf && (
                <Button href={ipo.rhp_pdf} target="_blank" variant="light">
                  <i className="fas fa-download me-1"></i>
                  Download RHP
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Main Details */}
          <Col lg={8} className="mb-4">
            <Card className="detail-card">
              <Card.Header>
                <h4 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  IPO Details
                </h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="detail-row">
                      <span className="detail-label">Company Name</span>
                      <span className="detail-value">{ipo.company_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Price Band</span>
                      <span className="detail-value">{ipo.price_band || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Issue Size</span>
                      <span className="detail-value">{ipo.issue_size || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Issue Type</span>
                      <span className="detail-value">{ipo.issue_type || 'Book Building'}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="detail-row">
                      <span className="detail-label">Open Date</span>
                      <span className="detail-value">{formatDate(ipo.open_date)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Close Date</span>
                      <span className="detail-value">{formatDate(ipo.close_date)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Listing Date</span>
                      <span className="detail-value">{formatDate(ipo.listing_date)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status</span>
                      <Badge bg={getStatusVariant(ipo.status)}>
                        {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Performance Details (for listed IPOs) */}
            {ipo.status === 'listed' && (
              <Card className="detail-card">
                <Card.Header>
                  <h4 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Performance
                  </h4>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="detail-row">
                        <span className="detail-label">IPO Price</span>
                        <span className="detail-value">{formatCurrency(ipo.ipo_price)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Listing Price</span>
                        <span className="detail-value">{formatCurrency(ipo.listing_price)}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="detail-row">
                        <span className="detail-label">Current Price</span>
                        <span className="detail-value">{formatCurrency(ipo.current_market_price)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Listing Gain</span>
                        <span className={`detail-value ${ipo.listing_gain >= 0 ? 'text-success' : 'text-danger'}`}>
                          {ipo.listing_gain ? `${ipo.listing_gain}%` : 'N/A'}
                        </span>
                      </div>
                    </Col>
                  </Row>
                  <div className="mt-3">
                    <div className="detail-row">
                      <span className="detail-label">Current Return</span>
                      <span className={`detail-value fs-5 fw-bold ${ipo.current_return >= 0 ? 'text-success' : 'text-danger'}`}>
                        {ipo.current_return ? `${ipo.current_return}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Documents */}
            <Card className="detail-card mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-file-pdf me-2"></i>
                  Documents
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {ipo.rhp_pdf ? (
                    <Button 
                      href={ipo.rhp_pdf} 
                      target="_blank"
                      variant="outline-primary"
                      className="d-flex align-items-center justify-content-center"
                    >
                      <i className="fas fa-download me-2"></i>
                      Download RHP
                    </Button>
                  ) : (
                    <Button variant="outline-secondary" disabled>
                      RHP Not Available
                    </Button>
                  )}
                  
                  {ipo.drhp_pdf ? (
                    <Button 
                      href={ipo.drhp_pdf} 
                      target="_blank"
                      variant="outline-primary"
                      className="d-flex align-items-center justify-content-center"
                    >
                      <i className="fas fa-download me-2"></i>
                      Download DRHP
                    </Button>
                  ) : (
                    <Button variant="outline-secondary" disabled>
                      DRHP Not Available
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card className="detail-card">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-tools me-2"></i>
                  Quick Actions
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button 
                    as={Link} 
                    to="/ipos" 
                    variant="outline-primary"
                  >
                    <i className="fas fa-list me-2"></i>
                    View All IPOs
                  </Button>
                  <Button 
                    href={`/admin/ipo/ipo/${ipo.id}/change/`}
                    target="_blank"
                    variant="outline-secondary"
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit in Admin
                  </Button>
                  <Button 
                    onClick={() => window.print()}
                    variant="outline-info"
                  >
                    <i className="fas fa-print me-2"></i>
                    Print Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default IPODetailPage;
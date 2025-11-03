import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Breadcrumb, Alert } from 'react-bootstrap';
import { ipoAPI } from '../services/api';

const IPODetailPage = () => {
  const { id } = useParams();
  const [ipo, setIpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIPODetail();
  }, [id]);

  const fetchIPODetail = async () => {
    try {
      setLoading(true);
      const response = await ipoAPI.getIPOById(id);
      setIpo(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch IPO details');
      console.error('Error fetching IPO details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'success';
      case 'listed': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareIPO = () => {
    if (navigator.share) {
      navigator.share({
        title: `${ipo.company_name} IPO`,
        text: `Check out ${ipo.company_name} IPO details`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !ipo) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error || 'IPO not found'}</Alert>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>{ipo.company_name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Company Header */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              {ipo.logo ? (
                <img 
                  src={ipo.logo} 
                  alt={ipo.company_name}
                  className="rounded"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              ) : (
                <div className="bg-light rounded d-flex align-items-center justify-content-center"
                     style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-building fa-2x text-muted"></i>
                </div>
              )}
            </Col>
            <Col>
              <h1 className="mb-2">{ipo.company_name}</h1>
              <Badge bg={getStatusVariant(ipo.status)} className="text-capitalize">
                <i className={`fas fa-${ipo.status === 'upcoming' ? 'clock' : ipo.status === 'ongoing' ? 'play-circle' : 'check-circle'} me-1`}></i>
                {ipo.status}
              </Badge>
            </Col>
            <Col xs="auto">
              <Button as={Link} to="/" variant="outline-secondary">
                <i className="fas fa-arrow-left me-2"></i>Back to Home
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {/* IPO Details */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>IPO Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted">Price Band</small>
                    <div className="fw-bold fs-5 text-success">{ipo.price_band}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Issue Size</small>
                    <div className="fw-bold">{ipo.issue_size}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Issue Type</small>
                    <div className="fw-bold">{ipo.issue_type}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted">Open Date</small>
                    <div className="fw-bold">{formatDate(ipo.open_date)}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Close Date</small>
                    <div className="fw-bold">{formatDate(ipo.close_date)}</div>
                  </div>
                  {ipo.listing_date && (
                    <div className="mb-3">
                      <small className="text-muted">Listing Date</small>
                      <div className="fw-bold">{formatDate(ipo.listing_date)}</div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Price Performance */}
          {(ipo.ipo_price || ipo.listing_price || ipo.current_market_price) && (
            <Card className="mb-4">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>Price Performance
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {ipo.ipo_price && (
                    <Col md={4} className="text-center mb-3">
                      <div className="p-3 border rounded">
                        <div className="text-muted small">IPO Price</div>
                        <div className="fs-4 fw-bold text-primary">₹{ipo.ipo_price}</div>
                      </div>
                    </Col>
                  )}
                  {ipo.listing_price && (
                    <Col md={4} className="text-center mb-3">
                      <div className="p-3 border rounded">
                        <div className="text-muted small">Listing Price</div>
                        <div className="fs-4 fw-bold text-info">₹{ipo.listing_price}</div>
                      </div>
                    </Col>
                  )}
                  {ipo.current_market_price && (
                    <Col md={4} className="text-center mb-3">
                      <div className="p-3 border rounded">
                        <div className="text-muted small">Current Price</div>
                        <div className="fs-4 fw-bold text-warning">₹{ipo.current_market_price}</div>
                      </div>
                    </Col>
                  )}
                </Row>

                {(ipo.listing_gain || ipo.current_return) && (
                  <>
                    <hr />
                    <Row>
                      {ipo.listing_gain && (
                        <Col md={6} className="text-center">
                          <div className="p-3">
                            <div className="text-muted small">Listing Gain</div>
                            <div className={`fs-3 fw-bold ${ipo.listing_gain > 0 ? 'text-success' : 'text-danger'}`}>
                              {ipo.listing_gain > 0 ? '+' : ''}{ipo.listing_gain}%
                            </div>
                          </div>
                        </Col>
                      )}
                      {ipo.current_return && (
                        <Col md={6} className="text-center">
                          <div className="p-3">
                            <div className="text-muted small">Current Return</div>
                            <div className={`fs-3 fw-bold ${ipo.current_return > 0 ? 'text-success' : 'text-danger'}`}>
                              {ipo.current_return > 0 ? '+' : ''}{ipo.current_return}%
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Documents */}
          {(ipo.rhp_pdf || ipo.drhp_pdf) && (
            <Card className="mb-4">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-file-pdf me-2"></i>Documents
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {ipo.rhp_pdf && (
                    <Button variant="outline-danger" href={ipo.rhp_pdf} target="_blank">
                      <i className="fas fa-file-pdf me-2"></i>Download RHP
                    </Button>
                  )}
                  {ipo.drhp_pdf && (
                    <Button variant="outline-danger" href={ipo.drhp_pdf} target="_blank">
                      <i className="fas fa-file-pdf me-2"></i>Download DRHP
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2"></i>Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={shareIPO}>
                  <i className="fas fa-share me-2"></i>Share IPO
                </Button>
                <Button variant="outline-primary" onClick={() => alert('Added to watchlist! (Feature coming soon)')}>
                  <i className="fas fa-bookmark me-2"></i>Add to Watchlist
                </Button>
                <Button 
                  variant="outline-secondary" 
                  href={`http://127.0.0.1:8000/api/ipo/${ipo.id}/`} 
                  target="_blank"
                >
                  <i className="fas fa-code me-2"></i>View API
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default IPODetailPage;
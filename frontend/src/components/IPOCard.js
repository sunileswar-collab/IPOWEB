import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const IPOCard = ({ ipo }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'warning';
      case 'listed': return 'success';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `₹${amount}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  return (
    <Card className="ipo-card h-100 fade-in-up">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            {ipo.logo && (
              <img 
                src={ipo.logo} 
                alt={`${ipo.company_name} logo`}
                className="company-logo me-3"
                style={{ width: '50px', height: '50px' }}
              />
            )}
            <div>
              <Card.Title className="mb-1 h5">{ipo.company_name}</Card.Title>
              <Badge bg={getStatusVariant(ipo.status)} className="status-badge">
                {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <Row className="mb-3">
          <Col xs={6}>
            <small className="text-muted">Price Band</small>
            <div className="fw-bold">{ipo.price_band || 'N/A'}</div>
          </Col>
          <Col xs={6}>
            <small className="text-muted">Issue Size</small>
            <div className="fw-bold">{ipo.issue_size || 'N/A'}</div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col xs={6}>
            <small className="text-muted">Open Date</small>
            <div className="fw-bold">{formatDate(ipo.open_date)}</div>
          </Col>
          <Col xs={6}>
            <small className="text-muted">Close Date</small>
            <div className="fw-bold">{formatDate(ipo.close_date)}</div>
          </Col>
        </Row>

        {ipo.status === 'listed' && (
          <Row className="mb-3">
            <Col xs={6}>
              <small className="text-muted">Listing Gain</small>
              <div className={`fw-bold ${ipo.listing_gain >= 0 ? 'text-success' : 'text-danger'}`}>
                {ipo.listing_gain ? `${ipo.listing_gain}%` : 'N/A'}
              </div>
            </Col>
            <Col xs={6}>
              <small className="text-muted">Current Return</small>
              <div className={`fw-bold ${ipo.current_return >= 0 ? 'text-success' : 'text-danger'}`}>
                {ipo.current_return ? `${ipo.current_return}%` : 'N/A'}
              </div>
            </Col>
          </Row>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <Button 
            as={Link} 
            to={`/ipo/${ipo.id}`} 
            variant="outline-primary" 
            size="sm"
            className="btn-custom"
          >
            View Details
          </Button>
          
          {ipo.rhp_pdf && (
            <Button 
              href={ipo.rhp_pdf} 
              target="_blank"
              variant="outline-secondary" 
              size="sm"
              className="btn-custom"
            >
              <i className="fas fa-download me-1"></i>
              RHP
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default IPOCard;
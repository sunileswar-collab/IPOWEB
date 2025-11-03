import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const IPOCard = ({ ipo }) => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-100 shadow-sm hover-card">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          {ipo.logo ? (
            <img 
              src={ipo.logo} 
              alt={ipo.company_name}
              className="company-logo me-3"
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : (
            <div className="company-logo me-3 bg-light d-flex align-items-center justify-content-center" 
                 style={{ width: '50px', height: '50px', borderRadius: '8px' }}>
              <i className="fas fa-building text-muted"></i>
            </div>
          )}
          <div>
            <Card.Title className="mb-1 h6">{ipo.company_name}</Card.Title>
            <Badge bg={getStatusVariant(ipo.status)} className="text-capitalize">
              {ipo.status}
            </Badge>
          </div>
        </div>

        <div className="mb-3">
          <div className="row text-sm">
            <div className="col-6">
              <small className="text-muted">Price Band</small>
              <div className="fw-semibold text-success">{ipo.price_band}</div>
            </div>
            <div className="col-6">
              <small className="text-muted">Issue Size</small>
              <div className="fw-semibold">{ipo.issue_size}</div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="row text-sm">
            <div className="col-6">
              <small className="text-muted">
                {ipo.status === 'listed' ? 'Listing Date' : 'Open Date'}
              </small>
              <div className="fw-semibold">
                {formatDate(ipo.status === 'listed' ? ipo.listing_date : ipo.open_date)}
              </div>
            </div>
            <div className="col-6">
              {ipo.status === 'listed' && ipo.listing_gain ? (
                <>
                  <small className="text-muted">Listing Gain</small>
                  <div className={`fw-semibold ${ipo.listing_gain > 0 ? 'text-success' : 'text-danger'}`}>
                    {ipo.listing_gain > 0 ? '+' : ''}{ipo.listing_gain}%
                  </div>
                </>
              ) : (
                <>
                  <small className="text-muted">Close Date</small>
                  <div className="fw-semibold">{formatDate(ipo.close_date)}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <Button 
          as={Link} 
          to={`/ipo/${ipo.id}`} 
          variant={getStatusVariant(ipo.status)} 
          size="sm" 
          className="w-100"
        >
          <i className="fas fa-eye me-2"></i>View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

export default IPOCard;
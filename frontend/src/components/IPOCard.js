import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { watchlistService } from '../services/api';

const statusVariant = { UPCOMING: 'primary', ONGOING: 'warning', LISTED: 'success' };
const riskVariant = { LOW: 'success', MEDIUM: 'warning', HIGH: 'danger' };

const IPOCard = ({ ipo }) => {
  const { isLoggedIn } = useAuth();
  const [watchlisted, setWatchlisted] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    watchlistService.check(ipo.id).then(r => setWatchlisted(r.data)).catch(() => {});
  }, [ipo.id, isLoggedIn]);

  const toggleWatchlist = async (e) => {
    e.preventDefault();
    setToggling(true);
    try {
      if (watchlisted) {
        await watchlistService.remove(ipo.id);
        setWatchlisted(false);
      } else {
        await watchlistService.add(ipo.id);
        setWatchlisted(true);
      }
    } catch {}
    setToggling(false);
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';

  return (
    <Card className="ipo-card h-100 fade-in-up">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            {ipo.logoUrl && (
              <img src={ipo.logoUrl} alt={ipo.companyName} className="me-3"
                style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6 }} />
            )}
            <div>
              <Card.Title className="mb-1 h6">{ipo.companyName}</Card.Title>
              <Badge bg={statusVariant[ipo.status] || 'secondary'} className="me-1">
                {ipo.status}
              </Badge>
              {ipo.riskScore && (
                <Badge bg={riskVariant[ipo.riskScore] || 'secondary'}>
                  {ipo.riskScore} RISK
                </Badge>
              )}
            </div>
          </div>
          {isLoggedIn && (
            <Button variant="link" size="sm" onClick={toggleWatchlist} disabled={toggling}
              className="p-0" title={watchlisted ? 'Remove from watchlist' : 'Add to watchlist'}>
              <i className={`fas fa-star ${watchlisted ? 'text-warning' : 'text-muted'}`}></i>
            </Button>
          )}
        </div>

        <Row className="mb-2 g-2">
          <Col xs={6}>
            <small className="text-muted d-block">Price Band</small>
            <span className="fw-bold small">{ipo.priceBand || 'N/A'}</span>
          </Col>
          <Col xs={6}>
            <small className="text-muted d-block">Issue Size</small>
            <span className="fw-bold small">{ipo.issueSize || 'N/A'}</span>
          </Col>
          <Col xs={6}>
            <small className="text-muted d-block">Open</small>
            <span className="fw-bold small">{fmt(ipo.openDate)}</span>
          </Col>
          <Col xs={6}>
            <small className="text-muted d-block">Close</small>
            <span className="fw-bold small">{fmt(ipo.closeDate)}</span>
          </Col>
        </Row>

        {ipo.status === 'LISTED' && (
          <Row className="mb-2 g-2">
            <Col xs={6}>
              <small className="text-muted d-block">Listing Gain</small>
              <span className={`fw-bold small ${ipo.listingGain >= 0 ? 'text-success' : 'text-danger'}`}>
                {ipo.listingGain != null ? `${ipo.listingGain}%` : 'N/A'}
              </span>
            </Col>
            <Col xs={6}>
              <small className="text-muted d-block">Current Return</small>
              <span className={`fw-bold small ${ipo.currentReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                {ipo.currentReturn != null ? `${ipo.currentReturn}%` : 'N/A'}
              </span>
            </Col>
          </Row>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <Button as={Link} to={`/ipo/${ipo.id}`} variant="outline-primary" size="sm">
            View Details
          </Button>
          {ipo.rhpPdfUrl && (
            <Button href={ipo.rhpPdfUrl} target="_blank" variant="outline-secondary" size="sm">
              <i className="fas fa-download me-1"></i>RHP
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default IPOCard;

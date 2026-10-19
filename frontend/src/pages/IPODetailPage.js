import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { ipoService, watchlistService } from '../services/api';

const statusVariant = { UPCOMING: 'primary', ONGOING: 'warning', LISTED: 'success' };
const riskVariant = { LOW: 'success', MEDIUM: 'warning', HIGH: 'danger' };

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
const fmtCurrency = (v) => v != null ? `₹${v}` : 'N/A';
const fmtPct = (v) => v != null ? `${v}%` : 'N/A';

const IPODetailPage = () => {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const [ipo, setIpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlisted, setWatchlisted] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    ipoService.getById(id)
      .then(r => setIpo(r.data))
      .catch(() => setError('Failed to load IPO details.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn || !id) return;
    watchlistService.check(id).then(r => setWatchlisted(r.data)).catch(() => {});
  }, [id, isLoggedIn]);

  const toggleWatchlist = async () => {
    setToggling(true);
    try {
      if (watchlisted) { await watchlistService.remove(id); setWatchlisted(false); }
      else { await watchlistService.add(id); setWatchlisted(true); }
    } catch {}
    setToggling(false);
  };

  if (loading) return <div className="loading-spinner"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Container className="py-4"><Alert variant="danger">{error}<br /><Button as={Link} to="/ipos" variant="outline-danger" className="mt-2">Back</Button></Alert></Container>;
  if (!ipo) return <Container className="py-4"><Alert variant="warning">IPO not found. <Button as={Link} to="/ipos" variant="outline-warning" size="sm">Back</Button></Alert></Container>;

  return (
    <>
      <div className="ipo-detail-header">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                {ipo.logoUrl && (
                  <img src={ipo.logoUrl} alt={ipo.companyName} className="me-3"
                    style={{ width: 60, height: 60, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4 }} />
                )}
                <div>
                  <h1 className="mb-1">{ipo.companyName}</h1>
                  <div className="d-flex gap-2 flex-wrap">
                    <Badge bg={statusVariant[ipo.status] || 'secondary'} className="fs-6">{ipo.status}</Badge>
                    {ipo.riskScore && <Badge bg={riskVariant[ipo.riskScore]}>{ipo.riskScore} RISK</Badge>}
                  </div>
                </div>
              </div>
              <p className="lead mb-0 opacity-75">{ipo.issueType || 'Book Building'} · {ipo.issueSize || 'N/A'}</p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0 d-flex gap-2 justify-content-md-end flex-wrap">
              <Button as={Link} to="/ipos" variant="outline-light" size="sm">
                <i className="fas fa-arrow-left me-1"></i>Back
              </Button>
              {isLoggedIn && (
                <Button variant={watchlisted ? 'warning' : 'outline-light'} size="sm"
                  onClick={toggleWatchlist} disabled={toggling}>
                  <i className={`fas fa-star me-1`}></i>
                  {watchlisted ? 'Watchlisted' : 'Add to Watchlist'}
                </Button>
              )}
              {ipo.rhpPdfUrl && (
                <Button href={ipo.rhpPdfUrl} target="_blank" variant="light" size="sm">
                  <i className="fas fa-download me-1"></i>RHP
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="detail-card mb-4">
              <Card.Header><h5 className="mb-0"><i className="fas fa-info-circle me-2"></i>IPO Details</h5></Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    {[
                      ['Price Band', ipo.priceBand],
                      ['Issue Size', ipo.issueSize],
                      ['Issue Type', ipo.issueType || 'Book Building'],
                    ].map(([label, val]) => (
                      <div className="detail-row" key={label}>
                        <span className="detail-label">{label}</span>
                        <span className="detail-value">{val || 'N/A'}</span>
                      </div>
                    ))}
                  </Col>
                  <Col md={6}>
                    {[
                      ['Open Date', fmt(ipo.openDate)],
                      ['Close Date', fmt(ipo.closeDate)],
                      ['Listing Date', fmt(ipo.listingDate)],
                    ].map(([label, val]) => (
                      <div className="detail-row" key={label}>
                        <span className="detail-label">{label}</span>
                        <span className="detail-value">{val}</span>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {ipo.status === 'LISTED' && (
              <Card className="detail-card">
                <Card.Header><h5 className="mb-0"><i className="fas fa-chart-line me-2"></i>Performance</h5></Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="detail-row"><span className="detail-label">IPO Price</span><span className="detail-value">{fmtCurrency(ipo.ipoPrice)}</span></div>
                      <div className="detail-row"><span className="detail-label">Listing Price</span><span className="detail-value">{fmtCurrency(ipo.listingPrice)}</span></div>
                    </Col>
                    <Col md={6}>
                      <div className="detail-row"><span className="detail-label">Current Price</span><span className="detail-value">{fmtCurrency(ipo.currentMarketPrice)}</span></div>
                      <div className="detail-row">
                        <span className="detail-label">Listing Gain</span>
                        <span className={`detail-value fw-bold ${ipo.listingGain >= 0 ? 'text-success' : 'text-danger'}`}>{fmtPct(ipo.listingGain)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Current Return</span>
                        <span className={`detail-value fw-bold fs-5 ${ipo.currentReturn >= 0 ? 'text-success' : 'text-danger'}`}>{fmtPct(ipo.currentReturn)}</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg={4}>
            <Card className="detail-card mb-4">
              <Card.Header><h5 className="mb-0"><i className="fas fa-file-pdf me-2"></i>Documents</h5></Card.Header>
              <Card.Body className="d-grid gap-2">
                {ipo.rhpPdfUrl
                  ? <Button href={ipo.rhpPdfUrl} target="_blank" variant="outline-primary"><i className="fas fa-download me-2"></i>Download RHP</Button>
                  : <Button variant="outline-secondary" disabled>RHP Not Available</Button>}
                {ipo.drhpPdfUrl
                  ? <Button href={ipo.drhpPdfUrl} target="_blank" variant="outline-primary"><i className="fas fa-download me-2"></i>Download DRHP</Button>
                  : <Button variant="outline-secondary" disabled>DRHP Not Available</Button>}
              </Card.Body>
            </Card>

            <Card className="detail-card">
              <Card.Header><h5 className="mb-0"><i className="fas fa-tools me-2"></i>Quick Actions</h5></Card.Header>
              <Card.Body className="d-grid gap-2">
                <Button as={Link} to="/ipos" variant="outline-primary"><i className="fas fa-list me-2"></i>View All IPOs</Button>
                {isLoggedIn && (
                  <Button variant={watchlisted ? 'warning' : 'outline-warning'} onClick={toggleWatchlist} disabled={toggling}>
                    <i className="fas fa-star me-2"></i>{watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </Button>
                )}
                <Button onClick={() => window.print()} variant="outline-info"><i className="fas fa-print me-2"></i>Print Details</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default IPODetailPage;

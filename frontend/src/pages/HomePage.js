import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ipoService } from '../services/api';
import IPOCard from '../components/IPOCard';

const HomePage = () => {
  const [stats, setStats] = useState({ UPCOMING: 0, ONGOING: 0, LISTED: 0 });
  const [featuredIpos, setFeaturedIpos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ipoService.getStats(),
      ipoService.getAll({ status: 'ONGOING' }),
    ]).then(([statsRes, iposRes]) => {
      setStats(statsRes.data);
      const ipos = iposRes.data;
      // show ongoing first, fallback to all
      if (ipos.length > 0) {
        setFeaturedIpos(ipos.slice(0, 6));
      } else {
        return ipoService.getAll().then(r => setFeaturedIpos(r.data.slice(0, 6)));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = (stats.UPCOMING || 0) + (stats.ONGOING || 0) + (stats.LISTED || 0);

  if (loading) return (
    <div className="loading-spinner">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <>
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="text-center text-lg-start">
              <h1 className="hero-title">Discover the Next Big IPO</h1>
              <p className="hero-subtitle mb-4">
                Real-time IPO tracking with risk scoring, watchlist alerts, and live notifications.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Button as={Link} to="/ipos" variant="light" size="lg">
                  <i className="fas fa-search me-2"></i>Explore IPOs
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center mt-4 mt-lg-0">
              <i className="fas fa-chart-line" style={{ fontSize: '8rem', opacity: 0.3 }}></i>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="mb-5">
        <Row>
          {[
            { label: 'Total IPOs', value: total, color: 'primary' },
            { label: 'Upcoming', value: stats.UPCOMING || 0, color: 'info' },
            { label: 'Ongoing', value: stats.ONGOING || 0, color: 'warning' },
            { label: 'Listed', value: stats.LISTED || 0, color: 'success' },
          ].map(s => (
            <Col md={3} sm={6} className="mb-4" key={s.label}>
              <Card className="stats-card text-center p-3">
                <div className={`display-6 fw-bold text-${s.color}`}>{s.value}</div>
                <div className="text-muted small">{s.label}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Featured IPOs</h2>
            <p className="text-muted mb-0">Currently open for subscription</p>
          </div>
          <Button as={Link} to="/ipos" variant="outline-primary">
            View All <i className="fas fa-arrow-right ms-1"></i>
          </Button>
        </div>
        <Row>
          {featuredIpos.length > 0 ? featuredIpos.map(ipo => (
            <Col lg={4} md={6} className="mb-4" key={ipo.id}>
              <IPOCard ipo={ipo} />
            </Col>
          )) : (
            <Col className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No IPOs available right now</h5>
            </Col>
          )}
        </Row>
      </Container>

      <Container className="mb-5">
        <Row className="mb-4">
          <Col className="text-center">
            <h2 className="mb-2">Why Choose Bluestock?</h2>
          </Col>
        </Row>
        <Row>
          {[
            { icon: 'fa-bell', color: 'primary', title: 'Real-time Alerts', desc: 'WebSocket notifications when your watchlisted IPOs change status.' },
            { icon: 'fa-shield-alt', color: 'warning', title: 'Risk Scoring', desc: 'Automated LOW / MEDIUM / HIGH risk scores based on price band and issue size.' },
            { icon: 'fa-file-pdf', color: 'success', title: 'Document Access', desc: 'Download RHP and DRHP documents directly from the platform.' },
          ].map(f => (
            <Col lg={4} md={6} className="mb-4" key={f.title}>
              <Card className="detail-card text-center h-100">
                <Card.Body>
                  <i className={`fas ${f.icon} fa-3x text-${f.color} mb-3`}></i>
                  <h5>{f.title}</h5>
                  <p className="text-muted mb-0">{f.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default HomePage;

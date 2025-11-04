import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ipoService, statsService } from '../services/api';
import IPOCard from '../components/IPOCard';

const HomePage = () => {
  const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0, listed: 0 });
  const [featuredIPOs, setFeaturedIPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsData = await statsService.getStats();
      setStats(statsData);
      
      // Fetch featured IPOs (latest 6)
      const response = await ipoService.getAll({ page_size: 6, ordering: '-open_date' });
      setFeaturedIPOs(response.data.results || response.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="text-center text-lg-start">
              <h1 className="hero-title">
                Discover the Next Big IPO
              </h1>
              <p className="hero-subtitle mb-4">
                Stay ahead of the market with real-time IPO information, 
                comprehensive analysis, and investment insights.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Button 
                  as={Link} 
                  to="/ipos" 
                  variant="light" 
                  size="lg"
                  className="btn-custom"
                >
                  <i className="fas fa-search me-2"></i>
                  Explore IPOs
                </Button>
                <Button 
                  href="/admin/" 
                  target="_blank"
                  variant="outline-light" 
                  size="lg"
                  className="btn-custom"
                >
                  <i className="fas fa-cog me-2"></i>
                  Admin Panel
                </Button>
              </div>
            </Col>
            <Col lg={4} className="text-center mt-4 mt-lg-0">
              <div className="hero-image">
                <i className="fas fa-chart-line" style={{ fontSize: '8rem', opacity: 0.3 }}></i>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <Container className="mb-5">
        <Row>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stats-card">
              <div className="stats-number text-primary">{stats.total}</div>
              <div className="stats-label">Total IPOs</div>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stats-card">
              <div className="stats-number text-info">{stats.upcoming}</div>
              <div className="stats-label">Upcoming</div>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stats-card">
              <div className="stats-number text-warning">{stats.ongoing}</div>
              <div className="stats-label">Ongoing</div>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stats-card">
              <div className="stats-number text-success">{stats.listed}</div>
              <div className="stats-label">Listed</div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Featured IPOs Section */}
      <Container className="mb-5">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-2">Featured IPOs</h2>
                <p className="text-muted">Latest and most popular IPO offerings</p>
              </div>
              <Button 
                as={Link} 
                to="/ipos" 
                variant="outline-primary"
                className="btn-custom"
              >
                View All <i className="fas fa-arrow-right ms-1"></i>
              </Button>
            </div>
          </Col>
        </Row>
        
        <Row>
          {featuredIPOs.length > 0 ? (
            featuredIPOs.map((ipo) => (
              <Col lg={4} md={6} className="mb-4" key={ipo.id}>
                <IPOCard ipo={ipo} />
              </Col>
            ))
          ) : (
            <Col className="text-center">
              <div className="py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">No IPOs Available</h4>
                <p className="text-muted">Check back later for new IPO listings.</p>
              </div>
            </Col>
          )}
        </Row>
      </Container>

      {/* Features Section */}
      <Container className="mb-5">
        <Row className="mb-4">
          <Col className="text-center">
            <h2 className="mb-2">Why Choose Bluestock?</h2>
            <p className="text-muted">Everything you need to make informed IPO investments</p>
          </Col>
        </Row>
        
        <Row>
          <Col lg={4} md={6} className="mb-4">
            <Card className="detail-card text-center">
              <Card.Body>
                <div className="mb-3">
                  <i className="fas fa-clock fa-3x text-primary"></i>
                </div>
                <h5>Real-time Updates</h5>
                <p className="text-muted">
                  Get instant notifications about IPO openings, closings, and listings.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6} className="mb-4">
            <Card className="detail-card text-center">
              <Card.Body>
                <div className="mb-3">
                  <i className="fas fa-file-pdf fa-3x text-success"></i>
                </div>
                <h5>Document Access</h5>
                <p className="text-muted">
                  Download RHP and DRHP documents directly from our platform.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4} md={6} className="mb-4">
            <Card className="detail-card text-center">
              <Card.Body>
                <div className="mb-3">
                  <i className="fas fa-chart-bar fa-3x text-warning"></i>
                </div>
                <h5>Performance Tracking</h5>
                <p className="text-muted">
                  Track listing gains and current returns for all listed IPOs.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HomePage;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Alert } from 'react-bootstrap';
import { ipoAPI } from '../services/api';
import IPOCard from '../components/IPOCard';

const HomePage = () => {
  const [ipos, setIpos] = useState([]);
  const [filteredIpos, setFilteredIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchIPOs();
  }, []);

  useEffect(() => {
    filterIPOs();
  }, [ipos, searchTerm, statusFilter]);

  const fetchIPOs = async () => {
    try {
      setLoading(true);
      const response = await ipoAPI.getAllIPOs();
      setIpos(response.data.results || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch IPO data');
      console.error('Error fetching IPOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterIPOs = () => {
    let filtered = ipos;

    if (searchTerm) {
      filtered = filtered.filter(ipo =>
        ipo.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(ipo => ipo.status === statusFilter);
    }

    setFilteredIpos(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const getIPOsByStatus = (status) => {
    return filteredIpos.filter(ipo => ipo.status === status);
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

  return (
    <Container className="mt-4">
      {/* Hero Section */}
      <Row className="mb-4">
        <Col className="text-center py-5">
          <h1 className="display-4 fw-bold text-primary mb-3">
            <i className="fas fa-chart-line me-3"></i>IPO Dashboard
          </h1>
          <p className="lead text-muted">Track and explore Initial Public Offerings</p>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col>
          <div className="bg-white p-4 rounded shadow-sm">
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="listed">Listed</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button variant="outline-primary" className="w-100" onClick={clearFilters}>
                  <i className="fas fa-refresh me-2"></i>Clear
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Upcoming IPOs */}
      <Row className="mb-5">
        <Col>
          <h2 className="section-title mb-4">
            <i className="fas fa-clock text-primary me-2"></i>Upcoming IPOs
          </h2>
          <Row>
            {getIPOsByStatus('upcoming').length > 0 ? (
              getIPOsByStatus('upcoming').map(ipo => (
                <Col lg={4} md={6} key={ipo.id} className="mb-4">
                  <IPOCard ipo={ipo} />
                </Col>
              ))
            ) : (
              <Col>
                <div className="text-center py-4">
                  <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No upcoming IPOs available</p>
                </div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>

      {/* Ongoing IPOs */}
      <Row className="mb-5">
        <Col>
          <h2 className="section-title mb-4">
            <i className="fas fa-play-circle text-success me-2"></i>Ongoing IPOs
          </h2>
          <Row>
            {getIPOsByStatus('ongoing').length > 0 ? (
              getIPOsByStatus('ongoing').map(ipo => (
                <Col lg={4} md={6} key={ipo.id} className="mb-4">
                  <IPOCard ipo={ipo} />
                </Col>
              ))
            ) : (
              <Col>
                <div className="text-center py-4">
                  <i className="fas fa-pause-circle fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No ongoing IPOs available</p>
                </div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>

      {/* Listed IPOs */}
      <Row className="mb-5">
        <Col>
          <h2 className="section-title mb-4">
            <i className="fas fa-list text-warning me-2"></i>Listed IPOs
          </h2>
          <Row>
            {getIPOsByStatus('listed').length > 0 ? (
              getIPOsByStatus('listed').map(ipo => (
                <Col lg={4} md={6} key={ipo.id} className="mb-4">
                  <IPOCard ipo={ipo} />
                </Col>
              ))
            ) : (
              <Col>
                <div className="text-center py-4">
                  <i className="fas fa-list-alt fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No listed IPOs available</p>
                </div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
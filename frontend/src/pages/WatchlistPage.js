import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { watchlistService } from '../services/api';
import IPOCard from '../components/IPOCard';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    watchlistService.getAll()
      .then(r => setWatchlist(r.data))
      .catch(() => setWatchlist([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-1"><i className="fas fa-star text-warning me-2"></i>My Watchlist</h1>
          <p className="text-muted">{watchlist.length} IPO{watchlist.length !== 1 ? 's' : ''} tracked</p>
        </Col>
      </Row>

      {watchlist.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <i className="fas fa-star fa-3x text-muted mb-3 d-block"></i>
          <h5>Your watchlist is empty</h5>
          <p className="mb-3">Add IPOs to your watchlist to get real-time notifications when their status changes.</p>
          <Button as={Link} to="/ipos" variant="primary">Browse IPOs</Button>
        </Alert>
      ) : (
        <Row>
          {watchlist.map(item => (
            <Col lg={4} md={6} className="mb-4" key={item.id}>
              <IPOCard ipo={item.ipo} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default WatchlistPage;

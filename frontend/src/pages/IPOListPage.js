import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { ipoService } from '../services/api';
import IPOCard from '../components/IPOCard';

const STATUSES = ['', 'UPCOMING', 'ONGOING', 'LISTED'];
const STATUS_LABELS = { '': 'All', UPCOMING: 'Upcoming', ONGOING: 'Ongoing', LISTED: 'Listed' };
const STATUS_VARIANTS = { '': 'primary', UPCOMING: 'primary', ONGOING: 'warning', LISTED: 'success' };

const IPOListPage = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchIpos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await ipoService.getAll(params);
      setIpos(res.data);
    } catch {
      setIpos([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { fetchIpos(); }, [fetchIpos]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIpos();
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-1">All IPOs</h1>
          <p className="text-muted">Search, filter and explore IPO opportunities</p>
        </Col>
      </Row>

      <div className="filter-section mb-4 p-3 bg-light rounded">
        <Row className="align-items-center g-3">
          <Col lg={5} md={6}>
            <Form onSubmit={handleSearch} className="d-flex gap-2">
              <Form.Control type="text" placeholder="Search company name..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <Button type="submit" variant="primary">
                <i className="fas fa-search"></i>
              </Button>
            </Form>
          </Col>
          <Col lg={7} md={6}>
            <div className="d-flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <Button key={s} size="sm"
                  variant={status === s ? STATUS_VARIANTS[s] : 'outline-secondary'}
                  onClick={() => setStatus(s)}>
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </Col>
        </Row>
      </div>

      <p className="text-muted mb-3">
        {loading ? 'Loading...' : `${ipos.length} IPO${ipos.length !== 1 ? 's' : ''} found`}
        {status && ` · ${STATUS_LABELS[status]}`}
        {search && ` · "${search}"`}
      </p>

      {loading ? (
        <div className="loading-spinner"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Row>
          {ipos.length > 0 ? ipos.map(ipo => (
            <Col lg={4} md={6} className="mb-4" key={ipo.id}>
              <IPOCard ipo={ipo} />
            </Col>
          )) : (
            <Col className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3 d-block"></i>
              <h5 className="text-muted">No IPOs found</h5>
              {(search || status) && (
                <Button variant="outline-primary" className="mt-2"
                  onClick={() => { setSearch(''); setStatus(''); }}>
                  Clear Filters
                </Button>
              )}
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default IPOListPage;

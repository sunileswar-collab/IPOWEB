import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Pagination } from 'react-bootstrap';
import { ipoService } from '../services/api';
import IPOCard from '../components/IPOCard';

const IPOListPage = () => {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('-open_date');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchIPOs();
  }, [searchTerm, statusFilter, sortBy, currentPage]);

  const fetchIPOs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 12,
        ordering: sortBy,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const response = await ipoService.getAll(params);
      const data = response.data;
      
      console.log('API Response:', data); // Debug log
      
      if (Array.isArray(data)) {
        // Direct array response
        setIpos(data);
        setTotalPages(1);
      } else if (data.results) {
        // Paginated response
        setIpos(data.results);
        setTotalPages(Math.ceil(data.count / 12));
      } else {
        // Fallback
        setIpos([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching IPOs:', error);
      setIpos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchIPOs();
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      />
    );

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      />
    );

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  return (
    <Container className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">All IPOs</h1>
          <p className="text-muted">
            Explore all available IPO opportunities with advanced filtering and search
          </p>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <div className="filter-section mb-4">
        <Row className="align-items-center">
          <Col lg={4} md={6} className="mb-3 mb-lg-0">
            <Form onSubmit={handleSearch}>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Search IPOs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input me-2"
                />
                <Button type="submit" variant="primary">
                  <i className="fas fa-search"></i>
                </Button>
              </div>
            </Form>
          </Col>
          
          <Col lg={5} md={6} className="mb-3 mb-lg-0">
            <div className="d-flex flex-wrap">
              <Button
                variant={statusFilter === '' ? 'primary' : 'outline-secondary'}
                className="filter-btn"
                onClick={() => handleStatusFilter('')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'upcoming' ? 'primary' : 'outline-secondary'}
                className="filter-btn"
                onClick={() => handleStatusFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={statusFilter === 'ongoing' ? 'warning' : 'outline-secondary'}
                className="filter-btn"
                onClick={() => handleStatusFilter('ongoing')}
              >
                Ongoing
              </Button>
              <Button
                variant={statusFilter === 'listed' ? 'success' : 'outline-secondary'}
                className="filter-btn"
                onClick={() => handleStatusFilter('listed')}
              >
                Listed
              </Button>
            </div>
          </Col>
          
          <Col lg={3}>
            <Form.Select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="-open_date">Latest First</option>
              <option value="open_date">Oldest First</option>
              <option value="company_name">Company A-Z</option>
              <option value="-company_name">Company Z-A</option>
              <option value="-close_date">Closing Soon</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Results Count */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            {loading ? 'Loading...' : `Showing ${ipos.length} IPOs`}
            {statusFilter && ` filtered by ${statusFilter}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </Col>
      </Row>

      {/* IPO Grid */}
      {loading ? (
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Row>
            {ipos.length > 0 ? (
              ipos.map((ipo) => (
                <Col lg={4} md={6} className="mb-4" key={ipo.id}>
                  <IPOCard ipo={ipo} />
                </Col>
              ))
            ) : (
              <Col className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">No IPOs Found</h4>
                <p className="text-muted">
                  {searchTerm || statusFilter
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No IPOs are currently available.'}
                </p>
                {(searchTerm || statusFilter) && (
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Col>
            )}
          </Row>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

export default IPOListPage;
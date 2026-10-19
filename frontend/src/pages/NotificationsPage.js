import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { notificationService } from '../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getAll()
      .then(r => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notificationService.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => notificationService.markRead(n.id).catch(() => {})));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <div className="loading-spinner"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-1">
            <i className="fas fa-bell me-2"></i>Notifications
            {unreadCount > 0 && <Badge bg="danger" className="ms-2">{unreadCount} new</Badge>}
          </h1>
        </Col>
        {unreadCount > 0 && (
          <Col xs="auto">
            <Button variant="outline-primary" size="sm" onClick={markAllRead}>
              Mark all as read
            </Button>
          </Col>
        )}
      </Row>

      {notifications.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="fas fa-bell-slash fa-3x text-muted mb-3 d-block"></i>
            <h5 className="text-muted">No notifications yet</h5>
            <p className="text-muted">You'll be notified when your watchlisted IPOs change status.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          {notifications.map((n, i) => (
            <div key={n.id} className={`p-3 d-flex justify-content-between align-items-start ${i < notifications.length - 1 ? 'border-bottom' : ''} ${!n.read ? 'bg-light' : ''}`}>
              <div className="d-flex gap-3">
                <div className="mt-1">
                  {!n.read
                    ? <i className="fas fa-circle text-primary" style={{ fontSize: '0.5rem' }}></i>
                    : <i className="fas fa-circle text-muted" style={{ fontSize: '0.5rem' }}></i>}
                </div>
                <div>
                  <p className={`mb-1 ${!n.read ? 'fw-semibold' : 'text-muted'}`}>{n.message}</p>
                  <small className="text-muted">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : ''}
                  </small>
                </div>
              </div>
              {!n.read && (
                <Button variant="link" size="sm" className="text-muted p-0 ms-3 flex-shrink-0" onClick={() => markRead(n.id)}>
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </Card>
      )}
    </Container>
  );
};

export default NotificationsPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_COLORS = { UPCOMING: '#0d6efd', ONGOING: '#ffc107', LISTED: '#198754' };
const RISK_COLORS   = { LOW: '#198754', MEDIUM: '#ffc107', HIGH: '#dc3545' };

const StatCard = ({ label, value, color, icon }) => (
  <Card className="h-100 border-0 shadow-sm">
    <Card.Body className="d-flex align-items-center gap-3">
      <div className={`rounded-circle bg-${color} bg-opacity-10 p-3`}>
        <i className={`fas ${icon} text-${color} fs-4`}></i>
      </div>
      <div>
        <div className="text-muted small">{label}</div>
        <div className="fs-3 fw-bold">{value}</div>
      </div>
    </Card.Body>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Guard AFTER all hooks
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      flash(`Role updated to ${role}`);
    } catch { flash('Failed to update role.'); }
  };

  const handleToggle = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled: res.data.enabled } : u));
      flash('User status updated.');
    } catch { flash('Failed to toggle user.'); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      flash('User deleted.');
    } catch { flash('Failed to delete user.'); }
  };

  if (loading) return <div className="loading-spinner"><Spinner animation="border" variant="primary" /></div>;
  if (error)   return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;

  const ipoStats   = stats?.ipoStats   || {};
  const riskStats  = stats?.riskStats  || {};
  const roleStats  = stats?.usersByRole || {};
  const topPerf    = stats?.topPerformers || [];

  const totalIpos  = Object.values(ipoStats).reduce((a, b) => a + b, 0);

  const pieData  = Object.entries(ipoStats).map(([name, value]) => ({ name, value }));
  const riskData = Object.entries(riskStats).map(([name, value]) => ({ name, value }));
  const roleData = Object.entries(roleStats).map(([name, value]) => ({ name, value }));

  return (
    <Container fluid className="py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Admin Dashboard</h2>
          <p className="text-muted mb-0">Platform overview and user management</p>
        </div>
        <Button variant="outline-primary" size="sm" onClick={fetchData}>
          <i className="fas fa-sync-alt me-1"></i>Refresh
        </Button>
      </div>

      {actionMsg && <Alert variant="success" className="py-2">{actionMsg}</Alert>}

      {/* Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xl={3} md={6}><StatCard label="Total Users"    value={stats?.totalUsers ?? 0}  color="primary" icon="fa-users" /></Col>
        <Col xl={3} md={6}><StatCard label="Total IPOs"     value={totalIpos}                color="info"    icon="fa-chart-line" /></Col>
        <Col xl={3} md={6}><StatCard label="Ongoing IPOs"   value={ipoStats.ONGOING ?? 0}   color="warning" icon="fa-fire" /></Col>
        <Col xl={3} md={6}><StatCard label="Listed IPOs"    value={ipoStats.LISTED ?? 0}    color="success" icon="fa-check-circle" /></Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-3 mb-4">
        {/* IPO Status Pie */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0">IPOs by Status</h6>
            </Card.Header>
            <Card.Body>
              {pieData.length === 0 ? (
                <p className="text-muted text-center py-4">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map(entry => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Risk Score Bar */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0">IPOs by Risk Score</h6>
            </Card.Header>
            <Card.Body>
              {riskData.length === 0 ? (
                <p className="text-muted text-center py-4">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={riskData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="IPOs" radius={[4, 4, 0, 0]}>
                      {riskData.map(entry => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#8884d8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Users by Role Bar */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0">Users by Role</h6>
            </Card.Header>
            <Card.Body>
              {roleData.length === 0 ? (
                <p className="text-muted text-center py-4">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={roleData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Users" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Performers */}
      {topPerf.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-0 pt-3 pb-0">
            <h6 className="fw-bold mb-0"><i className="fas fa-trophy text-warning me-2"></i>Top Performing IPOs (by Listing Gain)</h6>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>IPO Price</th>
                  <th>Listing Price</th>
                  <th>Listing Gain</th>
                  <th>Current Return</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {topPerf.map((ipo, i) => (
                  <tr key={ipo.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td className="fw-semibold">{ipo.companyName}</td>
                    <td>₹{ipo.ipoPrice ?? 'N/A'}</td>
                    <td>₹{ipo.listingPrice ?? 'N/A'}</td>
                    <td className={`fw-bold ${ipo.listingGain >= 0 ? 'text-success' : 'text-danger'}`}>
                      {ipo.listingGain != null ? `${ipo.listingGain}%` : 'N/A'}
                    </td>
                    <td className={`fw-bold ${ipo.currentReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                      {ipo.currentReturn != null ? `${ipo.currentReturn}%` : 'N/A'}
                    </td>
                    <td>
                      {ipo.riskScore && (
                        <Badge bg={ipo.riskScore === 'LOW' ? 'success' : ipo.riskScore === 'MEDIUM' ? 'warning' : 'danger'}>
                          {ipo.riskScore}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* User Management Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0"><i className="fas fa-users me-2"></i>User Management ({users.length})</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="text-muted small">{u.id}</td>
                  <td className="fw-semibold">{u.fullName}</td>
                  <td className="text-muted small">{u.email}</td>
                  <td>
                    <Form.Select size="sm" value={u.role} style={{ width: 110 }}
                      onChange={e => handleRoleChange(u.id, e.target.value)}>
                      <option value="VIEWER">VIEWER</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="ADMIN">ADMIN</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Badge bg={u.enabled ? 'success' : 'secondary'}>
                      {u.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="text-muted small">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button size="sm" variant={u.enabled ? 'outline-warning' : 'outline-success'}
                        onClick={() => handleToggle(u.id)} title={u.enabled ? 'Disable' : 'Enable'}>
                        <i className={`fas ${u.enabled ? 'fa-ban' : 'fa-check'}`}></i>
                      </Button>
                      <Button size="sm" variant="outline-danger"
                        onClick={() => handleDelete(u.id)} title="Delete user">
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;

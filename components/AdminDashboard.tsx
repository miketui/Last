import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Types
interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  todayRevenue: number;
  monthRevenue: number;
  totalSubscribers: number;
  newSubscribersToday: number;
  totalCustomers: number;
  refundCount: number;
  downloadsToday: number;
  totalDownloads: number;
  emailStats: {
    queued: number;
    sent: number;
    failed: number;
    activeSequences: number;
  };
}

interface Order {
  id: string;
  stripe_payment_intent_id: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  status: string;
  currency: string;
  amount_total: number;
  coupon: string | null;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  tags: string | null;
  confirmed: number;
  created_at: string;
}

interface Customer {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

interface Analytics {
  revenueByDay: { date: string; orders: number; revenue: number }[];
  subscribersByDay: { date: string; count: number }[];
  traffic: {
    totalViews: number;
    uniqueVisitors: number;
    viewsByDay: { date: string; views: number; unique_visitors: number }[];
    topPages: { path: string; views: number }[];
    topReferrers: { referrer: string; count: number }[];
  };
}

// Admin Auth Context
interface AdminAuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  token: null,
  login: async () => false,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

// Admin Auth Provider
export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setIsAuthenticated(data.valid === true);
        if (!data.valid) {
          localStorage.removeItem('adminToken');
          setToken(null);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    verifySession();
  }, [token]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore errors
      }
    }
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
  }, [token]);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Admin Login Page
export const AdminLoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);
    setLoading(false);

    if (success) {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Admin Dashboard</h1>
          <p>Curls & Contemplation</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'teal' | 'gold' | 'coral' | 'green';
}> = ({ label, value, subValue, icon, color = 'teal' }) => (
  <div className={`admin-stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {subValue && <span className="stat-subvalue">{subValue}</span>}
    </div>
  </div>
);

// Format currency helper
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

// Format date helper
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Admin Dashboard Overview
export const AdminDashboardOverview: React.FC = () => {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/dashboard/orders?limit=5', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="admin-error">Failed to load dashboard data</div>;
  }

  return (
    <div className="admin-dashboard-overview">
      <h2>Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subValue={`${stats.totalOrders} orders`}
          icon="💰"
          color="green"
        />
        <StatCard
          label="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          icon="📈"
          color="teal"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(stats.monthRevenue)}
          icon="📊"
          color="gold"
        />
        <StatCard
          label="Total Subscribers"
          value={stats.totalSubscribers}
          subValue={`+${stats.newSubscribersToday} today`}
          icon="📧"
          color="teal"
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers}
          icon="👥"
          color="gold"
        />
        <StatCard
          label="Downloads"
          value={stats.totalDownloads}
          subValue={`${stats.downloadsToday} today`}
          icon="📥"
          color="teal"
        />
        <StatCard
          label="Refunds"
          value={stats.refundCount}
          icon="↩️"
          color="coral"
        />
        <StatCard
          label="Email Queue"
          value={stats.emailStats.queued}
          subValue={`${stats.emailStats.sent} sent`}
          icon="✉️"
          color="teal"
        />
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <h3>Recent Orders</h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="no-data">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{formatDateTime(order.created_at)}</td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-email">{order.customer_email}</span>
                        {order.customer_name && (
                          <span className="customer-name">{order.customer_name}</span>
                        )}
                      </div>
                    </td>
                    <td>{formatCurrency(order.amount_total)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Admin Orders Page
export const AdminOrdersPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{ status: string; count: number; total_amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/admin/dashboard/orders?all=true', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
          setStats(data.stats || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders-page">
      <h2>Orders</h2>

      {/* Order Stats */}
      <div className="admin-order-stats">
        {stats.map((stat) => (
          <div key={stat.status} className={`order-stat order-stat-${stat.status}`}>
            <span className="order-stat-count">{stat.count}</span>
            <span className="order-stat-label">{stat.status}</span>
            <span className="order-stat-amount">{formatCurrency(stat.total_amount || 0)}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="admin-filter">
        <label>Filter by status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Coupon</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id.slice(0, 8)}...</td>
                  <td>{formatDateTime(order.created_at)}</td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-email">{order.customer_email}</span>
                      {order.customer_name && (
                        <span className="customer-name">{order.customer_name}</span>
                      )}
                    </div>
                  </td>
                  <td>{formatCurrency(order.amount_total)}</td>
                  <td>{order.coupon || '-'}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin Subscribers Page
export const AdminSubscribersPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [sourceStats, setSourceStats] = useState<{ source: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSubscribers = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/admin/dashboard/subscribers', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscribers(data.subscribers || []);
          setSourceStats(data.sourceStats || []);
        }
      } catch (error) {
        console.error('Failed to fetch subscribers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, [token]);

  const filteredSubscribers = search
    ? subscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
      )
    : subscribers;

  if (loading) {
    return <div className="admin-loading">Loading subscribers...</div>;
  }

  return (
    <div className="admin-subscribers-page">
      <h2>Subscribers ({subscribers.length})</h2>

      {/* Source Stats */}
      <div className="admin-source-stats">
        {sourceStats.slice(0, 6).map((stat) => (
          <div key={stat.source} className="source-stat">
            <span className="source-count">{stat.count}</span>
            <span className="source-name">{stat.source}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="admin-search">
        <input
          type="text"
          className="form-input"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Subscribers Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Source</th>
              <th>Tags</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">No subscribers found</td>
              </tr>
            ) : (
              filteredSubscribers.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.email}</td>
                  <td>{sub.name || '-'}</td>
                  <td>
                    <span className="source-badge">{sub.source}</span>
                  </td>
                  <td className="tags-cell">
                    {sub.tags ? sub.tags.split(',').map((tag, i) => (
                      <span key={i} className="tag-badge">{tag.trim()}</span>
                    )) : '-'}
                  </td>
                  <td>{formatDate(sub.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin Customers Page
export const AdminCustomersPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/admin/dashboard/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers || []);
          setTopCustomers(data.topCustomers || []);
        }
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  if (loading) {
    return <div className="admin-loading">Loading customers...</div>;
  }

  return (
    <div className="admin-customers-page">
      <h2>Customers ({customers.length})</h2>

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className="admin-section">
          <h3>Top Customers</h3>
          <div className="top-customers-grid">
            {topCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer.id} className="top-customer-card">
                <span className="rank">#{index + 1}</span>
                <div className="customer-info">
                  <span className="customer-email">{customer.email}</span>
                  {customer.name && <span className="customer-name">{customer.name}</span>}
                </div>
                <div className="customer-stats">
                  <span className="total-spent">{formatCurrency(customer.total_spent || 0)}</span>
                  <span className="order-count">{customer.order_count} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Customers Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">No customers yet</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.email}</td>
                  <td>{customer.name || '-'}</td>
                  <td>{customer.order_count}</td>
                  <td>{formatCurrency(customer.total_spent || 0)}</td>
                  <td>{formatDate(customer.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin Analytics Page
export const AdminAnalyticsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/admin/dashboard/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, days]);

  if (loading) {
    return <div className="admin-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="admin-error">Failed to load analytics</div>;
  }

  return (
    <div className="admin-analytics-page">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <div className="date-range-selector">
          <label>Period:</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Traffic Stats */}
      <div className="admin-section">
        <h3>Traffic</h3>
        <div className="traffic-stats">
          <StatCard
            label="Total Page Views"
            value={analytics.traffic.totalViews}
            icon="👁️"
            color="teal"
          />
          <StatCard
            label="Unique Visitors"
            value={analytics.traffic.uniqueVisitors}
            icon="👤"
            color="gold"
          />
        </div>
      </div>

      {/* Revenue Chart (Simple Bar Chart) */}
      <div className="admin-section">
        <h3>Revenue by Day</h3>
        <div className="simple-chart">
          {analytics.revenueByDay.length === 0 ? (
            <p className="no-data">No revenue data for this period</p>
          ) : (
            <div className="bar-chart">
              {analytics.revenueByDay.slice(-14).map((day) => {
                const maxRevenue = Math.max(...analytics.revenueByDay.map(d => d.revenue)) || 1;
                const heightPercent = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={day.date} className="bar-container" title={`${day.date}: ${formatCurrency(day.revenue)}`}>
                    <div className="bar" style={{ height: `${heightPercent}%` }}>
                      <span className="bar-value">{formatCurrency(day.revenue)}</span>
                    </div>
                    <span className="bar-label">{new Date(day.date).getDate()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subscribers Chart */}
      <div className="admin-section">
        <h3>New Subscribers by Day</h3>
        <div className="simple-chart">
          {analytics.subscribersByDay.length === 0 ? (
            <p className="no-data">No subscriber data for this period</p>
          ) : (
            <div className="bar-chart bar-chart-subscribers">
              {analytics.subscribersByDay.slice(-14).map((day) => {
                const maxSubs = Math.max(...analytics.subscribersByDay.map(d => d.count)) || 1;
                const heightPercent = (day.count / maxSubs) * 100;
                return (
                  <div key={day.date} className="bar-container" title={`${day.date}: ${day.count} subscribers`}>
                    <div className="bar" style={{ height: `${heightPercent}%` }}>
                      <span className="bar-value">{day.count}</span>
                    </div>
                    <span className="bar-label">{new Date(day.date).getDate()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Pages */}
      <div className="admin-section">
        <h3>Top Pages</h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {analytics.traffic.topPages.length === 0 ? (
                <tr>
                  <td colSpan={2} className="no-data">No page view data</td>
                </tr>
              ) : (
                analytics.traffic.topPages.map((page) => (
                  <tr key={page.path}>
                    <td>{page.path}</td>
                    <td>{page.views}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Referrers */}
      {analytics.traffic.topReferrers.length > 0 && (
        <div className="admin-section">
          <h3>Top Referrers</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Visits</th>
                </tr>
              </thead>
              <tbody>
                {analytics.traffic.topReferrers.map((ref) => (
                  <tr key={ref.referrer}>
                    <td className="referrer-cell">{ref.referrer}</td>
                    <td>{ref.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Sidebar Navigation
export const AdminSidebar: React.FC<{
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}> = ({ activePage, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'subscribers', label: 'Subscribers', icon: '📧' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
        <span className="admin-subtitle">Curls & Contemplation</span>
      </div>
      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <a href="/" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
          <span className="nav-icon">🌐</span>
          <span className="nav-label">View Site</span>
        </a>
        <button className="admin-nav-item logout" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Main Admin Dashboard Component
export const AdminDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { isAuthenticated, logout } = useAdminAuth();
  const [activePage, setActivePage] = useState('overview');

  const handleLogout = () => {
    logout();
    onExit();
  };

  if (!isAuthenticated) {
    return <AdminLoginPage onLogin={() => setActivePage('overview')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <AdminDashboardOverview />;
      case 'orders':
        return <AdminOrdersPage />;
      case 'subscribers':
        return <AdminSubscribersPage />;
      case 'customers':
        return <AdminCustomersPage />;
      case 'analytics':
        return <AdminAnalyticsPage />;
      default:
        return <AdminDashboardOverview />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />
      <main className="admin-main">
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminDashboard;

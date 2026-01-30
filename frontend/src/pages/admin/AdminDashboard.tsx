import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders, useAuth } from "../../context/AuthContext";
import styles from "./AdminDashboard.module.css";

interface DashboardStats {
  totalQuotes: number;
  totalRevenue: number;
  totalClients: number;
  totalUsers: number;
  recentQuotes: Array<{
    id: number;
    quote_number: string;
    total_price: number;
    status: string;
    created_at: string;
    company_name: string | null;
  }>;
}

interface QuoteRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  budget: number;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          fetch("/api/admin/stats", { headers: getAuthHeaders() }),
          fetch("/api/admin/quote-requests", { headers: getAuthHeaders() }),
        ]);

        if (!statsRes.ok) {
          if (statsRes.status === 401 || statsRes.status === 403) {
            navigate("/admin/login", { state: { error: "Session expired" } });
            return;
          }
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData = await statsRes.json();
        setStats(statsData);

        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setQuoteRequests(requestsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#fdb927";
      case "reviewed":
        return "#3b82f6";
      case "quoted":
        return "#8b5cf6";
      case "accepted":
        return "#22c55e";
      case "rejected":
        return "#ef4444";
      default:
        return "#888";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const pendingRequests = quoteRequests.filter((r) => r.status === "pending");

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header with greeting */}
      <div className={styles.header}>
        <div className={styles.greeting}>
          <h1>
            {getGreeting()}, {user?.firstName || "Admin"}
          </h1>
          <p>Here's what's happening with GuardQuote today.</p>
        </div>
        <div className={styles.headerDate}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Alert banner for pending requests */}
      {pendingRequests.length > 0 && (
        <div className={styles.alertBanner} onClick={() => navigate("/admin/quotes")}>
          <span className={styles.alertIcon}>🔔</span>
          <span>
            <strong>{pendingRequests.length}</strong> new quote request
            {pendingRequests.length !== 1 ? "s" : ""} waiting for review
          </span>
          <span className={styles.alertArrow}>→</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} onClick={() => navigate("/admin/quotes")}>
          <div
            className={styles.statIcon}
            style={{
              background:
                "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.3))",
            }}
          >
            📝
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{quoteRequests.length}</span>
            <span className={styles.statLabel}>Quote Requests</span>
          </div>
          {pendingRequests.length > 0 && (
            <span className={styles.statBadge}>{pendingRequests.length} new</span>
          )}
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.3))",
            }}
          >
            💰
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>${(stats?.totalRevenue || 0).toLocaleString()}</span>
            <span className={styles.statLabel}>Total Revenue</span>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => navigate("/admin/clients")}>
          <div
            className={styles.statIcon}
            style={{
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.3))",
            }}
          >
            👥
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats?.totalClients || 0}</span>
            <span className={styles.statLabel}>Clients</span>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => navigate("/admin/users")}>
          <div
            className={styles.statIcon}
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.3))",
            }}
          >
            🔐
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats?.totalUsers || 0}</span>
            <span className={styles.statLabel}>Users</span>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className={styles.twoColumn}>
        {/* Recent Quote Requests */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Recent Quote Requests</h2>
            <button className={styles.viewAllBtn} onClick={() => navigate("/admin/quotes")}>
              View All →
            </button>
          </div>

          {quoteRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <p>No quote requests yet</p>
              <span className={styles.emptyHint}>
                They'll appear here when users submit the quote form
              </span>
            </div>
          ) : (
            <div className={styles.requestsList}>
              {quoteRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className={styles.requestItem}
                  onClick={() => navigate("/admin/quotes")}
                >
                  <div className={styles.requestAvatar}>
                    {req.first_name[0]}
                    {req.last_name[0]}
                  </div>
                  <div className={styles.requestInfo}>
                    <span className={styles.requestName}>
                      {req.first_name} {req.last_name}
                    </span>
                    <span className={styles.requestMeta}>
                      ${req.budget}/mo budget • {formatTimeAgo(req.created_at)}
                    </span>
                  </div>
                  <span
                    className={styles.requestStatus}
                    style={{ backgroundColor: getStatusColor(req.status) }}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Quick Actions</h2>
          </div>

          <div className={styles.actionsStack}>
            <button className={styles.actionItem} onClick={() => navigate("/admin/quotes")}>
              <span className={styles.actionIconBox}>📋</span>
              <div className={styles.actionText}>
                <span className={styles.actionTitle}>Review Requests</span>
                <span className={styles.actionDesc}>Review and respond to quote requests</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>

            <button className={styles.actionItem} onClick={() => navigate("/admin/users")}>
              <span className={styles.actionIconBox}>👤</span>
              <div className={styles.actionText}>
                <span className={styles.actionTitle}>Manage Users</span>
                <span className={styles.actionDesc}>Add admins and manage access</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>

            <button className={styles.actionItem} onClick={() => navigate("/admin/services")}>
              <span className={styles.actionIconBox}>⚙️</span>
              <div className={styles.actionText}>
                <span className={styles.actionTitle}>Services & Pricing</span>
                <span className={styles.actionDesc}>Configure service options</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>

            <button className={styles.actionItem} onClick={() => navigate("/quote/individual")}>
              <span className={styles.actionIconBox}>🔗</span>
              <div className={styles.actionText}>
                <span className={styles.actionTitle}>View Public Form</span>
                <span className={styles.actionDesc}>See what clients experience</span>
              </div>
              <span className={styles.actionArrow}>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      {quoteRequests.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Request Status Overview</h2>
          </div>
          <div className={styles.statusOverview}>
            {["pending", "reviewed", "quoted", "accepted", "rejected"].map((status) => {
              const count = quoteRequests.filter((r) => r.status === status).length;
              const percentage =
                quoteRequests.length > 0 ? (count / quoteRequests.length) * 100 : 0;
              return (
                <div key={status} className={styles.statusItem}>
                  <div className={styles.statusHeader}>
                    <span
                      className={styles.statusDot}
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    <span className={styles.statusName}>{status}</span>
                    <span className={styles.statusCount}>{count}</span>
                  </div>
                  <div className={styles.statusBar}>
                    <div
                      className={styles.statusFill}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getStatusColor(status),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

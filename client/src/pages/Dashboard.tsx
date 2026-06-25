import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Transaction {
  _id: string;
  title: string;
  description: string;
  amount: number;
  buyer: any;
  seller?: any;
  sellerEmail: string;
  status:
    | "pending"
    | "funded"
    | "delivered"
    | "completed"
    | "disputed"
    | "resolved";
  paystackReference?: string;
  createdAt: string;
}

const statusColors: { [key: string]: string } = {
  pending: "#f59e0b",
  funded: "#38bdf8",
  delivered: "#a78bfa",
  completed: "#63eaaa",
  disputed: "#f472b6",
  resolved: "#94a3b8",
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const pendingInvites = transactions.filter(
    (t) => !t.seller && t.sellerEmail === user?.email,
  );

  const myTransactions = transactions.filter(
    (t) => t.seller || t.sellerEmail !== user?.email,
  );

  const totalEscrowed = transactions
    .filter((t) => t.status === "funded")
    .reduce((sum, t) => sum + t.amount, 0);

  const completed = transactions.filter((t) => t.status === "completed").length;
  const pending = transactions.filter((t) => t.status === "pending").length;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.logo}>🔐 EscrowNG</div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Manage your escrow transactions</p>
          </div>
          <Link to="/transactions/new" style={styles.newBtn}>
            + New Transaction
          </Link>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Transactions</span>
            <span style={styles.statNum}>{transactions.length}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>In Escrow</span>
            <span style={{ ...styles.statNum, color: "#38bdf8" }}>
              {formatAmount(totalEscrowed)}
            </span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Completed</span>
            <span style={{ ...styles.statNum, color: "#63eaaa" }}>
              {completed}
            </span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Pending</span>
            <span style={{ ...styles.statNum, color: "#f59e0b" }}>
              {pending}
            </span>
          </div>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div style={{ ...styles.section, marginBottom: "24px" }}>
            <h2 style={{ ...styles.sectionTitle, color: "#f59e0b" }}>
              🔔 Pending Invites ({pendingInvites.length})
            </h2>
            <div style={styles.list}>
              {pendingInvites.map((t) => (
                <Link
                  to={`/transactions/${t._id}`}
                  key={t._id}
                  style={{
                    ...styles.transactionCard,
                    border: "1px solid rgba(245,158,11,0.3)",
                    background: "rgba(245,158,11,0.05)",
                  }}
                >
                  <div style={styles.cardLeft}>
                    <span style={styles.cardIcon}>📨</span>
                    <div>
                      <p style={styles.cardTitle}>{t.title}</p>
                      <p style={styles.cardSub}>
                        From:{" "}
                        {typeof t.buyer === "object"
                          ? t.buyer.email
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div style={styles.cardRight}>
                    <p style={styles.cardAmount}>{formatAmount(t.amount)}</p>
                    <span
                      style={{
                        ...styles.badge,
                        background: "rgba(245,158,11,0.15)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245,158,11,0.3)",
                      }}
                    >
                      INVITE PENDING
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* My Transactions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Transactions</h2>
          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : myTransactions.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📭</p>
              <p style={styles.emptyText}>No transactions yet</p>
              <Link to="/transactions/new" style={styles.newBtn}>
                Create your first transaction
              </Link>
            </div>
          ) : (
            <div style={styles.list}>
              {myTransactions.map((t) => (
                <Link
                  to={`/transactions/${t._id}`}
                  key={t._id}
                  style={styles.transactionCard}
                >
                  <div style={styles.cardLeft}>
                    <span style={styles.cardIcon}>🔐</span>
                    <div>
                      <p style={styles.cardTitle}>{t.title}</p>
                      <p style={styles.cardSub}>
                        {typeof t.buyer === "object" ? t.buyer.email : "You"} →{" "}
                        {t.sellerEmail}
                      </p>
                    </div>
                  </div>
                  <div style={styles.cardRight}>
                    <p style={styles.cardAmount}>{formatAmount(t.amount)}</p>
                    <span
                      style={{
                        ...styles.badge,
                        background: `${statusColors[t.status]}20`,
                        color: statusColors[t.status],
                        border: `1px solid ${statusColors[t.status]}40`,
                      }}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: "100vh", background: "#0f1117" },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    background: "#1a1f2e",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#63eaaa",
    fontFamily: "monospace",
  },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navUser: { fontSize: "14px", color: "#94a3b8" },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#94a3b8",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
  },
  content: { maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: { fontSize: "28px", fontWeight: "700", color: "#e2e8f0" },
  subtitle: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  newBtn: {
    background: "#63eaaa",
    color: "#0f1117",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    border: "none",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    background: "#1a1f2e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  statNum: { fontSize: "28px", fontWeight: "700", color: "#e2e8f0" },
  section: {
    background: "#1a1f2e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "20px",
  },
  empty: { color: "#64748b", textAlign: "center", padding: "40px" },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  emptyIcon: { fontSize: "48px" },
  emptyText: { fontSize: "16px", color: "#64748b" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  transactionCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "#0f1117",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "all 0.2s",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: "12px" },
  cardIcon: { fontSize: "24px" },
  cardTitle: { fontSize: "15px", fontWeight: "600", color: "#e2e8f0" },
  cardSub: { fontSize: "12px", color: "#64748b", marginTop: "2px" },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
  },
  cardAmount: { fontSize: "16px", fontWeight: "700", color: "#e2e8f0" },
  badge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "99px",
    letterSpacing: "0.06em",
  },
};

export default Dashboard;

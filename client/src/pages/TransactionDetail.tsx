import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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

const TransactionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const res = await api.get(`/transactions/${id}`);
      setTransaction(res.data);
    } catch (err) {
      toast.error("Transaction not found");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/payments/initialize/${id}`);
      // Save reference to localStorage before redirecting to Paystack
      localStorage.setItem("pendingPaymentReference", res.data.reference);
      localStorage.setItem("pendingTransactionId", id || "");
      window.location.href = res.data.authorizationUrl;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await api.put(`/transactions/${id}/accept`);
      toast.success("Transaction accepted!");
      fetchTransaction();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async () => {
    setActionLoading(true);
    try {
      await api.put(`/transactions/${id}/deliver`);
      toast.success("Marked as delivered!");
      fetchTransaction();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark delivered");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await api.put(`/transactions/${id}/confirm`);
      toast.success("Delivery confirmed! Funds released to seller.");
      fetchTransaction();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to confirm");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason) return toast.error("Please enter a reason");
    setActionLoading(true);
    try {
      await api.put(`/transactions/${id}/dispute`, { reason: disputeReason });
      toast.success("Dispute raised! Admin will review.");
      setShowDispute(false);
      fetchTransaction();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to raise dispute");
    } finally {
      setActionLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!transaction) return null;

  const isBuyer =
    user?.email ===
    (typeof transaction.buyer === "object" ? transaction.buyer.email : "");

  const isSeller = user?.email === transaction.sellerEmail;

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🔐 EscrowNG</div>
        <Link to="/dashboard" style={styles.backBtn}>
          ← Back to Dashboard
        </Link>
      </nav>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{transaction.title}</h1>
            <p style={styles.subtitle}>Transaction ID: {transaction._id}</p>
          </div>
          <span
            style={{
              ...styles.badge,
              background: `${statusColors[transaction.status]}20`,
              color: statusColors[transaction.status],
              border: `1px solid ${statusColors[transaction.status]}40`,
            }}
          >
            {transaction.status.toUpperCase()}
          </span>
        </div>

        {/* Details Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Transaction Details</h2>
          <div style={styles.detailGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Amount</span>
              <span style={styles.detailValue}>
                {formatAmount(transaction.amount)}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Status</span>
              <span
                style={{
                  ...styles.detailValue,
                  color: statusColors[transaction.status],
                }}
              >
                {transaction.status.toUpperCase()}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Buyer</span>
              <span style={styles.detailValue}>
                {typeof transaction.buyer === "object"
                  ? transaction.buyer.email
                  : "N/A"}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Seller</span>
              <span style={styles.detailValue}>
                {typeof transaction.seller === "object"
                  ? transaction.seller.email
                  : transaction.sellerEmail}
              </span>
            </div>
            <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}>
              <span style={styles.detailLabel}>Description</span>
              <span style={styles.detailValue}>{transaction.description}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Created</span>
              <span style={styles.detailValue}>
                {new Date(transaction.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Transaction Flow</h2>
          <div style={styles.timeline}>
            {["pending", "funded", "delivered", "completed"].map((step, i) => (
              <div key={step} style={styles.timelineItem}>
                <div
                  style={{
                    ...styles.timelineDot,
                    background:
                      ["pending", "funded", "delivered", "completed"].indexOf(
                        transaction.status,
                      ) >= i
                        ? "#63eaaa"
                        : "rgba(255,255,255,0.1)",
                  }}
                />
                <span
                  style={{
                    ...styles.timelineLabel,
                    color:
                      ["pending", "funded", "delivered", "completed"].indexOf(
                        transaction.status,
                      ) >= i
                        ? "#e2e8f0"
                        : "#64748b",
                  }}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {i < 3 && <div style={styles.timelineLine} />}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Actions</h2>
          <div style={styles.actions}>
            {/* Seller accepts */}
            {transaction.status === "pending" &&
              !transaction.seller &&
              !isBuyer && (
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  style={styles.actionBtn}
                >
                  ✅ Accept Transaction
                </button>
              )}

            {/* Buyer pays */}
            {transaction.status === "pending" &&
              transaction.seller &&
              isBuyer && (
                <button
                  onClick={handlePayment}
                  disabled={actionLoading}
                  style={styles.actionBtn}
                >
                  💳 {actionLoading ? "Redirecting..." : "Pay into Escrow"}
                </button>
              )}

            {/* Seller marks delivered */}
            {transaction.status === "funded" && isSeller && (
              <button
                onClick={handleDeliver}
                disabled={actionLoading}
                style={styles.actionBtn}
              >
                📦 {actionLoading ? "Updating..." : "Mark as Delivered"}
              </button>
            )}

            {/* Buyer confirms or disputes */}
            {transaction.status === "delivered" && isBuyer && (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  style={styles.actionBtn}
                >
                  ✅{" "}
                  {actionLoading ? "Processing..." : "Confirm & Release Funds"}
                </button>
                <button
                  onClick={() => setShowDispute(!showDispute)}
                  style={{
                    ...styles.actionBtn,
                    background: "rgba(244,114,182,0.1)",
                    color: "#f472b6",
                    border: "1px solid rgba(244,114,182,0.3)",
                  }}
                >
                  ⚠️ Raise Dispute
                </button>
              </>
            )}

            {/* Dispute form */}
            {showDispute && (
              <div style={styles.disputeBox}>
                <label style={styles.label}>Reason for dispute</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain why you are raising a dispute..."
                  rows={3}
                  style={styles.textarea}
                />
                <button
                  onClick={handleDispute}
                  disabled={actionLoading}
                  style={{
                    ...styles.actionBtn,
                    background: "#f472b6",
                    color: "#0f1117",
                  }}
                >
                  Submit Dispute
                </button>
              </div>
            )}

            {transaction.status === "completed" && (
              <div style={styles.successBox}>
                <p style={styles.successText}>
                  ✅ Transaction completed successfully! Funds have been
                  released to the seller.
                </p>
              </div>
            )}

            {transaction.status === "disputed" && (
              <div style={styles.disputedBox}>
                <p style={styles.disputedText}>
                  ⚠️ This transaction is under dispute. Admin will review and
                  resolve it.
                </p>
              </div>
            )}

            {/* No actions available */}
            {transaction.status === "pending" &&
              !transaction.seller &&
              isBuyer && (
                <div style={styles.waitingBox}>
                  <p style={styles.waitingText}>
                    ⏳ Waiting for seller to accept the transaction...
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: "100vh", background: "#0f1117" },
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    background: "#1a1f2e",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#63eaaa",
    fontFamily: "monospace",
  },
  backBtn: { fontSize: "14px", color: "#94a3b8" },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: "28px", fontWeight: "700", color: "#e2e8f0" },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
    fontFamily: "monospace",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "6px 14px",
    borderRadius: "99px",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
  },
  card: {
    background: "#1a1f2e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "28px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "20px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  detailItem: { display: "flex", flexDirection: "column", gap: "6px" },
  detailLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  detailValue: { fontSize: "15px", color: "#e2e8f0", fontWeight: "500" },
  timeline: { display: "flex", alignItems: "center" },
  timelineItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  timelineLabel: {
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  timelineLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "0 8px",
  },
  actions: { display: "flex", flexDirection: "column", gap: "12px" },
  actionBtn: {
    background: "rgba(99,234,170,0.1)",
    color: "#63eaaa",
    border: "1px solid rgba(99,234,170,0.3)",
    borderRadius: "8px",
    padding: "14px 24px",
    fontSize: "14px",
    fontWeight: "600",
  },
  disputeBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    background: "rgba(244,114,182,0.05)",
    borderRadius: "8px",
    border: "1px solid rgba(244,114,182,0.2)",
  },
  label: { fontSize: "13px", color: "#94a3b8" },
  textarea: {
    background: "#0f1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "12px",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
  },
  successBox: {
    background: "rgba(99,234,170,0.08)",
    border: "1px solid rgba(99,234,170,0.2)",
    borderRadius: "8px",
    padding: "16px",
  },
  successText: { fontSize: "14px", color: "#63eaaa" },
  disputedBox: {
    background: "rgba(244,114,182,0.08)",
    border: "1px solid rgba(244,114,182,0.2)",
    borderRadius: "8px",
    padding: "16px",
  },
  disputedText: { fontSize: "14px", color: "#f472b6" },
  waitingBox: {
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: "8px",
    padding: "16px",
  },
  waitingText: { fontSize: "14px", color: "#f59e0b" },
};

export default TransactionDetail;

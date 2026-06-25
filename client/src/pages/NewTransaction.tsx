import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const NewTransaction = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/transactions", {
        title,
        description,
        amount: Number(amount),
        sellerEmail,
      });
      toast.success("Transaction created!");
      navigate(`/transactions/${res.data._id}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create transaction",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🔐 EscrowNG</div>
        <Link to="/dashboard" style={styles.backBtn}>
          ← Back to Dashboard
        </Link>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>New Transaction</h1>
        <p style={styles.subtitle}>Create a secure escrow transaction</p>

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.group}>
              <label style={styles.label}>Transaction Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Logo Design, Website Development"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is being bought/sold..."
                required
                rows={4}
                style={{ ...styles.input, resize: "vertical" }}
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Amount (NGN)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                required
                min="100"
                style={styles.input}
              />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Seller Email</label>
              <input
                type="email"
                value={sellerEmail}
                onChange={(e) => setSellerEmail(e.target.value)}
                placeholder="seller@example.com"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                💡 The seller will need to register on EscrowNG and accept this
                transaction before payment can be made.
              </p>
            </div>

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Creating..." : "Create Transaction →"}
            </button>
          </form>
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
  },
  logo: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#63eaaa",
    fontFamily: "monospace",
  },
  backBtn: { fontSize: "14px", color: "#94a3b8" },
  content: { maxWidth: "600px", margin: "0 auto", padding: "40px 24px" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: "8px",
  },
  subtitle: { fontSize: "14px", color: "#64748b", marginBottom: "32px" },
  card: {
    background: "#1a1f2e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "32px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  group: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", color: "#94a3b8", fontWeight: "500" },
  input: {
    background: "#0f1117",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  },
  infoBox: {
    background: "rgba(99,234,170,0.06)",
    border: "1px solid rgba(99,234,170,0.2)",
    borderRadius: "8px",
    padding: "14px 16px",
  },
  infoText: { fontSize: "13px", color: "#63eaaa", lineHeight: "1.6" },
  btn: {
    background: "#63eaaa",
    color: "#0f1117",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "14px",
    fontWeight: "700",
  },
};

export default NewTransaction;

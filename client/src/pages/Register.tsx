import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.token, res.data.user);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🔐 EscrowNG</div>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Start transacting safely today</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f1117",
    padding: "24px",
  },
  card: {
    background: "#1a1f2e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#63eaaa",
    marginBottom: "24px",
    fontFamily: "monospace",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "500",
  },
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
  btn: {
    background: "#63eaaa",
    color: "#0f1117",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "14px",
    fontWeight: "700",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#64748b",
  },
  link: {
    color: "#63eaaa",
    fontWeight: "600",
  },
};

export default Register;

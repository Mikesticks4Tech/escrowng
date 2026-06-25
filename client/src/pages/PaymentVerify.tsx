import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const PaymentVerify = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Get reference from localStorage (saved before Paystack redirect)
    const reference = localStorage.getItem("pendingPaymentReference");
    const transactionId = localStorage.getItem("pendingTransactionId");

    console.log("Reference from storage:", reference);

    if (reference) {
      verifyPayment(reference, transactionId || "");
    } else {
      // Try URL params as fallback
      const params = new URLSearchParams(window.location.search);
      const urlReference = params.get("reference");
      if (urlReference) {
        verifyPayment(urlReference, "");
      } else {
        toast.error("No payment reference found");
        navigate("/dashboard");
      }
    }
  }, []);

  const verifyPayment = async (reference: string, transactionId: string) => {
    try {
      localStorage.removeItem("pendingPaymentReference");
      localStorage.removeItem("pendingTransactionId");
      const res = await api.get(`/payments/verify/${reference}`);
      toast.success("Payment successful! Funds are in escrow 🔐");
      const txId = res.data.transaction._id || transactionId;
      navigate(`/transactions/${txId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment verification failed");
      navigate("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1117",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "48px" }}>⏳</div>
      <p style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: "600" }}>
        Verifying your payment...
      </p>
      <p style={{ color: "#64748b", fontSize: "14px" }}>
        Please wait, do not close this page.
      </p>
    </div>
  );
};

export default PaymentVerify;

import React, { useState, useEffect } from "react";
import axios from "axios";

const History = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/billing/history")
      .then((res) => setBills(res.data))
      .catch((err) => console.error("Error loading bills:", err));
  }, []);

  const handleDownload = async (billId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/invoice/${billId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${billId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  const handleView = (bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🧾 Billing History</h2>
      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f3f3f3" }}>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td colSpan="4" align="center">
                No bills yet.
              </td>
            </tr>
          ) : (
            bills.map((bill) => (
              <tr key={bill.id}>
                <td>{bill.date}</td>
                <td>{bill.payment_method}</td>
                <td>₹{bill.total.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => handleView(bill)}
                    style={{
                      marginRight: "10px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => handleDownload(bill.id)}
                    style={{ padding: "5px 10px", cursor: "pointer" }}
                  >
                    ⬇️ Download
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* -------------------- Modal -------------------- */}
      {showModal && selectedBill && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>Invoice Details</h3>
            <p><strong>Date:</strong> {selectedBill.date}</p>
            <p><strong>Payment:</strong> {selectedBill.payment_method}</p>
            <p><strong>Subtotal:</strong> ₹{selectedBill.subtotal.toFixed(2)}</p>
            <p><strong>GST:</strong> ₹{selectedBill.gst.toFixed(2)}</p>
            <p><strong>Additional Tax:</strong> ₹{selectedBill.additional_tax.toFixed(2)}</p>
            <p><strong>Discount:</strong> ₹{selectedBill.discount.toFixed(2)}</p>
            <p><strong>Total:</strong> ₹{selectedBill.total.toFixed(2)}</p>

            <h4>🛍️ Items:</h4>
            <ul>
              {selectedBill.items.map((item) => (
                <li key={item.pid}>
                  {item.name} x {item.quantity} = ₹{item.subtotal.toFixed(2)}
                </li>
              ))}
            </ul>

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

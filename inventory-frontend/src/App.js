import React, { useState } from "react";
import NewBill from "./components/NewBill";
import ManageInventory from "./components/Inventory";
import History from "./components/History";
import Analysis from "./components/Analysis";

function App() {
  const [activeTab, setActiveTab] = useState("newbill");

  const renderPage = () => {
    switch (activeTab) {
      case "newbill":
        return <NewBill />;
      case "inventory":
        return <ManageInventory />;
      case "history":
        return <History />;
      case "analysis":
        return <Analysis />;
      default:
        return <NewBill />;
    }
  };

  return (
    <div>
      {/* -------- Navbar -------- */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "#1E293B",
          color: "white",
        }}
      >
        <h2 style={{ margin: 0 }}>🛒 Inventory & Billing System</h2>
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => setActiveTab("newbill")}
            style={{
              background: activeTab === "newbill" ? "#3B82F6" : "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "5px",
            }}
          >
            New Bill
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            style={{
              background: activeTab === "inventory" ? "#3B82F6" : "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "5px",
            }}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              background: activeTab === "history" ? "#3B82F6" : "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "5px",
            }}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            style={{
              background: activeTab === "analysis" ? "#3B82F6" : "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "5px",
            }}
          >
            Analysis
          </button>
        </div>
      </nav>

      {/* -------- Page Content -------- */}
      <div style={{ padding: "20px" }}>{renderPage()}</div>
    </div>
  );
}

export default App;

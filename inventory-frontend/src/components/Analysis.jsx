import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analysis = () => {
  const [analysis, setAnalysis] = useState({ labels: [], data: [] });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchAnalysis = async () => {
    try {
      const params = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const res = await axios.get("http://127.0.0.1:5000/analysis", { params });
      setAnalysis(res.data);
    } catch (err) {
      console.error("Error fetching analysis:", err);
    }
  };

  useEffect(() => {
    fetchAnalysis(); // load initial data
  }, []);

  const chartData = {
    labels: analysis.labels,
    datasets: [
      {
        label: "Total Sold Quantity",
        data: analysis.data,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Top Sold Items (Selected Period)",
      },
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Sales Analysis</h2>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginLeft: "5px" }}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ marginLeft: "5px" }}
          />
        </label>

        <button
          onClick={fetchAnalysis}
          style={{
            padding: "6px 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🔍 Analyze
        </button>
      </div>

      <div style={{ width: "80%", margin: "0 auto" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default Analysis;

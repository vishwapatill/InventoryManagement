# 🧾 Inventory Management System

## 📘 Introduction
The **Inventory Management System** is a full-stack web application designed to manage products, generate bills, track sales history, and analyze business performance.  
It includes both a **Flask (Python)** backend for APIs and a **React** frontend for the user interface.

---

## 🧩 Description
This system helps streamline inventory and billing operations for retail and wholesale businesses.  
Key features include:
- 🛍️ Adding and managing products in inventory  
- 🧾 Creating and printing customer bills  
- 📜 Viewing billing history with invoices  
- 📊 Sales analysis and most-sold item insights  
- 💰 Auto-calculated GST, discounts, and totals  

---

## ⚙️ Tech Stack

### **Frontend**
- React.js  
- Axios  
- Chart.js  
- Tailwind CSS  

### **Backend**
- Python 3.10  
- Flask  
- SQLite / JSON (for data persistence)  
- ReportLab (for PDF invoice generation)  

### **Environment**
- Node.js v22.20.0  
- npm  

---

## 🧑‍💻 Local Development Setup

### **1️⃣ Setup Python Backend**
```bash
cd backend
python -m venv env

Activate Virtual Environment


Windows
.\env\Scripts\activate



Ubuntu / macOS
source env/bin/activate



Run Flask Server
python main.py


2️⃣ Setup React Frontend
cd ..
cd inventory-frontend
npm install
npm start

Your frontend will run at:
👉 http://localhost:3000
and backend at:
👉 http://127.0.0.1:5000

🧾 Folder Structure
InventoryManagement/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── static/
│   ├── templates/
│   └── invoices/
│
└── inventory-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── NewBill.js
    │   │   ├── Inventory.js
    │   │   ├── History.js
    │   │   └── Analysis.js
    │   ├── App.js
    │   └── Navbar.js
    └── package.json


🧠 Future Improvements


Authentication and user roles


Cloud database integration


Export reports (CSV, PDF)


Dashboard for profit and expense analysis



📜 License
This project is open-source and available under the MIT License.

Developed by Vishwa Patil 🚀

---

Would you like me to make this README include **API endpoint documentation** (like `/inventory`, `/bills`, `/analysis` etc.) as well?


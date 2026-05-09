import Papa from "papaparse";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const user = localStorage.getItem("user");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/expenses/${user}`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthly = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((s, e) => s + Number(e.amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expense = {
      amount: Number(amount),
      category,
      date,
      description,
      user_id: Number(user),
    };

    try {
      if (editId) {
        await fetch(`http://127.0.0.1:5000/expense/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expense),
        });
        toast.success("Expense Updated ✅");
      } else {
        await fetch("http://127.0.0.1:5000/expense", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expense),
        });
        toast.success("Expense Added ✅");
      }

      fetchExpenses();
      setAmount("");
      setCategory("");
      setDate("");
      setDescription("");
      setEditId(null);

    } catch (err) {
      toast.error("Error adding expense");
    }
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:5000/expense/${id}`, {
      method: "DELETE",
    });
    toast("Deleted", { icon: "🗑️" });
    fetchExpenses();
  };

  const handleEdit = (e) => {
    setAmount(e.amount);
    setCategory(e.category);
    setDate(e.date);
    setDescription(e.description);
    setEditId(e.id);
  };
  const handleCSVUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,

    complete: async (results) => {
      try {
        for (const row of results.data) {

          // Ignore CREDIT / income transactions
          if (row.type?.toLowerCase() !== "debit") continue;

          const expense = {
            amount: Number(row.amount),
            category: "Other",
            date: row.date,
            description: row["transaction details"],
            user_id: Number(user),
          };

          await fetch("http://127.0.0.1:5000/expense", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(expense),
          });
        }

        toast.success("CSV Imported Successfully ✅");
        fetchExpenses();

      } catch (err) {
        console.error(err);
        toast.error("CSV Upload Failed");
      }
    },
  });
};

const handlePDFUpload = async (event) => {

  const file = event.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("user_id", user);

  try {

    const res = await fetch(
      "http://127.0.0.1:5000/upload-pdf",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    toast.success(data.message);

    fetchExpenses();

  } catch (err) {

    console.error(err);

    toast.error("PDF Upload Failed");

  }
};

const filteredExpenses = showAll
  ? expenses
  : expenses.filter((e) =>
      e.date.startsWith(currentMonth)
    );
  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>💰 Expense Dashboard</h1>
      
    <div style={{ marginBottom: "20px" }}>
  <input
    type="file"
    accept=".pdf"
    onChange={handlePDFUpload}
    style={styles.csvInput}
  />
</div>
        {/* FORM */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            {editId ? "Edit Expense" : "Add Expense"}
          </h3>

          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <select
              style={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option>Food</option>
              <option>Shopping</option>
              <option>Travel</option>
              <option>Bills</option>
              <option>Health</option>
              <option>Education</option>
              <option>Other</option>
            </select>

            <input
              style={styles.input}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <input
              style={styles.input}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button style={styles.primaryBtn}>
              {editId ? "Update Expense" : "Add Expense"}
            </button>
          </form>
        </div>

        {/* KPI */}
        <div style={styles.kpiRow}>
          <div style={styles.kpiBox}>
            <p style={styles.kpiLabel}>Total Spending</p>
            <h2 style={styles.kpiValue}>₹{total}</h2>
          </div>

          <div style={styles.kpiBox}>
            <p style={styles.kpiLabel}>This Month</p>
            <h2 style={styles.kpiValue}>₹{monthly}</h2>
          </div>

          <div style={styles.kpiBox}>
            <p style={styles.kpiLabel}>Transactions</p>
            <h2 style={styles.kpiValue}>{expenses.length}</h2>
          </div>
        </div>
        <div style={{ marginBottom: "15px" }}>
  <button
    onClick={() => setShowAll(!showAll)}
    style={styles.toggleBtn}
  >
    {showAll ? "Show Current Month" : "Show All Expenses"}
  </button>
</div>
        {/* TABLE */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>All Expenses</h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.map((e, index) => (
                <tr key={e.id} style={styles.row}>
                  <td>{index + 1}</td>
                  <td>₹{e.amount}</td>
                  <td>{e.category}</td>
                  <td>{e.date}</td>
                  <td>{e.description}</td>

                  <td>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEdit(e)}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ================= UI ================= */

const styles = {
  container: {
    padding: "30px",
    background: "#020617",
    minHeight: "100vh",
    color: "#e2e8f0",
  },

  heading: {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "25px",
    color: "#22c55e",
  },

  card: {
    background: "#0f172a",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
    
  },

  cardTitle: {
    marginBottom: "15px",
    color: "#38bdf8",
  },

  input: {
    display: "block",
    width: "100%",
    marginBottom: "12px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    background: "#020617",
    color: "#e2e8f0",
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  csvInput: {
  padding: "10px",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  color: "#e2e8f0",
},

  kpiRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    
  },

  kpiBox: {
    flex: 1,
    background: "#020617",
    border: "1px solid #1e293b",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#22c55e",
  },

  kpiValue: {
  color: "#22c55e",   // 👈 change THIS color
  fontWeight: "bold",
  fontSize: "22px",
  },

  kpiLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "5px",
  },
  
  toggleBtn: {
  padding: "10px 15px",
  background: "#38bdf8",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
},

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  row: {
    borderBottom: "1px solid #010202",
  },

  editBtn: {
    marginRight: "8px",
    padding: "6px 12px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  deleteBtn: {
    padding: "6px 12px",
    background: "#ef4444",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
  },
};

export default Dashboard;
import { useEffect, useState, useRef } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Analytics() {
  const navigate = useNavigate();
  const [income, setIncome] = useState(50000); // default value
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [budget, setBudget] = useState(5000);

  const lineRef = useRef();
  const pieRef = useRef();
  const barRef = useRef();

  const user = localStorage.getItem("user");

  // ✅ FIX 1: proper redirect (NO flicker)
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // ✅ FIX 2: safe fetch
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    fetch(`http://127.0.0.1:5000/expenses/${user}`)
      .then((res) => res.json())
      .then((data) => {
        // ✅ FIX 3: ensure numbers
        const cleanData = data.map((e) => ({
          ...e,
          amount: Number(e.amount),
        }));
        setExpenses(cleanData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // FILTER
  const filteredExpenses = expenses.filter((e) => {
    if (!fromDate && !toDate) return true;
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    return true;
  });

  // KPI
  const selectedMonthExpense = expenses
    .filter((e) => e.date.startsWith(selectedMonth))
    .reduce((s, e) => s + e.amount, 0);
  const savings = income - selectedMonthExpense;

const burnRate = income
  ? ((selectedMonthExpense / income) * 100).toFixed(1)
  : 0;

  const today = new Date().getDate();
  const avgDaily = today ? selectedMonthExpense / today : 0;

  // HEATMAP
  const days = new Array(31).fill(0);
  expenses.forEach((e) => {
    if (e.date.startsWith(selectedMonth)) {
      const d = new Date(e.date).getDate() - 1;
      days[d] += e.amount;
    }
  });

  const highestDayValue = Math.max(...days);
  const highestDayIndex = days.indexOf(highestDayValue);

  let highestDayFormatted = "N/A";
  if (highestDayValue > 0) {
    const dateObj = new Date(`${selectedMonth}-${highestDayIndex + 1}`);
    highestDayFormatted = dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const budgetLeft = budget - selectedMonthExpense;

  // AI INSIGHT
  const prevMonth = new Date(selectedMonth + "-01");
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthStr = prevMonth.toISOString().slice(0, 7);

  const prevMonthExpense = expenses
    .filter((e) => e.date.startsWith(prevMonthStr))
    .reduce((s, e) => s + e.amount, 0);

  let aiInsight = "No insights available";

  if (prevMonthExpense > 0) {
    const change =
      ((selectedMonthExpense - prevMonthExpense) / prevMonthExpense) * 100;

    aiInsight =
      change > 0
        ? `⚠️ You spent ${change.toFixed(0)}% more than last month`
        : `✅ You reduced spending by ${Math.abs(change).toFixed(0)}%`;
  }

  // LINE
  const todayMonthIndex = new Date().getMonth();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const monthlyTotals = new Array(12).fill(0);
  expenses.forEach((e) => {
    const m = new Date(e.date).getMonth();
    monthlyTotals[m] += e.amount;
  });

  const lineData = {
    labels: months.slice(0, todayMonthIndex + 1),
    datasets: [{
      label: "Monthly Expense",
      data: monthlyTotals.slice(0, todayMonthIndex + 1),
      borderColor: "#38bdf8",
      tension: 0.4,
    }],
  };

  // CATEGORY
  const categoryTotals = {};
  filteredExpenses.forEach((e) => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: ["#38bdf8","#22c55e","#f59e0b","#ef4444","#6366f1"],
    }],
  };

  const barData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: "Expense",
      data: Object.values(categoryTotals),
      backgroundColor: "#c2f838",
    }],
  };

  // EXPORT
  const exportPNG = (ref, name) => {
    const url = ref.current.toBase64Image();
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  };

  const getColor = (v) => {
    if (v === 0) return "#020617";
    if (v < 500) return "#22c55e";
    if (v < 1000) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>Analytics</h1>

        {loading && <p style={styles.loader}>Loading...</p>}

        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <p>Month Expense</p>
            <h2 style={styles.kpiValue}>₹{selectedMonthExpense}</h2>
          </div>

          <div style={styles.kpiCard}>
            <p>Avg / Day</p>
            <h2 style={styles.kpiValue}>₹{avgDaily.toFixed(0)}</h2>
          </div>

          <div style={styles.kpiCard}>
            <p>Peak Day</p>
            <h2 style={styles.kpiValue}>
              ₹{highestDayValue}
              <br />
              <span style={styles.subText}>{highestDayFormatted}</span>
            </h2>
          </div>

          <div style={styles.kpiCard}>
            <p>Budget Left</p>
            <h2 style={styles.kpiValue}>₹{budgetLeft}</h2>
          </div>
          <div style={styles.kpiCard}>
  <p>Income</p>
  <h2 style={styles.kpiValue}>₹{income}</h2>
</div>

<div style={styles.kpiCard}>
  <p>Savings</p>
  <h2 style={styles.kpiValue}>₹{savings}</h2>
</div>

<div style={styles.kpiCard}>
  <p>Burn Rate</p>
  <h2 style={styles.kpiValue}>{burnRate}%</h2>
</div>
        </div>
        
        <div style={styles.aiCard}>{aiInsight}</div>

        <div style={styles.gridSmall}>
          <div style={styles.card}>
            <h3>Trend</h3>
            <Line ref={lineRef} data={lineData} height={120} />
            <button onClick={() => exportPNG(lineRef, "trend.png")}>Export</button>
          </div>

          <div style={styles.card}>
            <h3>Budget</h3>

            <input type="month"
              value={selectedMonth}
              onChange={(e)=>setSelectedMonth(e.target.value)} />

            <input
            type="number"
            placeholder="Enter Monthly Income"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            />

            <input type="number"
              value={budget}
              onChange={(e)=>setBudget(Number(e.target.value))} />

            <Bar data={{
              labels:["Budget"],
              datasets:[
                {label:"Spent",data:[selectedMonthExpense],backgroundColor:"#ef4444"},
                {label:"Remaining",data:[Math.max(budget-selectedMonthExpense,0)],backgroundColor:"#22c55e"}
              ]
            }} height={150} />
          </div>
        </div>

        <div style={styles.card}>
          <h3>Date Filter</h3>
          <input type="date" onChange={(e)=>setFromDate(e.target.value)} />
          <input type="date" onChange={(e)=>setToDate(e.target.value)} />
        </div>

        <div style={styles.gridSmall}>
          <div style={styles.card}>
            <Pie ref={pieRef} data={pieData} height={150} />
            <button onClick={()=>exportPNG(pieRef,"pie.png")}>Export</button>
          </div>

          <div style={styles.card}>
            <Bar ref={barRef} data={barData} height={180} />
            <button onClick={()=>exportPNG(barRef,"bar.png")}>Export</button>
          </div>
        </div>

        <div style={styles.card}>
          <h3>{selectedMonth} Heatmap</h3>
          <div style={styles.heatmap}>
            {days.map((v,i)=>(
              <div key={i} style={{...styles.box,background:getColor(v)}}>
                {i+1}
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

const styles = {
  container:{padding:"30px",background:"#020617",color:"#e2e8f0",minHeight:"100vh"},
  heading:{color:"#38bdf8",marginBottom:"20px"},
  loader:{textAlign:"center",color:"#22c55e"},

  kpiGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"15px",marginBottom:"20px"},
  kpiCard:{background:"#0f172a",padding:"15px",borderRadius:"12px",textAlign:"center",border:"1px solid #1e293b"},
  kpiValue:{color:"#38bdf8",fontSize:"20px",fontWeight:"bold"},
  subText:{fontSize:"12px",color:"#94a3b8"},

  aiCard:{background:"#022c22",padding:"12px",borderRadius:"10px",marginBottom:"15px",color:"#4ade80",textAlign:"center"},

  gridSmall:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"70px"},
  card:{background:"#0f172a",padding:"15px",borderRadius:"10px",marginTop:"15px"},

  heatmap:{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:"5px"},
  box:{height:"30px",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"4px"}
};

export default Analytics;
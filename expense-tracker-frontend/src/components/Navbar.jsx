import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  const user = localStorage.getItem("user");
  const avatarLetter = user ? user.charAt(0).toUpperCase() : "?";

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {/* TOP BAR */}
      <div style={styles.topbar}>
        <button style={styles.menuBtn} onClick={() => setOpen(!open)}>
          ☰
        </button>

        <h2 style={styles.logo}>💰 ExpenseIQ</h2>

        {/* 🔥 USER SECTION */}
        {user && (
          <div style={styles.userBox}>
            <div style={styles.avatar}>{avatarLetter}</div>

            <button
              style={styles.logoutBtn}
              onClick={logout}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      {open && (
        <div style={styles.sidebar}>
          <Link style={styles.link} to="/" onClick={() => setOpen(false)}>
            Home
          </Link>

          <Link style={styles.link} to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </Link>

          <Link style={styles.link} to="/analytics" onClick={() => setOpen(false)}>
            Analytics
          </Link>
        </div>
      )}
    </>
  );
}

const styles = {
  topbar: {
    height: "60px",
    background: "rgba(2,6,23,0.8)",
    backdropFilter: "blur(10px)",
    color: "#22c55e",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  logo: {
    marginLeft: "10px",
    fontWeight: "bold",
  },

  menuBtn: {
    fontSize: "20px",
    background: "none",
    border: "none",
    color: "#22c55e",
    cursor: "pointer",
  },

  userBox: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#38bdf8",
    color: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  logoutBtn: {
    background: "#ef4444",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
    transition: "0.2s",
  },

  sidebar: {
    position: "fixed",
    top: "60px",
    left: 0,
    width: "200px",
    height: "100%",
    background: "#020617",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    gap: "15px",
    borderRight: "1px solid #1e293b",
  },

  link: {
    color: "#38bdf8",
    textDecoration: "none",
    fontSize: "16px",
  },
};

export default Navbar;
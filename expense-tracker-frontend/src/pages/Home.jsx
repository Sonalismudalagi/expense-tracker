import bg from "../assets/ex1.jpg";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <div
          style={styles.card}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h1 style={styles.title}>💰 ExpenseIQ</h1>

          <p style={styles.text}>
            Track, analyze and control your spending like a pro.
          </p>

          {/* NOT LOGGED IN */}
          {!user && (
            <>
              <button
                style={styles.primaryBtn}
                onClick={() => navigate("/login")}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Login
              </button>

              <button
                style={styles.secondaryBtn}
                onClick={() => navigate("/signup")}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Create Account
              </button>
            </>
          )}

          {/* LOGGED IN */}
          {user && (
            <button
              style={styles.primaryBtn}
              onClick={() => navigate("/dashboard")}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  backgroundImage: `url(${bg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",

  position: "relative",
  color: "#fff",
},

  card: {
    padding: "50px",
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    textAlign: "center",
    width: "360px",
    transition: "0.3s",
    boxShadow: "inset 0 0 200px rgba(56,189,248,0.05)",
  },

  title: {
    color: "#22c55e",
    marginBottom: "10px",
    fontSize: "28px",
  },

  text: {
    color: "#94a3b8",
    marginBottom: "25px",
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "10px",
    transition: "0.2s",
  },

  secondaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#38bdf8",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },
};

export default Home;
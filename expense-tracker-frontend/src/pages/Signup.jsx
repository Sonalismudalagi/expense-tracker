import bg from "../assets/ex1.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    const res = await fetch("http://127.0.0.1:5000/signup", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Account created!");
      navigate("/login");
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.card}
        onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.03)"}
        onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
      >
        <h2 style={styles.title}>Create Account 🚀</h2>

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          style={styles.primaryBtn}
          onClick={handleSignup}
          onMouseEnter={(e)=>e.target.style.transform="scale(1.05)"}
          onMouseLeave={(e)=>e.target.style.transform="scale(1)"}
        >
          Signup
        </button>

        <p style={styles.linkText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={()=>navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
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

  card:{
    background:"rgba(15, 23, 42, 0.7)",
    backdropFilter:"blur(12px)",
    padding:"40px",
    borderRadius:"16px",
    color:"white",
    width:"320px",
    textAlign:"center",
    border:"1px solid rgba(255,255,255,0.1)",
    transition:"0.3s",
    boxShadow:"inset 0 0 120px rgba(56,189,248,0.05)"
  },

  title:{
    marginBottom:"20px",
    color:"#38bdf8"
  },

  input:{
    width:"100%",
    padding:"10px",
    marginBottom:"12px",
    borderRadius:"6px",
    border:"1px solid #1e293b",
    background:"#020617",
    color:"#e2e8f0"
  },

  primaryBtn:{
    width:"100%",
    padding:"12px",
    background:"#38bdf8",
    border:"none",
    borderRadius:"6px",
    cursor:"pointer",
    fontWeight:"bold",
    marginTop:"10px",
    transition:"0.2s"
  },

  linkText:{
    marginTop:"15px",
    color:"#94a3b8"
  },

  link:{
    color:"#22c55e",
    cursor:"pointer",
    fontWeight:"bold"
  }
};

export default Signup;
// Register.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./Firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [age, setAge] = useState("");
  const [preferences, setPreferences] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        firstName: fname,
        lastName: lname,
        age,
        preferences: preferences.length
          ? preferences.split(",").map((p) => p.trim())
          : [],
        photo: "",
        createdAt: new Date(),
      });

      toast.success("Registration Successful!");
      window.location.href = "/login";

    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <input
            className="form-control"
            placeholder="First Name"
            onChange={(e) => setFname(e.target.value)}
            required
            style={styles.input}
          />

          <input
            className="form-control"
            placeholder="Last Name"
            onChange={(e) => setLname(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            className="form-control"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            className="form-control"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="number"
            className="form-control"
            placeholder="Age"
            onChange={(e) => setAge(e.target.value)}
            style={styles.input}
          />

          <input
            className="form-control"
            placeholder="Preferences (comma separated)"
            onChange={(e) => setPreferences(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.btn}>Register</button>
        </form>

        <p style={{ marginTop: "10px" }}>
          Already have an account? <a href="/login">Login</a>
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
    background: "#f0f2f5"
  },
  card: {
    width: "360px",
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "100%"
  },
  btn: {
    marginTop: "15px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    background: "#0d6efd",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  }
};

export default Register;

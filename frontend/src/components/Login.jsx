import { useState } from "react";
import { auth, db, googleProvider } from "./Firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [isSignup, setIsSignup] = useState(false);

  // ---------------- EMAIL LOGIN ------------------
  const loginEmail = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        lastLogin: new Date()
      }, { merge: true });

      onLogin(user);
      window.location.href = "/profile";
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- EMAIL SIGNUP ------------------
  const signupEmail = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        firstName: name,
        age,
        preferences,
        photo: "",
        createdAt: new Date()
      });

      onLogin(user);
      window.location.href = "/profile";
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- GOOGLE LOGIN ------------------
  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          firstName: user.displayName,
          email: user.email,
          photo: user.photoURL,
          lastLogin: new Date(),
          preferences: [],
          age: ""
        },
        { merge: true }
      );

      onLogin(user);
      window.location.href = "/profile";
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isSignup ? "Create Account" : "Login"}</h2>

        {/* NAME, AGE, PREFERENCES (Only Signup Mode) */}
        {isSignup && (
          <>
            <input
              placeholder="Name"
              style={styles.input}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Age"
              type="number"
              style={styles.input}
              onChange={(e) => setAge(e.target.value)}
            />

            <input
              placeholder="Preferences (comma separated)"
              style={styles.input}
              onChange={(e) =>
                setPreferences(
                  e.target.value.split(",").map((p) => p.trim())
                )
              }
            />
          </>
        )}

        {/* EMAIL + PASSWORD */}
        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isSignup ? (
          <>
            <button style={styles.btn} onClick={loginEmail}>
              Login
            </button>

            <button style={styles.link} onClick={() => setIsSignup(true)}>
              New? Create Account
            </button>
          </>
        ) : (
          <>
            <button style={styles.btnSecondary} onClick={signupEmail}>
              Sign Up
            </button>

            <button style={styles.link} onClick={() => setIsSignup(false)}>
              Already have an account? Login
            </button>
          </>
        )}

        <p style={{ margin: "10px 0" }}>OR</p>

        <button style={styles.googleBtn} onClick={loginGoogle}>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
  },
  card: {
    width: "360px",
    padding: "30px",
    borderRadius: "20px",
    background: "white",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  btn: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    borderRadius: "8px",
    border: "none",
    background: "#007bff",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnSecondary: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    borderRadius: "8px",
    border: "none",
    background: "#28a745",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  googleBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#DB4437",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  link: {
    marginTop: "10px",
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  }
};

export default Login;

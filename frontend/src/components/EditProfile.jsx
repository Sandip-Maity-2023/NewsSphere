// EditProfile.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

function EditProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [preferences, setPreferences] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return (window.location.href = "/login");

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setFirstName(data.firstName || "");
        setAge(data.age || "");
        setPreferences(data.preferences?.join(", ") || "");
        setPhoto(data.photo || "");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // SAVE PROFILE UPDATES
  const saveProfile = async () => {
    try {
      const user = auth.currentUser;

      await updateDoc(doc(db, "users", user.uid), {
        firstName,
        age,
        preferences: preferences.length
          ? preferences.split(",").map((p) => p.trim())
          : [],
        photo,
      });

      // Update Firebase Auth displayName + photoURL
      await updateProfile(user, {
        displayName: firstName,
        photoURL: photo,
      });

      alert("Profile updated successfully!");
      window.location.href = "/profile";

    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Edit Profile</h2>

        <img
          src={photo || "https://via.placeholder.com/150"}
          alt="preview"
          style={styles.avatar}
        />

        <input
          placeholder="Profile Photo URL"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Preferences (comma separated)"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          style={styles.input}
        />

        <button style={styles.btn} onClick={saveProfile}>
          Save Changes
        </button>

        <button
          style={styles.backBtn}
          onClick={() => (window.location.href = "/profile")}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: "50px",
  },
  card: {
    width: "360px",
    padding: "30px",
    borderRadius: "20px",
    background: "white",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "15px",
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
    marginTop: "20px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  backBtn: {
    width: "100%",
    padding: "15px",
    marginTop: "10px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default EditProfile;

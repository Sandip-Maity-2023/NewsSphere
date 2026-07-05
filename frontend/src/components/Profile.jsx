// Profile.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserDetails(snap.data());
      } else {
        console.log("User data missing in Firestore");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img
          src={userDetails.photo || "https://via.placeholder.com/150"}
          style={styles.avatar}
          alt="User"
        />

        <h2>Welcome, {userDetails.firstName}</h2>

        <p><b>Email:</b> {userDetails.email}</p>
        <p><b>Age:</b> {userDetails.age || "Not provided"}</p>
        
        <p>
          <b>Preferences:</b><br />
          {userDetails.preferences?.length ? (
            userDetails.preferences.join(", ")
          ) : (
            "No preferences added"
          )}
        </p>

        <button
  style={styles.editBtn}
  onClick={() => (window.location.href = "/edit-profile")}
>
  Edit Profile
</button>

<button style={styles.logoutBtn} onClick={logout}>
  Logout
</button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "150px",
    padding: "3px",
    borderRadius: "20px",
    background: "white",
    textAlign: "center",
    fontSize: "10px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
  },
  avatar: {
    width: "100px",
    height: "50px",
    borderRadius: "50%",
    marginBottom: "2px",
    objectFit: "cover",
  },
  logoutBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "5px",
    borderRadius: "10px",
    background: "#d9534f",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  
};

export default Profile;

import { signOut } from "firebase/auth";
import { auth } from "./Firebase";

const Logout = ({ onLogout }) => {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();   // Notify parent (App.jsx)
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <button 
      style={{
        position: "fixed",
        top: "150px",
        right: "10px",
        padding: "10px 20px",
        background: "red",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px"
      }}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default Logout;

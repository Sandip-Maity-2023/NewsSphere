// import "./App.css";
// import Newsapp from "./components/Newsapp";
// import CommunityBoard from "./components/CommunityBoard";
// import Footer from "./components/Footer";
// import { signOut } from "firebase/auth";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Login from "./components/Login";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useState, useEffect } from "react";
// import { auth } from "./components/Firebase";

// function App() {
//   const [user, setUser] = useState(null);
//   const [activeView, setActiveView] = useState("news");

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setUser(user);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await signOut(auth);
//     setUser(null);
//   };

//   // If NOT logged in → show login page
//   if (!user) return <Login onLogin={setUser} />;

//   return (
//     <>
//       <div
//         style={{
//           position: "fixed",
//           top: "20px",
//           right: "20px",
//           zIndex: 2000,
//         }}
//       >
//         <button
//           onClick={handleLogout}
//           style={{
//             background: "linear-gradient(135deg, #ef4444, #dc2626)",
//             border: "none",
//             padding: "12px 18px",
//             borderRadius: "999px",
//             color: "white",
//             cursor: "pointer",
//             fontWeight: 800,
//             boxShadow: "0 12px 24px rgba(220, 38, 38, 0.24)",
//           }}
//         >
//           Logout
//         </button>
//       </div>

//       <div
//         style={{
//           maxWidth: "1180px",
//           margin: "0 auto",
//           padding: "20px 20px 0",
//         }}
//       >
//         <div
//           style={{
//             display: "inline-flex",
//             gap: "10px",
//             margin: "50px 10px 10px 20px",
//             padding: "8px",
//             borderRadius: "999px",
//             background: "rgba(15, 23, 42, 0.9)",
//             boxShadow: "0 16px 34px rgba(15, 23, 42, 0.18)",
//           }}
//         >
//           <button
//             onClick={() => setActiveView("news")}
//             style={{
//               border: "none",
//               background: activeView === "news" ? "#fff" : "transparent",
//               color: activeView === "news" ? "#0f172a" : "#e2e8f0",
//               padding: "12px 18px",
//               borderRadius: "999px",
//               fontWeight: 800,
//               cursor: "pointer",
//             }}
//           >
//             News Feed
//           </button>
//           <button
//             onClick={() => setActiveView("community")}
//             style={{
//               border: "none",
//               background: activeView === "community" ? "#fff" : "transparent",
//               color: activeView === "community" ? "#0f172a" : "#e2e8f0",
//               padding: "12px 18px",
//               borderRadius: "999px",
//               fontWeight: 800,
//               cursor: "pointer",
//             }}
//           >
//             Community
//           </button>
//         </div>
//       </div>

//       {activeView === "news" ? <Newsapp user={user} /> : <CommunityBoard user={user} />}

//       <Footer />

//       <ToastContainer />
//     </>
//   );
// }

// export default App;


import "./App.css";
import Newsapp from "./components/Newsapp";
import CommunityBoard from "./components/CommunityBoard";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

function App() {
  const [activeView, setActiveView] = useState("news");

  // Providing a clean placeholder layout context to keep the underlying components happy
  const mockUser = {
    uid: "guest-user",
    displayName: "Guest Reader",
    email: "guest@newssphere.local",
  };

  return (
    <>
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "20px 20px 0",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: "10px",
            margin: "50px 10px 10px 20px",
            padding: "8px",
            borderRadius: "999px",
            background: "rgba(15, 23, 42, 0.9)",
            boxShadow: "0 16px 34px rgba(15, 23, 42, 0.18)",
          }}
        >
          <button
            onClick={() => setActiveView("news")}
            style={{
              border: "none",
              background: activeView === "news" ? "#fff" : "transparent",
              color: activeView === "news" ? "#0f172a" : "#e2e8f0",
              padding: "12px 18px",
              borderRadius: "999px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            News Feed
          </button>
          <button
            onClick={() => setActiveView("community")}
            style={{
              border: "none",
              background: activeView === "community" ? "#fff" : "transparent",
              color: activeView === "community" ? "#0f172a" : "#e2e8f0",
              padding: "12px 18px",
              borderRadius: "999px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Community
          </button>
        </div>
      </div>

      {activeView === "news" ? (
        <Newsapp user={mockUser} />
      ) : (
        <CommunityBoard user={mockUser} />
      )}

      <Footer />

      <ToastContainer />
    </>
  );
}

export default App;

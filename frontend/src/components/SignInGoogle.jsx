import { signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "./Firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";
import googleLogo from "../assets/google.png";

function SignInwithGoogle() {
  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          firstName: user.displayName,
          lastName: "",
          photo: user.photoURL,
          age: null,
          preferences: [],
          lastLogin: new Date(),
        },
        { merge: true }
      );

      toast.success("Logged in Successfully", { position: "top-center" });

      window.location.href = "/profile";

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p>-- Or continue with --</p>
      <img
        src={googleLogo}
        width="60%"
        style={{ cursor: "pointer" }}
        onClick={googleLogin}
      />
    </div>
  );
}

export default SignInwithGoogle;

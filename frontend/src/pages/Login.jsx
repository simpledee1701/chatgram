import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";

function Login() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User signed in:", user);
      navigate("/home");
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80 text-center">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <button
          onClick={handleGoogleSignIn}
          className="bg-red-500 text-white p-2 w-full rounded hover:bg-red-600"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;

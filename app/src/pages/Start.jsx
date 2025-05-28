import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebaseConfig";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { setPersistence, browserSessionPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, getDoc } from 'firebase/firestore'

function Start() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkUserProfile = async () => {
      if (authLoading) return; // Wait until Firebase auth state is resolved

      if (isAuthenticated && auth.currentUser) {
        setLoading(true); // Show loading while checking Firestore
        const db = getFirestore();
        const userDocRef = doc(db, 'users', auth.currentUser.uid); // Use UID as doc ID
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            navigate("/chat"); // User profile exists, go to chat
          } else {
            navigate("/profile-setup"); // User profile doesn't exist, go to setup
          }
        } catch (firestoreError) {
          console.error("Error checking user profile in Firestore:", firestoreError.message);
          setErrors({ general: "Failed to check user profile. Please try again." });
          // If there's a Firestore error, keep user on start page or handle appropriately
        } finally {
          setLoading(false);
        }
      }
    };

    checkUserProfile();
  }, [isAuthenticated, authLoading, navigate]); // Depend on isAuthenticated and authLoading

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrors({}); // Clear previous errors

      // Set persistence based on remember me checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Update the user in the AuthContext

      // After successful sign-in, the useEffect will handle redirection based on profile existence
    } catch (error) {
      console.error("Error during Google sign-in:", error.message);
      let errorMessage = error.message;

      // More user-friendly error messages
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Google sign-in popup was closed. Please try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Another Google sign-in request is in progress. Please wait.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = 'An unexpected error occurred during Google sign-in.';
      }
      setErrors({ general: errorMessage });
      setLoading(false);
    }
  };

  // If authentication is still loading, show a simple spinner
  if (authLoading || loading) { // Include local loading state for Firestore check
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Only show the sign-in button if not authenticated
  if (isAuthenticated) {
    return null; // Or a message "Redirecting..."
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Branding and illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 to-black flex flex-col justify-center items-center relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl animate-float1"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-900/20 rounded-full blur-3xl animate-float2"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl animate-float3"></div>
        </div>

        <div className="max-w-md mx-auto z-10 px-8 py-12 w-full">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-white/10">
              <svg
                className="w-14 h-14 text-purple-400"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 12H8.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 12H16.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-300 leading-[1.3] overflow-visible relative pb-2"
          >
            Chatgram
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-gray-300 text-center mb-10 max-w-sm mx-auto"
          >
            Secure messaging with end-to-end encryption and privacy focus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="hidden md:block"
          >
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/10">
              <div className="flex items-start mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex-shrink-0 shadow-md"></div>
                <div className="ml-3 bg-gray-800/60 rounded-2xl p-4 rounded-tl-none max-w-xs shadow-sm">
                  <p className="text-sm text-gray-100">Hey there! 👋 Ready to chat securely?</p>
                  <p className="text-xs text-gray-400 mt-1">10:24 AM</p>
                </div>
              </div>
              <div className="flex items-start mb-6 justify-end">
                <div className="mr-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 rounded-tr-none max-w-xs shadow-md">
                  <p className="text-sm text-white">Absolutely! Privacy first!</p>
                  <p className="text-xs text-indigo-200 mt-1 text-right">10:26 AM</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex-shrink-0 shadow-md"></div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex-shrink-0 shadow-md"></div>
                <div className="ml-3 bg-gray-800/60 rounded-2xl p-4 rounded-tl-none max-w-xs shadow-sm">
                  <p className="text-sm text-gray-100">Let's get started...</p>
                  <div className="flex items-center mt-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    <p className="text-xs text-gray-400">End-to-end encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Auth forms */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex items-center justify-center bg-gray-900 p-4"
      >
        <div className="max-w-md w-full px-4 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="google-auth" // Fixed key as we only have one main form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  Sign In to Chatgram
                </h2>
                <p className="text-gray-400">
                  Access your secure messages
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-8 border-0"
              >
                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="relative flex items-center justify-center w-full py-4 px-6 rounded-xl border-0 bg-gray-700/50 text-gray-100 hover:bg-gray-700 hover:shadow-lg transition-all duration-300 mb-6 overflow-hidden group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 text-purple-400 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-purple-400 font-medium">Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span className="absolute left-0 top-0 w-0 h-full bg-gradient-to-r from-purple-600 to-indigo-600 -z-10 group-hover:w-full transition-all duration-500 ease-out"></span>
                      <svg
                        className="w-6 h-6 mr-3 transition-transform group-hover:scale-110 duration-300"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#EA4335"
                          d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                        />
                        <path
                          fill="#4285F4"
                          d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                        />
                      </svg>
                      <span className="font-medium group-hover:text-white transition-colors duration-300">
                        Continue with Google
                      </span>
                    </>
                  )}
                </button>

                {errors.general && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4 text-center">
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="flex items-center justify-center mt-6">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-0 bg-gray-700 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Keep me signed in
                  </label>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default Start;
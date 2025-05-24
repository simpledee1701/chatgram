import { useNavigate } from "react-router-dom";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, provider } from "../firebase/firebaseConfig";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { setPersistence, browserSessionPersistence, browserLocalPersistence } from "firebase/auth";

function Start() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during sign-in:", error.message);
      setErrors({ general: error.message });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      // Set persistence based on remember me
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setUser(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
        setUser({ ...userCredential.user, displayName: formData.name });
      }
    } catch (error) {
      console.error("Error during authentication:", error.message);
      let errorMessage = error.message;

      // More user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      }

      setErrors({ general: errorMessage });
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setErrors({});
  };

  if (authLoading) {
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
              key={isLogin ? 'login' : 'signup'}
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
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-400">
                  {isLogin ? 'Sign in to access your secure messages' : 'Join us for secure messaging'}
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
                      <span className="text-purple-400 font-medium">Processing...</span>
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
                          fill="#4A90E2"
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

                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <p className="mx-4 text-sm text-gray-500">or {isLogin ? 'sign in' : 'sign up'} with email</p>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className={`w-full px-5 py-4 bg-gray-700/50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-gray-100 pl-12 placeholder-gray-500 ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                      />
                      <svg
                        className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {errors.name && <p className="text-red-400 text-sm mt-1 ml-1">{errors.name}</p>}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email address"
                      className={`w-full px-5 py-4 bg-gray-700/50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-gray-100 pl-12 placeholder-gray-500 ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                    />
                    <svg
                      className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {errors.email && <p className="text-red-400 text-sm mt-1 ml-1">{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className={`w-full px-5 py-4 bg-gray-700/50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-gray-100 pl-12 placeholder-gray-500 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                    />
                    <svg
                      className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {errors.password && <p className="text-red-400 text-sm mt-1 ml-1">{errors.password}</p>}
                  </div>

                  {!isLogin && (
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        className={`w-full px-5 py-4 bg-gray-700/50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-gray-100 pl-12 placeholder-gray-500 ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`}
                      />
                      <svg
                        className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      {errors.confirmPassword && <p className="text-red-400 text-sm mt-1 ml-1">{errors.confirmPassword}</p>}
                    </div>
                  )}

                  {errors.general && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{errors.general}</p>
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-0 bg-gray-700 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                          Remember me
                        </label>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
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
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </div>
                    ) : (
                      isLogin ? 'Sign in' : 'Create account'
                    )}
                  </button>
                </form>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center mt-8"
              >
                <p className="text-gray-500">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={toggleForm}
                    className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default Start;
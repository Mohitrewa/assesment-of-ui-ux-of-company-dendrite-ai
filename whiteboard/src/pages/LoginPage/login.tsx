import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../../pages/SingupPage/index'; // Ensure this path is correct
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from '../../utils/Firebase/firebaseConfig'; // Import the default export

const LoginPage: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [signupPasswordVisible, setSignupPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');

  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate(`/dashboard/${user.uid}`); // Redirect to dashboard if user is already logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [auth, navigate]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    return regex.test(pwd);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (!validatePassword(pwd)) {
      setPasswordError(
        'Password must be at least 8 characters long, include an uppercase letter, a number, and a special character'
      );
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setConfirmPassword(pwd);
    if (pwd !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      navigate(`/dashboard/${user.uid}`); // Redirect to home page with user ID in URL
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error logging in: ', error.message);
        setLoginError('Failed to log in, please check your email and password.');
      } else {
        console.error('Unknown error occurred:', error);
        setLoginError('An unknown error occurred.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userRef = doc(db, 'users', user.uid);

        await setDoc(
          userRef,
          {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            provider: 'google',
          },
          { merge: true }
        );

        navigate(`/dashboard/${user.uid}`); // Redirect to home page with user ID in URL
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error signing in with Google: ', error.message);
        setLoginError('Failed to sign in with Google.');
      } else {
        console.error('Unknown error occurred:', error);
        setLoginError('An unknown error occurred.');
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: '1000px',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    height: '500px',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.8s',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const cardFaceStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: 'auto',
    backfaceVisibility: 'hidden',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  };

  const backfaceStyle: React.CSSProperties = {
    ...cardFaceStyle,
    transform: 'rotateY(180deg)',
  };

  const passwordToggleStyle: React.CSSProperties = {
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Login Form */}
        <div style={cardFaceStyle}>
          <h2 className="text-3xl font-semibold text-center text-gray-800">Login</h2>
          <form className="mt-6 space-y-6 w-full" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  style={passwordToggleStyle}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {passwordVisible ? 'Hide' : 'Show'}
                </span>
              </div>
              {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Login
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleFlip}
              className="text-blue-600 hover:text-blue-500 focus:outline-none transition-colors"
            >
              Sign up
            </button>
          </p>
          <h3>OR</h3>
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2 px-4 mt-2 bg-red-700 text-white rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Sign-In With Google
          </button>
        </div>

        {/* Signup Form */}
        <SignupForm
          password={password}
                    confirmPassword={confirmPassword}
                    passwordError={passwordError}
                    confirmPasswordError={confirmPasswordError}
                    signupPasswordVisible={signupPasswordVisible}
                    backfaceStyle={backfaceStyle}
                    passwordToggleStyle={passwordToggleStyle}
                    handlePasswordChange={handlePasswordChange}
                    handleConfirmPasswordChange={handleConfirmPasswordChange}
                    setSignupPasswordVisible={setSignupPasswordVisible}
                    handleFlip={handleFlip}
                />
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/Firebase/firebaseConfig'; // Adjust the path to where you initialize Firebase
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface SignupFormProps {
  password: string;
  confirmPassword: string;
  passwordError?: string;
  confirmPasswordError?: string;
  signupPasswordVisible: boolean;
  backfaceStyle?: React.CSSProperties;
  passwordToggleStyle?: React.CSSProperties;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSignupPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleFlip: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  signupPasswordVisible,
  backfaceStyle,
  passwordToggleStyle,
  handlePasswordChange,
  handleConfirmPasswordChange,
  setSignupPasswordVisible,
  handleFlip
}) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore with the document ID being the user's UID
      await setDoc(doc(db, 'users', user.uid), { // Changed from 'addDoc' to 'setDoc'
        uid: user.uid,
        email,
        // Note: Avoid storing plain passwords; use Firebase Authentication for user authentication
      });

      setLoading(false);
      toast.success('Signup successful!');
      navigate(`/dashboard/${user.uid}`);
    } catch (err: any) {
      console.error('Error signing up: ', err.message);
      setLoading(false);
      setError('Failed to sign up, please try again.');
      toast.error('Failed to sign up, please try again.');
    }
  };

  return (
    <div style={backfaceStyle}>
      <ToastContainer />
      <h2 className="text-3xl font-semibold text-center text-gray-800">Sign Up</h2>
      <form className="mt-6 space-y-6 w-full" onSubmit={handleSignup}>
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <input
              type={signupPasswordVisible ? 'text' : 'password'}
              id="signup-password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span
              onClick={() => setSignupPasswordVisible(!signupPasswordVisible)}
              style={passwordToggleStyle}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            >
              {signupPasswordVisible ? 'Hide' : 'Show'}
            </span>
          </div>
          {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="relative mt-1">
            <input
              type={signupPasswordVisible ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {confirmPasswordError && <p className="text-red-600 text-sm">{confirmPasswordError}</p>}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={handleFlip}
          className="text-blue-600 hover:text-blue-500 focus:outline-none transition-colors"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupForm;
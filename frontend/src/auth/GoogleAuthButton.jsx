import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { auth, googleProvider } from '../context/firebase';
import { signInWithPopup } from 'firebase/auth';

const GoogleAuthButton = ({ onSuccess, onError, disabled = false }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Signed in user:', { email: user.email, name: user.displayName });
      if (onSuccess) onSuccess(user);
    } catch (error) {
      console.error('Google auth error:', { message: error.message, code: error.code });
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={disabled || loading}
      className={`w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <FcGoogle className="h-5 w-5 mr-2" />
      <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
      {loading && <span className="animate-spin h-5 w-5 border-t-2 border-gray-500 rounded-full ml-2"></span>}
    </button>
  );
};

export default GoogleAuthButton;
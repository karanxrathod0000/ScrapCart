import React, { useState } from 'react';
import Spinner from './Spinner';
import { isFirebaseConfigured } from '../services/firebaseConfig';
import { User } from '../types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setLoading(true);
        setError(null);

        // Simulate Firebase Auth calls
        try {
            await new Promise(res => setTimeout(res, 1000)); // Network delay
            if (isFirebaseConfigured()) {
                 // In a real app:
                 // let userCredential;
                 // if (isSigningUp) {
                 //     userCredential = await createUserWithEmailAndPassword(auth, email, password);
                 // } else {
                 //     userCredential = await signInWithEmailAndPassword(auth, email, password);
                 // }
                 // onLoginSuccess(userCredential.user);
            } else {
                // Mock success if not configured
                console.log(`${isSigningUp ? 'Signing up' : 'Logging in'} with ${email}... (mocked)`);
                onLoginSuccess({ uid: `mock_${Date.now()}`, email: email, displayName: email.split('@')[0] });
            }
        } catch (err: any) {
            // In a real app, you'd parse err.code
            setError(err.message || `Failed to ${isSigningUp ? 'sign up' : 'log in'}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(res => setTimeout(res, 1000));
             if (isFirebaseConfigured()) {
                // In a real app:
                // const result = await signInWithPopup(auth, googleProvider);
                // onLoginSuccess(result.user);
             } else {
                 console.log("Signing in with Google... (mocked)");
                 onLoginSuccess({ uid: `mock_google_${Date.now()}`, email: 'google.user@example.com', displayName: 'Google User' });
             }
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                        {isSigningUp ? 'Create an Account' : 'Welcome Back'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{' '}
                        <button onClick={() => setIsSigningUp(!isSigningUp)} className="font-medium text-green-600 hover:text-green-500">
                            {isSigningUp ? 'log in to your account' : 'start selling for free'}
                        </button>
                    </p>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                     <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.658C34.566 5.854 29.563 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.566 5.854 29.563 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 30.638 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
                    </svg>
                    Sign in with Google
                </button>

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with email</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center">
                        {loading && <Spinner className="w-5 h-5 mr-2" />}
                        {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Log In')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
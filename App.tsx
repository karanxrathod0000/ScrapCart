import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import CreateListing from './components/CreateListing';
import BrowseListings from './components/BrowseListings';
import Login from './components/Login';
import Spinner from './components/Spinner';
import { ShoppingCart, LogOut, Tag } from 'lucide-react';
import { isFirebaseConfigured } from './services/firebaseConfig';


// Mock user type, in a real app this would be from the Firebase SDK
type User = {
    uid: string;
    email: string | null;
};

export type View = 'home' | 'create-listing' | 'browse-listings';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('home');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Simulate checking auth state on load
    const [showConfigWarning, setShowConfigWarning] = useState(false);

    // Simulate onAuthStateChanged
    useEffect(() => {
        setShowConfigWarning(!isFirebaseConfigured());

        setLoading(true);
        const unsubscribe = setTimeout(() => {
            // To test the logged-in state, you can manually set a user object here:
            // setUser({ uid: 'test-user-123', email: 'test@example.com' });
            setLoading(false);
        }, 1000); // Simulate auth check delay

        return () => clearTimeout(unsubscribe);
    }, []);

    const handleLogout = () => {
        // In a real app: await signOut(auth);
        setUser(null);
        setCurrentView('home');
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><Spinner className="w-12 h-12 text-green-500" /></div>;
        }

        if (!user) {
            return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
        }

        switch (currentView) {
            case 'home':
                return <Home setView={setCurrentView} />;
            case 'create-listing':
                return <CreateListing setView={setCurrentView} user={user} />;
            case 'browse-listings':
                 return <BrowseListings setView={setCurrentView} user={user} />;
            default:
                return <Home setView={setCurrentView} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            {showConfigWarning && (
                 <div className="bg-yellow-400 text-yellow-900 text-center p-2 text-sm font-semibold">
                    Warning: Firebase is not configured. Please add your credentials to 
                    <code className="bg-yellow-300 p-1 rounded">services/firebaseConfig.ts</code> to enable backend features.
                </div>
            )}
            <header className="bg-white dark:bg-gray-800/50 shadow-sm sticky top-0 z-10">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div 
                        className="text-2xl font-bold text-green-600 dark:text-green-400 cursor-pointer"
                        onClick={() => user && setCurrentView('home')}
                    >
                        ScrapKart
                    </div>
                    {user && (
                        <div className="flex items-center gap-4">
                             <button 
                                onClick={() => setCurrentView('browse-listings')}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ShoppingCart size={20} />
                                Buy
                            </button>
                            <button 
                                onClick={() => setCurrentView('create-listing')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                            >
                                <Tag size={16}/>
                                Sell Scrap
                            </button>
                             <button 
                                onClick={handleLogout}
                                className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </nav>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                {renderContent()}
            </main>
             <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} ScrapKart Marketplace. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;

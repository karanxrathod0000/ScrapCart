import React, { useState, useRef, useEffect } from 'react';
import { User, View, ListingFilter } from '../types';
import { UserCircle, LogOut, Package, ShoppingBag } from 'lucide-react';

interface ProfileDropdownProps {
    user: User;
    onNavigate: (view: View, filter: ListingFilter) => void;
    onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onNavigate, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNavigation = (view: View, filter: ListingFilter) => {
        onNavigate(view, filter);
        setIsOpen(false);
    };
    
    const handleLogoutClick = () => {
        onLogout();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <UserCircle size={28} className="text-gray-600 dark:text-gray-300"/>
                <span className="hidden sm:block font-semibold text-sm pr-2">{user.displayName || user.email}</span>
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                            <p className="font-semibold text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                            <p className="truncate font-medium">{user.email}</p>
                        </div>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handleNavigation('browse-listings', 'my-listings'); }} 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            <Package size={16} /> My Listings
                        </a>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handleNavigation('browse-listings', 'my-purchases'); }} 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            <ShoppingBag size={16} /> My Purchases
                        </a>
                        <div className="border-t dark:border-gray-700 my-1"></div>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handleLogoutClick(); }} 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 w-full"
                            role="menuitem"
                        >
                            <LogOut size={16} /> Logout
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;

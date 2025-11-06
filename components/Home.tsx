import React from 'react';
// Fix: Corrected import path for types.
import { View, ListingFilter } from '../types';
import { Tag, Search } from 'lucide-react';

interface HomeProps {
    onNavigate: (view: View, filter?: ListingFilter) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    return (
        <div className="text-center py-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                The AI-Powered Scrap Marketplace
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Turn your trash into treasure. Buy and sell recyclable materials with the help of powerful AI tools.
            </p>
            <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12 gap-4">
                <button
                    onClick={() => onNavigate('create-listing')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                >
                    <Tag className="mr-2" />
                    Sell Your Scrap
                </button>
                <button
                    onClick={() => onNavigate('browse-listings')}
                    className="mt-3 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg md:px-10 sm:mt-0"
                >
                    <Search className="mr-2" />
                    Buy Materials
                </button>
            </div>
        </div>
    );
};

export default Home;
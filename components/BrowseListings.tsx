import React, { useState, useEffect } from 'react';
import { getListings, updateListingStatus } from '../services/firestoreService';
import { Listing, View, ListingFilter, User } from '../types';
import Spinner from './Spinner';
import CheckoutModal from './CheckoutModal';
import { Tag, Weight, MapPin, CheckCircle, Info, Search } from 'lucide-react';

interface BrowseListingsProps {
    onNavigate: (view: View, filter?: ListingFilter) => void;
    user: User | null;
    filter: ListingFilter;
}

const ListingCard: React.FC<{ listing: Listing; onBuyNow: (listing: Listing) => void; currentUser: User | null; }> = ({ listing, onBuyNow, currentUser }) => {
    const displayImage = listing.enhancedImageUrl || listing.imageUrl;
    const isSold = listing.status === 'Sold';
    const isOwner = currentUser?.uid === listing.sellerId;

    return (
        <div className={`bg-white dark:bg-gray-800/50 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isSold ? 'grayscale opacity-60' : 'transform hover:-translate-y-1'}`}>
            <div className="relative">
                <img src={displayImage} alt={listing.title} className="w-full h-48 object-cover" />
                 {isSold && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold bg-red-600 px-4 py-2 rounded-md">SOLD</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{listing.title}</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 my-2">₹{listing.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10 overflow-hidden">{listing.description}</p>
                
                <div className="text-xs text-gray-500 dark:text-gray-300 space-y-2">
                   <div className="flex items-center gap-2">
                       <Tag size={14} /> <span>{listing.scrapTypes.join(', ')}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <Weight size={14} /> <span>{listing.estimatedWeight} kg</span>
                   </div>
                    <div className="flex items-center gap-2">
                       <MapPin size={14} /> <span>{listing.addressString}</span>
                   </div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
                <div className="relative group">
                     <button 
                        onClick={() => onBuyNow(listing)}
                        disabled={isSold || isOwner || !currentUser}
                        className="w-full px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2
                                   disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed
                                   bg-green-600 text-white hover:bg-green-700"
                    >
                        {isSold ? <><CheckCircle size={18}/> Sold</> : isOwner ? 'Your Listing' : 'Buy Now'}
                    </button>
                    {!currentUser && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                           <Info size={14}/> Please log in to buy items.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const BrowseListings: React.FC<BrowseListingsProps> = ({ onNavigate, user, filter }) => {
    const [allListings, setAllListings] = useState<Listing[]>([]);
    const [displayListings, setDisplayListings] = useState<Listing[]>([]);
    const [locationQuery, setLocationQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const fetchedListings = await getListings();
                
                let baseList = fetchedListings;
                if (filter === 'my-listings') {
                    baseList = fetchedListings.filter(l => l.sellerId === user?.uid);
                } else if (filter === 'my-purchases') {
                    baseList = fetchedListings.filter(l => l.buyerId === user?.uid);
                }
                
                setAllListings(baseList);
                setDisplayListings(baseList);
                setLocationQuery(''); // Reset search on filter change
            } catch (err) {
                setError("Failed to load listings. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filter, user?.uid]);
    
    const handleLocationSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationQuery.trim()) {
            setDisplayListings(allListings);
            return;
        }
        const lowerCaseQuery = locationQuery.toLowerCase();
        const filtered = allListings.filter(listing => 
            listing.addressString.toLowerCase().includes(lowerCaseQuery)
        );
        setDisplayListings(filtered);
    };

    const clearSearch = () => {
        setLocationQuery('');
        setDisplayListings(allListings);
    };

    const getPageTitle = () => {
        if (filter === 'my-listings') return "My Listings";
        if (filter === 'my-purchases') return "My Purchases";
        return "Browse Scrap Listings";
    };

    const handleBuyNowClick = (listing: Listing) => {
        if (!user) {
            alert("Please log in to purchase an item.");
            return;
        }
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const handleConfirmPurchase = async (listingId: string) => {
        if (!user) {
            setError("You must be logged in to complete a purchase.");
            return;
        }
        try {
            const updatedListing = await updateListingStatus(listingId, 'Sold', user.uid);
            if (updatedListing) {
                setAllListings(prev => prev.map(l => l.id === listingId ? updatedListing : l));
                setDisplayListings(prev => prev.map(l => l.id === listingId ? updatedListing : l));
            }
            setIsModalOpen(false);
            setSelectedListing(null);
            alert("Purchase successful! The seller has been notified.");
        } catch (err) {
             setError(err instanceof Error ? err.message : "Failed to complete purchase.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner className="w-12 h-12 text-green-500" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold whitespace-nowrap">{getPageTitle()}</h1>
                {filter !== 'my-purchases' && (
                     <form onSubmit={handleLocationSearch} className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow">
                           <input
                                type="text"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                placeholder="Enter city or pincode..."
                                className="w-full sm:w-64 p-2 pl-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                            />
                        </div>
                         <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                            <Search size={18} />
                        </button>
                        {locationQuery && (
                            <button type="button" onClick={clearSearch} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors">
                                Clear
                            </button>
                        )}
                    </form>
                )}
            </div>
            {displayListings.length === 0 ? (
                <div className="text-center py-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                    <h2 className="text-2xl font-semibold">
                        {locationQuery ? 'No Listings Found For Your Location' : (filter ? 'You have no listings here' : 'No Listings Found')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {locationQuery
                            ? 'Try a different search, or clear the filter to see all available listings.'
                            : (filter ? 'Items you buy or sell will appear here.' : 'Be the first to sell! Create a listing today.')
                        }
                    </p>
                    {locationQuery ? (
                         <button 
                            onClick={clearSearch}
                            className="mt-6 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                        >
                            Clear Search
                        </button>
                    ) : (
                        !filter && <button 
                            onClick={() => onNavigate('create-listing')}
                            className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                        >
                            Sell Your Scrap
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} onBuyNow={handleBuyNowClick} currentUser={user} />
                    ))}
                </div>
            )}

            {isModalOpen && selectedListing && user && (
                <CheckoutModal
                    listing={selectedListing}
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onConfirmPurchase={handleConfirmPurchase}
                />
            )}
        </div>
    );
};

export default BrowseListings;
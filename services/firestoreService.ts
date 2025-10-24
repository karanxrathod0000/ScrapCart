import { Listing, Address } from '../types';

// This is a mock/stub for what Firestore's GeoPoint would be.
export interface GeoPoint {
    latitude: number;
    longitude: number;
}

// In a real app, these would be the actual Firebase SDK functions.
// We are mocking them to simulate the behavior.

const MOCK_DB: {
    listings: Listing[],
    users: { [key: string]: { addresses: Address[] } }
} = {
    listings: [],
    users: {},
};

const MOCK_STORAGE = {};

// Simulate fetching a collection of documents
export const getListings = async (): Promise<Listing[]> => {
    console.log("Fetching listings from MOCK Firebase...");
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    // In a real app: const querySnapshot = await getDocs(collection(db, "listings"));
    const listings = MOCK_DB.listings;
    // Sort by newest first
    return [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Simulate adding a new document
export const addListing = async (listingData: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing> => {
    console.log("Adding new listing to MOCK Firebase...");
    await new Promise(res => setTimeout(res, 1000)); // Simulate network delay
    
    const newListing: Listing = {
        ...listingData,
        id: `listing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
    };
    
    MOCK_DB.listings.unshift(newListing); // Add to the beginning
    
    return newListing;
};

// Simulate updating a document's status
export const updateListingStatus = async (listingId: string, status: 'Sold', buyerId: string): Promise<Listing | null> => {
    console.log(`Updating listing ${listingId} to ${status} for buyer ${buyerId}...`);
    await new Promise(res => setTimeout(res, 1500)); // Simulate payment processing delay
    
    let updatedListing: Listing | null = null;
    MOCK_DB.listings = MOCK_DB.listings.map(listing => {
        if (listing.id === listingId) {
            updatedListing = {
                ...listing,
                status,
                buyerId,
                soldAt: new Date().toISOString(),
            };
            return updatedListing;
        }
        return listing;
    });

    if (updatedListing) {
        return updatedListing;
    }

    throw new Error("Listing not found for update.");
};

// --- SIMULATED USER ADDRESS API ---

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
    console.log(`Fetching addresses for user ${userId} from MOCK Firebase...`);
    await new Promise(res => setTimeout(res, 300));
    return MOCK_DB.users[userId]?.addresses || [];
};

export const addUserAddress = async (userId: string, addressData: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
    console.log(`Adding new address for user ${userId} to MOCK Firebase...`);
    await new Promise(res => setTimeout(res, 500));
    
    if (!MOCK_DB.users[userId]) {
        MOCK_DB.users[userId] = { addresses: [] };
    }

    const newAddress: Address = {
        ...addressData,
        userId: userId,
        id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    MOCK_DB.users[userId].addresses.push(newAddress);
    return newAddress;
};


// --- SIMULATED FIREBASE STORAGE API ---

// Simulate uploading a file and getting a URL
export const uploadImage = async (file: File, userId: string): Promise<string> => {
    console.log(`"Uploading" image to MOCK Storage for user ${userId}: ${file.name}`);
    // In a real app, this would upload to Firebase Storage and return the https:// URL.
    // For simulation, we'll convert the file to a Base64 data URL.
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

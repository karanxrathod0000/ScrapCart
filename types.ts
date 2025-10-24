import { GeoPoint } from './services/firestoreService'; // Mock GeoPoint

export interface Listing {
  id: string;
  sellerId: string; // Will be a placeholder for now
  buyerId?: string | null;
  title: string;
  description: string;
  scrapTypes: string[];
  estimatedWeight: number;
  price: number;
  imageUrl: string;
  enhancedImageUrl?: string;
  location?: GeoPoint;
  addressString: string; // Placeholder
  status: 'Available' | 'Sold' | 'Completed' | 'Cancelled';
  createdAt: string; // ISO String for easier serialization
  soldAt?: string | null;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

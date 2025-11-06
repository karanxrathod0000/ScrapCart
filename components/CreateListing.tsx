import React, { useState } from 'react';
import { analyzeImageForScrap, enhanceImage, suggestPrice, generateDescription } from '../services/geminiService';
import { addListing, uploadImage } from '../services/firestoreService';
import Spinner from './Spinner';
import { Sparkles, Bot, Upload, Lightbulb } from 'lucide-react';
import { Listing, View, ListingFilter, User } from '../types';

interface CreateListingProps {
    onNavigate: (view: View, filter?: ListingFilter) => void;
    user: User;
}

const CreateListing: React.FC<CreateListingProps> = ({ onNavigate, user }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
    const [scrapType, setScrapType] = useState('');
    const [quality, setQuality] = useState('');
    const [weight, setWeight] = useState('');
    const [price, setPrice] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setEnhancedImageUrl(null);
            // Reset fields on new image
            setScrapType('');
            setQuality('');
            setWeight('');
            setPrice('');
            setTitle('');
            setDescription('');
        }
    };
    
    const handleAIAutofill = async () => {
        if (!imageFile) {
            setError("Please upload an image first.");
            return;
        }
        setLoading(prev => ({ ...prev, autofill: true }));
        setError(null);

        try {
            // 1. Analyze image for type, quality, and weight
            const analysis = await analyzeImageForScrap(imageFile);
            setScrapType(analysis.scrapType);
            setQuality(analysis.quality);
            setWeight(analysis.estimatedWeight.toString());

            // 2. Concurrently get price and description based on analysis
            const weightValue = analysis.estimatedWeight;
            if (weightValue <= 0) {
                 throw new Error("AI could not estimate a valid weight. Please enter it manually.");
            }

            const pricePromise = suggestPrice(analysis.scrapType, weightValue);
            const descriptionPromise = generateDescription(analysis.scrapType, analysis.quality, weightValue);

            const [suggestedPrice, content] = await Promise.all([pricePromise, descriptionPromise]);
            
            setPrice(suggestedPrice.toString());
            setTitle(content.title);
            setDescription(content.description);

        } catch (err) {
            setError(err instanceof Error ? err.message : `An error occurred during AI Autofill.`);
        } finally {
            setLoading(prev => ({ ...prev, autofill: false }));
        }
    };


    const handleAIAssist = async (action: 'enhance' | 'price' | 'describe') => {
        setLoading(prev => ({ ...prev, [action]: true }));
        setError(null);
        try {
            switch (action) {
                case 'enhance':
                    if (!imageFile) throw new Error("Please upload an image first.");
                    const enhanced = await enhanceImage(imageFile);
                    setEnhancedImageUrl(enhanced);
                    break;
                case 'price':
                    if (!scrapType || !weight) throw new Error("Please ensure Scrap Type and Weight are filled in.");
                    const suggested = await suggestPrice(scrapType, parseFloat(weight));
                    setPrice(suggested.toString());
                    break;
                case 'describe':
                    if (!scrapType || !quality || !weight) throw new Error("Please ensure Scrap Type, Quality, and Weight are filled in.");
                    const content = await generateDescription(scrapType, quality, parseFloat(weight));
                    setTitle(content.title);
                    setDescription(content.description);
                    break;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : `An error occurred during ${action}.`);
        } finally {
            setLoading(prev => ({ ...prev, [action]: false }));
        }
    };

    const handleSubmit = async () => {
        if (!imageFile || !title || !price || !weight || !scrapType) {
            setError("Please fill out all required fields and upload an image.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            // "Upload" the original image to get a URL
            const uploadedImageUrl = await uploadImage(imageFile, user.uid);

            const newListingData: Omit<Listing, 'id' | 'createdAt'> = {
                sellerId: user.uid,
                title,
                description,
                scrapTypes: [scrapType],
                estimatedWeight: parseFloat(weight),
                price: parseFloat(price),
                imageUrl: uploadedImageUrl,
                enhancedImageUrl: enhancedImageUrl ?? undefined,
                addressString: "Pune, Maharashtra", // Placeholder address
                status: 'Available',
            };

            await addListing(newListingData);
            alert("Listing created successfully!");
            onNavigate('browse-listings');

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create listing.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Create a New Listing</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Let our AI assistant help you sell your scrap faster.</p>

            {error && <div className="p-4 mb-6 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">1. Upload & Analyze</h2>
                    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border dark:border-gray-600">
                        {enhancedImageUrl ? <img src={enhancedImageUrl} alt="Enhanced" className="w-full h-full object-contain" /> : imageUrl ? <img src={imageUrl} alt="Original" className="w-full h-full object-contain" /> : <Upload className="w-16 h-16 text-gray-400" />}
                    </div>
                     <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/50 dark:file:text-green-300 dark:hover:file:bg-green-900" />
                    
                    <button onClick={handleAIAutofill} disabled={!imageFile || loading.autofill || isSubmitting} className="w-full text-lg flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors">
                        {loading.autofill ? <Spinner className="w-6 h-6" /> : <Sparkles size={20} />} 
                        Autofill Details with AI
                    </button>
                    <button onClick={() => handleAIAssist('enhance')} disabled={!imageFile || loading.enhance || isSubmitting} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 transition-colors">
                        {loading.enhance ? <Spinner className="w-4 h-4" /> : <Sparkles size={16} />} Enhance Image
                    </button>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">2. Review Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scrap Type</label>
                                <input type="text" value={scrapType} onChange={e => setScrapType(e.target.value)} placeholder="e.g., Cardboard" className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quality</label>
                                <input type="text" value={quality} onChange={e => setQuality(e.target.value)} placeholder="e.g., Good" className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Est. Weight (kg)</label>
                                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g., 5" className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                                <div className="relative">
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 150" className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                                    <button onClick={() => handleAIAssist('price')} disabled={!scrapType || !weight || loading.price || isSubmitting} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-700 disabled:opacity-50" title="Suggest Price">
                                        {loading.price ? <Spinner className="w-4 h-4" /> : <Lightbulb size={16} className="text-yellow-500" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title & Description</label>
                           <button onClick={() => handleAIAssist('describe')} disabled={!scrapType || !weight || loading.describe || isSubmitting} className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline disabled:opacity-50">
                             {loading.describe ? <Spinner className="w-3 h-3"/> : <Bot size={12}/>} Generate
                           </button>
                        </div>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Listing Title" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mb-2" />
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your item..." rows={4} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                </div>
            </div>
            
            <div className="mt-10 border-t dark:border-gray-600 pt-6 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-lg flex items-center justify-center gap-3 py-3 px-12 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                    {isSubmitting ? <Spinner /> : 'Create Listing'}
                </button>
            </div>
        </div>
    );
};

export default CreateListing;
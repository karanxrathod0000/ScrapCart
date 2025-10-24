import React, { useState, useEffect } from 'react';
import { Listing, Address } from '../types';
import { getUserAddresses, addUserAddress } from '../services/firestoreService';
import Spinner from './Spinner';
import AddressForm from './AddressForm';
import RazorpaySim from './RazorpaySim';
import { X, ChevronLeft, ChevronRight, Home, Truck, ShieldCheck, ShoppingCart } from 'lucide-react';

type User = { uid: string; email: string | null; };
type CheckoutStep = 'address' | 'summary' | 'payment';

interface CheckoutModalProps {
    listing: Listing;
    user: User;
    onClose: () => void;
    onConfirmPurchase: (listingId: string) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ listing, user, onClose, onConfirmPurchase }) => {
    const [step, setStep] = useState<CheckoutStep>('address');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const deliveryFee = 40.00;
    const totalAmount = listing.price + deliveryFee;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const fetchAddresses = async () => {
            try {
                const userAddresses = await getUserAddresses(user.uid);
                setAddresses(userAddresses);
                if (userAddresses.length > 0) {
                    setSelectedAddress(userAddresses[0]);
                } else {
                    setShowNewAddressForm(true); // Force add address if none exist
                }
            } catch (e) {
                setError("Could not load addresses.");
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
        return () => { document.body.style.overflow = 'unset'; };
    }, [user.uid]);

    const handleSaveAddress = async (addressData: Omit<Address, 'id' | 'userId'>) => {
        const newAddress = await addUserAddress(user.uid, addressData);
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddress(newAddress);
        setShowNewAddressForm(false);
    };
    
    const handleFinalPayment = async () => {
        setIsProcessing(true);
        setError('');
        try {
            // Simulate payment processing
            await new Promise(res => setTimeout(res, 2000));
            await onConfirmPurchase(listing.id);
            // Parent handles closing on success
        } catch (e) {
            setError("Payment failed. Please try again.");
            setIsProcessing(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 'address':
                return (
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Home size={20}/> Select Delivery Address</h3>
                        {loadingAddresses && <div className="flex justify-center p-8"><Spinner /></div>}
                        {!loadingAddresses && (
                             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {addresses.map(addr => (
                                    <div key={addr.id} onClick={() => setSelectedAddress(addr)} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500' : 'dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                        <p className="font-bold">{addr.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{addr.line1}, {addr.line2}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{addr.city}, {addr.state} - {addr.pincode}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Phone: {addr.phone}</p>
                                    </div>
                                ))}
                             </div>
                        )}
                        {showNewAddressForm ? (
                            <AddressForm onSave={handleSaveAddress} onCancel={() => addresses.length > 0 && setShowNewAddressForm(false)}/>
                        ) : (
                            <button onClick={() => setShowNewAddressForm(true)} className="w-full mt-4 py-2 text-green-600 dark:text-green-400 font-semibold rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                + Add a New Address
                            </button>
                        )}
                    </div>
                );
            case 'summary':
                return (
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><ShoppingCart size={20}/> Order Summary</h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                             <div className="flex items-start gap-4 mb-4">
                                <img src={listing.enhancedImageUrl || listing.imageUrl} alt={listing.title} className="w-20 h-20 object-cover rounded-md" />
                                <div>
                                    <h4 className="font-bold">{listing.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Seller ID: ...{listing.sellerId.slice(-6)}</p>
                                    <p className="text-lg font-bold text-green-500">₹{listing.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="border-t dark:border-gray-600 pt-4">
                                <h4 className="font-semibold mb-2">Deliver to:</h4>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <p className="font-bold">{selectedAddress?.name}</p>
                                    <p>{selectedAddress?.line1}, {selectedAddress?.city} - {selectedAddress?.pincode}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                            <h4 className="text-lg font-semibold mb-2">Price Details</h4>
                            <div className="flex justify-between"><span>Item Price</span> <span>₹{listing.price.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Delivery Fee</span> <span>₹{deliveryFee.toFixed(2)}</span></div>
                            <div className="border-t dark:border-gray-600 my-2"></div>
                            <div className="flex justify-between font-bold text-base"><span>Total Amount</span> <span>₹{totalAmount.toFixed(2)}</span></div>
                        </div>
                    </div>
                );
             case 'payment':
                return (
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><ShieldCheck size={20}/> Choose Payment Method</h3>
                        <RazorpaySim amount={totalAmount} onPaymentSuccess={handleFinalPayment} isProcessing={isProcessing} />
                    </div>
                );
        }
    };
    
    const STEPS: CheckoutStep[] = ['address', 'summary', 'payment'];
    const currentStepIndex = STEPS.indexOf(step);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Complete Your Purchase</h2>
                    <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"><X size={24} /></button>
                </div>
                
                {/* Step Indicator */}
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 text-sm">
                    <div className={`flex items-center gap-2 ${step === 'address' ? 'text-green-600 font-bold' : 'text-gray-500'}`}><Home size={16}/> Address</div>
                    <ChevronRight size={18} className="text-gray-400"/>
                    <div className={`flex items-center gap-2 ${step === 'summary' ? 'text-green-600 font-bold' : 'text-gray-500'}`}><ShoppingCart size={16}/> Summary</div>
                     <ChevronRight size={18} className="text-gray-400"/>
                    <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-green-600 font-bold' : 'text-gray-500'}`}><ShieldCheck size={16}/> Payment</div>
                </div>

                <div className="p-6 min-h-[300px]">
                    {error && <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}
                    {renderStepContent()}
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-between items-center">
                    <div>
                        {step !== 'address' && <button onClick={() => setStep(STEPS[currentStepIndex - 1])} className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"><ChevronLeft size={18}/> Back</button>}
                    </div>
                    <div>
                        {step !== 'payment' && (
                             <button 
                                onClick={() => setStep(STEPS[currentStepIndex + 1])}
                                disabled={!selectedAddress}
                                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                            >
                                {step === 'summary' ? 'Proceed to Payment' : 'Continue'} <ChevronRight size={18}/>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;

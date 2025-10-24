import React, { useState } from 'react';
import Spinner from './Spinner';
import { CreditCard, Smartphone } from 'lucide-react';

interface RazorpaySimProps {
    amount: number;
    onPaymentSuccess: () => void;
    isProcessing: boolean;
}

type PaymentMethod = 'upi' | 'card';

const RazorpaySim: React.FC<RazorpaySimProps> = ({ amount, onPaymentSuccess, isProcessing }) => {
    const [method, setMethod] = useState<PaymentMethod>('upi');

    return (
        <div className="flex border dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="w-1/3 bg-gray-100 dark:bg-gray-900/50 p-4">
                <h4 className="font-bold text-sm mb-4">PAYMENT METHOD</h4>
                <div className="space-y-1">
                    <button onClick={() => setMethod('upi')} className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 ${method === 'upi' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        <Smartphone size={16}/> UPI
                    </button>
                     <button onClick={() => setMethod('card')} className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 ${method === 'card' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                        <CreditCard size={16}/> Card
                    </button>
                </div>
            </div>
            <div className="w-2/3 p-6">
                {method === 'upi' && (
                    <div>
                        <h5 className="font-semibold mb-4">Pay with UPI</h5>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">UPI ID</label>
                                <input type="text" placeholder="yourname@bank" className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"/>
                            </div>
                            <p className="text-center text-xs text-gray-400">OR</p>
                            <div className="flex justify-center">
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 rounded-lg">
                                    QR Code Placeholder
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {method === 'card' && (
                    <div>
                         <h5 className="font-semibold mb-4">Pay with Card</h5>
                         <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500">Card Number</label>
                                <input type="text" placeholder="0000 0000 0000 0000" className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"/>
                            </div>
                             <div className="flex gap-4">
                               <div className="flex-1">
                                 <label className="text-xs font-medium text-gray-500">Expiry</label>
                                 <input type="text" placeholder="MM/YY" className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"/>
                               </div>
                               <div className="flex-1">
                                 <label className="text-xs font-medium text-gray-500">CVV</label>
                                 <input type="password" placeholder="***" maxLength={3} className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"/>
                               </div>
                             </div>
                         </div>
                    </div>
                )}
                 <button 
                    onClick={onPaymentSuccess}
                    disabled={isProcessing}
                    className="w-full mt-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                    {isProcessing && <Spinner className="w-5 h-5"/>}
                    {isProcessing ? 'Processing...' : `Pay ₹${amount.toFixed(2)} Securely`}
                </button>
            </div>
        </div>
    );
};

export default RazorpaySim;

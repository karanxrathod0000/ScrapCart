import React, { useState } from 'react';
import { Address } from '../types';
import Spinner from './Spinner';

interface AddressFormProps {
    onSave: (addressData: Omit<Address, 'id' | 'userId'>) => Promise<void>;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [line1, setLine1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !line1 || !city || !state || !pincode) {
            setError("All fields are required.");
            return;
        }
        setError('');
        setIsSaving(true);
        try {
            await onSave({ name, phone, line1, city, state, pincode });
        } catch (e) {
            setError("Failed to save address.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-6 border-t dark:border-gray-600 pt-4">
            <h4 className="font-semibold mb-4">Add a New Address</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <input type="text" value={line1} onChange={e => setLine1(e.target.value)} placeholder="Address (House No, Street)" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Pincode" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2">
                        {isSaving && <Spinner className="w-5 h-5"/>}
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;

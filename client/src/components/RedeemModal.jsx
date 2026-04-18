import React, { useState } from 'react';
import axios from 'axios';

const RedeemModal = ({ isOpen, onClose, currentBalance, onRedeemSuccess }) => {
    const [status, setStatus] = useState('selection'); // selection, processing, success, error
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const coupons = [
        {
            id: 'zepto',
            name: 'Zepto Voucher',
            amount: 500,
            image: 'https://b2cstatic.woohoo.in/media/catalog/product/z/e/zepto.png?appId=12',
            description: 'Redeem for 500 credits on Zepto'
        },
        {
            id: 'mmt',
            name: 'MakeMyTrip Voucher',
            amount: 1000,
            image: 'https://promos.makemytrip.com/appfest/2x/580x346-BestWishes-2.png',
            description: 'Redeem for 1000 credits on MMT'
        }
    ];

    const generateFakeCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleRedeem = async (coupon) => {
        if (currentBalance < coupon.amount) {
            setError('Insufficient balance for this voucher.');
            return;
        }

        setStatus('processing');
        setError('');

        try {
            await axios.post('/payment/withdraw', { amount: coupon.amount });
            
            const code = generateFakeCode();
            setGeneratedCode(code);
            setSelectedCoupon(coupon);
            setStatus('success');
            onRedeemSuccess();
        } catch (err) {
            setError(err.response?.data?.msg || 'Redemption failed');
            setStatus('selection');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => status !== 'processing' && onClose()}
            ></div>

            <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl transition-all">
                {status === 'selection' && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Choose Your Reward</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
                        </div>
                        
                        <p className="text-gray-500 mb-8 font-medium">Available Balance: <span className="text-black dark:text-white font-bold">₹{currentBalance}</span></p>

                        <div className="grid grid-cols-1 gap-4">
                            {coupons.map(coupon => (
                                <button
                                    key={coupon.id}
                                    onClick={() => handleRedeem(coupon)}
                                    disabled={currentBalance < coupon.amount}
                                    className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                        currentBalance >= coupon.amount 
                                        ? 'border-gray-100 hover:border-black dark:border-zinc-800' 
                                        : 'opacity-50 grayscale cursor-not-allowed'
                                    }`}
                                >
                                    <img src={coupon.image} alt={coupon.name} className="w-24 h-16 object-cover rounded-lg shadow-sm" />
                                    <div className="text-left">
                                        <h4 className="font-bold text-lg">{coupon.name}</h4>
                                        <p className="text-sm text-gray-500">{coupon.description}</p>
                                        <p className="mt-1 font-black text-black dark:text-white">COST: ₹{coupon.amount}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black text-white p-2 rounded-full">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {error && <p className="mt-4 text-red-500 text-sm font-bold text-center">{error}</p>}
                    </div>
                )}

                {status === 'processing' && (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold uppercase">Processing Redemption...</h3>
                    </div>
                )}

                {status === 'success' && (
                    <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
                        <div className="mb-8 p-4 bg-black rounded-2xl">
                            <img src={selectedCoupon.image} alt="Success" className="w-full h-40 object-cover rounded-xl" />
                        </div>
                        
                        <h2 className="text-3xl font-black uppercase italic italic tracking-tighter mb-2">Redemption Success!</h2>
                        <p className="text-gray-500 mb-8">Your unique coupon code is generated:</p>
                        
                        <div className="bg-gray-100 dark:bg-zinc-800 p-6 rounded-2xl border-2 border-dashed border-gray-300 mb-8">
                            <span className="text-4xl font-mono font-black tracking-[0.5em] text-black dark:text-white">{generatedCode}</span>
                        </div>

                        <p className="text-xs text-gray-400 mb-8">Use this code at checkout on the {selectedCoupon.id === 'zepto' ? 'Zepto' : 'MakeMyTrip'} platform. <br/> <a href="#" className="underline font-bold">Fake Redemption Link</a></p>

                        <button
                            onClick={onClose}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            Back to Earnings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RedeemModal;

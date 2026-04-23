import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RedeemModal = ({ isOpen, onClose, currentBalance, onRedeemSuccess }) => {
    const [status, setStatus] = useState('selection'); // selection, processing, success, error
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [error, setError] = useState('');

    const [coupons, setCoupons] = useState([]);

    React.useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await axios.get('/shop/products');
                setCoupons(res.data);
            } catch (err) {
                console.error('Error fetching vouchers:', err);
            }
        };
        if (isOpen) fetchCoupons();
    }, [isOpen]);

    const [newBalance, setNewBalance] = useState(null);

    if (!isOpen) return null;

    const handleRedeem = async (coupon) => {
        if (currentBalance < coupon.price) {
            setError('Insufficient balance for this voucher.');
            return;
        }

        setStatus('processing');
        setError('');

        try {
            const res = await axios.post('/payment/pay-with-wallet', { 
                productId: coupon._id
            });
            
            setGeneratedCode(res.data.couponCode); // REAL CODE FROM BACKEND
            setSelectedCoupon(coupon);
            setNewBalance(res.data.newBalance);
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
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => status !== 'processing' && onClose()}
            ></div>

            <div className="relative bg-white w-full max-w-md overflow-hidden rounded-2xl shadow-xl transition-all">
                {status === 'selection' && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Select Reward</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available balance</p>
                            <p className="text-2xl font-bold text-slate-900">₹{currentBalance}</p>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {coupons.map(coupon => (
                                <button
                                    key={coupon._id}
                                    onClick={() => handleRedeem(coupon)}
                                    disabled={currentBalance < coupon.price}
                                    className={`w-full group relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                        currentBalance >= coupon.price 
                                        ? 'border-slate-100 hover:border-slate-900 hover:bg-slate-50' 
                                        : 'opacity-40 grayscale cursor-not-allowed border-slate-50'
                                    }`}
                                >
                                    <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={coupon.imageUrl} alt={coupon.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-sm text-slate-900 leading-none mb-1">{coupon.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] text-slate-500 font-medium">₹{coupon.price} Credits</p>
                                            {coupon.originalPrice && coupon.originalPrice > coupon.price && (
                                                <span className="text-[10px] text-slate-400 line-through">₹{coupon.originalPrice}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {error && <p className="mt-4 text-red-500 text-xs font-bold text-center">{error}</p>}
                    </div>
                )}

                {status === 'processing' && (
                    <div className="p-16 text-center">
                        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-sm font-bold text-slate-900">Generating Voucher...</h3>
                    </div>
                )}

                {status === 'success' && (
                    <div className="p-10 text-center animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Success
                        </h3>
                        <p className="text-sm text-slate-500 mb-10 leading-relaxed">
                            Your redemption of <span className="font-bold text-slate-900">{selectedCoupon?.name}</span> was successful. You can find it in your items history.
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                        >
                            Great
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RedeemModal;

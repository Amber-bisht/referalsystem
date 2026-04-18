import React from 'react';

const SuccessModal = ({ isOpen, onClose, productName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-sm overflow-hidden rounded-2xl shadow-xl transform transition-all animate-in fade-in zoom-in duration-300">
                <div className="p-10 text-center">


                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Success
                    </h3>
                    <p className="text-sm text-slate-500 mb-10 leading-relaxed">
                        Your purchase of <span className="font-bold text-slate-900">{productName}</span> was successful. You can find it in your order history.
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                    >
                        Great
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;

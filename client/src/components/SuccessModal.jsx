import React from 'react';

const SuccessModal = ({ isOpen, onClose, productName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-zinc-900 w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
                <div className="p-8 text-center">
                    {/* Success Icon */}
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                        <svg 
                            className="h-10 w-10 text-green-600 dark:text-green-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2.5" 
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-black dark:text-white mb-2 uppercase tracking-tight">
                        Thank You!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Payment Successful! <br />
                        <span className="font-semibold text-black dark:text-white">
                            {productName}
                        </span> is now part of your collection.
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-150"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;

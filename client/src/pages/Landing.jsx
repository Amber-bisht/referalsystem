import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
            <div className="text-center px-4">
                <h1 className="text-3xl sm:text-6xl md:text-8xl font-bold uppercase tracking-widest mb-6">LuxeStream</h1>
                <p className="text-xl md:text-2xl text-gray-500 mb-12 tracking-wide font-light">
                    Elevate your lifestyle with our premium curated collection.
                </p>

                <Link
                    to="/shop"
                    className="inline-block bg-black text-white px-12 py-4 text-lg font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300"
                >
                    Shop Collection
                </Link>
            </div>

            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4 max-w-6xl opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                <img src="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRKVlVohhI3k4G1eQ69GqsqEA89DAGQiRRxltN5_9Z8rNvFR5SvABeN4dnCZxbEgAtBq2jIW4tXT_M" alt="Watch" className="w-full h-64 object-cover" />
                <img src="https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/2025/AUGUST/28/aPnJ2QOF_c09ea20cbf62415cbddc6c49d3dc99f5.jpg" alt="Bag" className="w-full h-64 object-cover" />
                <img src="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSHgDFsPH-xeizxqLbJXRSXL-Jj0_Wt3xPxysx8xSF-swm4Bm1l" alt="Glasses" className="w-full h-64 object-cover" />
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKlpox488T6I75L8djnqWg3AVN96xVEdRytw&s" alt="Phone" className="w-full h-64 object-cover" />
            </div>
        </div>
    );
};

export default Landing;

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Success = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        console.log("✅ Stripe session ID:", sessionId);

        // If you had a backend, you'd now send this ID to the server
        // Example:
        // fetch(`/api/session?session_id=${sessionId}`).then(...)
    }, [searchParams]);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center transform transition-all duration-300 hover:scale-105">

                <div className="flex items-center justify-center mb-6">
                    <svg
                        className="w-20 h-20 text-green-500 animate-bounce-in"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    Your payment has been processed successfully. A confirmation email has been sent to your registered email address.
                    <code>{searchParams.get("session_id")}</code>
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default Success;

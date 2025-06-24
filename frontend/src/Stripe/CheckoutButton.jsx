import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51RdUo3PFfN6P9NCx0cOk8b6zF8jZLBvQLoSf65dEQvsGsHrx25KVLMeyNoYHgyomMaV1SRly40jIEcAgn2rxvquc00aXmeT0kj");

const CheckoutButton = () => {
    const handleClick = async () => {
        const stripe = await stripePromise;

        await stripe.redirectToCheckout({
            lineItems: [
                {
                    price: "price_1RdVCHPFfN6P9NCxrJz3CJx1",
                    quantity: 1,
                },
            ],
            mode: "payment",
            successUrl: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
            cancelUrl: "http://localhost:3000/cancel",
        });
    };

    return (
        <button onClick={handleClick} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
            Buy Now
        </button>
    );
};

export default CheckoutButton;

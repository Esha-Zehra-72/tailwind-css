import React, { useState } from 'react';
import img1 from "../assets/img1.jpg"
import img2 from "../assets/img2.jpg"
import img3 from "../assets/img3.jpg"
import img4 from "../assets/img4.jpg"
import img5 from "../assets/img5.jpg"
const ImageSlider = ({ images = [], interval = 3000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Function to go to the previous slide
    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    // Function to go to the next slide
    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    // Function to go to a specific slide using dots
    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    // Placeholder image function for broken links (still useful)
    const getPlaceholderImage = (width, height, text) =>
        `https://placehold.co/${width}x${height}/cccccc/333333?text=${text}`;

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl group">
            {/* Slider Container */}
            <div className="relative w-full h-80 sm:h-96 flex items-center justify-center bg-gray-200">
                {images.length > 0 ? (
                    <img
                        src={images[currentIndex].src}
                        alt={images[currentIndex].alt || `Slide ${currentIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                    />
                ) : (
                    // Display a placeholder if no images are provided
                    <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 text-lg">
                        No Images Available
                    </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 z-10"
                            aria-label="Previous slide"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 z-10"
                            aria-label="Next slide"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Dots Navigation */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {images.map((_, slideIndex) => (
                        <button
                            key={slideIndex}
                            onClick={() => goToSlide(slideIndex)}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${currentIndex === slideIndex ? 'bg-blue-600' : 'bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${slideIndex + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Slider = () => {
    const images = [
        { src: img1 },
        { src: img2 },
        { src: img3 },
        { src: img4 },
        { src: img5 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4 font-inter antialiased text-gray-800">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-3xl space-y-8">
                <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">Image Showcase</h1>

                <ImageSlider images={images} interval={5000} /> 
            </div>
        </div>
    );
};

export default Slider;
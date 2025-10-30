import { useState } from 'react';
import LazyImage from '../LazyImage';

const ImageGallery = ({ images = [], altTextPrefix = 'Property image' }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = (e) => {
    e.stopPropagation();
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious(e);
    } else if (e.key === 'ArrowRight') {
      goToNext(e);
    }
  };

  return (
    <>
      {/* Gallery Grid */}
      <section className="bg-white rounded-lg shadow overflow-hidden" aria-label="Image gallery">
        {images.length === 1 ? (
          // Single image display
          <div 
            className="relative cursor-pointer group"
            onClick={() => openLightbox(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
            aria-label="Open image in full screen"
          >
            <LazyImage
              src={images[0]}
              alt={`${altTextPrefix} 1 of 1`}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <i className="fas fa-search-plus text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></i>
            </div>
          </div>
        ) : (
          // Multiple images grid
          <div className="grid grid-cols-4 gap-2 p-2">
            {/* Main large image */}
            <div 
              className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => openLightbox(0)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
              aria-label="Open main image in full screen"
            >
              <LazyImage
                src={images[0]}
                alt={`${altTextPrefix} 1 of ${images.length}`}
                className="w-full h-full object-cover rounded-lg"
                style={{ minHeight: '400px' }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-lg">
                <i className="fas fa-search-plus text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></i>
              </div>
            </div>

            {/* Thumbnail images */}
            {images.slice(1, 5).map((image, index) => (
              <div
                key={index + 1}
                className="relative cursor-pointer group aspect-square"
                onClick={() => openLightbox(index + 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(index + 1)}
                aria-label={`Open image ${index + 2} in full screen`}
              >
                <LazyImage
                  src={image}
                  alt={`${altTextPrefix} ${index + 2} of ${images.length}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-lg">
                  <i className="fas fa-search-plus text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></i>
                </div>
                {/* Show "+X more" overlay on last thumbnail if there are more images */}
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg" aria-label={`${images.length - 5} more images available`}>
                    <span className="text-white text-xl font-semibold" aria-hidden="true">
                      +{images.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close image viewer"
          >
            <i className="fas fa-times text-3xl" aria-hidden="true"></i>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white text-lg font-medium z-10" aria-live="polite" aria-atomic="true">
            Image {currentIndex + 1} of {images.length}
          </div>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 p-4"
              aria-label="View previous image"
            >
              <i className="fas fa-chevron-left text-4xl" aria-hidden="true"></i>
            </button>
          )}

          {/* Image */}
          <div 
            className="max-w-7xl max-h-screen p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt={`${altTextPrefix} ${currentIndex + 1} of ${images.length} - Full size view`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 p-4"
              aria-label="View next image"
            >
              <i className="fas fa-chevron-right text-4xl" aria-hidden="true"></i>
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          {images.length > 1 && (
            <nav className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4" aria-label="Image thumbnails">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(index);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : 'false'}
                >
                  <img
                    src={image}
                    alt={`${altTextPrefix} ${index + 1} thumbnail`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </nav>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;

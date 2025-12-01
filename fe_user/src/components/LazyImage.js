import React, { useState, useEffect } from 'react';

// Sử dụng đường dẫn public URL thay vì import
const baNaHillImage = '/img/banahills.jpg';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  wrapperClassName = '',
  fallbackSrc = baNaHillImage,
  ...props 
}) => {
  // Đảm bảo src luôn có giá trị hợp lệ
  const imageSrc = src || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  const [hasError, setHasError] = useState(false);

  // Reset khi src thay đổi
  useEffect(() => {
    if (imageSrc !== currentSrc) {
      setCurrentSrc(imageSrc);
      setHasError(false);
    }
  }, [imageSrc, currentSrc]);

  const handleError = (e) => {
    if (!hasError && currentSrc !== fallbackSrc) {
      // Thử load fallback nếu chưa thử
      console.warn(` Không thể load ảnh "${currentSrc}", thử fallback: ${fallbackSrc}`);
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    } else {
      // Nếu fallback cũng lỗi, vẫn hiển thị ảnh (có thể là broken image)
      console.error(`Không thể load cả ảnh và fallback: ${currentSrc}`);
    }
  };

  return (
    <div className={`lazy-image-wrapper ${wrapperClassName}`.trim()}>
      <img
        src={currentSrc}
        alt={alt}
        className={`lazy-image ${className}`.trim()}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        {...props}
      />
    </div>
  );
};

export default LazyImage;

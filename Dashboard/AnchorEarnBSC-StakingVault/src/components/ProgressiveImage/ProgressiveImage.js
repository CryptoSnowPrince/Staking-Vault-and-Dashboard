import React, { useEffect, useState } from 'react';

const ProgressiveImage = (props) => {
  const { src, alt, placeholder, errorImage, className } = props;
  const [loading, setLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    // initially set loading to true and current src of image to placeholder image
    setLoading(true);
    setCurrentSrc(placeholder);
  }, [placeholder]);

  useEffect(() => {
    // start loading original image
    const imageToLoad = new Image();
    imageToLoad.src = src;
    imageToLoad.onload = () => {
      // When image is loaded replace the image's src and set loading to false
      setCurrentSrc(src);
      setLoading(false);
    }
    imageToLoad.onerror = () => {
      setCurrentSrc(errorImage);
      setLoading(false);
    }
  }, [placeholder, src, errorImage]);

  return (
    <img
      src={currentSrc}
      style={{
        opacity: loading ? 0.5 : 1,
        transition: "opacity .15s linear",
      }}
      alt={alt ?? ""}
      // width="100%"
      // height="100%"
      className={className}
    />
  );
};

export default ProgressiveImage;

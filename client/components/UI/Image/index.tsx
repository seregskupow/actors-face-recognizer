import Loader from '@/components/Loader';
import { useIntersection } from '@/hooks/useIntersection';
import { FC, Fragment, ReactElement, useEffect, useRef, useState } from 'react';
import { isConditionalExpression } from 'typescript';
import styles from './image.module.scss';
import PlaceHolder from './placeholder.jpg';
import clsx from 'clsx';
interface ImageProps {
  src: string;
  className?: string;
  alt?: string;
  animate?: boolean;
}

const placeholserSrc: string =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920px' height='1080px'%3E%3C/svg%3E";

const ImageComponent: FC<ImageProps> = ({
  src,
  className,
  alt,
  animate = true,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [image, setImage] = useState<any>(placeholserSrc);
  const [loaderScale, setLoaderScale] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const imgRef = useRef<HTMLDivElement>(null);

  useIntersection(imgRef, () => {
    setIsInView(true);
  });

  const loadImage = (src: string) => {
    const image: HTMLImageElement = new Image();
    image.referrerPolicy = 'no-referrer';
    image.src = src;
    image.onload = () => {
      setImage(image.src);
      setImageLoading(false);
    };
    image.onerror = () => {
      setImage(PlaceHolder.src);
      setImageLoading(false);
    };
  };
  const calcLoaderScale = (height: number): number => {
    //maximum scale value for loader circle
    const x = 1;
    //max image height when loader should stop to scale
    const y = 300;
    const loaderScale = (x / y) * height;
    return loaderScale;
  };
  useEffect(() => {
    if (isInView) loadImage(src);
  }, [isInView, src]);

  useEffect(() => {
    const imageHeight = imgRef.current?.clientHeight;
    imageHeight && setLoaderScale(calcLoaderScale(imageHeight));
  }, []);

  const renderImage = (): ReactElement => {
    return (
      <div ref={imgRef} className={styles.ImageWrapper}>
        <img
          src={image}
          referrerPolicy='no-referrer'
          className={clsx(className, animate && styles.transitionOn)}
          alt={alt}
          style={{ opacity: imageLoading ? '0' : '1' }}
        />

        {imageLoading && (
          <Loader position='absolute' scale={loaderScale} blur />
        )}
      </div>
    );
  };
  return <Fragment>{renderImage()}</Fragment>;
};
export default ImageComponent;

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";

// Import images
import carousel from "../../../assets/imgs/carousel.webp";
import carousel2 from "../../../assets/imgs/carousel2.webp";
import carousel3 from "../../../assets/imgs/carousel3.webp";
import carousel4 from "../../../assets/imgs/carousel4.webp";
import carouselMobile from "../../../assets/imgs/carouselMobile.webp";
import carouselMobile2 from "../../../assets/imgs/carouselMobile2.webp";
import carouselMobile3 from "../../../assets/imgs/carouselMobile3.webp";
import carouselMobile4 from "../../../assets/imgs/carouselMobile4.webp";

// Import CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Carousel data for better organization
const carouselData = [
  {
    desktop: carousel,
    mobile: carouselMobile,
    alt: "New Collection 2025",
    link: "#latest-products",
  },
  {
    desktop: carousel2,
    mobile: carouselMobile2,
    alt: "Summer Sale",
    link: "#latest-products",
  },
  {
    desktop: carousel3,
    mobile: carouselMobile3,
    alt: "Exclusive Products",
    link: "#latest-products",
  },
  {
    desktop: carousel4,
    mobile: carouselMobile4,
    alt: "Limited Edition",
    link: "#latest-products",
  },
];

const Carousel: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle resize with debounce for better performance
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial state
    handleResize();
    setIsLoaded(true);

    // Debounce resize event
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoize settings to prevent unnecessary re-renders
  const settings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000,
      arrows: false,
      lazyLoad: "ondemand" as const,
      accessibility: true,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            arrows: false,
            dots: true,
          },
        },
      ],
    }),
    []
  );

  if (!isLoaded) return null;

  return (
    <section
      className="relative w-full bg-gray-100 overflow-hidden"
      aria-label="Main Carousel"
    >
      <div className="carousel-container max-w-screen-2xl mx-auto">
        <Slider {...settings}>
          {carouselData.map((slide, index) => (
            <div key={index} className="outline-none">
              <Link href={slide.link} passHref>
                <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[21/9]">
                  <Image
                    src={isMobile ? slide.mobile : slide.desktop}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 100vw"
                    priority={index === 0}
                    quality={85}
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
                  />
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Carousel;

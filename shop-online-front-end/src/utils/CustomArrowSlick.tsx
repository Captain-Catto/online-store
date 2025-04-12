import React from "react";

// Interface cho arrow props
interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  currentSlide?: number;
  slideCount?: number;
}

export const PrevArrow: React.FC<ArrowProps> = (props) => {
  const { className, onClick } = props;
  return (
    <button
      className={`custom-arrow custom-prev-arrow ${className || ""}`}
      onClick={onClick}
      aria-label="Previous"
    >
      <svg
        width="21"
        height="18"
        viewBox="0 0 21 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.4755 7.84696L12.961 0.33225C12.7465 0.117742 12.4606 0 12.1557 0C11.8505 0 11.5648 0.117912 11.3503 0.33225L10.668 1.01468C10.4537 1.22885 10.3356 1.51492 10.3356 1.81993C10.3356 2.12478 10.4537 2.42049 10.668 2.63466L15.0519 7.02818H1.12414C0.496176 7.02818 0 7.51979 0 8.14792V9.11269C0 9.74082 0.496176 10.282 1.12414 10.282H15.1017L10.6682 14.7C10.4539 14.9146 10.3358 15.1928 10.3358 15.4979C10.3358 15.8025 10.4539 16.0849 10.6682 16.2992L11.3505 16.9794C11.565 17.194 11.8507 17.3109 12.1559 17.3109C12.4607 17.3109 12.7466 17.1924 12.9611 16.9779L20.4757 9.46338C20.6907 9.2482 20.809 8.96095 20.8081 8.6556C20.8088 8.34923 20.6907 8.06181 20.4755 7.84696Z"
          fill="currentColor"
        ></path>
      </svg>
    </button>
  );
};

export const NextArrow: React.FC<ArrowProps> = (props) => {
  const { className, onClick } = props;
  return (
    <button
      className={`custom-arrow custom-next-arrow ${className || ""}`}
      onClick={onClick}
      aria-label="Next"
    >
      <svg
        width="21"
        height="18"
        viewBox="0 0 21 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.4755 7.84696L12.961 0.33225C12.7465 0.117742 12.4606 0 12.1557 0C11.8505 0 11.5648 0.117912 11.3503 0.33225L10.668 1.01468C10.4537 1.22885 10.3356 1.51492 10.3356 1.81993C10.3356 2.12478 10.4537 2.42049 10.668 2.63466L15.0519 7.02818H1.12414C0.496176 7.02818 0 7.51979 0 8.14792V9.11269C0 9.74082 0.496176 10.282 1.12414 10.282H15.1017L10.6682 14.7C10.4539 14.9146 10.3358 15.1928 10.3358 15.4979C10.3358 15.8025 10.4539 16.0849 10.6682 16.2992L11.3505 16.9794C11.565 17.194 11.8507 17.3109 12.1559 17.3109C12.4607 17.3109 12.7466 17.1924 12.9611 16.9779L20.4757 9.46338C20.6907 9.2482 20.809 8.96095 20.8081 8.6556C20.8088 8.34923 20.6907 8.06181 20.4755 7.84696Z"
          fill="currentColor"
        ></path>
      </svg>
    </button>
  );
};

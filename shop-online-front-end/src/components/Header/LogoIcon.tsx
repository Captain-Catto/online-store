import React from "react";

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      width="35"
      height="34"
      viewBox="0 0 35 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.3593 10.1503L19.9862 0.252441H26.8552L21.517 11.6724C19.7501 15.452 15.2462 18.516 11.4572 18.516H0L3.19901 11.6724H13.1216C13.9642 11.6724 14.9664 10.9912 15.3593 10.1503ZM19.6407 23.8496L15.0138 33.7474H15.0134H8.1444L13.4831 22.3274C15.2499 18.5479 19.7538 15.4838 23.5428 15.4838H35L31.801 22.3274H21.8784C21.0358 22.3274 20.0336 23.0087 19.6407 23.8496Z"
        fill="black"
      />
    </svg>
  );
};

"use client";

import React from "react";
import Image from "next/image";
import MessengerIcon from "../../../assets/imgs/icons8-facebook-messenger.svg";

const MessengerButton: React.FC = () => {
  const messengerUsername = "blakesinclair1995";

  const handleClick = () => {
    window.open(`https://m.me/${messengerUsername}`, "_blank");
    // _blank để mở tab mới
  };

  return (
    <button
      onClick={handleClick}
      className="fixed z-50 bottom-8 right-8 transition-all duration-300 ease-in-out cursor-pointer"
      aria-label="Chat với chúng tôi qua Messenger"
    >
      <div className="relative flex items-center bg-white justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:transform hover:scale-110 transition-all duration-300">
        <Image
          className="w-10 h-10 relative"
          src={MessengerIcon}
          alt="messenger icon"
        ></Image>
      </div>
    </button>
  );
};

export default MessengerButton;

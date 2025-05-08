import React from "react";

import InfoFooter from "./InfoFooter";

const Footer: React.FC = () => {
  return (
    <footer className="container px-4 mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
      <div className="lg:col-span-12 col-span-1">
        <InfoFooter />
      </div>
    </footer>
  );
};

export default Footer;

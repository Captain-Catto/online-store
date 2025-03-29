import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const SocialFooter: React.FC = () => {
  return (
    <div className="">
      <span className="text-2xl font-semibold">Devcamp</span>
      <div className="flex justify-center xl:justify-start space-x-4">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black-600 hover:text-black-800"
        >
          <FacebookIcon />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black-400 hover:text-black-600"
        >
          <TwitterIcon />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black-600 hover:text-black-800"
        >
          <InstagramIcon />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black-700 hover:text-black-900"
        >
          <LinkedInIcon />
        </a>
      </div>
    </div>
  );
};

export default SocialFooter;

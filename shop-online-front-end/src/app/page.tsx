// import Image from "next/image";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Carousel from "@/components/Homepage/Carousel/Carousel";
import FeaturesSection from "@/components/Homepage/Policy/Policy";
import Membership from "@/components/Homepage/Membership/Membership";
import LatestProducts from "@/components/Homepage/LatestProducts/LastestProducts";
import CasualProductsBanner from "@/components/Homepage/CasualProducts/CasualProducts-Banner";
import CasualProducts from "@/components/Homepage/CasualProducts/CasualProducts";
import Categories from "@/components/Homepage/Categories/Categories";
import MessengerButton from "@/components/Homepage/MessengerButton/MessengerButton";
import BackToTop from "@/components/BackToTop/BackToTop";

export default function Home() {
  return (
    <div>
      <Header />
      <Carousel />
      <MessengerButton />
      <FeaturesSection />
      <Categories />
      <LatestProducts />
      <CasualProductsBanner />
      <CasualProducts />
      <Membership />
      <Footer />
      <BackToTop />
    </div>
  );
}

import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Chatbot from "@/components/Chatbot";

const Layout = () => {
  // const [currentPage, setCurrentPage] = useState("/");

  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Simple visitors counter (once per session)
  useEffect(() => {
    if (!sessionStorage.getItem('visited')) {
      sessionStorage.setItem('visited', 'true');
      const current = Number(localStorage.getItem('siteVisitors') || '0');
      localStorage.setItem('siteVisitors', String(current + 1));
    }
  }, []);

  //Changing /routes when location change
  // useEffect(() => {
  //   handleNavigate(currentPage);
  // }, [currentPage]);

  // useEffect(() => {
  //   const page = location.pathname === "/" ? "/" : location.pathname;
  //   setCurrentPage(page);
  // }, [location]);

  // const handlePageChange = (page: string, carId?: string) => {
  //   setCurrentPage(page);
  //   if (carId) console.log(carId);
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster position="top-right" />
      <Chatbot />
      <Footer />
    </div>
  );
};

export default Layout;

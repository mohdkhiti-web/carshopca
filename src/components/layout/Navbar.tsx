import { useState, useEffect } from "react";
import { Car, Menu, X, Phone, Mail, ChevronDown, Heart, GitCompare } from "lucide-react";
import { Button } from "../ui/button";
import { company } from "@/data/company";
import { useNavigateHandler } from "@/hooks/useNavigateHandler";
import { useLocation } from "react-router-dom";
import { contact } from "@/data/contact";
import { motion } from "motion/react";
import ThemeToggle from "../ui/theme-toggle";

// interface NavbarProps {
//   currentPage: string;
//   onPageChange: (page: string) => void;
// }
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = company[0].navigationID;

  const location = useLocation();
  const navigate = useNavigateHandler();

  const navigateToContact = () => {
    if (location.pathname === "/contact") {
      navigate(contact.getInTouch);
    } else {
      navigate("/contact" + contact.getInTouch);
    }
  };

  const [scrolled, setScrolled] = useState(false);
  const [compareCount, setCompareCount] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    const refresh = () => {
      try {
        const list: string[] = JSON.parse(localStorage.getItem('compareCars') || '[]');
        setCompareCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setCompareCount(0);
      }
    };
    refresh();
    window.addEventListener('compare-updated', refresh);
    return () => window.removeEventListener('compare-updated', refresh);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/90 backdrop-blur-md shadow-xl' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(company[0].navigationID[0].id)}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-amber-400 rounded-lg flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {company[0].companyName.split(' ')[0]}
              </h1>
              <p className="text-xs font-medium text-gray-300 hidden sm:block tracking-wider">
                {company[0].companyDescription}
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <Button
                  variant="ghost"
                  className={`text-gray-100 hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-all duration-300 ${
                    location.pathname === item.id ? 'text-gold-400' : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => navigate(item.id)}
                >
                  {item.label}
                  {item.label === 'Luxury Collection' && (
                    <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  )}
                </Button>
                {item.label === 'Luxury Collection' && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-black/90 backdrop-blur-lg p-2 hidden group-hover:block animate-fadeIn">
                    <div className="py-1">
                      <a href="/listings?type=luxury" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md">Luxury Sedans</a>
                      <a href="/listings?type=suv" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md">Premium SUVs</a>
                      <a href="/listings?type=sports" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-md">Sports Cars</a>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="default"
                className="ml-4 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-amber-500 hover:to-gold-500 text-black font-semibold px-6 py-2 rounded-md text-sm tracking-wide shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                onClick={navigateToContact}
              >
                Contact Us
              </Button>
            </motion.div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center justify-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/favorites')}
            >
              <Heart className="h-4 w-4" />
              Favorites
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative flex items-center gap-2"
              onClick={() => navigate('/compare')}
            >
              <GitCompare className="h-4 w-4" />
              Compare
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Button>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{company[0].phoneNumber}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="group hover:text-blue-600 duration-300"
              onClick={() => navigateToContact()}
            >
              {
                <Mail className="h-4 w-4 group-hover:-rotate-16 transition-transform group-hover:scale-110" />
              }
              <span className="group-hover:translate-x-1 transition-transform">
                Get in touch
              </span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6 text-amber-400" />
              ) : (
                <Menu className="block h-6 w-6 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation handled below */}

    {/* Mobile Navigation */}
    {isMobileMenuOpen && (
      <div className="md:hidden border-t border-gray-100 py-4">
        <div className="space-y-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.id
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{company[0].phoneNumber}</span>
            </div>
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
            <div className="px-3 py-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 w-full" onClick={() => { navigate('/favorites'); setIsMobileMenuOpen(false); }}>
                <Heart className="h-4 w-4" />
                Favorites
              </Button>
            </div>
            <div className="px-3 py-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 w-full" onClick={() => { navigate('/compare'); setIsMobileMenuOpen(false); }}>
                <GitCompare className="h-4 w-4" />
                Compare {compareCount > 0 ? `(${compareCount})` : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </motion.nav>
  );
}

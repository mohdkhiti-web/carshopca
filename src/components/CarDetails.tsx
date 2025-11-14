import { getCarById } from "@/services/api";
import type { CarDocument } from "@/types/Car";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Award,
  Car as CarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Fuel,
  Gauge,
  Heart,
  Mail,
  MapPin,
  Phone,
  Settings,
} from "lucide-react";
import { useNavigateHandler } from "@/hooks/useNavigateHandler";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import FeaturedCars from "./HomePage/FeaturedCars";
import { contact } from "@/data/contact";

const CarDetails = () => {
  const [car, setCar] = useState<CarDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!id) {
        setError('No car ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching car with ID:', id);
        const carData = await getCarById(id);
        
        if (!carData) {
          console.error('Car not found for ID:', id);
          setError(`Car with ID ${id} not found`);
          return;
        }
        
        console.log('Fetched car data:', carData);
        setCar(carData);
      } catch (error) {
        console.error("Error fetching car details:", error);
        setError('Failed to load car details. Please try again later.');
        setCar(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handleNavigation = useNavigateHandler();

  const PriceConverter = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-lg mt-8"></div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'Car Not Found'}
        </h2>
        <p className="text-gray-600 mb-6">
          {error ? 'Please try again later.' : "The car you're looking for doesn't exist or has been removed."}
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => window.location.href = '/listings'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Browse All Cars
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto py-16">
      <div className="mb-4 px-4">
        <Button
          variant="outline"
          className="text-blue-600 text-lg border-blue-200 hover:bg-blue-50"
          onClick={() => handleNavigation("/listings")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>
      </div>
      {/* TOP - CAR INFO */}
      <div className="grid lg:grid-cols-2 max-lg:px-4 gap-12 pb-12">
        {/* IMG DIV */}
        <CarImages car={car} carid={car._id || ""} />
        {/* INFO DIV */}
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-bold font-montserrat text-gray-900">
              {car?.year} {car?.brand} {car?.model}
            </h2>
            <p className="text-lg text-gray-600 font-raleway">
              {car?.description}
            </p>
            <h4 className="text-3xl font-bold font-roboto text-blue-500 mb-4">
              {car?.price ? PriceConverter(car?.price) : "Price not available"}
            </h4>
            <CarShortDescription car={car} />
            <div className="grid lg:grid-cols-2  gap-6 py-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 cursor-pointer rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => handleNavigation("/contact")}
                disabled={!!car.isSold}
              >
                <Phone className="h-4 w-4 mr-2" />
                {car.isSold ? 'Car Sold' : 'Call Dealer'}
              </Button>
              <Button
                variant="outline"
                className="py-3 border-blue-500 text-blue-500 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => handleNavigation("/contact?question=test_drive")}
                disabled={!!car.isSold}
              >
                <Eye className="h-4 w-4 mr-2" />
                {car.isSold ? 'Unavailable' : 'Schedule a Test Drive'}
              </Button>
            </div>
            <ContactInfo />
          </div>
        </div>
      </div>
      {/* SPECIFICATIONS & KEY FEATURES */}
      <div className="flex max-lg:px-4 flex-col gap-8">
        <CarSpecifications car={car} />
        <CarKeyFeatures />
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl text-center font-bold text-gray-900">
            You Might Also Like
          </h2>
          <FeaturedCars
            featuredCars={[car, car, car]}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
};

const ContactInfo = () => {
  const carContactInfos = [
    {
      title: "Phone",
      value: contact.phoneNumber,
      value2: contact.serviceNumber,
      icon: Phone,
    },
    {
      title: "Email",
      value: contact.email,
      icon: Mail,
    },
    {
      title: "Address",
      value: contact.adress,
      icon: MapPin,
    },
  ];
  return (
    <Card className="px-5 font-raleway font-light py-6">
      <CardHeader>
        <CardTitle className="text-xl flex max-md:flex-col items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Contact Informations
        </CardTitle>
      </CardHeader>
      <CardContent className="font-montserrat font-normal px-8 flex flex-col gap-3">
        {carContactInfos.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className="flex items-center max-md:justify-center gap-2 hover:scale-[102%] transition-all hover:translate-x-1 hover:-translate-y-0.5"
              key={item.title}
            >
              <div className="flex gap-3">
                <div className="flex gap-2 max-md:flex-col max-md:items-center">
                  <Icon className="w-5 h-5 text-blue-500" />
                  <span className="font-bold">{item.title}:</span>
                  <span className="hover:text-blue-500 duration-300">
                    {item.title === "Phone" ? (
                      <a href={`tel:${item.value}`}>{item.value}</a>
                    ) : item.title === "Email" ? (
                      <a href={`mailto:${item.value}`}>{item.value}</a>
                    ) : item.title === "Address" ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${contact.adress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <a href="#">{item.value}</a>
                    )}
                  </span>
                  {item?.value2 && (
                    <span className="hover:text-blue-500 duration-300">
                      {item.title === "Phone" ? "|" : ""}
                      <a href={`tel:${item.value2}`}>{item.value2}</a>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const CarShortDescription = ({ car }: { car: CarDocument }) => {
  return (
    <Card className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-4 gap-4">
      <CardContent className="py-6 grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gauge className="h-6 w-6 text-white" />
          </div>
          <div className="text-sm text-gray-600">Mileage</div>
          <div className="font-bold text-gray-900">{car?.mileage} km</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Fuel className="h-6 w-6 text-white" />
          </div>
          <div className="text-sm text-gray-600">Fuel Type</div>
          <div className="font-bold text-gray-900">Gasoline</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div className="text-sm text-gray-600">Transmission</div>
          <div className="font-bold text-gray-900">Automatic</div>
        </div>
      </CardContent>
    </Card>
  );
};

const CarImages = ({ car, carid }: { car: CarDocument; carid: string }) => {
  const primary = car?.images?.[0] || 'https://via.placeholder.com/800x600?text=Car+Image+1';
  const CarImages = [
    { image: primary, index: 0 },
    { image: car?.images?.[1] || primary, index: 1 },
    { image: car?.images?.[2] || primary, index: 2 },
  ];

  const [activeCarImageIndex, setActiveCarImageIndex] = useState(0);

  const handleSetActiveCarImage = (_image: string, index: number) => {
    setActiveCarImageIndex(index);
  };

  const nextImage = () => {
    setActiveCarImageIndex((prev) => {
      const nextImage = prev + 1;
      return nextImage;
    });
  };

  const prevImage = () => {
    setActiveCarImageIndex((prev) => {
      const prevImage = prev - 1;
      return prevImage;
    });
  };

  const [isFavorite, setIsFavorite] = useState(false);

  const getFavoriteCars = (): string[] => {
    try {
      const raw = localStorage.getItem("favoriteCars");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const setFavoriteCars = (favorites: string[]) => {
    try {
      localStorage.setItem("favoriteCars", JSON.stringify(favorites));
    } catch {
      console.error("Error saving favorite cars");
    }
  };

  const handleFavorite = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      const favorites = getFavoriteCars();
      if (next) {
        if (!favorites.includes(carid)) {
          favorites.push(carid);
        }
      } else {
        const idx = favorites.indexOf(carid);
        if (idx !== -1) favorites.splice(idx, 1);
      }
      setFavoriteCars(favorites);
      return next;
    });
  };

  useEffect(() => {
    const favorites = getFavoriteCars();
    setIsFavorite(favorites.includes(carid));
  }, [carid]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full relative h-96 lg:h-[500px]">
        {car.isSold && (
          <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-md font-semibold shadow">
            Sold
          </div>
        )}
        <div
          className="absolute top-4 right-4 cursor-pointer bg-gray-200 p-2 rounded-full"
          onClick={() => handleFavorite()}
        >
          {isFavorite ? (
            <Heart className="h-6 w-6 text-blue-600 fill-blue-600 duration-300 transition-colors" />
          ) : (
            <Heart className="h-6 w-6 text-gray-600 fill-none duration-300 transition-colors" />
          )}
        </div>
        <Button
          onClick={prevImage}
          className="absolute left-4 top-1/2 rounded-full shadow-2xl"
          variant="outline"
          disabled={activeCarImageIndex === 0}
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </Button>
        <Button
          onClick={nextImage}
          className="absolute right-4 top-1/2 rounded-full"
          variant="outline"
          disabled={activeCarImageIndex === CarImages.length - 1}
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </Button>
        <img
          src={
            CarImages[activeCarImageIndex]?.image ||
            "https://via.placeholder.com/800x600?text=Loading+image"
          }
          loading="lazy"
          alt=""
          className={`w-full select-none rounded-3xl border-gray-400 min-h-96 h-full object-cover`}
        />
        {CarImages[activeCarImageIndex]?.index === 1 && (
          <div className="absolute top-1/2 left-1/2 transform bg-black/50 rounded-3xl p-4 -translate-x-1/2 text-center -translate-y-1/2">
            <p className="text-2xl font-bold text-white">{car?.brand}</p>
            <p className="text-2xl font-bold text-white">{car?.model}</p>
            <p className="text-2xl font-bold text-white">{car?.year}</p>
          </div>
        )}
      </div>
      <div className="w-full grid grid-cols-7 gap-4">
        {CarImages.map((image, index) => (
          <img
            key={index}
            src={
              image.image || "https://via.placeholder.com/400x300?text=No+image"
            }
            alt=""
            className={`w-full even:col-span-3 odd:col-span-2 rounded-3xl shadow-lg border-2 h-32 object-cover cursor-pointer ${
              index === activeCarImageIndex
                ? "border-blue-500"
                : "border-gray-200 "
            }`}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 33vw, 128px"
            onClick={() =>
              handleSetActiveCarImage(image.image as string, index)
            }
          />
        ))}
      </div>
    </div>
  );
};

const CarSpecifications = ({ car }: { car: CarDocument }) => {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900 flex items-center">
          <CarIcon className="h-6 w-6 text-blue-600 mr-3" />
          Specifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Engine</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Engine Size</span>
                <span className="font-medium">2.0L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horsepower</span>
                <span className="font-medium">200 HP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">0-100 km/h</span>
                <span className="font-medium">7.5s</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Body & Dimensions</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Body Style</span>
                <span className="font-medium">Sedan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transmission</span>
                <span className="font-medium">Automatic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fuel Type</span>
                <span className="font-medium">Gasoline</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mileage</span>
                <span className="font-medium">{car.mileage} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year</span>
                <span className="font-medium">{car.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Color</span>
                <span className="font-medium">{car.color || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CarKeyFeatures = () => {
  // key features
  const keyFeatures = [
    "Premium leather interior",
    "Premium sound system",
    "Panoramic sunroof",
    "360 camera system",
    "Bluetooth connectivity",
    "Heated seats",
    "Ambient lighting",
  ];
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900 flex items-center">
          <Award className="h-6 w-6 text-blue-600 mr-3" />
          Key Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 px-12 py-2 text-lg">
          {keyFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CarDetails;

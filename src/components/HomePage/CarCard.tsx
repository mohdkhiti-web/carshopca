import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigateHandler } from "@/hooks/useNavigateHandler";
import { Link } from "react-router-dom";
import React, { memo, useCallback, useEffect, useState } from "react";
import { formatCurrency, formatKm } from '@/utils/format';

interface CarCardProps {
  id: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  description?: string;
  image?: string;
  featured?: boolean;
  fuelType?: string;
  transmission?: string;
  features?: string[];
  images?: string[];
  color?: string;
  isFeatured?: boolean;
  isSold?: boolean;
  createdAt?: string;
  updatedAt?: string;
  viewMode?: "grid" | "list";
  
  // CarDocument properties with $ prefix
  $id?: string;
  $collectionId?: string;
  $databaseId?: string;
  $permissions?: any[];
  $createdAt?: string;
  $updatedAt?: string;
  $brand?: string;
  $model?: string;
  $isAvailable?: boolean;
  $price?: number;
  $year?: number;
  $mileage?: number;
  $description?: string;
  $featured?: boolean;
  $fuelType?: string;
  $transmission?: string;
  $power?: string;
  $engine_size?: string;
  $color?: string;
  $seats?: number;
  $doors?: number;
  $drive?: string;
  $vin?: string;
  $condition?: string;
  $status?: string;
}

const CarCard = memo(
  ({ viewMode = "grid", ...car }: CarCardProps) => {
    const navigateHandler = useNavigateHandler();
    const [inCompare, setInCompare] = useState(false);

    useEffect(() => {
      const list: string[] = JSON.parse(localStorage.getItem('compareCars') || '[]');
      const carId = car.id || car.$id || '';
      setInCompare(!!carId && list.includes(carId));
    }, [car.id, car.$id]);

    const handleViewDetails = useCallback(() => {
      // Use car.id or fall back to car.$id
      const carId = car.id || car.$id;
      if (!carId) {
        console.error('No car ID available for navigation');
        return;
      }
      navigateHandler(`/car/${carId}`);
    }, [car.id, car.$id, navigateHandler]);

    const FALLBACK_IMAGE =
      "https://c0.carzone.ie/web/image/electric-cars/octavia-electric/octavia-electric.png";

    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = FALLBACK_IMAGE;
      },
      [FALLBACK_IMAGE]
    );

    const cardClasses =
      viewMode === "list"
        ? "group w-full flex flex-row py-0 gap-3 bg-card shadow-lg border-none hover:shadow-xl transition-shadow duration-200 overflow-hidden rounded-xl"
        : "group max-md:w-full py-0 gap-3 bg-card shadow-lg border-none hover:md:scale-105 transition-transform duration-200 overflow-hidden rounded-xl";

    const imageClasses =
      viewMode === "list"
        ? "w-48 h-32 object-cover"
        : "w-full group-hover:scale-105 h-48 object-cover transition-transform duration-300";

    return (
      <Card className={cardClasses}>
        {/* Image + Badges */}
        <div className={`relative ${viewMode === "list" ? "shrink-1" : ""}`}>
          <Link to={`/car/${car.id || car.$id}`}>
            <img
              src={car.image || car.images?.[0] || FALLBACK_IMAGE}
              alt={`${car.brand} ${car.model}`}
              className={imageClasses}
              width={viewMode === "list" ? 192 : 800}
              height={viewMode === "list" ? 128 : 600}
              loading="lazy"
              decoding="async"
              sizes={viewMode === "list" 
                ? "(max-width: 640px) 100vw, 192px" 
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              onError={handleImageError}
              style={{
                contentVisibility: 'auto',
                backgroundColor: '#f3f4f6' // Light gray background while loading
              }}
            />
          </Link>
          <div className="absolute top-3 flex gap-2 left-3">
            {car.isSold ? (
              <Badge className="bg-red-600 text-white">Sold</Badge>
            ) : (
              <>
                <Badge className="bg-blue-600 text-white">Excellent</Badge>
                {(car.isFeatured || car.featured) && (
                  <Badge className="bg-yellow-400 text-black">Featured</Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Car Info */}
        <div
          className={`flex-1 ${
            viewMode === "list" ? "flex flex-col justify-between" : ""
          }`}
        >
          <CardContent
            className={`px-4 ${
              viewMode === "list" ? "pb-2" : "max-md:text-center pb-4"
            }`}
          >
            <h3 className="text-lg font-semibold">
              {car.brand} {car.model}
            </h3>
            <p className="text-sm text-gray-700">{car.year}</p>
            <div
              className={`mt-3 space-y-1 text-sm ${
                viewMode === "list" ? "grid grid-cols-3 gap-2" : ""
              }`}
            >
              <div className="flex justify-between border-gray-300 max-md:border-b-1 max-md:pb-1">
                <span className="text-gray-500">Mileage</span>
                <span className="font-medium">
                  {formatKm(car.mileage)}
                </span>
              </div>
              <div className="flex justify-between border-gray-300 max-md:border-b-1 max-md:pb-1">
                <span className="text-gray-500">Fuel Type</span>
                <span className="font-medium">{car.fuelType || car.$fuelType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transmission</span>
                <span className="font-medium">{car.transmission || car.$transmission || 'N/A'}</span>
              </div>
            </div>
          </CardContent>

          {/* Price + Button */}
          <CardFooter className="flex justify-between max-md:justify-center max-md:gap-6 items-center px-4 pb-4">
            <span className="text-lg font-bold text-red-600">
              {car.isSold ? 'Sold' : formatCurrency(car.price)}
            </span>
            <Button
              variant="default"
              className="md:hidden hover:cursor-pointer"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              className="hidden md:block hover:bg-blue-600 hover:text-white duration-300 hover:cursor-pointer"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            <Button
              variant={inCompare ? "default" : "outline"}
              className={`ml-2 ${inCompare ? 'bg-amber-500 hover:bg-amber-600 text-black' : ''}`}
              size="sm"
              onClick={() => {
                const carId = car.id || car.$id;
                if (!carId) return;
                const key = 'compareCars';
                const list: string[] = JSON.parse(localStorage.getItem(key) || '[]');
                const idx = list.indexOf(carId);
                if (idx >= 0) {
                  list.splice(idx, 1);
                } else {
                  if (list.length >= 3) {
                    list.shift();
                  }
                  list.push(carId);
                }
                localStorage.setItem(key, JSON.stringify(list));
                setInCompare(list.includes(carId));
                window.dispatchEvent(new Event('compare-updated'));
              }}
              disabled={!!car.isSold}
              title={car.isSold ? 'Car sold' : 'Compare (max 3)'}
            >
              {inCompare ? 'In Compare' : 'Compare'}
            </Button>
          </CardFooter>
        </div>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
      prevProps.$id === nextProps.$id &&
      prevProps.price === nextProps.price &&
      prevProps.viewMode === nextProps.viewMode
    );
  }
);

CarCard.displayName = "CarCard";
export default CarCard;

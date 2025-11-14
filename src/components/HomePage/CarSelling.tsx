import { searchCars } from "@/services/api";
import CarCard from "@/components/HomePage/CarCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import type { Car } from "@/database/indexedDB";
import Loading from "../ui/loading";

const CarSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => (
  <div
    className={`animate-pulse bg-card rounded-xl shadow-lg ${
      viewMode === "list" ? "flex" : ""
    }`}
  >
    <div
      className={`bg-gray-300 rounded-t-xl ${
        viewMode === "list" ? "w-48 h-32" : "h-48"
      }`}
    ></div>
    <div className="p-4 flex-1">
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

export default function CarSelling({
  limit,
  searchTerm,
  sortBy,
  filters,
  isLoading,
  setIsLoading,
  setTotalCars,
  viewMode,
  extraFilters,
  page,
}: {
  limit: number;
  searchTerm: string;
  sortBy: string;
  filters: {
    brand: string[];
    priceRange: [number, number];
  };
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalCars: React.Dispatch<React.SetStateAction<number>>;
  viewMode: "grid" | "list";
  extraFilters: {
    mileage: number;
    fuelType?: string;
    transmission?: string;
    yearMin?: number;
    yearMax?: number;
  };
  page: number;
}) {
  const [cars, setCars] = useState<Car[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize filter params to prevent unnecessary re-renders
  const filterParams = useMemo(
    () => ({
      brand: filters.brand,
      searchTerm,
      priceRange: filters.priceRange,
      sortBy,
      mileage: extraFilters.mileage,
      fuelType: extraFilters.fuelType,
      transmission: extraFilters.transmission,
      yearMin: extraFilters.yearMin,
      yearMax: extraFilters.yearMax,
      page,
      limit,
    }),
    [
      filters.brand,
      searchTerm,
      filters.priceRange,
      sortBy,
      extraFilters.mileage,
      extraFilters.fuelType,
      extraFilters.transmission,
      extraFilters.yearMin,
      extraFilters.yearMax,
      page,
      limit,
    ]
  );

  // Memoized fetch function
  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare filters
      const filters = {
        brand: filterParams.brand,
        search: filterParams.searchTerm,
        priceRange: filterParams.priceRange,
        sortBy: filterParams.sortBy,
        mileage: filterParams.mileage,
        fuelType: filterParams.fuelType,
        transmission: filterParams.transmission,
        yearRange: [filterParams.yearMin || 0, filterParams.yearMax || 0] as [number, number],
        page: filterParams.page,
        limit: filterParams.limit
      };

      console.log('Fetching cars with filters:', filters);
      
      const result = await searchCars(filters);
      console.log('API Response:', result);

      if (result && result.cars) {
        setTotalCars(result.total);
        setCars(result.cars);
      } else {
        console.error('Unexpected API response format:', result);
        setError("Unexpected response from the server. Please try again later.");
        setCars([]);
        setTotalCars(0);
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to load cars. Please try again later.");
      setCars([]);
      setTotalCars(0);
    } finally {
      setIsLoading(false);
    }
  }, [filterParams, setTotalCars, setIsLoading]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Memoized grid classes
  const gridClasses = useMemo(() => {
    const baseClasses = "grid gap-4 transition-opacity duration-300";
    const columns =
      viewMode === "grid"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1";
    return `${baseClasses} ${columns} ${
      isLoading ? "opacity-50" : "opacity-100"
    }`;
  }, [viewMode, isLoading]);

  // Show skeletons while loading initial data
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className={gridClasses}>
          {Array.from({ length: limit }).map((_, index) => (
            <CarSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  // Show error message
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchCars}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show no results message
  if (!cars || cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No cars found matching your criteria.</p>
        <button 
          onClick={() => {
            // Reset all filters and search
            setCars(null);
            setTotalCars(0);
            if (typeof window !== 'undefined') {
              window.location.href = '/listings';
            }
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  // Show no results message
  if (!cars || cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No cars found matching your criteria.</p>
        <button 
          onClick={() => {
            // Reset filters and search
            setCars(null);
            setTotalCars(0);
            // Reset all filters to default values
            if (typeof window !== 'undefined') {
              window.location.href = '/listings';
            }
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchCars}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show no results or loading state
  if (!cars) {
    return (
      <div className="flex flex-col gap-6">
        <div className={gridClasses}>
          {Array.from({ length: limit }).map((_, index) => (
            <CarSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 text-lg mb-2">No cars found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={gridClasses}>
        {cars?.map((car) => {
          // Map car properties to match CarCardProps
          const carProps = {
            id: car.id?.toString() || '',
            brand: car.brand || 'Unknown',
            model: car.model || 'Unknown',
            price: car.price || 0,
            year: car.year || new Date().getFullYear(),
            mileage: car.mileage || 0,
            description: car.description || 'No description available',
            image: car.image || 'https://c0.carzone.ie/web/image/electric-cars/octavia-electric/octavia-electric.png',
            featured: car.featured || false,
            fuelType: car.fuelType || 'Gasoline',
            transmission: car.transmission || 'Automatic',
            features: [],
            images: car.images || [car.image || 'https://c0.carzone.ie/web/image/electric-cars/octavia-electric/octavia-electric.png'],
            
            // Required CarDocument properties with defaults
            $id: car.id?.toString() || '',
            $collectionId: 'cars',
            $databaseId: 'car-dealer-db',
            $permissions: [],
            $createdAt: car.createdAt?.toISOString() || new Date().toISOString(),
            $updatedAt: car.updatedAt?.toISOString() || new Date().toISOString(),
            $brand: car.brand || 'Unknown',
            $model: car.model || 'Unknown',
            $isAvailable: true,
            $price: car.price || 0,
            $year: car.year || new Date().getFullYear(),
            $mileage: car.mileage || 0,
            $description: car.description || 'No description available',
            $featured: car.featured || false,
            $fuelType: car.fuelType || 'Gasoline',
            $transmission: car.transmission || 'Automatic',
            $power: '150 HP',
            $engine_size: '2.0L',
            $color: car.color || 'White',
            $seats: 5,
            $doors: 4,
            $drive: 'FWD',
            $vin: 'N/A',
            $condition: 'Used',
            $status: 'Available',
            
            // View mode for the card
            viewMode,
          };
          
          return <CarCard key={car.id} {...carProps} />;
        })}
      </div>

      {isLoading && cars.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loading text="Loading Cars..." size="large" />
        </div>
      )}
    </div>
  );
}

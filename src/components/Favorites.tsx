import { useEffect, useMemo, useState } from 'react';
import CarCard from './HomePage/CarCard';
import type { CarDocument } from '@/types/Car';
import { getCarById } from '@/services/api';
import { Button } from './ui/button';
import Loading from './ui/loading';

const Favorites = () => {
  const [cars, setCars] = useState<CarDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const favoriteIds = useMemo(() => {
    try {
      const raw = localStorage.getItem('favoriteCars');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as string[];
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const fetched = await Promise.all(
          favoriteIds.map(async (id: string) => {
            const car = await getCarById(id);
            return car;
          })
        );
        setCars(fetched.filter(Boolean) as CarDocument[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [favoriteIds]);

  const clearAll = () => {
    localStorage.setItem('favoriteCars', JSON.stringify([]));
    setCars([]);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Favorites</h1>
          {cars.length > 0 && (
            <Button variant="outline" onClick={clearAll}>Clear All</Button>
          )}
        </div>
        {loading ? (
          <Loading text="Loading your favorites..." />
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-4">No favorite cars yet.</p>
            <Button onClick={() => (window.location.href = '/listings')}>Browse Cars</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-8">
            {cars.map((car, i) => {
              const id = (car as any)._id || (car as any).id || String(i);
              const image = car.images?.[0] || (car as any).image;
              return (
                <CarCard
                  key={id}
                  id={id}
                  brand={car.brand}
                  model={car.model}
                  price={car.price}
                  year={car.year}
                  mileage={car.mileage}
                  description={car.description}
                  image={image}
                  features={car.features}
                  images={car.images}
                  color={car.color}
                  fuelType={car.fuelType}
                  transmission={car.transmission}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;

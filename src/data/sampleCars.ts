import type { Car } from '../database/indexedDB';

export const sampleCars: Omit<Car, 'id' | 'createdAt'>[] = [
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 24999,
    mileage: 15000,
    image: 'https://via.placeholder.com/800x600?text=Toyota+Camry',
    color: 'Black',
    description: 'Like new Toyota Camry with excellent fuel efficiency and modern features.',
    featured: true
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 21999,
    mileage: 20000,
    image: 'https://via.placeholder.com/800x600?text=Honda+Civic',
    color: 'Silver',
    description: 'Reliable Honda Civic with great handling and low mileage.',
    featured: true
  },
  {
    brand: 'Ford',
    model: 'F-150',
    year: 2020,
    price: 34999,
    mileage: 35000,
    image: 'https://via.placeholder.com/800x600?text=Ford+F-150',
    color: 'Blue',
    description: 'Powerful Ford F-150 truck with plenty of towing capacity.',
    featured: false
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 42999,
    mileage: 5000,
    image: 'https://via.placeholder.com/800x600?text=Tesla+Model+3',
    color: 'White',
    description: 'Electric vehicle with autopilot and long range battery.',
    featured: true
  },
  {
    brand: 'BMW',
    model: 'X5',
    year: 2021,
    price: 45999,
    mileage: 28000,
    image: 'https://via.placeholder.com/800x600?text=BMW+X5',
    color: 'Gray',
    description: 'Luxury SUV with premium features and excellent performance.',
    featured: false
  }
];

// Function to initialize sample data
export const initializeSampleData = async () => {
  try {
    const { createCar } = await import('../services/api');
    const { db } = await import('../database/indexedDB');
    const existingCars = await db.getCars(1, 0);
    
    // Only add sample data if the database is empty
    if (existingCars.length === 0) {
      for (const car of sampleCars) {
        await createCar({
          brand: car.brand,
          model: car.model,
          year: car.year,
          price: car.price,
          mileage: car.mileage,
          fuelType: 'Gasoline',
          transmission: 'Automatic',
          color: car.color ?? 'Black',
          description: car.description ?? '',
          features: [],
          images: car.image ? [car.image] : [],
          isFeatured: !!car.featured,
          isSold: false,
        });
      }
      console.log('Sample data initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

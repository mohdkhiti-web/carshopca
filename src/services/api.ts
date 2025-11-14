import { db } from '../database/indexedDB';
import type { Car, CarDocument } from '../types/Car';

// Helper function to convert DB Car to CarDocument
const toCarDocument = (car: any): CarDocument | null => {
  if (!car) return null;
  
  // Create a base car object with all required fields
  const carDoc: any = {
    _id: car.id?.toString() || '',
    $id: car.id?.toString() || '',
    $collectionId: 'cars',
    $databaseId: 'car-dealer-db',
    $permissions: [],
    brand: car.brand || 'Unknown Brand',
    model: car.model || 'Unknown Model',
    year: car.year || new Date().getFullYear(),
    price: car.price || 0,
    mileage: car.mileage || 0,
    color: car.color || 'Unknown',
    description: car.description || 'No description available',
    fuelType: car.fuelType || 'Gasoline',
    transmission: car.transmission || 'Automatic',
    features: car.features || [],
    images: car.images || (car.image ? [car.image] : []),
    isFeatured: car.isFeatured || car.featured || false,
    isSold: car.isSold || false,
    createdAt: car.createdAt || new Date(),
    updatedAt: car.updatedAt || new Date(),
    $createdAt: (car.createdAt || new Date()).toISOString(),
    $updatedAt: (car.updatedAt || new Date()).toISOString(),
  };

  // Copy any additional properties
  Object.keys(car).forEach(key => {
    if (!(key in carDoc)) {
      carDoc[key] = car[key];
    }
  });

  return carDoc as CarDocument;
};

// Car related functions
export const getAllCars = async (limit: number = 10, offset: number = 0): Promise<CarDocument[]> => {
  const cars = await db.getCars(limit, offset);
  return cars
    .map(toCarDocument)
    .filter((car): car is CarDocument => car !== null && !car.isSold);
};

export const getCar = async (id: string | number): Promise<CarDocument | null> => {
  try {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      console.error('Invalid car ID:', id);
      return null;
    }
    const car = await db.getCarById(numericId);
    console.log('Retrieved car from DB:', car);
    return car ? toCarDocument(car) : null;
  } catch (error) {
    console.error('Error in getCar:', error);
    return null;
  }
};

// Alias for getCar for backward compatibility
export const getCarById = getCar;

export const createCar = async (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarDocument> => {
  const newCar = {
    ...carData,
    featured: carData.isFeatured,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: Array.isArray(carData.images) && carData.images.length > 0 ? carData.images[0] : undefined,
  };
  
  // Remove any undefined values
  (Object.keys(newCar) as Array<keyof typeof newCar>).forEach(key => {
    if (newCar[key] === undefined) {
      delete newCar[key];
    }
  });
  
  const createdId = await db.addCar(newCar);
  const created = await db.getCarById(Number(createdId));
  return toCarDocument(created)!;
};

export const updateCar = async (id: string, carData: Partial<Omit<Car, 'id'>>): Promise<CarDocument | null> => {
  const existingCar = await getCar(id);
  if (!existingCar) return null;
  
  const updatedCar = {
    ...existingCar,
    ...carData,
    featured: carData.isFeatured ?? existingCar.isFeatured,
    updatedAt: new Date(),
  };
  
  // Remove any undefined values
  (Object.keys(updatedCar) as Array<keyof typeof updatedCar>).forEach(key => {
    if (updatedCar[key] === undefined) {
      delete updatedCar[key];
    }
  });
  
  // Convert back to DB format
  const dbCar = {
    ...updatedCar,
    id: Number(id),
    featured: updatedCar.isFeatured,
    image: Array.isArray(updatedCar.images) && updatedCar.images.length > 0 ? updatedCar.images[0] : undefined,
  };
  
  const res = await db.updateCar(Number(id), dbCar);
  return res ? toCarDocument(res) : null;
};

export const deleteCar = async (id: string): Promise<boolean> => {
  try {
    await db.deleteCar(Number(id));
    return true;
  } catch (error) {
    console.error('Error deleting car:', error);
    return false;
  }
};

// Newsletter subscription
export const subscribeToNewsletter = async (email: string): Promise<boolean> => {
  try {
    await db.subscribeToNewsletter(email);
    return true;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};

// Contact form submission
export const submitContactForm = async (formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  questionType?: string;
  subject?: string;
  message: string;
}): Promise<boolean> => {
  try {
    await db.addContactMessage({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      questionType: formData.questionType,
      subject: formData.subject,
      message: formData.message
    });
    return true;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// Search and filter functions
export const searchCars = async (filters: {
  brand?: string[];
  search?: string;
  priceRange?: [number, number];
  sortBy?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  yearRange?: [number, number];
  page?: number;
  limit?: number;
  includeSold?: boolean;
} = {}): Promise<{ cars: CarDocument[]; total: number }> => {
  try {
    // Get all cars from the database
    const allCars = await db.getCars(1000, 0);
    // Convert to CarDocument format (non-null) and apply filters
    const docs = allCars
      .map(toCarDocument)
      .filter((car): car is CarDocument => car !== null);

    let results: CarDocument[] = docs.filter((car) => {
      // Exclude sold cars by default unless explicitly included
      if (!filters.includeSold && car.isSold) return false;
      // Filter by brand (if specified)
      if (filters.brand?.length && !filters.brand.includes(car.brand || '')) {
        return false;
      }
      
      // Filter by price range (if specified)
      if (
        filters.priceRange &&
        (car.price < filters.priceRange[0] || car.price > filters.priceRange[1])
      ) {
        return false;
      }
      
      // Filter by search term (if specified)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = [
          car.brand,
          car.model,
          car.description,
          car.color,
          car.fuelType,
          car.transmission
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }
      
      // Filter by mileage (if specified)
      if (filters.mileage && car.mileage > filters.mileage) {
        return false;
      }

      // Filter by fuel type
      if (filters.fuelType && filters.fuelType !== 'any') {
        if ((car.fuelType || '').toLowerCase() !== filters.fuelType.toLowerCase()) {
          return false;
        }
      }

      // Filter by transmission
      if (filters.transmission && filters.transmission !== 'any') {
        if ((car.transmission || '').toLowerCase() !== filters.transmission.toLowerCase()) {
          return false;
        }
      }

      // Filter by year range
      if (filters.yearRange) {
        const [ymin, ymax] = filters.yearRange;
        if (typeof ymin === 'number' && car.year < ymin) return false;
        if (typeof ymax === 'number' && ymax > 0 && car.year > ymax) return false;
      }
      
      return true;
    });
    
    // Apply sorting (if specified)
    if (filters.sortBy) {
      const sortMap: Record<string, string> = {
        'price-low': 'price:asc',
        'price-high': 'price:desc',
        'year-new': 'year:desc',
        'year-old': 'year:asc',
        'mileage-low': 'mileage:asc',
        'mileage-high': 'mileage:desc',
      };
      const sortKey = sortMap[filters.sortBy] || filters.sortBy;
      const [field, order] = sortKey.split(':');
      results.sort((a: any, b: any) => {
        let aVal = a[field];
        let bVal = b[field];
        
        // Handle undefined/null values
        if (aVal === undefined || aVal === null) return order === 'asc' ? -1 : 1;
        if (bVal === undefined || bVal === null) return order === 'asc' ? 1 : -1;
        
        // Convert to lowercase for string comparison
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        // Compare values
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting by price (low to high)
      results.sort((a, b) => a.price - b.price);
    }
    
    // Apply pagination
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const startIndex = (page - 1) * limit;
    
    // Return paginated results
    return {
      cars: results.slice(startIndex, startIndex + limit),
      total: results.length
    };
  } catch (error) {
    console.error('Error searching cars:', error);
    return { cars: [], total: 0 };
  }
};

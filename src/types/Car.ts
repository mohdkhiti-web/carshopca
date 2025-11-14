export type Car = {
  id?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: "Gasoline" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Automatic" | "Manual" | "Semi-Automatic" | "CVT";
  color: string;
  description: string;
  features: string[];
  images: string[];
  isFeatured: boolean;
  isSold: boolean;
  engineSize?: number;
  power?: number;
  bodyStyle?: string;
  driveTrain?: string;
  seatings?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CarDocument = Omit<Car, 'id'> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

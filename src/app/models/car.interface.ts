export interface Car {
    id: string;
    brand: string;
    model: string;
    image: string;
    category: 'ECONOMY' | 'COMBI';
    seats: number;
    fuelType: 'Petrol' | 'Diesel';
    transmission: 'Manual' | 'Automatic';
    bodyType: 'Hatchback' | 'Minivan' | 'Sedan';
    deposit: number;
    mileageLimit: number;
    pricePerDay: number;
    totalPrice: number;
    rentalCompany: string;
  }
  
  export interface SearchCriteria {
    pickupLocation: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
  } 
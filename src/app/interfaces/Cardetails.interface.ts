export interface Cardetails {
  car_id: number;
  vin: string;
  make: string;
  model: string;
  color: string;
  int_color?: string;
  ext_color?: string;
  odo: number;
  source: string;
  src_name: string;
  purpose: string;
  status: string;
  buying_price: number;
  sales_tax: number;
  retail_price: number;
  wholesale_price: number;
  rental_amount?: number;
  sold_price?: number;
  procure_date: string;
  ready_date?: string;
  sales_date?: string;
  created_date?: string;
  last_modified_date?: string;
}
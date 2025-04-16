import { Address } from "./Costumer";

export interface OrderStatus {
  order_status: [id: string, description: string];
}

export interface Order {
  costumer_id: string;
  order_status_id: string;
  payment_method_id: string;
  delivery_date: Date;
  delivery_address_id: string;
  products: [product_id: string, quantity: number];
}

export interface Orders {
  orders: Order[]
}

export interface OrderWithAddress extends Order {
  delivery_address: Address;
}

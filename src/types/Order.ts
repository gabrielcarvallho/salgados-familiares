import { Address } from "./Costumer";

interface OrderStatus {
  status: [id: string, description: string];
}

interface Order {
  costumer_id: string;
  order_status_id: string;
  payment_method_id: string;
  delivery_date: Date;
  delivery_address_id: string;
  products: [product_id: string, quantity: number];
}

interface Orders {
  orders: Order[]
}

interface OrderWithAddress extends Order {
  delivery_address: Address;
}

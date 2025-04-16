
export interface Products {
  products: Product[]
}

export interface Product {
  name: string;
  price: number;
  weight: number;
  batch_packages: number;
}

export type ProductUpdate = Partial<Product>;

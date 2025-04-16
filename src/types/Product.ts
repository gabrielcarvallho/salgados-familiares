
interface Products {
  products: Product[]
}

interface Product {
  name: string;
  price: number;
  weight: number;
  batch_packages: number;
}

interface UpdateProduct {
  name?: string;
  price?: number;
  weight?: number;
  batch_packages?: number;
}

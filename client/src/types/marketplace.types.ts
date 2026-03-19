export interface MarketplaceItem {
  _id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string; // 👈 Sirf URL store hai
  seller: {
    id: string;
    name: string;
    email: string;
  };
  status: 'available' | 'sold' | 'reserved';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDTO {
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}
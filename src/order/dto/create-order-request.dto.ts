export interface CreateOrderRequestDto {
  date: Date;
  description: string;
  items: CreateOrderItemRequestDto[];
}

interface CreateOrderItemRequestDto {
  name: string;
  description: string;
  quantity: number;
}

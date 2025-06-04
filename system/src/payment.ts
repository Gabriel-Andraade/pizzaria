export interface OrderItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface PaymentRequest {
  items: OrderItem[];
  delivery: number;
  address: string;
}

export interface PaymentResponse {
  status: "success" | "error";
  message: string;
  total: number;
  orderId?: string;
}

export function calculateTotals(
  items: OrderItem[],
  delivery: number
): { subtotal: number; delivery: number; total: number } {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );
  const total = subtotal + (delivery || 0);
  return { subtotal, delivery, total };
}

export async function simulatePayment(
  order: PaymentRequest
): Promise<PaymentResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const { subtotal, delivery, total } = calculateTotals(
    order.items,
    order.delivery
  );

  return {
    status: "success",
    message: "Payment approved! 🎉",
    total,
    orderId: Math.random().toString(36).substring(2, 10).toUpperCase(),
  };
}

import { Badge } from "./ui/badge";
import type { OrderStatus } from "@/lib/types";
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant="secondary">{status}</Badge>;
}

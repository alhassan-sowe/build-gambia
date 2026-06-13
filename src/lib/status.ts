export function statusColor(s: string) {
  switch (s) {
    case "pending": return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "confirmed": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "delivering": return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
    case "delivered": return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "canceled": return "bg-red-100 text-red-800 hover:bg-red-100";
    default: return "bg-muted text-muted-foreground";
  }
}
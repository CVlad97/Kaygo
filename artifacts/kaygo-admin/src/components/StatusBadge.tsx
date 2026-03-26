import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  
  let styles = "bg-gray-100 text-gray-800 border-gray-200";
  let label = status;

  switch (normalized) {
    case "draft":
    case "brouillon":
      styles = "bg-gray-100 text-gray-600 border-gray-200";
      label = "Brouillon";
      break;
    case "pending":
    case "submitted":
    case "en validation":
      styles = "bg-yellow-100 text-yellow-800 border-yellow-200";
      label = "En attente";
      break;
    case "validated":
    case "validé":
      styles = "bg-blue-100 text-blue-800 border-blue-200";
      label = "Validé";
      break;
    case "accepted":
    case "accepté":
    case "verified":
      styles = "bg-teal-100 text-teal-800 border-teal-200";
      label = "Accepté";
      break;
    case "paid":
    case "payé":
      styles = "bg-emerald-100 text-emerald-800 border-emerald-200";
      label = "Payé";
      break;
    case "in_transit":
    case "en transit":
      styles = "bg-purple-100 text-purple-800 border-purple-200";
      label = "En transit";
      break;
    case "delivered":
    case "livré":
      styles = "bg-green-100 text-green-800 border-green-200";
      label = "Livré";
      break;
    case "dispute":
    case "litige":
    case "rejected":
    case "rejeté":
      styles = "bg-red-100 text-red-800 border-red-200";
      label = normalized === 'rejected' ? 'Rejeté' : "Litige";
      break;
  }

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles, className)}>
      {label}
    </span>
  );
}

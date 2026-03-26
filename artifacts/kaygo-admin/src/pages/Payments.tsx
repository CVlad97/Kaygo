import { useListPayments } from "@workspace/api-client-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { CreditCard, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function Payments() {
  const { data, isLoading } = useListPayments();

  const payments = data?.payments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary">Paiements</h1>
        <p className="text-muted-foreground">Historique des transactions et reversements.</p>
      </div>

      <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-6 py-4">ID Trans.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Statut Client (Encaissement)</th>
                <th className="px-6 py-4">Statut Voyageur (Reversement)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Chargement...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Aucun paiement trouvé.</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium">PAY-{payment.id.toString().padStart(4, '0')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Colis #{payment.shipmentId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                        <StatusBadge status={payment.paymentStatus} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                        <StatusBadge status={payment.payoutStatus} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

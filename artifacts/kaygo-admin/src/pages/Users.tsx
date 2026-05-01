import { useState } from "react";
import { useListUsers, useVerifyUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListUsersQueryKey } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, Shield, Search } from "lucide-react";

export default function Users() {
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useListUsers();
  const queryClient = useQueryClient();
  
  const verifyMutation = useVerifyUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      }
    }
  });

  const handleVerify = (id: number, status: 'verified' | 'rejected') => {
    verifyMutation.mutate({ id, data: { status } });
  };

  const users = data?.users || [];
  const filteredUsers = users.filter((u: any) =>
    u.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    u.lastName.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes expéditeurs et voyageurs.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-lg shadow-black/5 border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Inscription</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Chargement...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm font-medium">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.verificationStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.verificationStatus === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleVerify(user.id, 'verified')}
                            disabled={verifyMutation.isPending}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Valider"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleVerify(user.id, 'rejected')}
                            disabled={verifyMutation.isPending}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Rejeter"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      {user.verificationStatus === 'verified' && (
                        <span className="text-sm text-emerald-600 flex items-center justify-end gap-1 font-medium">
                          <Shield className="h-4 w-4" /> Vérifié
                        </span>
                      )}
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

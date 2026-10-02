import Link from "next/link";
import { getContracts } from "@/lib/actions/contract-actions";
import { ContractTable } from "@/components/contracts/contract-table";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function ContractsPage() {
  const { contracts, isConnectedToSupabase } = await getContracts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Breadcrumb / Top Bar */}
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Master Database
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Master Contract Database
        </h1>
      </div>

      {/* Main Table View */}
      <ContractTable
        initialData={contracts}
        isConnectedToSupabase={isConnectedToSupabase}
      />
    </div>
  );
}

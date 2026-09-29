import Link from "next/link";
import { getContracts } from "@/lib/actions/contract-actions";
import { ContractTable } from "@/components/contracts/contract-table";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  UploadCloud,
  Database,
  ArrowLeft
} from "lucide-react";

export const revalidate = 0;

export default async function ContractsPage() {
  const { contracts, isConnectedToSupabase } = await getContracts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center gap-3">
          <Link href="/contracts/upload">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm">
              <UploadCloud className="h-4 w-4" />
              Upload File Excel
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Table View */}
      <ContractTable
        initialData={contracts}
        isConnectedToSupabase={isConnectedToSupabase}
      />
    </div>
  );
}

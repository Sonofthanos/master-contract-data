"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Contract } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { formatContractType } from "@/lib/constants";
import { 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";

interface ContractColumnsOptions {
  onEdit: (contract: Contract) => void;
  onDelete: (contractNumber: string) => void;
  onViewDetail: (contract: Contract) => void;
}

export function getContractColumns({
  onEdit,
  onDelete,
  onViewDetail,
}: ContractColumnsOptions): ColumnDef<Contract>[] {
  return [
    {
      accessorKey: "vendor_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 text-xs font-semibold"
        >
          Vendor ID
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.getValue("vendor_id") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "vendor_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 text-xs font-semibold"
        >
          Nama Mitra
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[220px]">
          <span
            className="font-medium text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => onViewDetail(row.original)}
            title={row.getValue("vendor_name")}
          >
            {row.getValue("vendor_name")}
          </span>
          <span className="text-[11px] text-slate-400 block line-clamp-1">
            {row.original.core_business || "Umum"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "contract_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 text-xs font-semibold"
        >
          Nomor Kontrak
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const cType = formatContractType(row.original.contract_type);
        return (
          <div className="max-w-[220px]">
            <span
              className="font-mono text-xs text-slate-800 dark:text-slate-200 block truncate"
              title={row.getValue("contract_number")}
            >
              {row.getValue("contract_number")}
            </span>
            {cType !== "-" && (
              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {cType}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "core_business",
      header: "Core Business",
      cell: ({ row }) => (
        <span
          className="text-xs text-slate-700 dark:text-slate-300 max-w-[170px] truncate block"
          title={row.getValue("core_business") || "-"}
        >
          {row.getValue("core_business") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "contract_status",
      header: "Status Kontrak",
      cell: ({ row }) => {
        const status = (row.getValue("contract_status") as string) || "Active";
        if (status === "Active" || status === "Valid") {
          return (
            <Badge variant="success" className="gap-1 font-medium text-[11px]">
              <CheckCircle2 className="h-3 w-3" /> Active
            </Badge>
          );
        }
        if (status === "Expired") {
          return (
            <Badge variant="destructive" className="gap-1 font-medium text-[11px]">
              <AlertCircle className="h-3 w-3" /> Expired
            </Badge>
          );
        }
        return (
          <Badge variant="warning" className="gap-1 font-medium text-[11px]">
            <Clock className="h-3 w-3" /> {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "contract_date_to",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8 text-xs font-semibold"
        >
          Masa Berlaku
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const from = row.original.contract_date_from;
        const to = row.original.contract_date_to;
        return (
          <div className="text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {formatDate(to)}
            </span>
            <span className="block text-[11px] text-slate-400">
              Mulai: {formatDate(from)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "scan_doc_status",
      header: "Scan Doc",
      cell: ({ row }) => {
        const val = String(row.getValue("scan_doc_status") || "BELUM").toUpperCase();
        return val === "SUDAH" ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
            SUDAH
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400">
            BELUM
          </span>
        );
      },
    },
    {
      accessorKey: "vendor_category",
      header: "Kategori",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.getValue("vendor_category") || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const contract = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-indigo-600"
              onClick={() => onViewDetail(contract)}
              title="Lihat Detail Lengkap"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-amber-600"
              onClick={() => onEdit(contract)}
              title="Edit Data Kontrak"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-rose-600"
              onClick={() => onDelete(contract.contract_number)}
              title="Hapus Kontrak"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

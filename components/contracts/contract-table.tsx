"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import { Contract } from "@/types/contract";
import { getContractColumns } from "./contract-columns";
import { ContractFormModal } from "./contract-form-modal";
import { ContractDetailModal } from "./contract-detail-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CORE_BUSINESS_LIST, CONTRACT_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { upsertSingleContract, deleteContract } from "@/lib/actions/contract-actions";

interface ContractTableProps {
  initialData: Contract[];
  isConnectedToSupabase?: boolean;
}

export function ContractTable({ initialData, isConnectedToSupabase }: ContractTableProps) {
  const [data, setData] = useState<Contract[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [coreBusinessFilter, setCoreBusinessFilter] = useState("all");
  const [contractTypeFilter, setContractTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scanDocFilter, setScanDocFilter] = useState("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [selectedContractForDetail, setSelectedContractForDetail] = useState<Contract | null>(null);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (coreBusinessFilter !== "all" && item.core_business !== coreBusinessFilter) {
        return false;
      }
      if (contractTypeFilter !== "all") {
        const itemType = (item.contract_type || "").toUpperCase();
        if (contractTypeFilter === "AMD") {
          if (itemType !== "AMD" && itemType !== "AMANDEMEN") return false;
        } else if (itemType !== contractTypeFilter) {
          return false;
        }
      }
      if (statusFilter !== "all") {
        if (statusFilter === "Active") {
          if (item.contract_status !== "Active" && item.contract_status !== "Valid") {
            return false;
          }
        } else if (item.contract_status !== statusFilter) {
          return false;
        }
      }
      if (scanDocFilter !== "all" && item.scan_doc_status !== scanDocFilter) {
        return false;
      }
      if (globalFilter) {
        const s = globalFilter.toLowerCase();
        const matchesName = item.vendor_name?.toLowerCase().includes(s);
        const matchesId = item.vendor_id?.toLowerCase().includes(s);
        const matchesContract = item.contract_number?.toLowerCase().includes(s);
        const matchesCore = item.core_business?.toLowerCase().includes(s);
        if (!matchesName && !matchesId && !matchesContract && !matchesCore) {
          return false;
        }
      }
      return true;
    });
  }, [data, coreBusinessFilter, contractTypeFilter, statusFilter, scanDocFilter, globalFilter]);

  const handleEdit = (contract: Contract) => {
    setContractToEdit(contract);
    setIsFormOpen(true);
  };

  const handleDelete = async (contractNumber: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kontrak nomor ${contractNumber}?`)) {
      return;
    }
    try {
      await deleteContract(contractNumber);
      setData((prev) => prev.filter((c) => c.contract_number !== contractNumber));
      toast.success("Kontrak berhasil dihapus");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus data";
      toast.error(msg);
    }
  };

  const handleSave = async (contract: Contract) => {
    try {
      await upsertSingleContract(contract);
      setData((prev) => {
        const existingIdx = prev.findIndex((c) => c.contract_number === contract.contract_number);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = contract;
          return next;
        }
        return [contract, ...prev];
      });
      toast.success(
        contractToEdit ? "Data kontrak berhasil diperbarui!" : "Kontrak baru berhasil ditambahkan!"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan data";
      toast.error(msg);
    }
  };

  const handleExportExcel = () => {
    try {
      if (filteredData.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }

      const exportRows = filteredData.map((c, idx) => ({
        "No": idx + 1,
        "Vendor ID": c.vendor_id,
        "Nama Mitra": c.vendor_name,
        "Core Business": c.core_business || "-",
        "Kategori Vendor": c.vendor_category || "-",
        "Tipe Kontrak": c.contract_type || "-",
        "Nomor Kontrak": c.contract_number,
        "Status Kontrak": c.contract_status,
        "Tanggal Mulai": c.contract_date_from || "-",
        "Tanggal Berakhir": c.contract_date_to || "-",
        "Scan Dokumen": c.scan_doc_status,
        "Upload Dokumen": c.upload_contract_status,
        "Request For Contract (RFC)": c.rfc ? formatDate(c.rfc) : "-",
        "Draft Sent": c.draft_sent_date || "-",
        "Draft Return": c.draft_return_date || "-",
        "Final Approval": c.final_approval_date || "-",
        "PIC Email": c.pic_email || "-",
        "Catatan Internal": c.remarks_internal || "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Master Kontrak");

      const todayStr = new Date().toISOString().split("T")[0];
      const fileName = `Master_Contract_Database_TBIG_${todayStr}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success(`Berhasil mengekspor seluruh ${exportRows.length} data kontrak ke file Excel!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengekspor file Excel";
      toast.error(msg);
    }
  };

  const columns = useMemo(
    () =>
      getContractColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onViewDetail: (c) => setSelectedContractForDetail(c),
      }),
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Global Search */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari Vendor, Nama Mitra, No Kontrak..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="gap-1.5 h-9 text-xs font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300"
              title="Unduh seluruh data kontrak yang sedang difilter/ditampilkan ke format Excel (.xlsx)"
            >
              <Download className="h-4 w-4 text-emerald-600" /> Export Excel
            </Button>
            <Button
              onClick={() => {
                setContractToEdit(null);
                setIsFormOpen(true);
              }}
              className="gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              <Plus className="h-4 w-4" /> Tambah Kontrak
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Filter Core Business (22 Options) */}
          <div>
            <select
              value={coreBusinessFilter}
              onChange={(e) => setCoreBusinessFilter(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">Semua Core Business (22 Bidang)</option>
              {CORE_BUSINESS_LIST.map((cb) => (
                <option key={cb} value={cb}>
                  {cb}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tipe Kontrak (P, B, AMD) */}
          <div>
            <select
              value={contractTypeFilter}
              onChange={(e) => setContractTypeFilter(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">Semua Tipe Kontrak</option>
              {CONTRACT_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Kontrak */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">Semua Status Operasional</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="No Contract">No Contract</option>
            </select>
          </div>

          {/* Filter Scan Doc */}
          <div>
            <select
              value={scanDocFilter}
              onChange={(e) => setScanDocFilter(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">Status Scan: Semua</option>
              <option value="SUDAH">Status Scan: SUDAH</option>
              <option value="BELUM">Status Scan: BELUM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
        <div>
          Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredData.length}</span> dari{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{data.length}</span> total kontrak
        </div>
        <div className="flex items-center gap-2">
          <span>Baris per halaman:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          >
            {[10, 15, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-32 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <span>Tidak ada data kontrak yang cocok dengan filter</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {Math.max(1, table.getPageCount())}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContractFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        contractToEdit={contractToEdit}
        onSave={handleSave}
      />

      <ContractDetailModal
        isOpen={Boolean(selectedContractForDetail)}
        onClose={() => setSelectedContractForDetail(null)}
        contract={selectedContractForDetail}
        onEdit={handleEdit}
      />
    </div>
  );
}

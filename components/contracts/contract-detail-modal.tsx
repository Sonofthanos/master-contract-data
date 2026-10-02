"use client";

import { Contract } from "@/types/contract";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { formatContractType } from "@/lib/constants";
import { Building2, Calendar, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ContractDetailModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contract: Contract) => void;
}

export function ContractDetailModal({
  contract,
  isOpen,
  onClose,
  onEdit,
}: ContractDetailModalProps) {
  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <DialogTitle className="text-xl font-bold">
                {contract.vendor_name}
              </DialogTitle>
            </div>
            <Badge
              variant={
                contract.contract_status === "Active" || contract.contract_status === "Valid"
                  ? "success"
                  : contract.contract_status === "Expired"
                  ? "destructive"
                  : "warning"
              }
            >
              {contract.contract_status === "Valid" ? "Active" : (contract.contract_status || "Active")}
            </Badge>
          </div>
          <DialogDescription className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
            {contract.contract_number}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
          {/* Box 1: Vendor & Profil */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" /> Informasi Mitra
            </h4>
            <div className="grid grid-cols-2 gap-y-1 text-slate-600 dark:text-slate-400">
              <span>Vendor ID:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{contract.vendor_id}</span>
              <span>Kategori:</span>
              <span className="font-medium text-slate-900 dark:text-white">{contract.vendor_category || "-"}</span>
              <span>Core Business:</span>
              <span className="font-medium text-slate-900 dark:text-white">{contract.core_business || "-"}</span>
              <span>Result Selection:</span>
              <span className="font-medium text-slate-900 dark:text-white">{contract.result_selection || "-"}</span>
              <span>Request For Contract (RFC):</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatDate(contract.rfc)}</span>
            </div>
          </div>

          {/* Box 2: Detail Kontrak */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-600" /> Spesifikasi Kontrak
            </h4>
            <div className="grid grid-cols-2 gap-y-1 text-slate-600 dark:text-slate-400">
              <span>Tipe Kontrak:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatContractType(contract.contract_type)}</span>
              <span>Periode / Tahun:</span>
              <span className="font-medium text-slate-900 dark:text-white">{contract.period || "-"}</span>
              <span>Scan Dokumen:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{contract.scan_doc_status}</span>
              <span>Upload Dokumen:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{contract.upload_contract_status}</span>
              <span>Subcont Status:</span>
              <span className="font-medium text-slate-900 dark:text-white">{contract.subcont_status || "-"}</span>
            </div>
          </div>

          {/* Box 3: Tanggal & Alur Kerja */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" /> Milestone & Timeline
            </h4>
            <div className="grid grid-cols-2 gap-y-1 text-slate-600 dark:text-slate-400">
              <span>Tanggal Mulai:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatDate(contract.contract_date_from)}</span>
              <span>Tanggal Berakhir:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatDate(contract.contract_date_to)}</span>
              <span>Draft Dikirim:</span>
              <span>{formatDate(contract.draft_sent_date)}</span>
              <span>Draft Return Vendor:</span>
              <span>{formatDate(contract.draft_return_date)}</span>
              <span>Final Approval:</span>
              <span>{formatDate(contract.final_approval_date)}</span>
              <span>Return to Vendor:</span>
              <span>{formatDate(contract.return_to_vendor_date)}</span>
            </div>
          </div>

          {/* Box 4: Penanganan & Catatan */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-indigo-600" /> Catatan & Tindak Lanjut
            </h4>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Email PIC:</span>
                <span>{contract.pic_email || "-"}</span>
              </div>
              <div>
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Action Status:</span>
                <span>{contract.action_status || "-"} {contract.action_date ? `(${formatDate(contract.action_date)})` : ""}</span>
              </div>
              <div>
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Remark:</span>
                <span className="italic">{contract.remarks_internal || "-"}</span>
              </div>
              {contract.case_hold_terminate && (
                <div className="p-2 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
                  <strong>Hold/Terminate Case:</strong> {contract.case_hold_terminate}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button
            onClick={() => {
              onClose();
              onEdit(contract);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Edit Kontrak Ini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

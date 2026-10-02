"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { Contract } from "@/types/contract";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  Building2,
  Calendar,
} from "lucide-react";

interface ExpiringContractsAlertModalProps {
  contracts: Contract[];
  isOpen: boolean;
  onClose: () => void;
}

export function ExpiringContractsAlertModal({
  contracts,
  isOpen,
  onClose,
}: ExpiringContractsAlertModalProps) {
  const [dontShowAgainSession, setDontShowAgainSession] = useState(false);

  const calculateDaysLeft = (dateStrTo: string | null | undefined): number => {
    if (!dateStrTo) return 0;
    const parts = dateStrTo.split("-");
    let expDate: Date;
    if (parts.length === 3) {
      expDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      expDate = new Date(dateStrTo);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Urutkan berdasarkan sisa hari paling sedikit (paling mendesak)
  const sortedContracts = useMemo(() => {
    return [...contracts].sort((a, b) => {
      return calculateDaysLeft(a.contract_date_to) - calculateDaysLeft(b.contract_date_to);
    });
  }, [contracts]);

  const handleClose = () => {
    if (dontShowAgainSession) {
      sessionStorage.setItem("has_seen_expiring_alert", "true");
    }
    onClose();
  };

  const criticalCount = contracts.filter((c) => calculateDaysLeft(c.contract_date_to) <= 30).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Kontrak Segera Berakhir
                <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                  {contracts.length}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar kontrak mitra yang mendekati batas waktu berakhir (&le; 60 hari).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col space-y-3 py-2">
          {/* Simple Alert Banner */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-amber-200 bg-amber-50/70 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 shrink-0">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Terdapat <strong>{contracts.length} kontrak</strong> yang akan berakhir dalam 60 hari ({criticalCount} kontrak &le; 30 hari).
            </span>
          </div>

          {/* Table Kontrak Segera Berakhir */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex-1">
            <div className="overflow-y-auto max-h-[340px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Nama Mitra</th>
                    <th className="py-2.5 px-3">Tgl Berakhir</th>
                    <th className="py-2.5 px-3 text-center">Sisa Waktu</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedContracts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Tidak ada kontrak yang mendekati batas waktu.
                      </td>
                    </tr>
                  ) : (
                    sortedContracts.map((c) => {
                      const daysLeft = calculateDaysLeft(c.contract_date_to);
                      const isCritical = daysLeft <= 30;

                      return (
                        <tr
                          key={c.contract_number}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[240px]" title={c.vendor_name}>
                                {c.vendor_name}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[240px]" title={c.core_business || "-"}>
                              {c.core_business || "-"}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              {formatDate(c.contract_date_to)}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                isCritical
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {daysLeft} Hari Lagi
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={`/contracts?search=${encodeURIComponent(c.contract_number)}`}
                              onClick={handleClose}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                            >
                              Lihat
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgainSession}
              onChange={(e) => setDontShowAgainSession(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>Jangan ingatkan lagi pada sesi ini</span>
          </label>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={handleClose} className="text-xs">
              Tutup
            </Button>
            <Button asChild size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/contracts" onClick={handleClose}>
                Kelola Seluruh Kontrak →
              </Link>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

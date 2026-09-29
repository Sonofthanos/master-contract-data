"use client";

import { useState, useRef } from "react";
import { parseContractWorkbook } from "@/lib/excel-parser";
import { upsertContractsBatch } from "@/lib/actions/contract-actions";
import { Contract } from "@/types/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Database,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ExcelUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedContracts, setParsedContracts] = useState<Contract[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState<{ total: number; success: boolean } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
    if (e.target) e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    await processFile(droppedFile);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("File harus berformat Excel (.xlsx atau .xls)");
      return;
    }

    setFile(file);
    setIsParsing(true);
    setUploadStats(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseContractWorkbook(buffer);

      if (parsed.length === 0) {
        toast.error("Tidak ditemukan data kontrak pada sheet 'Detail Contract'. Pastikan struktur kolom sesuai.");
      } else {
        setParsedContracts(parsed);
        toast.success(`Berhasil membaca ${parsed.length} baris data kontrak!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membaca file Excel";
      toast.error(`Kesalahan parsing: ${msg}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartUpsert = async () => {
    if (parsedContracts.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const result = await upsertContractsBatch(parsedContracts);
      setUploadProgress(100);
      setUploadStats({ total: result.count, success: true });
      toast.success(`Sukses! ${result.count} data kontrak berhasil disimpan ke database.`);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal meng-upsert data ke database";
      toast.error(msg);
      setUploadStats({ total: 0, success: false });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
        <CardContent className="p-8">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
              {file ? file.name : "Pilih atau Tarik File Excel Master (MCD)"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md">
              Sistem akan membaca sheet <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">Detail Contract</code> dimulai dari baris ke-6 secara otomatis.
            </p>
            {file && (
              <Badge variant="secondary" className="mt-3 gap-1.5 font-mono text-[11px]">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parsing Status / Preview */}
      {isParsing && (
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Sedang membaca dan menormalisasi baris kontrak...
        </div>
      )}

      {parsedContracts.length > 0 && !isParsing && (
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Preview Data Berhasil Diparsing ({parsedContracts.length} Baris Kontrak)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kunci unik untuk upsert: <code className="font-mono text-indigo-600">contract_number</code>. Data dengan nomor kontrak yang sama akan otomatis diperbarui.
                </p>
              </div>

              <Button
                onClick={handleStartUpsert}
                disabled={isUploading}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Memproses Batch Ingestion...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Mulai Ingest ke Database
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Proses Upsert Database (Batch 150 rows)...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success message */}
            {uploadStats?.success && (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Seluruh {uploadStats.total} data kontrak berhasil disimpan ke master database!
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/contracts")}
                  className="gap-1 text-xs"
                >
                  Buka Master Table <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Sample Table Preview (First 5 Rows) */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                Sample 5 Baris Pertama Hasil Parsing:
              </h5>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Vendor ID</th>
                      <th className="p-2.5">Nama Mitra</th>
                      <th className="p-2.5">Nomor Kontrak</th>
                      <th className="p-2.5">Core Business</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Berlaku Dari - Sampai</th>
                      <th className="p-2.5">Scan Doc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedContracts.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono">{row.vendor_id}</td>
                        <td className="p-2.5 font-medium">{row.vendor_name}</td>
                        <td className="p-2.5 font-mono text-[11px]">{row.contract_number}</td>
                        <td className="p-2.5">{row.core_business || "-"}</td>
                        <td className="p-2.5">
                          <Badge
                            variant={
                              row.contract_status === "Active" || row.contract_status === "Valid"
                                ? "success"
                                : row.contract_status === "Expired"
                                ? "destructive"
                                : "warning"
                            }
                            className="text-[10px] py-0 px-1.5"
                          >
                            {row.contract_status}
                          </Badge>
                        </td>
                        <td className="p-2.5">
                          {row.contract_date_from} s/d {row.contract_date_to}
                        </td>
                        <td className="p-2.5 font-semibold">{row.scan_doc_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

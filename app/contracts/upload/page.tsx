import Link from "next/link";
import { ExcelUploader } from "@/components/contracts/excel-uploader";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  HelpCircle,
  CheckCircle2,
  FileCheck2
} from "lucide-react";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/contracts"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Master Database
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Bulk Upload & Ingest
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Upload & Ingest Master Data Excel
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Impor data kontrak dari file master Excel MCD. Sistem akan otomatis memparsing, memvalidasi, dan meng-upsert data tanpa duplikasi.
        </p>
      </div>

      {/* Guide Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-indigo-600" /> Spesifikasi & Aturan Ingest File:
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
          <li>
            Target Sheet: Sheet bernama <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-indigo-600">Detail Contract</code> (atau sheet pertama jika tidak ditemukan).
          </li>
          <li>
            Baris Header: Header kolom terbaca pada baris ke-6 (skips 5 baris atas).
          </li>
          <li>
            Conflict Target (Auto-Upsert): Kolom <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-indigo-600">CONTRACT NUMBER</code>. Jika nomor kontrak sudah ada di database, baris tersebut akan diperbarui secara transparan.
          </li>
          <li>
            Pemrosesan Batch: Data di-chunk ke dalam batch 150 baris per transaksi untuk menjaga performa koneksi database.
          </li>
        </ul>
      </div>

      {/* Main Uploader */}
      <ExcelUploader />
    </div>
  );
}

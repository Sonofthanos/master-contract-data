"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractFormSchema, ContractFormValues } from "@/lib/validations/contract-schema";
import { Contract } from "@/types/contract";
import { CORE_BUSINESS_LIST, CONTRACT_TYPES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, AlertCircle } from "lucide-react";

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractToEdit?: Contract | null;
  onSave: (contract: Contract) => Promise<void>;
}

export function ContractFormModal({
  isOpen,
  onClose,
  contractToEdit,
  onSave,
}: ContractFormModalProps) {
  const isEditing = Boolean(contractToEdit);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      vendor_id: "",
      vendor_name: "",
      contract_number: "",
      core_business: CORE_BUSINESS_LIST[0],
      vendor_category: "Small",
      contract_type: "P",
      contract_status: "Active",
      scan_doc_status: "BELUM",
      upload_contract_status: "BELUM",
      contract_date_from: "",
      contract_date_to: "",
      pic_email: "",
      remarks_internal: "",
    },
  });

  useEffect(() => {
    if (contractToEdit) {
      let cType = contractToEdit.contract_type || "P";
      if (cType.toUpperCase() === "AMANDEMEN") cType = "AMD";

      reset({
        vendor_id: contractToEdit.vendor_id || "",
        vendor_name: contractToEdit.vendor_name || "",
        contract_number: contractToEdit.contract_number || "",
        core_business: contractToEdit.core_business || CORE_BUSINESS_LIST[0],
        vendor_category: contractToEdit.vendor_category || "Small",
        contract_type: cType,
        contract_status: contractToEdit.contract_status === "Valid" ? "Active" : (contractToEdit.contract_status || "Active"),
        scan_doc_status: contractToEdit.scan_doc_status || "BELUM",
        upload_contract_status: contractToEdit.upload_contract_status || "BELUM",
        contract_date_from: contractToEdit.contract_date_from || "",
        contract_date_to: contractToEdit.contract_date_to || "",
        pic_email: contractToEdit.pic_email || "",
        remarks_internal: contractToEdit.remarks_internal || "",
      });
    } else {
      reset({
        vendor_id: "",
        vendor_name: "",
        contract_number: "",
        core_business: CORE_BUSINESS_LIST[0],
        vendor_category: "Small",
        contract_type: "P",
        contract_status: "Active",
        scan_doc_status: "BELUM",
        upload_contract_status: "BELUM",
        contract_date_from: "",
        contract_date_to: "",
        pic_email: "",
        remarks_internal: "",
      });
    }
  }, [contractToEdit, isOpen, reset]);

  const contractDateTo = watch("contract_date_to");
  useEffect(() => {
    if (contractDateTo) {
      const parts = contractDateTo.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const expDate = new Date(y, m, d, 23, 59, 59, 999);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!isNaN(expDate.getTime())) {
          setValue("contract_status", expDate >= today ? "Active" : "Expired");
        }
      }
    }
  }, [contractDateTo, setValue]);

  const onSubmit = async (values: ContractFormValues) => {
    const payload: Contract = {
      ...(contractToEdit || {}),
      vendor_id: values.vendor_id,
      vendor_name: values.vendor_name,
      contract_number: values.contract_number,
      core_business: values.core_business || null,
      vendor_category: values.vendor_category || null,
      contract_type: values.contract_type || null,
      contract_status: values.contract_status || "Active",
      scan_doc_status: values.scan_doc_status || "BELUM",
      upload_contract_status: values.upload_contract_status || "BELUM",
      contract_date_from: values.contract_date_from,
      contract_date_to: values.contract_date_to,
      pic_email: values.pic_email || null,
      remarks_internal: values.remarks_internal || null,
      result_selection: contractToEdit?.result_selection || null,
      rfc: contractToEdit?.rfc || null,
      remarks_sourcing: contractToEdit?.remarks_sourcing || null,
      period: contractToEdit?.period || null,
      draft_sent_date: contractToEdit?.draft_sent_date || null,
      draft_return_date: contractToEdit?.draft_return_date || null,
      final_approval_date: contractToEdit?.final_approval_date || null,
      return_to_vendor_date: contractToEdit?.return_to_vendor_date || null,
      subcont_status: contractToEdit?.subcont_status || null,
      outstanding_status: contractToEdit?.outstanding_status || null,
      action_status: contractToEdit?.action_status || null,
      action_date: contractToEdit?.action_date || null,
      case_hold_terminate: contractToEdit?.case_hold_terminate || null,
    };

    await onSave(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Data Kontrak Mitra" : "Tambah Kontrak Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Ubah informasi kontrak mitra kerja TBIG. Nomor kontrak bertindak sebagai kunci unik."
              : "Masukkan data kontrak baru. Jika nomor kontrak sudah ada, sistem akan otomatis memperbarui datanya."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Baris 1: Vendor ID & Nama Mitra */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Vendor ID <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Contoh: 1368"
                {...register("vendor_id")}
                className="mt-1"
              />
              {errors.vendor_id && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.vendor_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Mitra (Vendor) <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="Contoh: PT. Dwi Putra Nugraha"
                {...register("vendor_name")}
                className="mt-1"
              />
              {errors.vendor_name && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.vendor_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Baris 2: Nomor Kontrak & Tipe Kontrak */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nomor Kontrak (Unique Key) <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="0001/TBG-TBG-00/VEM-SACME/..."
                {...register("contract_number")}
                className="mt-1 font-mono text-xs"
              />
              {errors.contract_number && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.contract_number.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tipe Kontrak
              </label>
              <select
                {...register("contract_type")}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {CONTRACT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris 3: Core Business (22 Pilihan) & Kategori Vendor */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Core Business (22 Bidang Usaha)
              </label>
              <select
                {...register("core_business")}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                {CORE_BUSINESS_LIST.map((cb) => (
                  <option key={cb} value={cb}>
                    {cb}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kategori Vendor
              </label>
              <select
                {...register("vendor_category")}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Non Category">Non Category</option>
              </select>
            </div>
          </div>

          {/* Baris 4: Tanggal Kontrak (From & To) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Mulai (From) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                {...register("contract_date_from")}
                className="mt-1"
              />
              {errors.contract_date_from && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.contract_date_from.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Berakhir (To) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                {...register("contract_date_to")}
                className="mt-1"
              />
              {errors.contract_date_to && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.contract_date_to.message}
                </p>
              )}
            </div>
          </div>

          {/* Baris 5: Status Kontrak & Scan Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status Kontrak
              </label>
              <select
                {...register("contract_status")}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="No Contract">No Contract</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Scan Dokumen Kontrak
              </label>
              <select
                {...register("scan_doc_status")}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="SUDAH">SUDAH</option>
                <option value="BELUM">BELUM</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload Kontrak
              </label>
              <select
                {...register("upload_contract_status")}
                className="mt-1 flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="SUDAH">SUDAH</option>
                <option value="BELUM">BELUM</option>
              </select>
            </div>
          </div>

          {/* Baris 6: PIC Email & Catatan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email PIC Vendor
              </label>
              <Input
                type="email"
                placeholder="pic@vendor.co.id"
                {...register("pic_email")}
                className="mt-1"
              />
              {errors.pic_email && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.pic_email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Remark
              </label>
              <Input
                placeholder="Catatan / remark..."
                {...register("remarks_internal")}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Kontrak"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

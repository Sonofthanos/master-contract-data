import { z } from "zod";

export const contractFormSchema = z.object({
  id: z.string().optional(),
  vendor_id: z.string().min(1, "Vendor ID wajib diisi"),
  vendor_name: z.string().min(1, "Nama Mitra wajib diisi"),
  core_business: z.string().optional(),
  vendor_category: z.string().optional(),
  result_selection: z.string().optional(),
  rfc: z.string().optional(),
  remarks_sourcing: z.string().optional(),
  contract_type: z.string().optional(),
  contract_number: z.string().min(1, "Nomor Kontrak wajib diisi"),
  period: z.string().optional(),
  contract_date_from: z.string().min(1, "Tanggal mulai kontrak wajib diisi"),
  contract_date_to: z.string().min(1, "Tanggal akhir kontrak wajib diisi"),
  draft_sent_date: z.string().optional(),
  draft_return_date: z.string().optional(),
  final_approval_date: z.string().optional(),
  return_to_vendor_date: z.string().optional(),
  contract_status: z.string(),
  subcont_status: z.string().optional(),
  scan_doc_status: z.string(),
  upload_contract_status: z.string(),
  outstanding_status: z.string().optional(),
  action_status: z.string().optional(),
  pic_email: z.string().optional(),
  action_date: z.string().optional(),
  remarks_internal: z.string().optional(),
  case_hold_terminate: z.string().optional(),
});

export type ContractFormValues = {
  id?: string;
  vendor_id: string;
  vendor_name: string;
  core_business?: string;
  vendor_category?: string;
  result_selection?: string;
  rfc?: string;
  remarks_sourcing?: string;
  contract_type?: string;
  contract_number: string;
  period?: string;
  contract_date_from: string;
  contract_date_to: string;
  draft_sent_date?: string;
  draft_return_date?: string;
  final_approval_date?: string;
  return_to_vendor_date?: string;
  contract_status: string;
  subcont_status?: string;
  scan_doc_status: string;
  upload_contract_status: string;
  outstanding_status?: string;
  action_status?: string;
  pic_email?: string;
  action_date?: string;
  remarks_internal?: string;
  case_hold_terminate?: string;
};

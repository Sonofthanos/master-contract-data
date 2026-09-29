import * as XLSX from "xlsx";
import { Contract } from "@/types/contract";

export function parseExcelDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString().split("T")[0];
  }
  if (typeof value === "number") {
    // Menghitung offset serial number Excel ke JavaScript Date
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("=")) return null;
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().split("T")[0];
  }
  return null;
}

function getRowValue(row: Record<string, unknown>, possibleKeys: string[]): unknown {
  const rowKeys = Object.keys(row);
  for (const targetKey of possibleKeys) {
    const targetNormalized = targetKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const k of rowKeys) {
      const kNormalized = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (kNormalized === targetNormalized) {
        return row[k];
      }
    }
  }
  return undefined;
}

export function parseContractWorkbook(buffer: ArrayBuffer | Uint8Array): Contract[] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  
  // Cari sheet 'Detail Contract' secara case-insensitive
  const targetSheetName = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === "detail contract" || name.trim().toLowerCase().includes("detail")
  ) || workbook.SheetNames[0];
  
  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) return [];

  // PENTING: Batasi range kolom maksimum ke kolom 35 (Index 0-34).
  // File MCD master memiliki dimensi ref s.d. XFD (16.384 kolom kosong) yang dapat menyebabkan browser hang / OOM.
  let headerIndex = 5; // Default baris ke-6 (0-indexed 5)
  if (worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    range.e.c = Math.min(range.e.c, 35);
    worksheet["!ref"] = XLSX.utils.encode_range(range);
  }

  // Cari baris header secara dinamis pada 10 baris pertama
  const sampleRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: null });
  for (let i = 0; i < Math.min(10, sampleRows.length); i++) {
    const rowStr = JSON.stringify(sampleRows[i] || "").toUpperCase();
    if (rowStr.includes("CONTRACT NUMBER") || (rowStr.includes("VENDOR ID") && rowStr.includes("MITRA"))) {
      headerIndex = i;
      break;
    }
  }

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, {
    range: headerIndex,
    defval: null,
  });

  return rawRows
    .filter((row, idx) => {
      const namaMitra = getRowValue(row, ["NAMA MITRA", "Nama Mitra", "Vendor Name", "Mitra"]);
      const contractNumber = getRowValue(row, ["CONTRACT NUMBER", "Contract Number", "Nomor Kontrak"]);
      const vendorId = getRowValue(row, ["Vendor ID", "VendorId", "ID Vendor"]);

      // Abaikan baris subtotal, formula atau baris kosong
      const sMitra = namaMitra ? String(namaMitra).trim() : "";
      const sContract = contractNumber ? String(contractNumber).trim() : "";
      const sVendorId = vendorId ? String(vendorId).trim() : "";

      if (sMitra.startsWith("=") || sContract.startsWith("=") || sVendorId.startsWith("=")) {
        return false;
      }
      if (sMitra.toUpperCase().includes("SUBTOTAL") || sMitra.toUpperCase().includes("SUMPRODUCT")) {
        return false;
      }

      // Valid jika memiliki nama mitra atau nomor kontrak atau vendor id
      return sMitra !== "" || sContract !== "" || sVendorId !== "";
    })
    .map((row, idx) => {
      const rawVendorId = getRowValue(row, ["Vendor ID", "VendorId", "ID Vendor"]);
      const vendorIdStr = rawVendorId != null
        ? (typeof rawVendorId === "number" ? String(rawVendorId) : String(rawVendorId).trim())
        : "N/A";

      const rawNamaMitra = getRowValue(row, ["NAMA MITRA", "Nama Mitra", "Vendor Name", "Mitra"]);
      const vendorNameStr = rawNamaMitra ? String(rawNamaMitra).trim() : "Mitra TBIG";

      const rawNo = getRowValue(row, ["No", "NO", "Nomor"]);
      const noStr = rawNo ? String(rawNo).trim() : String(idx + 1);

      const rawContractNo = getRowValue(row, ["CONTRACT NUMBER", "Contract Number", "Nomor Kontrak"]);
      // Jika nomor kontrak belum diterbitkan, buatkan surrogate key DRAFT yang unik
      const contractNoStr = rawContractNo && String(rawContractNo).trim() !== ""
        ? String(rawContractNo).trim()
        : `DRAFT-${vendorIdStr !== "N/A" ? vendorIdStr : "NEW"}-${noStr}`;

      // Normalisasi tipe kontrak: P (Perpanjangan), B (Baru), AMD (Amandemen)
      const rawContractType = getRowValue(row, ["Type of Contract", "Type", "Tipe Kontrak"]);
      let contractType = rawContractType ? String(rawContractType).trim() : null;
      if (contractType) {
        const upper = contractType.toUpperCase();
        if (upper === "AMANDEMEN" || upper === "AMD") contractType = "AMD";
        else if (upper === "P") contractType = "P";
        else if (upper === "B") contractType = "B";
      }

      // Core Business
      const rawCoreBusiness = getRowValue(row, ["CORE BUSINESS", "Core Business", "Bidang Usaha"]);
      let coreBusiness = rawCoreBusiness ? String(rawCoreBusiness).trim() : null;
      if (coreBusiness && coreBusiness.startsWith("=")) {
        coreBusiness = null;
      }

      const dateFrom = parseExcelDate(getRowValue(row, ["CONTRACT DATE FROM", "Contract Date From", "Tanggal Mulai"]));
      const dateTo = parseExcelDate(getRowValue(row, ["CONTRACT DATE TO", "Contract Date To", "Tanggal Akhir"]));

      // Status Kontrak: ditentukan berdasarkan CONTRACT DATE TO vs Hari Ini
      // Jika CONTRACT DATE TO >= hari ini -> Active, jika < hari ini -> Expired
      const rawStatus = getRowValue(row, ["CONTRACT STATUS", "Contract Status", "Status Kontrak"]);
      let contractStatus = "Active";
      if (dateTo) {
        const parts = dateTo.split("-");
        let expDate: Date;
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          expDate = new Date(y, m, d, 23, 59, 59, 999);
        } else {
          expDate = new Date(dateTo);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        contractStatus = !isNaN(expDate.getTime()) && expDate >= today ? "Active" : "Expired";
      } else if (rawStatus) {
        const s = String(rawStatus).trim();
        contractStatus = s.toLowerCase() === "valid" ? "Active" : s;
      } else {
        contractStatus = "No Contract";
      }

      const scanDoc = getRowValue(row, ["SCAN DOC CONTRACT", "Scan Doc", "SCAN DOC"]);
      const uploadDoc = getRowValue(row, ["UPLOAD CONTRACT", "Upload Contract", "UPLOAD"]);

      const remarksInternal = getRowValue(row, ["Remarks_1", "Remarks 1", "Catatan Internal", "Remarks"]);
      const remarksSourcing = getRowValue(row, ["Remarks", "Remarks Sourcing", "Sourcing Remarks"]);

      return {
        vendor_id: vendorIdStr,
        vendor_name: vendorNameStr,
        core_business: coreBusiness,
        vendor_category: (getRowValue(row, ["VENDOR CATEGORY", "Vendor Category", "Kategori"]) as string) || null,
        result_selection: (getRowValue(row, ["Result Selection", "Result"]) as string) || null,
        rfc: (getRowValue(row, ["RFC (Request For Contract)", "RFC"]) as string) || null,
        remarks_sourcing: remarksSourcing ? String(remarksSourcing).trim() : null,
        contract_type: contractType,
        contract_number: contractNoStr,
        period: (getRowValue(row, ["PERIOD", "Period", "Tahun"]) as string) ? String(getRowValue(row, ["PERIOD", "Period", "Tahun"])).trim() : null,
        contract_date_from: dateFrom,
        contract_date_to: dateTo,
        draft_sent_date: parseExcelDate(getRowValue(row, ["Draft Sent To Vendor", "Draft Sent"])),
        draft_return_date: parseExcelDate(getRowValue(row, ["Draft Return and Approve from Vendor", "Draft Return"])),
        final_approval_date: parseExcelDate(getRowValue(row, ["Final Approval"])),
        return_to_vendor_date: parseExcelDate(getRowValue(row, ["Return Contract to Vendor", "Return To Vendor"])),
        contract_status: contractStatus,
        subcont_status: (getRowValue(row, ["Subcont Status per core business per contract", "Subcont Status"]) as string) || null,
        scan_doc_status: scanDoc ? String(scanDoc).toUpperCase().trim() : "BELUM",
        upload_contract_status: uploadDoc ? String(uploadDoc).toUpperCase().trim() : "BELUM",
        outstanding_status: (getRowValue(row, ["OUTSTANDING STATUS", "Outstanding Status"]) as string) || null,
        action_status: (getRowValue(row, ["ACTION", "Action"]) as string) || null,
        pic_email: (getRowValue(row, ["EMAIL", "Email", "PIC Email"]) as string) || null,
        action_date: parseExcelDate(getRowValue(row, ["DATE", "Date", "Action Date"])),
        remarks_internal: remarksInternal ? String(remarksInternal).trim() : null,
        case_hold_terminate: (getRowValue(row, ["Hold/Terminate Karena Case", "Hold Terminate"]) as string) || null,
      };
    });
}

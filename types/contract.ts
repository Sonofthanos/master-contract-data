export interface Contract {
  id?: string;
  vendor_id: string;
  vendor_name: string;
  core_business: string | null;
  vendor_category: string | null;
  result_selection: string | null;
  rfc: string | null;
  remarks_sourcing: string | null;
  contract_type: string | null;
  contract_number: string;
  period: string | null;
  contract_date_from: string | null;
  contract_date_to: string | null;
  draft_sent_date: string | null;
  draft_return_date: string | null;
  final_approval_date: string | null;
  return_to_vendor_date: string | null;
  contract_status: string; // 'Active' | 'Valid' | 'Expired' | 'No Contract' | etc.
  subcont_status: string | null;
  scan_doc_status: string; // 'SUDAH' | 'BELUM'
  upload_contract_status: string; // 'SUDAH' | 'BELUM'
  outstanding_status: string | null;
  action_status: string | null;
  pic_email: string | null;
  action_date: string | null;
  remarks_internal: string | null;
  case_hold_terminate: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContractFilterState {
  search: string;
  coreBusiness: string;
  contractStatus: string;
  scanDocStatus: string;
  contractType: string;
  vendorCategory: string;
}

export interface DashboardMetrics {
  totalContracts: number;
  totalActiveVendors: number;
  validContracts: number; // Active contracts
  activeContracts?: number;
  expiredContracts: number;
  noContract: number;
  expiringIn60Days: number;
  scanDocComplianceRate: number;
  coreBusinessDistribution: { name: string; count: number }[];
  contractStatusComposition: { name: string; value: number; color: string }[];
  contractTypeBreakdown: {
    category: string; // e.g. Small, Medium, Others
    P: number;
    B: number;
    Amandemen: number;
    Other: number;
  }[];
  periodTrend: { period: string; count: number }[];
  sourcingStrategyComposition: { name: string; value: number; color: string }[];
  contractCategoryComposition?: { name: string; value: number; color: string }[];
  expiringContractsList?: Contract[];
  topVendors: { name: string; count: number; active: number; expired: number }[];
  expirationTimeline: { month: string; count: number }[];
}

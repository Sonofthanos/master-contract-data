export const CORE_BUSINESS_LIST = [
  "DESAIN, SUPPLY & INSTALASI IBS",
  "DESIGN DAN ANALISA KONSTRUKSI",
  "ESR & SCSR",
  "FTTH & MAINTENANCE FTTH",
  "FTTH TURNKEY NON OPERATOR",
  "INSTALASI KABEL FO",
  "KONEKTIVITAS SELULER MRT",
  "LAINNYA",
  "MAINTENANCE",
  "MAINTENANCE ICT",
  "MAINTENANCE MRT",
  "MAINTENANCE TBTS/RETO",
  "MANAGE SERVICE",
  "PERKUATAN",
  "SACME MACRO MICRO",
  "SACME UNTUK MCP & BTS HOTEL",
  "SEWA GUDANG",
  "SUPPLY & INSTALL ICT",
  "SUPPLY MATERIAL FO",
  "SUPPLY, INSTALL & DISMANTEL RETO",
  "SUPPLY, INSTALL & DISMANTEL TOWER",
  "TRANSPORTASI PENGIRIMAN BARANG",
] as const;

export type CoreBusinessType = (typeof CORE_BUSINESS_LIST)[number];

export const CONTRACT_TYPES = [
  { value: "P", label: "P (Perpanjangan)", desc: "Perpanjangan Kontrak" },
  { value: "B", label: "B (Baru)", desc: "Kontrak Baru" },
  { value: "AMD", label: "AMD (Amandemen)", desc: "Amandemen / Addendum" },
] as const;

export function formatContractType(type: string | null | undefined): string {
  if (!type) return "-";
  const trimmed = type.trim();
  const upper = trimmed.toUpperCase();
  if (upper === "P") return "P (Perpanjangan)";
  if (upper === "B") return "B (Baru)";
  if (upper === "AMD" || upper === "AMANDEMEN") return "AMD (Amandemen)";
  return trimmed;
}

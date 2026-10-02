'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { createServerClient, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { Contract, DashboardMetrics } from '@/types/contract';

const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'contracts-cache.json');

function readLocalCache(): Contract[] {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const data = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(data) as Contract[];
    }
  } catch (err) {
    console.error('Error reading local contracts cache:', err);
  }
  return [];
}

function writeLocalCache(contracts: Contract[]): void {
  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(contracts, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local contracts cache:', err);
  }
}

/**
 * Menghitung status kontrak secara dinamis:
 * Membandingkan contract_date_to dengan hari ini (today).
 * Jika contract_date_to >= hari ini -> 'Active'
 * Jika contract_date_to < hari ini -> 'Expired'
 */
export async function computeContractStatus(contractDateTo: string | null | undefined, currentStatus?: string | null): Promise<string> {
  if (!contractDateTo) {
    if (currentStatus && currentStatus !== 'Valid' && currentStatus !== 'Active') {
      return currentStatus;
    }
    return 'No Contract';
  }

  const parts = contractDateTo.split('-');
  let expDate: Date;
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    expDate = new Date(y, m, d, 23, 59, 59, 999);
  } else {
    expDate = new Date(contractDateTo);
  }

  if (isNaN(expDate.getTime())) {
    return currentStatus || 'Active';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expDate >= today ? 'Active' : 'Expired';
}

function resolveContractStatusSync(contractDateTo: string | null | undefined, currentStatus?: string | null): string {
  if (!contractDateTo) {
    if (currentStatus && currentStatus !== 'Valid' && currentStatus !== 'Active') {
      return currentStatus;
    }
    return 'No Contract';
  }

  const parts = contractDateTo.split('-');
  let expDate: Date;
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    expDate = new Date(y, m, d, 23, 59, 59, 999);
  } else {
    expDate = new Date(contractDateTo);
  }

  if (isNaN(expDate.getTime())) {
    return currentStatus || 'Active';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expDate >= today ? 'Active' : 'Expired';
}

/**
 * Bulk Upsert Server Action (150 rows per batch)
 * Compliant with implementation.md section 5B
 */
/**
 * Bulk Upsert Server Action
 * Jika Nomor Kontrak, Vendor ID, atau Nama Mitra sama,
 * record lama LANGSUNG DITIMPA (di-update in-place), BUKAN menambah data baru.
 */
export async function upsertContractsBatch(records: Contract[]) {
  const isConfigured = isSupabaseServerConfigured();
  let totalProcessed = 0;
  const BATCH_SIZE = 150;

  if (isConfigured) {
    const supabase = await createServerClient();

    // 1. Ambil data existing dari database untuk dicocokkan
    let existingContracts: { id: string; vendor_id: string; vendor_name: string; contract_number: string }[] = [];
    let from = 0;
    const step = 1000;
    while (true) {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, vendor_id, vendor_name, contract_number')
        .range(from, from + step - 1);
      if (error || !data || data.length === 0) break;
      existingContracts.push(...data);
      if (data.length < step) break;
      from += step;
    }

    const byContractNo = new Map<string, typeof existingContracts[0]>();
    const byVendorId = new Map<string, typeof existingContracts[0]>();
    const byVendorName = new Map<string, typeof existingContracts[0]>();

    for (const ec of existingContracts) {
      if (ec.contract_number) byContractNo.set(ec.contract_number.trim(), ec);
      if (ec.vendor_id && ec.vendor_id !== 'N/A') byVendorId.set(ec.vendor_id.trim(), ec);
      if (ec.vendor_name && ec.vendor_name.trim().length > 2) {
        byVendorName.set(ec.vendor_name.toLowerCase().trim(), ec);
      }
    }

    // 2. Hubungkan incoming records dengan existing ID agar langsung menimpa
    const recordsToUpsert: Contract[] = [];
    const usedExistingIds = new Set<string>();

    for (const r of records) {
      let matched = null;
      const isDraft = !r.contract_number || r.contract_number.startsWith('DRAFT-');

      if (r.contract_number && byContractNo.has(r.contract_number.trim())) {
        matched = byContractNo.get(r.contract_number.trim());
      } else if (isDraft) {
        // Hanya cocokan berdasarkan vendor jika nomor kontrak belum ada / masih draft
        if (r.vendor_id && r.vendor_id !== 'N/A' && byVendorId.has(r.vendor_id.trim())) {
          matched = byVendorId.get(r.vendor_id.trim());
        } else if (r.vendor_name && byVendorName.has(r.vendor_name.toLowerCase().trim())) {
          matched = byVendorName.get(r.vendor_name.toLowerCase().trim());
        }
      }

      if (matched && !usedExistingIds.has(matched.id)) {
        usedExistingIds.add(matched.id);
        recordsToUpsert.push({
          ...r,
          id: matched.id,
          contract_number: (!isDraft)
            ? r.contract_number
            : matched.contract_number,
        });
      } else {
        recordsToUpsert.push(r);
      }
    }

    // 3. Eksekusi batch upsert dengan target 'id'
    for (let i = 0; i < recordsToUpsert.length; i += BATCH_SIZE) {
      const batch = recordsToUpsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('contracts').upsert(batch, {
        onConflict: 'id',
      });

      if (error) {
        // Fallback ke contract_number jika id baru
        const fallback = await supabase.from('contracts').upsert(batch, {
          onConflict: 'contract_number',
        });
        if (fallback.error) {
          throw new Error(`Gagal memproses batch index ${i}: ${error.message}`);
        }
      }
      totalProcessed += batch.length;
    }
  }

  // Sinkronisasi local cache dengan menimpa data lama jika contract_number cocok
  const existing = readLocalCache();
  const mapByContractNo = new Map<string, number>();
  const mapByVendorId = new Map<string, number>();
  const mapByVendorName = new Map<string, number>();

  existing.forEach((c, idx) => {
    if (c.contract_number) mapByContractNo.set(c.contract_number, idx);
    if (c.vendor_id && c.vendor_id !== 'N/A') mapByVendorId.set(c.vendor_id, idx);
    if (c.vendor_name) mapByVendorName.set(c.vendor_name.toLowerCase().trim(), idx);
  });

  const updatedCache = [...existing];
  for (const r of records) {
    let matchIdx = -1;
    const isDraft = !r.contract_number || r.contract_number.startsWith('DRAFT-');

    if (r.contract_number && mapByContractNo.has(r.contract_number)) {
      matchIdx = mapByContractNo.get(r.contract_number)!;
    } else if (isDraft) {
      if (r.vendor_id && r.vendor_id !== 'N/A' && mapByVendorId.has(r.vendor_id)) {
        matchIdx = mapByVendorId.get(r.vendor_id)!;
      } else if (r.vendor_name && mapByVendorName.has(r.vendor_name.toLowerCase().trim())) {
        matchIdx = mapByVendorName.get(r.vendor_name.toLowerCase().trim())!;
      }
    }

    if (matchIdx >= 0) {
      updatedCache[matchIdx] = {
        ...updatedCache[matchIdx],
        ...r,
        updated_at: new Date().toISOString(),
      };
    } else {
      const newIdx = updatedCache.length;
      if (r.contract_number) mapByContractNo.set(r.contract_number, newIdx);
      updatedCache.push({
        ...r,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
  writeLocalCache(updatedCache);

  if (!isConfigured) {
    totalProcessed = records.length;
  }

  revalidatePath('/');
  revalidatePath('/contracts');

  return {
    success: true,
    count: totalProcessed,
    mode: isConfigured ? 'supabase' : 'local_cache',
  };
}

/**
 * Fetch all contracts with optional filtering
 */
export async function getContracts(options?: {
  search?: string;
  coreBusiness?: string;
  contractStatus?: string;
  scanDocStatus?: string;
}): Promise<{ contracts: Contract[]; isConnectedToSupabase: boolean }> {
  const isConfigured = isSupabaseServerConfigured();

  if (isConfigured) {
    try {
      const supabase = await createServerClient();
      const allRows: Contract[] = [];
      let from = 0;
      const step = 1000;

      while (true) {
        let query = supabase
          .from('contracts')
          .select('*')
          .order('contract_date_to', { ascending: false })
          .range(from, from + step - 1);

        if (options?.coreBusiness && options.coreBusiness !== 'all') {
          query = query.eq('core_business', options.coreBusiness);
        }
        if (options?.contractStatus && options.contractStatus !== 'all') {
          query = query.eq('contract_status', options.contractStatus);
        }
        if (options?.scanDocStatus && options.scanDocStatus !== 'all') {
          query = query.eq('scan_doc_status', options.scanDocStatus);
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) break;
        allRows.push(...(data as Contract[]));
        if (data.length < step) break;
        from += step;
      }

      if (allRows.length > 0) {
        let results = allRows.map((c) => ({
          ...c,
          contract_status: resolveContractStatusSync(c.contract_date_to, c.contract_status),
        }));
        if (options?.contractStatus && options.contractStatus !== 'all') {
          results = results.filter((c) =>
            options.contractStatus === 'Active' || options.contractStatus === 'Valid'
              ? c.contract_status === 'Active' || c.contract_status === 'Valid'
              : c.contract_status === options.contractStatus
          );
        }
        if (options?.search) {
          const s = options.search.toLowerCase().trim();
          results = results.filter(
            (c) =>
              c.vendor_name?.toLowerCase().includes(s) ||
              c.vendor_id?.toLowerCase().includes(s) ||
              c.contract_number?.toLowerCase().includes(s)
          );
        }
        return { contracts: results, isConnectedToSupabase: true };
      }
    } catch (err) {
      console.warn('Falling back to local contracts cache due to error:', err);
    }
  }

  // Fallback to local cache
  let allContracts = readLocalCache().map((c) => ({
    ...c,
    contract_status: resolveContractStatusSync(c.contract_date_to, c.contract_status),
  }));
  if (options?.coreBusiness && options.coreBusiness !== 'all') {
    allContracts = allContracts.filter((c) => c.core_business === options.coreBusiness);
  }
  if (options?.contractStatus && options.contractStatus !== 'all') {
    allContracts = allContracts.filter((c) =>
      options.contractStatus === 'Active' || options.contractStatus === 'Valid'
        ? c.contract_status === 'Active' || c.contract_status === 'Valid'
        : c.contract_status === options.contractStatus
    );
  }
  if (options?.scanDocStatus && options.scanDocStatus !== 'all') {
    allContracts = allContracts.filter((c) => c.scan_doc_status === options.scanDocStatus);
  }
  if (options?.search) {
    const s = options.search.toLowerCase().trim();
    allContracts = allContracts.filter(
      (c) =>
        c.vendor_name?.toLowerCase().includes(s) ||
        c.vendor_id?.toLowerCase().includes(s) ||
        c.contract_number?.toLowerCase().includes(s)
    );
  }

  return { contracts: allContracts, isConnectedToSupabase: isConfigured };
}

/**
 * Upsert a single contract record (from manual form)
 */
export async function upsertSingleContract(record: Contract) {
  const isConfigured = isSupabaseServerConfigured();

  if (isConfigured) {
    const supabase = await createServerClient();
    const { error } = await supabase.from('contracts').upsert(record, {
      onConflict: 'contract_number',
    });
    if (error) {
      throw new Error(`Gagal menyimpan kontrak ke Supabase: ${error.message}`);
    }
  }

  // Update local cache
  const existing = readLocalCache();
  const map = new Map<string, Contract>();
  existing.forEach((c) => map.set(c.contract_number, c));
  map.set(record.contract_number, {
    ...record,
    updated_at: new Date().toISOString(),
  });
  writeLocalCache(Array.from(map.values()));

  revalidatePath('/');
  revalidatePath('/contracts');

  return { success: true, contract: record };
}

/**
 * Delete a contract record
 */
export async function deleteContract(contractNumber: string) {
  const isConfigured = isSupabaseServerConfigured();

  if (isConfigured) {
    const supabase = await createServerClient();
    const { error } = await supabase.from('contracts').delete().eq('contract_number', contractNumber);
    if (error) {
      throw new Error(`Gagal menghapus kontrak di Supabase: ${error.message}`);
    }
  }

  const existing = readLocalCache();
  const filtered = existing.filter((c) => c.contract_number !== contractNumber);
  writeLocalCache(filtered);

  revalidatePath('/');
  revalidatePath('/contracts');

  return { success: true };
}

/**
 * Calculate KPI metrics & charts data
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics & { isConnectedToSupabase: boolean }> {
  const { contracts, isConnectedToSupabase } = await getContracts();

  const totalContracts = contracts.length;
  const distinctVendors = new Set(contracts.map((c) => c.vendor_id).filter(Boolean));
  const totalActiveVendors = distinctVendors.size;

  let activeContracts = 0;
  let expiredContracts = 0;
  let noContract = 0;
  let expiringIn60Days = 0;
  let scanDocDoneCount = 0;

  const now = new Date();
  const in60Days = new Date();
  in60Days.setDate(now.getDate() + 60);

  const coreBusinessCountMap: Record<string, number> = {};
  const statusCountMap: Record<string, number> = {
    Active: 0,
    Expired: 0,
    'No Contract': 0,
    Other: 0,
  };

  // Vendor category -> Contract Type counts
  const categoryBreakdownMap: Record<
    string,
    { P: number; B: number; Amandemen: number; Other: number }
  > = {
    Small: { P: 0, B: 0, Amandemen: 0, Other: 0 },
    Medium: { P: 0, B: 0, Amandemen: 0, Other: 0 },
    Other: { P: 0, B: 0, Amandemen: 0, Other: 0 },
  };

  // 1. Period Trend
  const periodMap: Record<string, number> = {};
  // 2. Kategori Kontrak (Perpanjangan P, Baru B, Amandemen AMD)
  const categoryMap: Record<string, number> = { P: 0, B: 0, AMD: 0, Other: 0 };
  const sourcingMap: Record<string, number> = { Renewal: 0, New: 0, AMD: 0, Other: 0 };
  // Expiring contracts collection
  const expiringContractsList: Contract[] = [];
  // 3. Vendor stats for Top 10
  const vendorStats: Record<string, { name: string; count: number; active: number; expired: number }> = {};
  // 4. Expiration Timeline (Next 12 Months)
  const monthBuckets: Record<string, number> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  for (let i = 0; i < 12; i++) {
    const mDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${monthNames[mDate.getMonth()]} ${mDate.getFullYear()}`;
    monthBuckets[key] = 0;
  }

  for (const c of contracts) {
    const status = resolveContractStatusSync(c.contract_date_to, c.contract_status);
    if (status === 'Active' || status === 'Valid') activeContracts++;
    else if (status === 'Expired') expiredContracts++;
    else if (status === 'No Contract') noContract++;

    if (statusCountMap[status] !== undefined) {
      statusCountMap[status]++;
    } else if (status === 'Valid') {
      statusCountMap.Active++;
    } else {
      statusCountMap.Other++;
    }

    // Expiring soon: contract_date_to between now and 60 days
    if (c.contract_date_to) {
      const expDate = new Date(c.contract_date_to);
      if (!isNaN(expDate.getTime()) && expDate >= now && expDate <= in60Days) {
        expiringIn60Days++;
        expiringContractsList.push(c);
      }
    }

    // Scan doc status compliance
    if (c.scan_doc_status?.toUpperCase() === 'SUDAH') {
      scanDocDoneCount++;
    }

    // Core business
    const cb = c.core_business?.trim() || 'Lainnya';
    coreBusinessCountMap[cb] = (coreBusinessCountMap[cb] || 0) + 1;

    // Contract type breakdown by category
    const cat = c.vendor_category === 'Small' || c.vendor_category === 'Medium' ? c.vendor_category : 'Other';
    const cType = c.contract_type ? c.contract_type.trim().toUpperCase() : null;
    if (cType === 'P') categoryBreakdownMap[cat].P++;
    else if (cType === 'B') categoryBreakdownMap[cat].B++;
    else if (cType === 'AMANDEMEN' || cType === 'AMD') categoryBreakdownMap[cat].Amandemen++;
    else categoryBreakdownMap[cat].Other++;

    // Period Trend
    const p = c.period ? String(c.period).trim() : null;
    if (p && !p.startsWith('=')) {
      periodMap[p] = (periodMap[p] || 0) + 1;
    }

    // Sourcing Strategy & Kategori Kontrak
    const s = (c.remarks_sourcing || '').trim().toUpperCase();
    if (s === 'RENEWAL') sourcingMap.Renewal++;
    else if (s === 'NEW') sourcingMap.New++;
    else if (s === 'AMD' || s === 'AMANDEMEN') sourcingMap.AMD++;
    else if (s && !s.startsWith('=')) sourcingMap.Other++;

    const rawCType = (c.contract_type || '').trim().toUpperCase();
    if (rawCType === 'P' || rawCType === 'RENEWAL' || rawCType === 'PERPANJANGAN' || (!rawCType && s === 'RENEWAL')) {
      categoryMap.P++;
    } else if (rawCType === 'B' || rawCType === 'BARU' || rawCType === 'NEW' || (!rawCType && s === 'NEW')) {
      categoryMap.B++;
    } else if (rawCType === 'AMD' || rawCType === 'AMANDEMEN' || (!rawCType && (s === 'AMD' || s === 'AMANDEMEN'))) {
      categoryMap.AMD++;
    } else if (rawCType || (s && !s.startsWith('='))) {
      categoryMap.Other++;
    }

    // Vendor Stats for Top 10
    const vName = c.vendor_name ? c.vendor_name.trim() : 'Unknown';
    if (!vendorStats[vName]) {
      vendorStats[vName] = { name: vName, count: 0, active: 0, expired: 0 };
    }
    vendorStats[vName].count++;
    if (status === 'Active' || status === 'Valid') {
      vendorStats[vName].active++;
    } else {
      vendorStats[vName].expired++;
    }

    // Expiration Timeline (Next 12 Months)
    if (c.contract_date_to) {
      const parts = c.contract_date_to.split('-');
      if (parts.length === 3) {
        const exp = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (exp >= now) {
          const key = `${monthNames[exp.getMonth()]} ${exp.getFullYear()}`;
          if (monthBuckets[key] !== undefined) {
            monthBuckets[key]++;
          }
        }
      }
    }
  }

  // Urutkan kontrak yang segera berakhir (jatuh tempo paling dekat di atas)
  expiringContractsList.sort((a, b) => {
    const da = a.contract_date_to ? new Date(a.contract_date_to).getTime() : Infinity;
    const db = b.contract_date_to ? new Date(b.contract_date_to).getTime() : Infinity;
    return da - db;
  });

  const scanDocComplianceRate = totalContracts > 0 ? Math.round((scanDocDoneCount / totalContracts) * 100) : 0;

  // Top 7 Core Business distribution
  const coreBusinessDistribution = Object.entries(coreBusinessCountMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Status composition
  const contractStatusComposition = [
    { name: 'Active', value: activeContracts, color: '#10B981' },
    { name: 'Expired', value: expiredContracts, color: '#EF4444' },
    { name: 'No Contract', value: noContract, color: '#F59E0B' },
  ];

  // Contract type breakdown
  const contractTypeBreakdown = [
    { category: 'Small', ...categoryBreakdownMap.Small },
    { category: 'Medium', ...categoryBreakdownMap.Medium },
    { category: 'Others / Unassigned', ...categoryBreakdownMap.Other },
  ];

  // 1. Period Trend
  const periodTrend = Object.entries(periodMap)
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period));

  // 2. Kategori Kontrak Composition
  const contractCategoryComposition = [
    { name: 'Perpanjangan (P)', value: categoryMap.P, color: '#3B82F6' },
    { name: 'Baru (B)', value: categoryMap.B, color: '#10B981' },
    { name: 'Amandemen (AMD)', value: categoryMap.AMD, color: '#F59E0B' },
    ...(categoryMap.Other > 0 ? [{ name: 'Lainnya', value: categoryMap.Other, color: '#8B5CF6' }] : []),
  ];

  // 2b. Backward compatibility alias
  const sourcingStrategyComposition = contractCategoryComposition;

  // 3. Top 10 Vendors
  const topVendors = Object.values(vendorStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 4. Expiration Timeline
  const expirationTimeline = Object.entries(monthBuckets).map(([month, count]) => ({ month, count }));

  return {
    totalContracts,
    totalActiveVendors,
    validContracts: activeContracts,
    activeContracts,
    expiredContracts,
    noContract,
    expiringIn60Days,
    scanDocComplianceRate,
    coreBusinessDistribution,
    contractStatusComposition,
    contractTypeBreakdown,
    periodTrend,
    sourcingStrategyComposition,
    contractCategoryComposition,
    expiringContractsList,
    topVendors,
    expirationTimeline,
    isConnectedToSupabase,
  };
}

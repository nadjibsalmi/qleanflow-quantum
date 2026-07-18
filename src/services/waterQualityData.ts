import { readFile } from "fs/promises";
import path from "path";
import Papa from "papaparse";

/**
 * Real data access layer for the Ghana water quality dataset.
 *
 * This is intentionally a plain Node file-read + parse, not a mocked API
 * response - every number the dashboard renders traces back to
 * `data/ghana_water_quality_data.csv`. There is no synthetic/random data
 * anywhere in this module.
 */

export interface CommunityRecord {
  community: string;
  region: string;
  latitude: number;
  longitude: number;
  waterQuality: 0 | 1; // 1 = good
  distanceToRiverKm: number;
  isMiningZone: boolean;
  contaminationLevel: number;
  contaminationType: string;
  waterSource: string;
  waterAccessScore: number;
  numberOfChildren: number;
  population: number;
  avgDailyWaterNeedsLiters: number;
  diseasePrevalence: number;
  accessibility: string;
  urbanRural: string;
  sanitationFacilities: string;
  avgHouseholdIncomeGHS: number;
  educationLevelYears: number;
  governmentIntervention: boolean;
  ngoPresence: boolean;
  yearCollected: number;
}

type RawRow = Record<string, string>;

function toBool(v: string): boolean {
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

const NUMERIC_FIELDS: (keyof CommunityRecord)[] = [
  "latitude",
  "longitude",
  "distanceToRiverKm",
  "contaminationLevel",
  "waterAccessScore",
  "numberOfChildren",
  "population",
  "avgDailyWaterNeedsLiters",
  "diseasePrevalence",
  "avgHouseholdIncomeGHS",
  "educationLevelYears",
  "yearCollected",
];

function mapRow(row: RawRow): CommunityRecord {
  const record: CommunityRecord = {
    community: row["Community"],
    region: row["Region"],
    latitude: parseFloat(row["Latitude"]),
    longitude: parseFloat(row["Longitude"]),
    waterQuality: (row["Water Quality"] === "1" ? 1 : 0) as 0 | 1,
    distanceToRiverKm: parseFloat(row["Distance to Nearest River (km)"]),
    isMiningZone: toBool(row["Is Mining Zone"]),
    contaminationLevel: parseFloat(row["Contamination Level"]),
    contaminationType: row["Contamination Type"],
    waterSource: row["Water Source"],
    waterAccessScore: parseFloat(row["Water Access Score"]),
    numberOfChildren: parseInt(row["Number of Children"], 10),
    population: parseInt(row["Population"], 10),
    avgDailyWaterNeedsLiters: parseFloat(row["Average Daily Water Needs (liters)"]),
    diseasePrevalence: parseFloat(row["Prevalence of Water Borne Diseases"]),
    accessibility: row["Accessibility"],
    urbanRural: row["Urban/Rural"],
    sanitationFacilities: row["Sanitation Facilities Available"],
    avgHouseholdIncomeGHS: parseFloat(row["Average Household Income (GHS)"]),
    educationLevelYears: parseFloat(row["Education Level (Avg Years)"]),
    governmentIntervention: toBool(row["Government Intervention Present"]),
    ngoPresence: toBool(row["NGO Presence"]),
    yearCollected: parseInt(row["Year Data Collected"], 10),
  };

  // BEFORE: parseFloat/parseInt could silently produce NaN for any
  // malformed CSV cell with zero indication anywhere that it happened -
  // NaN would then quietly propagate into every downstream aggregate
  // (averages, sums) without ever throwing. Now surfaced as a console
  // warning naming the exact community and field, so a future data
  // update with a bad row is actually visible instead of silently
  // corrupting stats.
  for (const field of NUMERIC_FIELDS) {
    const value = record[field];
    if (typeof value === "number" && Number.isNaN(value)) {
      console.warn(
        `Malformed numeric value for "${field}" in community "${record.community || "(unknown)"}" - got NaN`
      );
    }
  }

  return record;
}

let cachedRecordsPromise: Promise<CommunityRecord[]> | null = null;

/**
 * BEFORE: this cached only the resolved array (`if (cachedRecords) return
 * cachedRecords`), which does nothing for concurrent calls that arrive
 * before the first one finishes - each one saw `cachedRecords === null`
 * and independently read + parsed the CSV from disk. This is exactly
 * what happened on every cold-start load of the Regions page, which
 * calls `getRegionSummaries()` (which itself calls `getAllRecords()`)
 * and `getAllRecords()` directly in the same `Promise.all`.
 *
 * AFTER: the in-flight Promise itself is cached, so concurrent callers
 * all await the same single read+parse operation.
 */
export async function getAllRecords(): Promise<CommunityRecord[]> {
  if (!cachedRecordsPromise) {
    cachedRecordsPromise = (async () => {
      const csvPath = path.join(process.cwd(), "data", "ghana_water_quality_data.csv");
      const raw = await readFile(csvPath, "utf-8");

      const parsed = Papa.parse<RawRow>(raw, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        // Real parsing errors (malformed rows, mismatched column count,
        // etc.) were previously silently ignored - Papa.parse still
        // returns whatever rows it *could* parse, so this failed
        // silently rather than surfacing a clear error.
        console.error(
          `CSV parsing encountered ${parsed.errors.length} error(s):`,
          parsed.errors.slice(0, 5)
        );
      }

      return parsed.data.map(mapRow);
    })();
  }

  return cachedRecordsPromise;
}

export interface RegionSummary {
  region: string;
  totalCommunities: number;
  avgContamination: number;
  goodQualityPct: number;
  miningZonePct: number;
}

export async function getRegionSummaries(): Promise<RegionSummary[]> {
  const records = await getAllRecords();
  const byRegion = new Map<string, CommunityRecord[]>();

  for (const r of records) {
    const list = byRegion.get(r.region) ?? [];
    list.push(r);
    byRegion.set(r.region, list);
  }

  return Array.from(byRegion.entries())
    .map(([region, list]) => ({
      region,
      totalCommunities: list.length,
      avgContamination: round(
        list.reduce((s, r) => s + r.contaminationLevel, 0) / list.length,
        3
      ),
      goodQualityPct: round(
        (list.filter((r) => r.waterQuality === 1).length / list.length) * 100,
        1
      ),
      miningZonePct: round(
        (list.filter((r) => r.isMiningZone).length / list.length) * 100,
        1
      ),
    }))
    .sort((a, b) => b.avgContamination - a.avgContamination);
}

export interface OverallStats {
  totalCommunities: number;
  totalPopulation: number;
  goodQualityPct: number;
  miningZonePct: number;
  avgDiseasePrevalence: number;
  avgWaterAccessScore: number;
  governmentInterventionPct: number;
  ngoPresencePct: number;
}

export async function getOverallStats(): Promise<OverallStats> {
  const records = await getAllRecords();
  const n = records.length;

  return {
    totalCommunities: n,
    totalPopulation: records.reduce((s, r) => s + (r.population || 0), 0),
    goodQualityPct: round(
      (records.filter((r) => r.waterQuality === 1).length / n) * 100,
      1
    ),
    miningZonePct: round((records.filter((r) => r.isMiningZone).length / n) * 100, 1),
    avgDiseasePrevalence: round(
      records.reduce((s, r) => s + r.diseasePrevalence, 0) / n,
      3
    ),
    avgWaterAccessScore: round(
      records.reduce((s, r) => s + r.waterAccessScore, 0) / n,
      2
    ),
    governmentInterventionPct: round(
      (records.filter((r) => r.governmentIntervention).length / n) * 100,
      1
    ),
    ngoPresencePct: round((records.filter((r) => r.ngoPresence).length / n) * 100, 1),
  };
}

export async function getContaminationTypeDistribution(): Promise<
  { type: string; count: number }[]
> {
  const records = await getAllRecords();
  const counts = new Map<string, number>();
  for (const r of records) {
    counts.set(r.contaminationType, (counts.get(r.contaminationType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getWaterSourceDistribution(): Promise<
  { source: string; count: number }[]
> {
  const records = await getAllRecords();
  const counts = new Map<string, number>();
  for (const r of records) {
    counts.set(r.waterSource, (counts.get(r.waterSource) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

function round(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

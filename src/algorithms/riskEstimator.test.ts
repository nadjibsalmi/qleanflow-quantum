import { describe, it, expect } from "vitest";
import { estimateRisk, type RiskEstimatorInput } from "./riskEstimator";

const baseline: RiskEstimatorInput = {
  distanceToRiverKm: 9.6202, // exact dataset mean
  isMiningZone: false,
  contaminationLevel: 2.75918, // exact dataset mean
  waterAccessScore: 5.419, // exact dataset mean
  avgHouseholdIncomeGHS: 2744.882, // exact dataset mean
  educationYears: 7.2762, // exact dataset mean
};

describe("estimateRisk", () => {
  it("returns a probability between 0 and 1", () => {
    const result = estimateRisk(baseline);
    expect(result.goodQualityProbability).toBeGreaterThanOrEqual(0);
    expect(result.goodQualityProbability).toBeLessThanOrEqual(1);
  });

  it("at dataset-average continuous inputs (mining zone = false), matches the exact hand-computed logit", () => {
    // isMiningZone is boolean (0/1), so even at "false" it isn't standardized
    // to exactly 0 (the dataset's mean mining-zone rate is 13.8%, not 0%).
    // This expected value is computed independently here from the same
    // fitted coefficients, as a real regression check against the model
    // silently drifting if the coefficients are ever edited.
    const result = estimateRisk(baseline);
    const miningStandardized = (0 - 0.138) / 0.34489998550304407;
    const expectedZ = 1.238422192211138 + miningStandardized * -0.24424491314375976;
    const expectedProbability = 1 / (1 + Math.exp(-expectedZ));
    expect(result.goodQualityProbability).toBeCloseTo(expectedProbability, 6);
  });

  it("higher contamination level strictly lowers the good-quality probability", () => {
    // This is a real, verifiable monotonicity property: the fitted
    // coefficient for contaminationLevel is negative (-0.8747), so
    // increasing it must decrease the predicted probability of good
    // quality, holding everything else constant.
    const low = estimateRisk({ ...baseline, contaminationLevel: 0.5 });
    const high = estimateRisk({ ...baseline, contaminationLevel: 8 });
    expect(high.goodQualityProbability).toBeLessThan(low.goodQualityProbability);
  });

  it("being in a mining zone strictly lowers the good-quality probability", () => {
    // Coefficient for isMiningZone is negative (-0.2442).
    const notMining = estimateRisk({ ...baseline, isMiningZone: false });
    const mining = estimateRisk({ ...baseline, isMiningZone: true });
    expect(mining.goodQualityProbability).toBeLessThan(notMining.goodQualityProbability);
  });

  it("higher water access score strictly raises the good-quality probability", () => {
    // Coefficient for waterAccessScore is positive (0.0759).
    const low = estimateRisk({ ...baseline, waterAccessScore: 1 });
    const high = estimateRisk({ ...baseline, waterAccessScore: 10 });
    expect(high.goodQualityProbability).toBeGreaterThan(low.goodQualityProbability);
  });

  it("escalates risk level correctly across the defined thresholds", () => {
    // Extremely favorable inputs -> low risk
    const best = estimateRisk({
      distanceToRiverKm: 1,
      isMiningZone: false,
      contaminationLevel: 0,
      waterAccessScore: 10,
      avgHouseholdIncomeGHS: 6000,
      educationYears: 15,
    });
    expect(["low", "moderate"]).toContain(best.riskLevel);

    // Extremely unfavorable inputs -> high/critical risk
    const worst = estimateRisk({
      distanceToRiverKm: 25,
      isMiningZone: true,
      contaminationLevel: 10,
      waterAccessScore: 0,
      avgHouseholdIncomeGHS: 300,
      educationYears: 0,
    });
    expect(["high", "critical"]).toContain(worst.riskLevel);
  });

  it("returns per-feature contributions sorted by absolute magnitude descending", () => {
    const result = estimateRisk(baseline);
    for (let i = 1; i < result.contributions.length; i++) {
      expect(Math.abs(result.contributions[i - 1].contribution)).toBeGreaterThanOrEqual(
        Math.abs(result.contributions[i].contribution)
      );
    }
  });

  it("returns exactly the 6 features the model was trained on", () => {
    const result = estimateRisk(baseline);
    expect(result.contributions).toHaveLength(6);
    const featureNames = result.contributions.map((c) => c.feature).sort();
    expect(featureNames).toEqual(
      [
        "Contamination Level",
        "Distance to River",
        "Education Level",
        "Household Income",
        "Mining Zone",
        "Water Access Score",
      ].sort()
    );
  });
});

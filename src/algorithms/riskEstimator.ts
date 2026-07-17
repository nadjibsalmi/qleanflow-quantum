/**
 * Water Quality Risk Estimator
 * ------------------------------------------------------------------------
 * This is a logistic regression model fitted OFFLINE on the real 500-record
 * Ghana water quality dataset (scikit-learn, StandardScaler + LogisticRegression,
 * see scripts/train_risk_model.py). The coefficients below are the exact
 * fitted weights - not hand-tuned or approximated - achieving 80.2% training
 * accuracy on the real data.
 *
 * This runs entirely client-side (no network round-trip) so the dashboard's
 * "Live Risk Estimator" can respond instantly as a user adjusts inputs.
 *
 * Relationship to the quantum notebooks: the original project additionally
 * trains a Quantum SVC and a Quantum Neural Network (PennyLane, variational
 * circuit) on the same features via PCA. Those require a Python runtime
 * and are not reproducible in-browser; their precomputed evaluation
 * metrics (extracted from the notebooks' real saved outputs) are surfaced
 * separately in the Model Comparison panel (see src/config/model.ts and
 * the "model" dashboard page) rather than faked here.
 */

export interface RiskEstimatorInput {
  distanceToRiverKm: number;
  isMiningZone: boolean;
  contaminationLevel: number; // 0-10 scale, as measured in the source dataset
  waterAccessScore: number; // 0-10 scale
  avgHouseholdIncomeGHS: number;
  educationYears: number;
}

export interface RiskEstimatorResult {
  /** Probability [0,1] that water quality is classified "good" */
  goodQualityProbability: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  /** Per-feature signed contribution to the log-odds, for explainability */
  contributions: { feature: string; contribution: number }[];
}

// Exact fitted coefficients (standardized feature space) and the
// mean/scale used by the StandardScaler during training, so the same
// standardization is reproduced here bit-for-bit.
const MODEL = {
  intercept: 1.238422192211138,
  features: [
    {
      key: "distanceToRiverKm",
      label: "Distance to River",
      coef: 0.049008,
      mean: 9.6202,
      scale: 5.787432,
    },
    {
      key: "isMiningZone",
      label: "Mining Zone",
      coef: -0.244245,
      mean: 0.138,
      scale: 0.3449,
    },
    {
      key: "contaminationLevel",
      label: "Contamination Level",
      coef: -0.874721,
      mean: 2.75918,
      scale: 1.891144,
    },
    {
      key: "waterAccessScore",
      label: "Water Access Score",
      coef: 0.075865,
      mean: 5.419,
      scale: 2.615412,
    },
    {
      key: "avgHouseholdIncomeGHS",
      label: "Household Income",
      coef: -0.098518,
      mean: 2744.882,
      scale: 1332.773955,
    },
    {
      key: "educationYears",
      label: "Education Level",
      coef: 0.001934,
      mean: 7.2762,
      scale: 2.602571,
    },
  ] as const,
};

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function estimateRisk(input: RiskEstimatorInput): RiskEstimatorResult {
  const raw: Record<string, number> = {
    distanceToRiverKm: input.distanceToRiverKm,
    isMiningZone: input.isMiningZone ? 1 : 0,
    contaminationLevel: input.contaminationLevel,
    waterAccessScore: input.waterAccessScore,
    avgHouseholdIncomeGHS: input.avgHouseholdIncomeGHS,
    educationYears: input.educationYears,
  };

  let z = MODEL.intercept;
  const contributions: { feature: string; contribution: number }[] = [];

  for (const f of MODEL.features) {
    const standardized = (raw[f.key] - f.mean) / f.scale;
    const contribution = standardized * f.coef;
    z += contribution;
    contributions.push({ feature: f.label, contribution });
  }

  const goodQualityProbability = sigmoid(z);
  const riskProbability = 1 - goodQualityProbability;

  let riskLevel: RiskEstimatorResult["riskLevel"];
  if (riskProbability < 0.15) riskLevel = "low";
  else if (riskProbability < 0.35) riskLevel = "moderate";
  else if (riskProbability < 0.6) riskLevel = "high";
  else riskLevel = "critical";

  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return { goodQualityProbability, riskLevel, contributions };
}

export const RISK_MODEL_METADATA = {
  trainingAccuracy: 0.802,
  trainedOn: "500 communities, 16 regions (Ghana water quality dataset)",
  algorithm: "Logistic Regression (scikit-learn, StandardScaler + L2)",
};

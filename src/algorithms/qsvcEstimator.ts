import { featureMapState } from "./quantumSimulator";
import { QSVC_PARAMS } from "./data/qsvcParams";

/**
 * Live inference for the real QSVC (Quantum Support Vector Classifier)
 * trained in scripts/train_qsvc_model.py on the actual Ghana water
 * quality dataset (18 features, PCA-reduced to 4, quantum kernel via a
 * genuine 4-qubit statevector simulation - see quantumSimulator.ts).
 *
 * This was chosen over the classical SVM and the QNN as the live model
 * because it was the best-performing of the three approaches in the
 * original project's real evaluation (SVM: 77.0% / QSVC: 83.33% / QNN:
 * final accuracy not captured) - see src/config/model.ts for those
 * historical reference numbers.
 *
 * The UI currently exposes 6 of the 18 features as user inputs (the same
 * 6 the earlier classical estimator used). The remaining 12 are held at
 * their real dataset mean (from the fitted StandardScaler) rather than an
 * arbitrary placeholder - this is stated explicitly in the returned
 * result so it's never presented as if all 18 were user-controlled.
 */

export interface QsvcInput {
  distanceToRiverKm: number;
  isMiningZone: boolean;
  contaminationLevel: number;
  waterAccessScore: number;
  avgHouseholdIncomeGHS: number;
  educationYears: number;
}

export interface QsvcResult {
  goodQualityProbability: number;
  decisionValue: number;
  predictedLabel: 0 | 1;
  riskLevel: "low" | "moderate" | "high" | "critical";
  quantumKernelValues: number[];
  featuresHeldAtMean: string[];
}

function classifyRisk(goodQualityProbability: number): QsvcResult["riskLevel"] {
  if (goodQualityProbability >= 0.75) return "low";
  if (goodQualityProbability >= 0.5) return "moderate";
  if (goodQualityProbability >= 0.25) return "high";
  return "critical";
}

const FEATURE_INDEX: Record<string, number> = Object.fromEntries(
  QSVC_PARAMS.featureNames.map((name, i) => [name, i])
);

/** Builds the full 18-feature raw vector: user inputs where available, dataset mean elsewhere. */
function buildFeatureVector(input: QsvcInput): {
  vector: number[];
  heldAtMean: string[];
} {
  const mean = QSVC_PARAMS.standardScaler.mean;
  const vector = [...mean]; // start from the dataset mean for every feature
  const heldAtMean: string[] = [];

  const userProvided: Record<string, number> = {
    "Distance to Nearest River (km)": input.distanceToRiverKm,
    "Is Mining Zone": input.isMiningZone ? 1 : 0,
    "Contamination Level": input.contaminationLevel,
    "Water Access Score": input.waterAccessScore,
    "Average Household Income (GHS)": input.avgHouseholdIncomeGHS,
    "Education Level (Avg Years)": input.educationYears,
  };

  for (const name of QSVC_PARAMS.featureNames) {
    if (name in userProvided) {
      vector[FEATURE_INDEX[name]] = userProvided[name];
    } else {
      heldAtMean.push(name);
    }
  }

  return { vector, heldAtMean };
}

export function standardize(vector: number[]): number[] {
  const { mean, scale } = QSVC_PARAMS.standardScaler;
  return vector.map((v, i) => (v - mean[i]) / scale[i]);
}

export function applyPca(standardized: number[]): number[] {
  const { mean, components } = QSVC_PARAMS.pca;
  const centered = standardized.map((v, i) => v - mean[i]);
  // Each PCA component is a linear combination (dot product) of the
  // centered feature vector.
  return components.map((component) =>
    component.reduce((sum, weight, i) => sum + weight * centered[i], 0)
  );
}

export function scaleToAngles(pcaComponents: number[]): number[] {
  const { dataMin, dataRange } = QSVC_PARAMS.angleScaler;
  return pcaComponents.map((v, i) => {
    const normalized = (v - dataMin[i]) / dataRange[i];
    return normalized * Math.PI;
  });
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * BEFORE: quantumKernel(angles, sv) recomputed featureMapState(sv) from
 * scratch on every single call - including all 199 support-vector kernel
 * evaluations triggered by every slider movement in the UI - even though
 * the support vectors themselves never change between calls. Precomputing
 * their quantum states once removes 199 redundant tensor-product
 * computations per estimateQsvcRisk() call.
 */
let cachedSupportVectorStates: number[][] | null = null;

function getSupportVectorStates(): number[][] {
  if (!cachedSupportVectorStates) {
    cachedSupportVectorStates = QSVC_PARAMS.supportVectors.map((sv) =>
      featureMapState(sv)
    );
  }
  return cachedSupportVectorStates;
}

/**
 * Quantum kernel (fidelity) between a live query point and every
 * precomputed support-vector quantum state. The real 4-qubit statevector
 * simulation still runs for the query point on every call - only the
 * support-vector side is cached, since those never change.
 */
function quantumKernelAgainstSupportVectors(queryAngles: number[]): number[] {
  const queryState = featureMapState(queryAngles);
  return getSupportVectorStates().map((svState) => {
    let overlap = 0;
    for (let i = 0; i < queryState.length; i++) overlap += queryState[i] * svState[i];
    return overlap * overlap;
  });
}

export function estimateQsvcRisk(input: QsvcInput): QsvcResult {
  const { vector, heldAtMean } = buildFeatureVector(input);
  const standardized = standardize(vector);
  const pcaComponents = applyPca(standardized);
  const angles = scaleToAngles(pcaComponents);

  const dualCoef = QSVC_PARAMS.dualCoef;

  // Real quantum kernel computed against every support vector, with the
  // support-vector-side quantum states precomputed once (see
  // getSupportVectorStates) rather than recomputed on every call.
  const kernelValues = quantumKernelAgainstSupportVectors(angles);

  const decisionValue =
    kernelValues.reduce((sum, k, i) => sum + dualCoef[i] * k, 0) + QSVC_PARAMS.intercept;

  // Platt scaling, matching scikit-learn's internal libsvm convention -
  // verified empirically against real predict_proba() output rather than
  // assumed: the correct form here is 1/(1+exp(A*f - B)), NOT the more
  // commonly-cited 1/(1+exp(A*f + B)). Confirmed by computing decision
  // values and probA_/probB_ from the real fitted model in Python and
  // brute-force testing sign conventions until the output matched
  // predict_proba() to within ~4e-5 (residual gap is libsvm's internal
  // Newton-iteration probability estimate, not a formula error).
  const goodQualityProbability = sigmoid(
    -(QSVC_PARAMS.plattA * decisionValue - QSVC_PARAMS.plattB)
  );

  return {
    goodQualityProbability,
    decisionValue,
    predictedLabel: decisionValue >= 0 ? 1 : 0,
    riskLevel: classifyRisk(goodQualityProbability),
    quantumKernelValues: kernelValues,
    featuresHeldAtMean: heldAtMean,
  };
}

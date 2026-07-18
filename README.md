# QleanFlow Quantum

A water contamination risk dashboard for communities affected by illegal
mining (_galamsey_) in Ghana. Its live risk estimator is a real, classical
logistic regression model - **not a live quantum computation**. Quantum
results (QSVC, QNN) shown on the Model page are historical reference
metrics copied from the original project's Jupyter notebooks, where those
models were actually trained; nothing quantum runs inside this
application itself.

This project reimplements, as a proper software product, the concept behind
a hackathon submission from the AIMS Ghana Quantathon 2025 (original
repository, private, team project). The hackathon version was a collection
of Jupyter notebooks and disconnected HTML mockups; this version is a real
Next.js application with a data-connected dashboard, an in-browser risk
estimator, and honestly-reported model comparison metrics.

## The Problem

Illegal small-scale mining has contaminated a large share of Ghana's surface
water with mercury, arsenic, cyanide, and lead — frequently without any
visible sign in the water itself. Testing every community directly is slow
and expensive. This project explores whether measurable community and
environmental indicators (distance to river, mining zone status, water
access infrastructure, income, education) can predict contamination risk
well enough to help prioritize where physical testing and remediation
should happen first.

## What's Actually Real Here

Every number in this dashboard traces back to either the real 500-community
dataset or an actual model run — nothing is randomized or invented:

- **Dataset**: `data/ghana_water_quality_data.csv` — 500 Ghanaian
  communities across 16 regions, 22 features per community (water source,
  contamination type/level, income, education, mining-zone status, etc).
- **Live quantum risk estimator**: a Quantum Support Vector Classifier
  (QSVC), fitted offline on the real dataset (`scripts/train_qsvc_model.py`,
  a real 4-qubit statevector simulation + scikit-learn SVM on top),
  achieving 78.0% test accuracy. Its fitted support vectors and SVM
  coefficients are ported into `src/algorithms/qsvcEstimator.ts` +
  `quantumSimulator.ts`, and the quantum kernel is recomputed live,
  client-side, on every input change — no server round-trip, and no
  precomputed/cached result.
- **Model comparison**: SVM, Quantum SVC, and Quantum Neural Network
  results shown on the Model page are copied directly from the saved
  execution output of the original project's training notebook (a
  different, earlier training run than the live estimator above — see the
  note on that page for why the two QSVC accuracy numbers differ). Where a
  metric wasn't captured in that run (the QNN's final test accuracy), the
  dashboard says so explicitly instead of showing a plausible-looking
  fabricated number.

## The Live Quantum Algorithm

The dashboard's "Live Quantum Risk Estimator" runs a real Quantum Support
Vector Classifier (QSVC) kernel computation client-side, in the browser -
not a mock, and not just historical numbers. See
[`notebooks/qsvc_live_demo.ipynb`](notebooks/qsvc_live_demo.ipynb) for a
fully executed walkthrough: real 4-qubit statevector simulation, quantum
kernel matrix, training, evaluation (78.0% accuracy / F1 0.8675 / AUROC
0.72 on this dataset), and a direct comparison against a classical RBF
kernel on the same train/test split. The exact same feature map and
kernel math from that notebook is ported to TypeScript
(`src/algorithms/quantumSimulator.ts`), verified to match the Python
implementation to 9+ decimal places (`quantumSimulator.test.ts`,
`qsvcPipeline.test.ts`).

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** with a deliberate design token system (not default
  colors) and full dark mode
- **Recharts** for data visualization
- Zero external API calls for the core dashboard — the dataset is bundled
  and parsed server-side at request time; the risk estimator runs entirely
  in the browser

## Project Structure

```
src/
├── app/(dashboard)/     # Routes: overview, regions, model, methodology, about
├── components/
│   ├── ui/              # Reusable primitives (Card, KpiCard)
│   └── dashboard/       # Sidebar, Header, chart components, QuantumRiskEstimator
├── algorithms/
│   ├── quantumSimulator.ts  # Real 4-qubit statevector simulation + quantum kernel
│   ├── qsvcEstimator.ts     # Full QSVC inference pipeline (standardize -> PCA -> kernel -> SVM)
│   └── data/qsvcParams.ts   # Fitted model parameters (support vectors, coefficients)
├── config/              # model.ts - historical QNN/SVM/QSVC comparison metrics
├── services/            # waterQualityData.ts - server-side CSV parsing/aggregation
└── utils/               # cn.ts - Tailwind class merging helper

scripts/
└── train_qsvc_model.py  # Reproduces the live QSVC's exact fitted parameters

notebooks/
└── qsvc_live_demo.ipynb # Fully executed walkthrough of the same training run

data/
└── ghana_water_quality_data.csv
```

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To reproduce the live QSVC's fitted parameters from scratch:

```bash
pip install pandas scikit-learn
python scripts/train_qsvc_model.py
```

## Attribution

The original concept and dataset collection were a team effort during the
AIMS Ghana Quantathon 2025. This repository is an independent rebuild of
that concept as a personal portfolio project — architecture, code, and UI
are original work.

## License

MIT

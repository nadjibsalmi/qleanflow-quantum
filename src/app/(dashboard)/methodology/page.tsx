import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <>
      <Header title="Methodology" />
      <main className="flex-1 p-6 space-y-6 max-w-3xl">
        <Card title="Problem framing">
          <p className="text-sm text-muted leading-relaxed">
            Illegal small-scale mining (locally known as{" "}
            <em>galamsey</em>) has contaminated a significant share of
            Ghana&apos;s surface water with mercury, arsenic, cyanide, and
            heavy metals. Contamination is frequently invisible: affected
            water can look, smell, and taste identical to safe water, which
            makes visual inspection or community reporting an unreliable way
            to prioritize testing and remediation resources. This project
            treats water safety as a supervised classification problem —
            predicting water quality from measurable community, geographic,
            and socioeconomic indicators that correlate with contamination
            risk, without requiring a lab test for every source up front.
          </p>
        </Card>

        <Card title="Dataset">
          <p className="text-sm text-muted leading-relaxed">
            The dataset covers 500 communities across 16 regions of Ghana,
            with 23 recorded features per community: geographic location,
            distance to the nearest river, proximity to known mining zones,
            water source type, sanitation infrastructure, household income,
            education level, and the presence of government or NGO
            intervention, alongside the target label (water quality: safe or
            unsafe) and a graded contamination level.
          </p>
        </Card>

        <Card title="Why compare classical and quantum approaches">
          <p className="text-sm text-muted leading-relaxed">
            The feature set is small (23 raw features, reduced to 4 principal
            components) and the sample size is modest — exactly the regime
            where near-term quantum machine learning methods are most
            plausible to evaluate meaningfully, since they don&apos;t yet
            scale to large feature spaces on real hardware or realistic
            simulators. Three approaches are trained on identical
            preprocessed data so their performance is directly comparable:
            a classical SVM baseline, a Quantum SVC (a classical SVM using a
            quantum-computed kernel), and a Quantum Neural Network (a
            variational circuit trained end-to-end with gradient descent).
            See the <a href="/model" className="text-accent hover:underline">Model</a>{" "}
            page for the exact configuration used.
          </p>
        </Card>

        <Card title="Limitations">
          <ul className="text-sm text-muted leading-relaxed space-y-2 list-disc list-inside">
            <li>
              All quantum circuits run on classical simulators
              (PennyLane&apos;s <code>default.qubit</code> device), not real
              quantum hardware — results reflect the algorithm&apos;s
              behavior, not hardware-specific noise or decoherence effects.
            </li>
            <li>
              The dataset, while realistic in structure, was compiled for a
              hackathon rather than sourced from a continuously updated
              government or NGO monitoring system — it should be treated as
              a proof of concept for the modeling approach, not a live
              operational dataset.
            </li>
            <li>
              A predicted &quot;safe&quot; classification is a risk-triage
              signal to prioritize lab testing, not a substitute for it.
            </li>
          </ul>
        </Card>
      </main>
    </>
  );
}

import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/Card";
import { QNN_CONFIG, COMPARED_MODELS } from "@/config/model";

export const metadata = { title: "Model" };

const CONFIG_ROWS: { label: string; value: string }[] = [
  { label: "Qubits", value: String(QNN_CONFIG.qubits) },
  { label: "Variational layers", value: String(QNN_CONFIG.variationalLayers) },
  { label: "Epochs", value: String(QNN_CONFIG.epochs) },
  {
    label: "Initial learning rate",
    value: `${QNN_CONFIG.initialLearningRate} (${QNN_CONFIG.lrSchedule})`,
  },
  { label: "Optimizer", value: QNN_CONFIG.optimizer },
  { label: "Feature embedding", value: QNN_CONFIG.embedding },
  { label: "Entanglement strategy", value: QNN_CONFIG.entanglementStrategy },
  { label: "PCA components", value: String(QNN_CONFIG.pcaComponents) },
  { label: "Batch size", value: String(QNN_CONFIG.batchSize) },
  { label: "Framework", value: QNN_CONFIG.framework },
];

export default function ModelPage() {
  return (
    <>
      <Header title="Model" />
      <main className="flex-1 p-6 space-y-6">
        <p className="text-sm text-muted max-w-2xl">
          Three classification approaches are trained on the same PCA-reduced feature set
          and compared on accuracy, F1, and ROC-AUC. The configuration below reflects the
          actual training run this project is based on.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COMPARED_MODELS.map((m) => (
            <Card key={m.id} title={m.name}>
              <p className="text-sm text-muted mb-4">{m.description}</p>
              {m.accuracy !== null ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted">Accuracy</span>
                    <span className="text-2xl font-semibold tracking-tight">
                      {(m.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  {"f1" in m && (
                    <div className="grid grid-cols-2 gap-x-4 text-xs pt-2 border-t border-surface-border/60">
                      <div className="flex justify-between">
                        <span className="text-muted">F1</span>
                        <span className="font-mono">{m.f1.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">AUROC</span>
                        <span className="font-mono">{m.auroc.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Precision</span>
                        <span className="font-mono">{m.precision.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Recall</span>
                        <span className="font-mono">{m.recall.toFixed(4)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-warning/10 border border-warning/30 px-3 py-2">
                  <span className="text-xs font-medium text-warning">
                    Final accuracy not captured
                  </span>
                </div>
              )}
              {"metricsNote" in m && m.metricsNote && (
                <p className="text-xs text-muted mt-3 leading-relaxed">{m.metricsNote}</p>
              )}
            </Card>
          ))}
        </div>

        <Card
          title="Quantum Neural Network — training configuration"
          subtitle="Variational circuit trained via gradient-based optimization"
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {CONFIG_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm py-2 border-b border-surface-border/60"
              >
                <dt className="text-muted">{row.label}</dt>
                <dd className="font-mono font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Circuit architecture">
          <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
            <li>
              Input features are reduced to {QNN_CONFIG.pcaComponents} principal
              components via PCA, matching the qubit count.
            </li>
            <li>
              Each component is angle-embedded onto its qubit using {QNN_CONFIG.embedding}
              .
            </li>
            <li>
              {QNN_CONFIG.variationalLayers} strongly entangling variational layers apply
              trainable rotation gates and entangling CNOTs.
            </li>
            <li>
              A PauliZ expectation value is measured on each qubit and passed through a
              classical linear layer to produce the prediction.
            </li>
            <li>
              Parameters are updated via {QNN_CONFIG.optimizer} with a{" "}
              {QNN_CONFIG.lrSchedule} learning rate schedule over {QNN_CONFIG.epochs}{" "}
              epochs.
            </li>
          </ol>
        </Card>
      </main>
    </>
  );
}

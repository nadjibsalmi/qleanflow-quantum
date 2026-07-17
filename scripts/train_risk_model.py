"""
Trains the logistic regression risk model on the real Ghana water quality
dataset and prints the exact coefficients used in
src/algorithms/riskEstimator.ts.

Run this to reproduce (or update, if the dataset changes) the coefficients
baked into the TypeScript model:

    pip install pandas scikit-learn
    python scripts/train_risk_model.py
"""

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

FEATURES = [
    "Distance to Nearest River (km)",
    "Is Mining Zone",
    "Contamination Level",
    "Water Access Score",
    "Average Household Income (GHS)",
    "Education Level (Avg Years)",
]


def main() -> None:
    df = pd.read_csv("data/ghana_water_quality_data.csv")

    X = df[FEATURES].copy()
    X["Is Mining Zone"] = X["Is Mining Zone"].astype(int)
    y = df["Water Quality"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LogisticRegression(max_iter=1000)
    model.fit(X_scaled, y)

    print(f"Training accuracy: {model.score(X_scaled, y):.4f}")
    print(f"Intercept: {model.intercept_[0]!r}")
    print()
    for feature, coef, mean, scale in zip(
        FEATURES, model.coef_[0], scaler.mean_, scaler.scale_
    ):
        print(f"{feature}: coef={coef!r}, mean={mean!r}, scale={scale!r}")


if __name__ == "__main__":
    main()

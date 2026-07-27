<p align="center">
  <img src="machine_learning_project_logo.png" alt="Multimodel Analysis Logo" width="180" />
</p>

<h1 align="center">Multimodel Analysis</h1>

<p align="center">
  <strong>Automate Your Machine Learning Pipelines • Benchmark 15+ Estimators in One Line</strong>
</p>

<p align="center">
  <a href="https://github.com/udityamerit"><img src="https://img.shields.io/badge/Author-Uditya-ec4899?style=for-the-badge&logo=github&logoColor=white" alt="Author Uditya"></a>
  <a href="https://pypi.org/project/multimodel-analysis/"><img src="https://img.shields.io/badge/PyPI-v1.0.0-06b6d4?style=for-the-badge&logo=pypi&logoColor=white" alt="PyPI Version"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/Python-3.8%2B-10b981?style=for-the-badge&logo=python&logoColor=white" alt="Python Version"></a>
  <a href="https://github.com/udityamerit"><img src="https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge" alt="License"></a>
  <a href="https://scikit-learn.org/"><img src="https://img.shields.io/badge/Scikit--Learn-Compatible-f59e0b?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn"></a>
  <a href="https://udityamerit.github.io/Multimodel-Analysis-Pacakge-Documentation/"><img src="https://img.shields.io/badge/Documentation-Live-2563eb?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Documentation"></a>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-documentation-portal">Web Portal</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-github-pages-deployment">Deploy to Web</a>
</p>

---

## 💡 Overview

**`multimodel-analysis`** is an enterprise-ready Python framework engineered to streamline supervised Machine Learning model evaluation and selection. Instead of writing hundreds of lines of boilerplate code to fit, predict, scale, and evaluate multiple scikit-learn models, `multimodel-analysis` allows you to **train, benchmark, and generate publication-ready diagnostic reports with a single function call**.

Built for data scientists, ML engineers, and researchers, the library features **fault-tolerant execution**, **pandas index preservation**, **automatic categorical label encoding**, and **parallel multi-core processing (`n_jobs=-1`)**.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **⚡ One-Line Benchmarking** | Train and evaluate 8+ Classification models or 7+ Regression models simultaneously. |
| **🛡️ Fault-Tolerant Engine** | If one estimator fails (e.g. convergence error), execution continues safely for remaining models. |
| **📊 Publication-Quality Plots** | Auto-generate Confusion Matrices, ROC/AUC Curves, and Residual Scatter plots without opening GUI windows. |
| **🏷️ Smart Label Preservation** | Maintains pandas DataFrame index, feature names, and string target labels without data corruption. |
| **🔌 Custom Estimator Support** | Seamlessly plug in external gradient boosting frameworks like **XGBoost**, **LightGBM**, and **CatBoost**. |
| **📁 Multi-Format Exporting** | Export unified performance leaderboards into **CSV**, **Excel (.xlsx)**, **HTML**, and **JSON** formats. |

---

## ⚡ Quickstart

### 1. Classification Pipeline Benchmark

```python
import pandas as pd
from multimodel_analysis import MultiModelClassifier, save_report

# 1. Load dataset & separate features from target
df = pd.read_csv("customer_churn.csv")
X = df.drop(columns=["Churn"])
y = df["Churn"]  # Categorical string labels ("Yes", "No") auto-encoded!

# 2. Instantiate classifier with automatic feature scaling & stratification
clf = MultiModelClassifier(
    X=X, y=y, test_size=0.25, scaled_data=True, random_state=42, stratify=True
)

# 3. Benchmark all 8 built-in classifiers in parallel
results = clf.run_all_models()

# 4. Display sorted leaderboard (Accuracy, Precision, Recall, F1, ROC-AUC)
df_report = clf.show_tabular_report(results, return_df=True)
save_report(df_report, "classification_report.csv")

# 5. Export diagnostic ROC, Confusion Matrix & Comparison charts
clf.plot_confusion_matrices(results, save_path="confusion_matrix.png", show_plot=False)
clf.plot_roc_curves(results, save_path="roc_curves.png", show_plot=False)
clf.plot_comparison(results, save_path="metrics_comparison.png", show_plot=False)
```

---

### 2. Regression Pipeline Benchmark

```python
import pandas as pd
from multimodel_analysis import MultiModelRegressor, save_report

# 1. Load continuous target dataset
df = pd.read_csv("housing_prices.csv")
X = df.drop(columns=["SalePrice"])
y = df["SalePrice"]  # Continuous numerical target

# 2. Instantiate regressor with standard scaling guard
reg = MultiModelRegressor(
    X=X, y=y, test_size=0.20, scaled_data=True, random_state=42
)

# 3. Train all 7 regression models (Ridge, Lasso, SVR, Random Forest, etc.)
results = reg.run_all_models()

# 4. Generate leaderboard (R², MAE, MSE, RMSE, Adjusted R²)
df_report = reg.show_tabular_report(results, return_df=True)
save_report(df_report, "regression_report.csv")

# 5. Diagnostic residual analysis & scatter plots
reg.plot_residuals(results, save_path="residuals.png", show_plot=False)
reg.plot_true_vs_pred(results, save_path="true_vs_pred.png", show_plot=False)
```

---

### 3. Integrating Custom Estimators (XGBoost & LightGBM)

```python
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from multimodel_analysis import MultiModelClassifier, save_report

clf = MultiModelClassifier(X=X, y=y, test_size=0.20, scaled_data=True)

# Define custom community estimators
custom_estimators = {
    "XGBoost Classifier": XGBClassifier(n_estimators=200, learning_rate=0.05, random_state=42),
    "LightGBM Classifier": LGBMClassifier(n_estimators=200, learning_rate=0.05, random_state=42)
}

# Benchmark scikit-learn models ALONGSIDE XGBoost & LightGBM!
results = clf.run_all_models(custom_models=custom_estimators)
df_report = clf.show_tabular_report(results, return_df=True)
save_report(df_report, "custom_boosting_benchmark.csv")
```

---

## 🖥️ Interactive Web Documentation Portal

This repository includes a state-of-the-art **Web Documentation Suite** built with vanilla HTML5, CSS3 tokens, and JavaScript.

### Key Web Portal Modules

- **Hero OS Switcher**: Interactive multi-platform install hub (Windows, macOS, Linux, Conda).
- **Interactive Metrics Calculator**: Live browser-based confusion matrix & classification metric simulator (Accuracy, Sensitivity, Specificity, Precision, F1-Score, MCC).
- **Interactive Benchmark Playground**: Select sample datasets (Iris, Wine, Breast Cancer, Boston Housing) and run live client-side ML simulations.
- **Diagnostic Visualizations Gallery**: Publication-quality SVG previews for Confusion Matrices, ROC Curves, and Residual Scatter plots.
- **Real-Time API Search**: Instant fuzzy-filter index across 15+ library methods and module functions.

---

## 💻 Installation

Install `multimodel-analysis` via `pip`:

```bash
pip install multimodel-analysis
```

### Multi-Platform Command Reference

| Platform / Environment | Recommended Installation Command |
| :--- | :--- |
| **Windows PowerShell** | `py -m pip install multimodel-analysis` |
| **macOS Terminal** | `python3 -m pip install multimodel-analysis` |
| **Linux (Ubuntu / Debian)** | `pip3 install multimodel-analysis` |
| **Conda / Mamba** | `conda create -n ml-env python=3.11 -y && conda activate ml-env && pip install multimodel-analysis` |

---

## 🧠 Core Architecture

```text
                               ┌─────────────────────────┐
                               │ Raw Data (X, y Series)  │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │  Smart Preprocessing    │
                               │ (Scaling / Categorical) │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │ Parallel Trainer Engine │
                               │ (n_jobs = -1 / Threads) │
                               └────────────┬────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
        ┌────────────▼────────────┐                   ┌────────────▼────────────┐
        │ Tabular Leaderboard     │                   │  Diagnostic Visuals     │
        │ (CSV / Excel / JSON)    │                   │ (ROC / Residual / CM)   │
        └─────────────────────────┘                   └─────────────────────────┘
```

---

## 🚀 Deploying Documentation to GitHub Pages

This repository contains a pre-configured **GitHub Actions Workflow** (`.github/workflows/deploy.yml`) and `.nojekyll` file.

### Step-by-Step GitHub Pages Setup

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy documentation portal"
   git push origin main
   ```
2. Open your GitHub Repository in your browser.
3. Go to **Settings** > **Pages**.
4. Change **Build and deployment** > **Source** to **GitHub Actions**.
5. The deployment workflow will trigger automatically and host your site live at:
   `https://<your-username>.github.io/<your-repository-name>/`

---
## 🤝 Contributing

Contributions, issue reports, and feature requests are welcome!
1. Fork the Project Repository.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 👨‍💻 Author & Maintainer

Developed and maintained with ❤️ by **Uditya Narayan Tiwari** ([@udityamerit](https://udityanarayantiwari.netlify.app/)).

## 📧 Connect with Me

**Uditya Narayan Tiwari**

- 🌐 [My Portfolio](https://udityanarayantiwari.netlify.app/)
- 💼 [My LinkedIn](https://www.linkedin.com/in/uditya-narayan-tiwari-562332289/)
- 👨‍💻 [My GitHub](https://github.com/udityamerit)
- 📦 [PyPI Package](https://pypi.org/project/multimodel-analysis/)

---

## 📄 License

Distributed under the **MIT License**. Created by Uditya Narayan Tiwari. See `LICENSE` for details.

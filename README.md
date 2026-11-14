# multimodel-analysis: documentation site

Source of the documentation website for [`multimodel-analysis`](https://pypi.org/project/multimodel-analysis/), a Python package that trains and compares several scikit-learn models on the same train/test split, for classification and regression.

**Live site:** https://udityamerit.github.io/Multimodel-Analysis-Pacakge-Documentation/

Documented version: **0.1.3** (Python 3.8+, Apache-2.0).

## What the package does

- `MultiModelClassifier` fits 8 built-in classifiers; `MultiModelRegressor` fits 8 built-in regressors. Both run sequentially on one split, and a model that fails is skipped with a `[WARNING]` instead of stopping the run.
- Classification reports Accuracy, Precision, Recall, F1 (weighted averages) and ROC AUC (one-vs-rest, weighted; `NaN` when it cannot be computed). Regression reports MAE, MSE, RMSE and R².
- Plots: confusion matrices, ROC curves and a comparison chart (classification); true vs predicted and an R² comparison (regression).
- `save_report(df, path)` writes a report as CSV, Excel, HTML or JSON, chosen by file extension.
- Your own scikit-learn compatible estimators (for example XGBoost or LightGBM, installed separately) can be passed with `custom_models=`.

```python
from sklearn.datasets import load_breast_cancer
from multimodel_analysis import MultiModelClassifier

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
clf = MultiModelClassifier(X, y, test_size=0.2, scaled_data=True, random_state=42)
results = clf.run_all_models()
clf.show_tabular_report(results)
```

```bash
pip install multimodel-analysis
```

The full API reference, a results explorer and a metrics calculator are on the live site.

## Where the numbers come from

The results explorer reads `assets/data/results.json`, and the charts in `assets/img/` are the package's own output. Both were produced by running version 0.1.3 on scikit-learn's bundled datasets (and the first 5,000 rows of California Housing) with `test_size=0.2`, `scaled_data=True`, `random_state=42`. Timings depend on the machine, so treat them as indicative.

## Repository layout

| Path | Purpose |
| :--- | :--- |
| `index.html` | All documentation content (single page) |
| `index.css` | Styles, light and dark themes |
| `app.js` | Navigation, search palette, tabs, results explorer, calculator, API dialogs |
| `assets/js/api-data.js` | API reference data (single source for the list, dialogs and search) |
| `assets/data/results.json` | Measured benchmark results |
| `assets/img/` | Logo and generated charts |
| `func_code.md` | Plain-text API guide |

There is no build step and no runtime dependency.

## Run locally

Fetching `results.json` needs http, so serve the folder rather than opening the file directly:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

`.github/workflows/deploy.yml` publishes the site to GitHub Pages on every push to `main`. It copies only the files the site needs (`index.html`, `index.css`, `app.js`, `assets/`, `.nojekyll`) into the published artifact. In the repository settings, set **Pages → Source** to **GitHub Actions**.

## Contributing

Issues and pull requests are welcome. If you change an API signature in the package, update `assets/js/api-data.js` and `func_code.md` together.

## Author

**Uditya Narayan Tiwari**: [Portfolio](https://udityanarayantiwari.netlify.app/) · [LinkedIn](https://www.linkedin.com/in/uditya-narayan-tiwari-562332289/) · [GitHub](https://github.com/udityamerit) · [PyPI](https://pypi.org/project/multimodel-analysis/)

## License

The package is released under the Apache License 2.0. The documentation site source in this repository is released under the MIT License (see `LICENSE`).

# multimodel-analysis: documentation site

Source of the documentation website for [`multimodel-analysis`](https://pypi.org/project/multimodel-analysis/), a Python package that trains and compares many scikit-learn models on the same data, for classification, regression, clustering, anomaly detection and dimensionality reduction.

**Live site:** https://udityamerit.github.io/Multimodel-Analysis-Pacakge-Documentation/

Documented version: **0.6.1** (Python 3.10+, Apache-2.0).

## Package links

| Resource | Link |
| :--- | :--- |
| PyPI | https://pypi.org/project/multimodel-analysis/ |
| Source code | https://github.com/udityamerit/Multimodel-Analysis-Pacakge |
| Issues | https://github.com/udityamerit/Multimodel-Analysis-Pacakge/issues |
| Changelog | https://github.com/udityamerit/Multimodel-Analysis-Pacakge/blob/main/CHANGELOG.md |
| Guides (`docs/`) | https://github.com/udityamerit/Multimodel-Analysis-Pacakge/tree/main/docs |
| Example notebooks | https://github.com/udityamerit/Multimodel-Analysis-Pacakge/tree/main/examples |
| Download statistics | https://pepy.tech/projects/multimodel-analysis |

## What the package does

| Class | Task | Models (default / total) |
| :--- | :--- | :--- |
| `MultiModelClassifier` | Predict a category | 8 / 17 |
| `MultiModelRegressor` | Predict a number | 9 / 19 |
| `MultiModelClusterer` | Find groups, no labels needed | 7 / 14 |
| `MultiModelAnomalyDetector` | Find unusual rows, no labels needed | 6 / 7 |
| `MultiModelReducer` | Compress many columns into a few | 7 / 12 |

- All five share one workflow: build the object, `run_all_models()`, `show_tabular_report()`, then plot, save or explain.
- Supervised classes also offer `cross_validate_models()`, `tune_models()`, `preprocess=True`, feature importance and partial dependence.
- Reports can be saved as CSV, Excel, HTML or JSON, or as one self-contained HTML file with `save_html_report()`. Trained models are saved and reloaded with `save_model()` and `load_model()`.
- Optional extras: `excel`, `boost` (XGBoost, LightGBM, CatBoost) and `umap`.

```python
from sklearn.datasets import load_breast_cancer
from multimodel_analysis import MultiModelClassifier

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
clf = MultiModelClassifier(X, y, test_size=0.2, random_state=42)
results = clf.run_all_models()
clf.show_tabular_report(results)
```

```bash
pip install multimodel-analysis
```

The site also has guides for every analyser, a model reference, the full API reference, a results explorer, a metrics calculator, troubleshooting and the changelog.

## Where the numbers come from

The results explorer reads `assets/data/results.json`, and the charts in `assets/img/` are the package's own output. Both were produced by running version 0.6.1 on scikit-learn's bundled datasets with `test_size=0.2`, `scaled_data=True`, `random_state=42` (clustering used `n_clusters=3`, reduction 2 components). Timings depend on the machine, so treat them as indicative.

## Repository layout

| Path | Purpose |
| :--- | :--- |
| `index.html` | All documentation content (single page) |
| `index.css` | Styles, light and dark themes |
| `app.js` | Navigation, search palette, tabs, results explorer, calculator, API dialogs |
| `assets/js/api-data.js` | API reference data (single source for the list, dialogs and search) |
| `assets/data/results.json` | Measured results for all five analysers |
| `assets/img/` | Logo and generated charts |

There is no build step and no runtime dependency.

## Run locally

Fetching `results.json` needs http, so serve the folder rather than opening the file directly:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

`.github/workflows/deploy.yml` publishes the site to GitHub Pages on every push to `main`. It copies only the files the site needs (`index.html`, `index.css`, `app.js`, `assets/`, `.nojekyll`) into the published artifact. In the repository settings, set **Pages → Source** to **GitHub Actions**.

## Updating for a new package release

1. Install the new version of `multimodel-analysis` and re-run the benchmark to regenerate `assets/data/results.json` and the charts in `assets/img/`.
2. Compare the package's `docs/api.md` and `docs/models.md` with `assets/js/api-data.js` and the **Model reference** section of `index.html`.
3. Add the release notes to the **Changelog** section and bump the version in `index.html` (version pill, install check, footer).

## Contributing

Issues and pull requests are welcome. If you change an API signature in the package, update `assets/js/api-data.js` (and `docs/api.md` in the package) together.

## Author

**Uditya Narayan Tiwari**: [Portfolio](https://udityanarayantiwari.netlify.app/) · [LinkedIn](https://www.linkedin.com/in/uditya-narayan-tiwari-562332289/) · [GitHub](https://github.com/udityamerit) · [PyPI](https://pypi.org/project/multimodel-analysis/)

## License

The package is released under the Apache License 2.0. The documentation site source in this repository is released under the MIT License (see `LICENSE`).

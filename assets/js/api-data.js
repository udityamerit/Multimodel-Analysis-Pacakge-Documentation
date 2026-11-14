/* Single source of truth for the API reference.
   Signatures and defaults are taken from multimodel-analysis 0.1.3 (multimodel.py). */
window.API_DATA = (function () {
  var CLF_RET = "tuple: (report, matrix, accuracy, precision, recall, f1, fpr_dict, tpr_dict, roc_auc)";
  var REG_RET = "tuple: (mae, mse, rmse, r2, y_pred)";
  var RS = ["random_state", "int | None", "None", "Seed for the estimator. None falls back to the instance's random_state."];

  function clfBuilder(id, sig, sk, params, example) {
    return {
      id: id, group: "Classifier: model builders", cls: "MultiModelClassifier",
      name: id.split(".")[1], sig: sig,
      summary: "Fits scikit-learn's " + sk + " on the training split and evaluates it on the test split.",
      params: params, returns: CLF_RET, example: example
    };
  }
  function regBuilder(id, sig, sk, params, example) {
    return {
      id: id, group: "Regressor: model builders", cls: "MultiModelRegressor",
      name: id.split(".")[1], sig: sig,
      summary: "Fits scikit-learn's " + sk + " on the training split and evaluates it on the test split.",
      params: params, returns: REG_RET, example: example
    };
  }
  var kw = ["**kwargs", "any", "", "Forwarded to the underlying scikit-learn estimator."];

  var items = [
    /* ---------- classes ---------- */
    {
      id: "MultiModelClassifier", group: "Classes", name: "MultiModelClassifier",
      sig: "MultiModelClassifier(X, y, test_size=0.3, scaled_data=False, random_state=42, stratify=True, n_jobs=-1)",
      summary: "Splits the data, optionally scales it, label-encodes the target and benchmarks several classifiers on the same split.",
      params: [
        ["X", "DataFrame | ndarray", "required", "Feature matrix. Raises ValueError if X or y is missing."],
        ["y", "Series | ndarray", "required", "Target. Strings and categoricals are encoded with LabelEncoder."],
        ["test_size", "float", "0.3", "Fraction of rows held out for evaluation."],
        ["scaled_data", "bool", "False", "Apply StandardScaler. The scaler is fit on the training split only."],
        ["random_state", "int | None", "42", "Seed used for the split and for the models."],
        ["stratify", "bool", "True", "Stratified split. Silently disabled if any class has fewer than 2 samples."],
        ["n_jobs", "int | None", "-1", "Forwarded to estimators that support it. Models themselves are trained one after another."]
      ],
      returns: "instance. Exposes classes_, n_classes_, label_encoder, X_train_scaled, X_test_scaled, y_train, y_test and models_.",
      example: 'import pandas as pd\nfrom multimodel_analysis import MultiModelClassifier\n\ndf = pd.read_csv("customer_churn.csv")\nclf = MultiModelClassifier(\n    X=df.drop(columns=["Churn"]),\n    y=df["Churn"],            # "Yes" / "No" strings are fine\n    test_size=0.2,\n    scaled_data=True,\n    random_state=42,\n)\nprint(clf.classes_, clf.n_classes_)'
    },
    {
      id: "MultiModelRegressor", group: "Classes", name: "MultiModelRegressor",
      sig: "MultiModelRegressor(X, y, test_size=0.3, scaled_data=False, random_state=42, n_jobs=-1)",
      summary: "Same pipeline as the classifier for continuous targets. MultiModelRegressior is a backwards-compatible alias of the same class.",
      params: [
        ["X", "DataFrame | ndarray", "required", "Feature matrix."],
        ["y", "Series | ndarray", "required", "Continuous target."],
        ["test_size", "float", "0.3", "Fraction of rows held out for evaluation."],
        ["scaled_data", "bool", "False", "Apply StandardScaler (fit on the training split only)."],
        ["random_state", "int | None", "42", "Seed used for the split and for the models."],
        ["n_jobs", "int | None", "-1", "Forwarded to estimators that support it."]
      ],
      returns: "instance. Exposes X_train_scaled, X_test_scaled, y_train, y_test and models_.",
      example: 'from sklearn.datasets import load_diabetes\nfrom multimodel_analysis import MultiModelRegressor\n\nX, y = load_diabetes(return_X_y=True, as_frame=True)\nreg = MultiModelRegressor(X=X, y=y, test_size=0.2, scaled_data=True)'
    },

    /* ---------- functions ---------- */
    {
      id: "save_report", group: "Functions", name: "save_report",
      sig: 'save_report(df=None, filepath="report.csv")',
      summary: "Writes a report DataFrame to disk. The format is chosen from the file extension; unknown extensions fall back to CSV.",
      params: [
        ["df", "DataFrame | None", "None", "Report to save. None or an empty frame prints a warning and returns without writing."],
        ["filepath", "str", '"report.csv"', ".csv, .xlsx/.xls, .html/.htm or .json (records orientation). .xlsx needs openpyxl."]
      ],
      returns: "None",
      example: 'from multimodel_analysis import save_report\n\ndf = clf.show_tabular_report(return_df=True)\nsave_report(df, "leaderboard.csv")\nsave_report(df, "leaderboard.xlsx")\nsave_report(df, "leaderboard.json")'
    },
    {
      id: "instance.save_report", group: "Functions", name: "model.save_report",
      sig: "model.save_report(df_or_filepath=None, filepath=None)",
      summary: "Instance method available on both classes. Can reuse the DataFrame stored by the last show_tabular_report call.",
      params: [
        ["df_or_filepath", "DataFrame | str | None", "None", "A DataFrame, or just a path string to save the stored report."],
        ["filepath", "str | None", "None", 'Target path when a DataFrame is passed. Defaults to "report.csv".']
      ],
      returns: "None",
      example: 'clf.show_tabular_report(return_df=True)   # stores the report on the instance\nclf.save_report("metrics.csv")            # path only\nclf.save_report(df, "metrics.html")       # explicit DataFrame'
    },

    /* ---------- classifier builders ---------- */
    clfBuilder("MultiModelClassifier.Logistic_model", "Logistic_model(random_state=None, max_iter=1000, **kwargs)", "LogisticRegression",
      [RS, ["max_iter", "int", "1000", "Maximum solver iterations."], kw],
      'row = clf.Logistic_model(max_iter=2000, C=0.5)\nreport, matrix, accuracy, *_ = row\nprint(round(accuracy, 4))'),
    clfBuilder("MultiModelClassifier.Support_vector_model", "Support_vector_model(random_state=None, kernel='linear', probability=True, **kwargs)", "SVC",
      [RS, ["kernel", "str", "'linear'", "Kernel passed to SVC."], ["probability", "bool", "True", "Enables predict_proba, which ROC AUC needs."], kw],
      'row = clf.Support_vector_model(kernel="rbf", C=2.0)'),
    clfBuilder("MultiModelClassifier.DecisionTree_model", "DecisionTree_model(random_state=None, **kwargs)", "DecisionTreeClassifier",
      [RS, kw], 'row = clf.DecisionTree_model(max_depth=6)'),
    clfBuilder("MultiModelClassifier.KNN_model", "KNN_model(n_neighbors=None, **kwargs)", "KNeighborsClassifier",
      [["n_neighbors", "int | None", "None", "None uses min(10, len(y_train) - 1), so tiny datasets do not crash."], kw],
      'row = clf.KNN_model(n_neighbors=7, weights="distance")'),
    clfBuilder("MultiModelClassifier.Naive_Bayes_model", "Naive_Bayes_model(**kwargs)", "GaussianNB",
      [kw], 'row = clf.Naive_Bayes_model(var_smoothing=1e-8)'),
    clfBuilder("MultiModelClassifier.RandomForest_model", "RandomForest_model(random_state=None, n_estimators=100, **kwargs)", "RandomForestClassifier",
      [RS, ["n_estimators", "int", "100", "Number of trees."], kw], 'row = clf.RandomForest_model(n_estimators=300)'),
    clfBuilder("MultiModelClassifier.GradientBoosting_model", "GradientBoosting_model(random_state=None, n_estimators=100, **kwargs)", "GradientBoostingClassifier",
      [RS, ["n_estimators", "int", "100", "Number of boosting stages."], kw], 'row = clf.GradientBoosting_model(learning_rate=0.05)'),
    clfBuilder("MultiModelClassifier.AdaBoost_model", "AdaBoost_model(random_state=None, n_estimators=50, **kwargs)", "AdaBoostClassifier",
      [RS, ["n_estimators", "int", "50", "Number of weak learners."], kw], 'row = clf.AdaBoost_model(n_estimators=100)'),

    /* ---------- classifier pipeline ---------- */
    {
      id: "MultiModelClassifier.run_all_models", group: "Classifier: pipeline & reports", cls: "MultiModelClassifier", name: "run_all_models",
      sig: "run_all_models(custom_models=None, random_state=None)",
      summary: "Trains the 8 built-in classifiers one after another, then any custom estimators. A model that raises is skipped with a [WARNING] and the rest continue.",
      params: [
        ["custom_models", "dict[str, estimator] | None", "None", "Name to unfitted scikit-learn-compatible estimator. Fitted on the same scaled split."],
        ["random_state", "int | None", "None", "Seed for the built-in models. None uses the instance seed."]
      ],
      returns: "list of tuples: (name, report, matrix, accuracy, precision, recall, f1, fpr_dict, tpr_dict, roc_auc). Also stored in models_.",
      example: 'from sklearn.ensemble import ExtraTreesClassifier\n\nresults = clf.run_all_models(\n    custom_models={"Extra Trees": ExtraTreesClassifier(n_estimators=200, random_state=42)}\n)\nprint([r[0] for r in results])   # 8 built-ins + "Extra Trees"'
    },
    {
      id: "MultiModelClassifier.evaluate_model", group: "Classifier: pipeline & reports", cls: "MultiModelClassifier", name: "evaluate_model",
      sig: "evaluate_model(model, X_test=None, y_true=None)",
      summary: "Scores an already fitted estimator. Precision, recall and F1 are weighted averages; ROC AUC is one-vs-rest weighted for multiclass. Estimators without predict_proba fall back to decision_function scores (sigmoid or softmax), which are not calibrated probabilities.",
      params: [
        ["model", "estimator", "required", "Fitted estimator with predict (and ideally predict_proba or decision_function)."],
        ["X_test", "array | None", "None", "Defaults to the instance's scaled test features."],
        ["y_true", "array | None", "None", "Defaults to the instance's encoded test labels."]
      ],
      returns: CLF_RET + ". roc_auc is NaN when it cannot be computed (no probabilities or scores available, or a failure printed as a warning).",
      example: 'from sklearn.linear_model import RidgeClassifier\n\nmodel = RidgeClassifier().fit(clf.X_train_scaled, clf.y_train)\nreport, matrix, acc, prec, rec, f1, fpr, tpr, auc = clf.evaluate_model(model)'
    },
    {
      id: "MultiModelClassifier.show_tabular_report", group: "Classifier: pipeline & reports", cls: "MultiModelClassifier", name: "show_tabular_report",
      sig: "show_tabular_report(models=None, return_df=False)",
      summary: "Prints the leaderboard and optionally returns it. Columns: Model, Accuracy, Precision, Recall, F1 Score, ROC AUC, sorted by Accuracy. The frame is also kept for save_report().",
      params: [
        ["models", "list | None", "None", "Output of run_all_models. None reuses models_ or runs everything."],
        ["return_df", "bool", "False", "Return the DataFrame instead of None."]
      ],
      returns: "DataFrame | None",
      example: 'df = clf.show_tabular_report(return_df=True)\nprint(df.head(3))'
    },
    {
      id: "MultiModelClassifier.plot_confusion_matrices", group: "Classifier: pipeline & reports", cls: "MultiModelClassifier", name: "plot_confusion_matrices",
      sig: "plot_confusion_matrices(models=None, save_path=None, show_plot=True)",
      summary: "One confusion-matrix heatmap per model, labelled with the original class names.",
      params: [
        ["models", "list | None", "None", "Results to plot. None reuses models_."],
        ["save_path", "str | None", "None", "Writes a PNG when set."],
        ["show_plot", "bool", "True", "Call plt.show(). Use False on servers and in CI."]
      ],
      returns: "None",
      example: 'clf.plot_confusion_matrices(save_path="cm.png", show_plot=False)'
    },
    {
      id: "MultiModelClassifier.plot_roc_curves", group: "Classifier: pipeline & reports", cls: "MultiModelClassifier", name: "plot_roc_curves",
      sig: "plot_roc_curves(models=None, save_path=None, show_plot=True)",
      summary: "Overlays one ROC curve per model (binary), or the macro-average curve per model (multiclass). Models without probabilities or scores are skipped.",
      params: [
        ["models", "list | None", "None", "Results to plot."],
        ["save_path", "str | None", "None", "Writes a PNG when set."],
        ["show_plot", "bool", "True", "Call plt.show()."]
      ],
      returns: "None",
      example: 'clf.plot_roc_curves(save_path="roc.png", show_plot=False)'
    },
    {
      id: "MultiModelClassifier.plot_comparison", group: "Classifier: pipeline & reports", cls: "MultiModelClassifier", name: "plot_comparison",
      sig: "plot_comparison(models=None, save_path=None, show_plot=True)",
      summary: "Grouped bar chart of Accuracy, Precision, Recall and F1 Score per model. ROC AUC is not part of this chart.",
      params: [
        ["models", "list | None", "None", "Results to plot."],
        ["save_path", "str | None", "None", "Writes a PNG when set."],
        ["show_plot", "bool", "True", "Call plt.show()."]
      ],
      returns: "None",
      example: 'clf.plot_comparison(save_path="compare.png", show_plot=False)'
    },
    {
      id: "MultiModelClassifier.get_summary", group: "Classifier: pipeline & reports", cls: "MultiModelClassifier", name: "get_summary",
      sig: "get_summary(models=None, save_prefix=None, show_plot=True)",
      summary: "Runs the table and all three plots. With save_prefix it writes four files: {prefix}_report.csv, _confusion_matrices.png, _roc_curves.png and _comparison.png.",
      params: [
        ["models", "list | None", "None", "Results to summarise."],
        ["save_prefix", "str | None", "None", 'Path prefix for the saved files, e.g. "outputs/run1".'],
        ["show_plot", "bool", "True", "Call plt.show() for each figure."]
      ],
      returns: "None",
      example: 'results = clf.run_all_models()\nclf.get_summary(results, save_prefix="outputs/run1", show_plot=False)'
    },

    /* ---------- regressor builders ---------- */
    regBuilder("MultiModelRegressor.LinearRegression_model", "LinearRegression_model(**kwargs)", "LinearRegression", [kw], 'row = reg.LinearRegression_model()\nmae, mse, rmse, r2, y_pred = row'),
    regBuilder("MultiModelRegressor.Lasso_model", "Lasso_model(random_state=None, alpha=0.1, **kwargs)", "Lasso",
      [RS, ["alpha", "float", "0.1", "L1 regularisation strength."], kw], 'row = reg.Lasso_model(alpha=0.05)'),
    regBuilder("MultiModelRegressor.Ridge_model", "Ridge_model(random_state=None, alpha=1.0, **kwargs)", "Ridge",
      [RS, ["alpha", "float", "1.0", "L2 regularisation strength."], kw], 'row = reg.Ridge_model(alpha=10.0)'),
    regBuilder("MultiModelRegressor.SVR_model", "SVR_model(kernel='rbf', **kwargs)", "SVR",
      [["kernel", "str", "'rbf'", "Kernel passed to SVR."], kw], 'row = reg.SVR_model(kernel="linear", C=10)'),
    regBuilder("MultiModelRegressor.DecisionTree_model", "DecisionTree_model(random_state=None, **kwargs)", "DecisionTreeRegressor",
      [RS, kw], 'row = reg.DecisionTree_model(max_depth=5)'),
    regBuilder("MultiModelRegressor.RandomForest_model", "RandomForest_model(random_state=None, n_estimators=100, **kwargs)", "RandomForestRegressor",
      [RS, ["n_estimators", "int", "100", "Number of trees."], kw], 'row = reg.RandomForest_model(n_estimators=300)'),
    regBuilder("MultiModelRegressor.GradientBoosting_model", "GradientBoosting_model(random_state=None, n_estimators=100, **kwargs)", "GradientBoostingRegressor",
      [RS, ["n_estimators", "int", "100", "Number of boosting stages."], kw], 'row = reg.GradientBoosting_model(learning_rate=0.05)'),
    regBuilder("MultiModelRegressor.AdaBoost_model", "AdaBoost_model(random_state=None, n_estimators=50, **kwargs)", "AdaBoostRegressor",
      [RS, ["n_estimators", "int", "50", "Number of weak learners."], kw], 'row = reg.AdaBoost_model(n_estimators=100)'),

    /* ---------- regressor pipeline ---------- */
    {
      id: "MultiModelRegressor.run_all_models", group: "Regressor: pipeline & reports", cls: "MultiModelRegressor", name: "run_all_models",
      sig: "run_all_models(custom_models=None, random_state=None)",
      summary: "Trains the 8 built-in regressors sequentially, then custom estimators. Failures are reported and skipped.",
      params: [
        ["custom_models", "dict[str, estimator] | None", "None", "Name to unfitted regressor."],
        ["random_state", "int | None", "None", "Seed for the built-in models."]
      ],
      returns: "list of tuples: (name, mae, mse, rmse, r2, y_pred). Also stored in models_.",
      example: 'from sklearn.ensemble import ExtraTreesRegressor\n\nresults = reg.run_all_models(\n    custom_models={"Extra Trees": ExtraTreesRegressor(n_estimators=200, random_state=42)}\n)'
    },
    {
      id: "MultiModelRegressor.evaluate_model", group: "Regressor: pipeline & reports", cls: "MultiModelRegressor", name: "evaluate_model",
      sig: "evaluate_model(model, X_test=None, y_true=None)",
      summary: "Scores a fitted regressor on the held-out split.",
      params: [
        ["model", "estimator", "required", "Fitted regressor with predict."],
        ["X_test", "array | None", "None", "Defaults to the scaled test features."],
        ["y_true", "array | None", "None", "Defaults to the test target."]
      ],
      returns: REG_RET,
      example: 'from sklearn.linear_model import HuberRegressor\n\nmodel = HuberRegressor().fit(reg.X_train_scaled, reg.y_train)\nmae, mse, rmse, r2, y_pred = reg.evaluate_model(model)'
    },
    {
      id: "MultiModelRegressor.show_tabular_report", group: "Regressor: pipeline & reports", cls: "MultiModelRegressor", name: "show_tabular_report",
      sig: "show_tabular_report(models=None, return_df=False)",
      summary: "Prints and optionally returns the leaderboard. Columns: Model, MAE, MSE, RMSE, R2 Score, sorted by R2 Score descending.",
      params: [
        ["models", "list | None", "None", "Output of run_all_models."],
        ["return_df", "bool", "False", "Return the DataFrame instead of None."]
      ],
      returns: "DataFrame | None",
      example: 'df = reg.show_tabular_report(return_df=True)\nprint(df.iloc[0]["Model"])'
    },
    {
      id: "MultiModelRegressor.plot_true_vs_predicted", group: "Regressor: pipeline & reports", cls: "MultiModelRegressor", name: "plot_true_vs_predicted",
      sig: "plot_true_vs_predicted(models=None, save_path=None, show_plot=True)",
      summary: "Scatter of true against predicted values per model with a perfect-fit diagonal.",
      params: [
        ["models", "list | None", "None", "Results to plot."],
        ["save_path", "str | None", "None", "Writes a PNG when set."],
        ["show_plot", "bool", "True", "Call plt.show()."]
      ],
      returns: "None",
      example: 'reg.plot_true_vs_predicted(save_path="true_vs_pred.png", show_plot=False)'
    },
    {
      id: "MultiModelRegressor.plot_comparison", group: "Regressor: pipeline & reports", cls: "MultiModelRegressor", name: "plot_comparison",
      sig: "plot_comparison(models=None, save_path=None, show_plot=True)",
      summary: "Bar chart of R2 Score per model.",
      params: [
        ["models", "list | None", "None", "Results to plot."],
        ["save_path", "str | None", "None", "Writes a PNG when set."],
        ["show_plot", "bool", "True", "Call plt.show()."]
      ],
      returns: "None",
      example: 'reg.plot_comparison(save_path="r2.png", show_plot=False)'
    },
    {
      id: "MultiModelRegressor.get_summary", group: "Regressor: pipeline & reports", cls: "MultiModelRegressor", name: "get_summary",
      sig: "get_summary(models=None, save_prefix=None, show_plot=True)",
      summary: "Runs the table and both plots. With save_prefix it writes {prefix}_report.csv, _true_vs_pred.png and _comparison.png.",
      params: [
        ["models", "list | None", "None", "Results to summarise."],
        ["save_prefix", "str | None", "None", "Path prefix for the saved files."],
        ["show_plot", "bool", "True", "Call plt.show() for each figure."]
      ],
      returns: "None",
      example: 'results = reg.run_all_models()\nreg.get_summary(results, save_prefix="outputs/housing", show_plot=False)'
    }
  ];

  return items;
})();

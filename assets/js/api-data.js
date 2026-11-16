/* Single source of truth for the API reference.
   Signatures and defaults are taken from multimodel-analysis 0.6.1 (docs/api.md in the package repository,
   generated from the source by tools/build_api_docs.py). */
window.API_DATA = (function () {
  var items = [];

  /* ---------- shared parameter rows ---------- */
  var P = {
    X: ["X", "DataFrame | ndarray", "required", "Feature matrix. Numeric by default; pass preprocess=True to allow missing values and text columns."],
    y: ["y", "Series | ndarray", "required", "Target. Strings and categoricals are label-encoded for classification."],
    test_size: ["test_size", "float", "0.3", "Fraction of rows held out for evaluation."],
    scaled: ["scaled_data", "bool", "True", "Standardise features (fitted on the training split only). The default was False before 0.1.4."],
    rs: ["random_state", "int | None", "42", "Seed used for the split and for the models."],
    nj: ["n_jobs", "int | None", "-1", "Forwarded to estimators that support it. Models themselves run one after another."],
    verbose: ["verbose", "bool", "True", "Print progress, tables and notes. Set False for quiet use in scripts."],
    prep: ["preprocess", "bool", "False", "Impute missing values (median / most frequent), one-hot encode text columns and scale numbers. Fitted on the training split only."],
    models: ["models", "list | None", "None", "Results from a previous run. When omitted the last run is used, or all models are run first."],
    save_path: ["save_path", "str | None", "None", "Write the figure to this file instead of (or as well as) showing it."],
    show_plot: ["show_plot", "bool", "True", "Display the figure. Pass False in scripts and servers."],
    model: ["model", "str | None", "None", "Display name or key of a fitted model. Default: the best model of the last report."],
    include: ["include", "list | 'all' | None", "None", "Model keys or names to run. None = the standard set; 'all' = every installed model."],
    exclude: ["exclude", "list | None", "None", "Model keys or names to skip."],
    custom: ["custom_models", "dict | None", "None", "{ 'display name': unfitted_sklearn_estimator } run alongside the built-in models."],
    rsm: ["random_state", "int | None", "None", "Overrides the instance seed for this call."],
    allow: ["allow_large", "bool", "False", "Run the slow methods even on large data (they are skipped above a row limit by default)."],
    top: ["top", "int", "6", "How many of the best models to draw."],
    report_df: ["return_df", "bool", "False", "Also return the report as a DataFrame."],
    cv: ["cv", "int | splitter", "5", "Number of folds, or any scikit-learn cross-validation splitter."],
    scoring: ["scoring", "str | None", "None", "scikit-learn scoring string. Default: accuracy / r2."],
    kw: ["**params", "any", "", "Overrides of the underlying estimator's parameters, for example n_estimators=300."]
  };

  function add(o) { items.push(o); }

  /* ---------- classes ---------- */
  add({
    id: "MultiModelClassifier", group: "Classes", name: "MultiModelClassifier",
    sig: "MultiModelClassifier(X=None, y=None, test_size=0.3, scaled_data=True, random_state=42, stratify=True, n_jobs=-1, verbose=True, preprocess=False, class_weight=None)",
    summary: "Splits the data once and benchmarks up to 17 classifiers on the same split (Accuracy, Precision, Recall, F1, ROC AUC).",
    params: [P.X, P.y, P.test_size, P.scaled, P.rs,
      ["stratify", "bool", "True", "Stratified split. Falls back to a random split with a warning if a class has fewer than 2 rows."],
      P.nj, P.verbose, P.prep,
      ["class_weight", "str | None", "None", "'balanced' re-weights classes inversely to their frequency in the models that support it."]],
    returns: "instance. Exposes classes_, n_classes_, label_encoder, X_train_scaled, X_test_scaled, y_train, y_test, models_, estimators_, fit_times_, failed_models_, warnings_, cv_results_, best_params_, tuning_results_, transformer_ and feature_names_.",
    example: 'from sklearn.datasets import load_breast_cancer\nfrom multimodel_analysis import MultiModelClassifier\n\nX, y = load_breast_cancer(return_X_y=True, as_frame=True)\nclf = MultiModelClassifier(X, y, test_size=0.2, random_state=42)\nclf.run_all_models()\nclf.show_tabular_report()'
  });
  add({
    id: "MultiModelRegressor", group: "Classes", name: "MultiModelRegressor",
    sig: "MultiModelRegressor(X=None, y=None, test_size=0.3, scaled_data=True, random_state=42, n_jobs=-1, verbose=True, preprocess=False)",
    summary: "Same workflow for continuous targets: up to 19 regressors ranked by MAE, MSE, RMSE and R². MultiModelRegressior is a kept alias of this class.",
    params: [P.X, ["y", "Series | ndarray", "required", "Continuous target."], P.test_size, P.scaled, P.rs, P.nj, P.verbose, P.prep],
    returns: "instance with the same attributes as the classifier, minus the class-related ones.",
    example: 'from sklearn.datasets import load_diabetes\nfrom multimodel_analysis import MultiModelRegressor\n\nX, y = load_diabetes(return_X_y=True, as_frame=True)\nreg = MultiModelRegressor(X, y, test_size=0.2)\nreg.run_all_models()\nreg.show_tabular_report()'
  });
  add({
    id: "MultiModelClusterer", group: "Classes", name: "MultiModelClusterer",
    sig: "MultiModelClusterer(X=None, y=None, n_clusters=3, scaled_data=True, random_state=42, n_jobs=-1, verbose=True, preprocess=False)",
    summary: "Groups rows with up to 14 clustering methods and ranks them by Silhouette, Calinski-Harabasz and Davies-Bouldin (plus ARI / NMI when labels are given). No train/test split: every row is clustered.",
    params: [P.X, ["y", "Series | ndarray | None", "None", "Optional known labels. Never used to fit; only adds Adjusted Rand Index and NMI columns."],
      ["n_clusters", "int | 'auto'", "3", "Number of clusters for methods that need one. 'auto' runs find_optimal_k() and uses the best k by Silhouette."],
      P.scaled, P.rs, P.nj, P.verbose, P.prep],
    returns: "instance. Exposes results in models_ (ClusterResult objects), estimators_, auto_params_, optimal_k_ and the shared attributes.",
    example: 'from sklearn.datasets import load_wine\nfrom multimodel_analysis import MultiModelClusterer\n\nX, y = load_wine(return_X_y=True, as_frame=True)\nclu = MultiModelClusterer(X, n_clusters="auto")\nclu.run_all_models()\nclu.show_tabular_report()\nprofile = clu.cluster_profile()'
  });
  add({
    id: "MultiModelAnomalyDetector", group: "Classes", name: "MultiModelAnomalyDetector",
    sig: "MultiModelAnomalyDetector(X=None, y=None, contamination=None, scaled_data=True, random_state=42, n_jobs=-1, verbose=True, preprocess=False)",
    summary: "Flags unusual rows with up to 7 detectors and measures how much they agree. Labels are 1 = anomaly, 0 = normal.",
    params: [P.X, ["y", "Series | ndarray | None", "None", "Optional known anomaly flags (1 / 0). Only used to add Precision / Recall / F1 columns."],
      ["contamination", "float | None", "None", "Expected fraction of anomalies (0 to 0.5). None uses 5%. Every detector flags this share of rows."],
      P.scaled, P.rs, P.nj, P.verbose, P.prep],
    returns: "instance. Exposes results in models_ (AnomalyResult objects), estimators_, failed_models_ and warnings_.",
    example: 'from sklearn.datasets import load_breast_cancer\nfrom multimodel_analysis import MultiModelAnomalyDetector\n\nX, _ = load_breast_cancer(return_X_y=True, as_frame=True)\nad = MultiModelAnomalyDetector(X, contamination=0.05)\nad.run_all_models()\nad.show_tabular_report()\nad.top_anomalies(10)'
  });
  add({
    id: "MultiModelReducer", group: "Classes", name: "MultiModelReducer",
    sig: "MultiModelReducer(X=None, y=None, n_components=2, scaled_data=True, random_state=42, n_jobs=-1, verbose=True, preprocess=False)",
    summary: "Shrinks many columns to a few with up to 12 methods and ranks them by Trustworthiness, Continuity, Global Structure and Variance Kept.",
    params: [P.X, ["y", "Series | ndarray | None", "None", "Optional labels. Used only to colour plots and compute Class Separation."],
      ["n_components", "int", "2", "Number of output dimensions."], P.scaled, P.rs, P.nj, P.verbose, P.prep],
    returns: "instance. Exposes results in models_ (ReductionResult objects), estimators_ and the shared attributes.",
    example: 'from sklearn.datasets import load_wine\nfrom multimodel_analysis import MultiModelReducer\n\nX, y = load_wine(return_X_y=True, as_frame=True)\nred = MultiModelReducer(X, y, n_components=2)\nred.run_all_models()\nred.show_tabular_report()\nred.plot_embeddings()'
  });
  add({
    id: "TrainedModel", group: "Classes", name: "TrainedModel",
    sig: "TrainedModel(estimator, name, task, transformer=None, label_encoder=None, columns=None, feature_names=None, metadata=None)",
    summary: "A fitted model bundled with its preprocessing. export_model() returns one and load_model() loads one; it predicts from RAW data and gives back original labels.",
    params: [
      ["estimator", "estimator", "required", "The fitted scikit-learn model."],
      ["name", "str", "required", "Display name of the model."],
      ["task", "str", "required", "'classification', 'regression', 'clustering', 'anomaly' or 'reduction'."],
      ["transformer", "transformer | None", "None", "Fitted scaler or preprocessor applied before the estimator."],
      ["label_encoder", "LabelEncoder | None", "None", "Maps predictions back to the original class labels."],
      ["columns", "list | None", "None", "Expected input columns."],
      ["feature_names", "list | None", "None", "Names of the columns the estimator was trained on."],
      ["metadata", "dict | None", "None", "Free-form information such as package_version and random_state."]],
    returns: "instance with predict(), transform(), predict_proba() and save().",
    example: 'tm = clf.export_model()          # best model\nprint(tm.name, tm.task, tm.metadata)\ntm.predict(X_new)'
  });

  /* ---------- functions ---------- */
  add({
    id: "load_model", group: "Functions", name: "load_model", sig: "load_model(path: str) -> TrainedModel",
    summary: "Loads a file written by save_model() or TrainedModel.save() and returns a TrainedModel.",
    params: [["path", "str", "required", "Path of the saved model file. Only load files you trust: they are Python pickles (joblib)."]],
    returns: "TrainedModel.",
    example: 'from multimodel_analysis import load_model\n\nmodel = load_model("best_model.joblib")\nlabels = model.predict(new_rows_dataframe)'
  });
  add({
    id: "save_report", group: "Functions", name: "save_report", sig: "save_report(df, filepath)",
    summary: "Saves a comparison report DataFrame as CSV, Excel (.xlsx, needs openpyxl), HTML or JSON, chosen by the file extension.",
    params: [["df", "DataFrame", "required", "A report, for example from show_tabular_report(return_df=True)."],
      ["filepath", "str", "required", "Output path ending in .csv, .xlsx, .html or .json."]],
    returns: "None.",
    example: 'from multimodel_analysis import save_report\n\ndf = clf.show_tabular_report(return_df=True)\nsave_report(df, "results.csv")'
  });

  /* ---------- per-class methods ---------- */
  function method(ctx, group, name, args, summary, params, returns, example) {
    add({
      id: ctx.cls + "." + name, group: ctx.label + ": " + group, cls: ctx.cls, name: name,
      sig: name + "(" + args + ")", summary: summary, params: params, returns: returns, example: example
    });
  }

  var CLASSES = [
    { cls: "MultiModelClassifier", label: "Classifier", task: "classification", res: "list of tuples (name, report, matrix, accuracy, precision, recall, f1, fpr, tpr, roc_auc)",
      sort: "Accuracy", cmp: "F1 Score", ex: "clf", key: "random_forest", sup: true },
    { cls: "MultiModelRegressor", label: "Regressor", task: "regression", res: "list of tuples (name, mae, mse, rmse, r2, y_pred)",
      sort: "R2 Score", cmp: "R2 Score", ex: "reg", key: "random_forest", sup: true },
    { cls: "MultiModelClusterer", label: "Clusterer", task: "clustering", res: "list of ClusterResult (name, labels, n_clusters, n_noise, silhouette, calinski_harabasz, davies_bouldin, external, fit_time)",
      sort: "Silhouette", cmp: "Silhouette", ex: "clu", key: "dbscan" },
    { cls: "MultiModelAnomalyDetector", label: "Anomaly detector", task: "anomaly", res: "list of AnomalyResult (name, scores, labels, threshold, n_anomalies, metrics, fit_time)",
      sort: "None", cmp: "Agreement", ex: "ad", key: "lof" },
    { cls: "MultiModelReducer", label: "Reducer", task: "reduction", res: "list of ReductionResult (name, embedding, n_components, metrics, fit_time, can_transform)",
      sort: "Trustworthiness", cmp: "Trustworthiness", ex: "red", key: "tsne" }
  ];

  CLASSES.forEach(function (c) {
    var sup = !!c.sup;
    var runArgs = sup ? "custom_models=None, random_state=None, include=None, exclude=None" : "custom_models=None, random_state=None, include=None, exclude=None, allow_large=False";
    var runParams = sup ? [P.custom, P.rsm, P.include, P.exclude] : [P.custom, P.rsm, P.include, P.exclude, P.allow];
    var best = c.task === "classification" ? "SVM" : c.task === "regression" ? "Ridge Regression" : "KMeans";

    /* --- run models --- */
    method(c, "run models", "run_all_models", runArgs,
      "Runs every standard built-in model (or the include / exclude selection) plus any custom_models, and stores the results.",
      runParams, c.res + ". Also fills estimators_, fit_times_, failed_models_ and warnings_.",
      c.ex + '.run_all_models()\n' + c.ex + '.run_all_models(include="all")                 # every installed model\n' + c.ex + '.run_all_models(exclude=["' + c.key + '"])');
    method(c, "run models", "run_model", "name, random_state=None, **params",
      "Runs ONE built-in model by key or display name, optionally overriding its parameters.",
      [["name", "str", "required", "Registry key (for example '" + c.key + "') or display name."], P.rsm, P.kw],
      "One result of the same type as run_all_models() returns.",
      'res = ' + c.ex + '.run_model("' + c.key + '")');
    method(c, "run models", "default_models / available_models", "installed_only=False",
      "Class-level helpers. default_models() lists the keys run_all_models() uses; available_models() lists every registered key, including extras that need xgboost, lightgbm or catboost.",
      [["installed_only", "bool", "False", "available_models only: list just the models whose package is installed."]], "list[str].",
      c.cls + '.default_models()\n' + c.cls + '.available_models(installed_only=True)');

    if (sup) {
      method(c, "run models", "tune_models", "include=None, exclude=None, search='random', n_iter=20, cv=5, scoring=None, param_grids=None, random_state=None",
        "Tunes each built-in model's hyper-parameters with cross-validation on the training split only, then refits it and scores it on the test split.",
        [P.include, P.exclude,
          ["search", "str", "'random'", "'random' (n_iter candidates), 'grid' (every combination) or 'halving' (successive halving, fast on big data)."],
          ["n_iter", "int", "20", "Candidates tried per model for random and halving search."],
          P.cv, ["scoring", "str | None", "None", "scikit-learn scoring string. Default: accuracy (classification) or r2 (regression)."],
          ["param_grids", "dict | None", "None", "{'random_forest': {'max_depth': [3, 5]}} replaces a model's default search space."], P.rsm],
        "Same result list as run_all_models(). best_params_ holds the winning parameters per model and tuning_results_ a summary DataFrame.",
        c.ex + '.tune_models(include=["' + c.key + '"], search="random", n_iter=15, cv=5)\nprint(' + c.ex + '.best_params_)\nprint(' + c.ex + '.tuning_results_)');
      method(c, "run models", "cross_validate_models", "cv=5, scoring=None, include=None, exclude=None, custom_models=None",
        "Cross-validates every model on the training split (the test split stays untouched). Preprocessing is re-fitted inside each fold, so nothing leaks.",
        [P.cv, ["scoring", "str | list | None", "None", "One scikit-learn scoring string or a list. neg_* scorers are negative: higher is still better."], P.include, P.exclude, P.custom],
        "DataFrame with '<scorer> mean', '<scorer> std' and 'Fit Time (s)' per model, sorted by the first scorer. Also stored in cv_results_; failures in cv_failed_.",
        c.ex + '.cross_validate_models(cv=5, scoring=["' + (c.task === "classification" ? 'accuracy", "f1_weighted' : 'r2", "neg_mean_absolute_error') + '"])');
    } else if (c.task === "clustering") {
      method(c, "run models", "tune_models", "include=None, exclude=None, scoring='Silhouette', param_grids=None, random_state=None, allow_large=False",
        "Searches a small parameter grid for each method and keeps the setting with the best internal score.",
        [P.include, P.exclude, ["scoring", "str", "'Silhouette'", "Internal score to maximise, for example 'Silhouette'."],
          ["param_grids", "dict | None", "None", "{'dbscan': {'eps': [0.3, 0.5]}} replaces a method's default search space."], P.rsm, P.allow],
        "list of ClusterResult for the tuned models.",
        c.ex + '.tune_models(include=["kmeans", "dbscan"])');
      method(c, "run models", "find_optimal_k", "k_range=None, verbose=None",
        "Fits KMeans for each k and scores it. The best k by Silhouette is stored in optimal_k_; n_clusters='auto' uses it.",
        [["k_range", "list[int] | None", "None", "Values of k to try. Default: 2 up to a data-dependent maximum."], ["verbose", "bool | None", "None", "Override the instance's verbose flag."]],
        "DataFrame with k, Inertia and Silhouette.", c.ex + '.find_optimal_k(k_range=range(2, 10))\nprint(' + c.ex + '.optimal_k_)');
    } else if (c.task === "reduction") {
      method(c, "run models", "find_n_components", "variance=0.95, verbose=None",
        "Smallest number of PCA components that keeps at least the given share of the variance.",
        [["variance", "float", "0.95", "Share of total variance to keep (0 to 1)."], ["verbose", "bool | None", "None", "Override the instance's verbose flag."]],
        "int: the number of components.", 'n = ' + c.ex + '.find_n_components(0.95)');
    }

    /* --- results --- */
    method(c, "results & prediction", "show_tabular_report", "models=None, return_df=False, sort_by=" + (c.task === "anomaly" ? "None" : "'" + c.sort + "'"),
      "Prints the comparison table and recommends the best model. With return_df=True it also returns the table.",
      [P.models, P.report_df, ["sort_by", "str | None", c.sort, c.task === "anomaly" ? "Column to rank by. None ranks by Agreement, or by F1 Score when y was given." : "Column to rank by. Lower-is-better columns (MAE, MSE, RMSE, Davies-Bouldin) sort ascending automatically."]],
      "DataFrame when return_df=True, otherwise None. The first row is the recommended model.",
      'df = ' + c.ex + '.show_tabular_report(return_df=True)');
    method(c, "results & prediction", "get_summary", "models=None, save_prefix=None, show_plot=True",
      "Runs the whole reporting pipeline in one call: table, comparison chart and the task's main plots.",
      [P.models, ["save_prefix", "str | None", "None", "When set, figures are saved with this prefix."], P.show_plot],
      "None.", c.ex + '.get_summary(save_prefix="out/run1", show_plot=False)');
    method(c, "results & prediction", "get_model", "name",
      "Returns the FITTED estimator for a model, as shown in the report.",
      [["name", "str", "required", "Display name from the report."]], "The fitted scikit-learn estimator.",
      'est = ' + c.ex + '.get_model("' + best + '")');

    if (c.task === "clustering") {
      method(c, "results & prediction", "get_labels", "model=None", "Cluster label of every row for a model (default: the best one). -1 means noise.", [P.model], "ndarray of int.", 'labels = clu.get_labels()');
      method(c, "results & prediction", "assign_clusters", "model=None", "Your data with a cluster column added.", [P.model], "DataFrame.", 'df_out = clu.assign_clusters()');
      method(c, "results & prediction", "cluster_profile", "model=None", "Size and average feature values of every cluster, in your original units. The quickest way to see what each cluster is.", [P.model], "DataFrame.", 'clu.cluster_profile()');
      method(c, "results & prediction", "predict", "X_new, model=None", "Assigns NEW rows to the clusters of a fitted model. Works for methods that can label unseen data (KMeans, MiniBatch KMeans, Gaussian Mixture, Birch, ...).",
        [["X_new", "DataFrame | ndarray", "required", "Raw rows with the same columns as the training data."], P.model], "ndarray of cluster labels.", 'clu.predict(new_rows, model="KMeans")');
    } else if (c.task === "anomaly") {
      method(c, "results & prediction", "get_labels", "model=None", "1 = anomaly, 0 = normal for every row (default: the best model).", [P.model], "ndarray of int.", 'flags = ad.get_labels()');
      method(c, "results & prediction", "get_scores", "model=None", "Anomaly score of every row. Higher = stranger.", [P.model], "ndarray of float.", 'scores = ad.get_scores()');
      method(c, "results & prediction", "assign_anomalies", "model=None", "Your data with anomaly (0 / 1) and anomaly_score columns added.", [P.model], "DataFrame.", 'ad.assign_anomalies()');
      method(c, "results & prediction", "top_anomalies", "n=10, model=None", "The n strangest rows with their score, strangest first.",
        [["n", "int", "10", "Number of rows to return."], P.model], "DataFrame.", 'ad.top_anomalies(5)');
      method(c, "results & prediction", "consensus", "min_votes=None, models=None", "Your data with a votes column (how many detectors flagged the row) and a consensus flag.",
        [["min_votes", "int | None", "None", "Votes needed for the consensus flag. None = a majority of the models."], P.models], "DataFrame.", 'ad.consensus(min_votes=4)');
      method(c, "results & prediction", "predict", "X_new, model=None", "1 = anomaly, 0 = normal for NEW rows, using the threshold learned on the training data.",
        [["X_new", "DataFrame | ndarray", "required", "Raw rows with the same columns as the training data."], P.model], "ndarray of int.", 'ad.predict(new_rows)');
      method(c, "results & prediction", "score_new", "X_new, model=None", "Anomaly score of NEW rows (higher = stranger). Compare with the model's threshold.",
        [["X_new", "DataFrame | ndarray", "required", "Raw rows."], P.model], "ndarray of float.", 'ad.score_new(new_rows)');
    } else if (c.task === "reduction") {
      method(c, "results & prediction", "get_embedding", "model=None", "The new columns (Component 1, Component 2, ...) for every row, indexed like your data.", [P.model], "DataFrame.", 'emb = red.get_embedding("PCA")');
      method(c, "results & prediction", "get_loadings", "model='PCA'", "How strongly each scaled feature contributes to each component. The way to interpret components.",
        [["model", "str", "'PCA'", "A linear method such as PCA, FastICA or Factor Analysis."]], "DataFrame (features x components).", 'red.get_loadings("PCA")');
      method(c, "results & prediction", "transform", "X_new, model=None", "Maps NEW rows into the components of a fitted method. Only methods with Can Transform New Data = yes support it (not t-SNE).",
        [["X_new", "DataFrame | ndarray", "required", "Raw rows with the same columns as the training data."], P.model], "DataFrame of components.", 'red.transform(new_rows, model="PCA")');
    } else {
      method(c, "results & prediction", "predict", "X_new, model=None",
        "Predicts for NEW raw data with a fitted model. The same imputation / encoding / scaling used in training is applied, and classification returns the original labels.",
        [["X_new", "DataFrame | ndarray", "required", "Raw rows with the same columns as the training data."], P.model], "ndarray of predictions.",
        c.ex + '.predict(new_rows)                       # best model\n' + c.ex + '.predict(new_rows, model="' + best + '")');
      method(c, "explain & plots", "feature_importance", "model=None, n_repeats=10, scoring=None, max_rows=2000",
        "Permutation importance: how much the test score drops when one feature is shuffled.",
        [P.model, ["n_repeats", "int", "10", "Shuffles per feature."], P.scoring, ["max_rows", "int", "2000", "Cap on test rows used, to keep it fast."]],
        "DataFrame of features ranked by importance (with spread).", c.ex + '.feature_importance()');
      method(c, "explain & plots", "partial_dependence", "feature, model=None, grid_points=20, class_label=None, max_rows=500",
        "Average prediction as ONE feature sweeps over its range, all other columns left as they are.",
        [["feature", "str | int", "required", "Column name or position."], P.model, ["grid_points", "int", "20", "Points along the feature range."],
          ["class_label", "any", "None", "Classification only: which class's probability to follow."], ["max_rows", "int", "500", "Cap on rows used."]],
        "DataFrame with the feature value and the average prediction.", c.ex + '.partial_dependence("' + (c.task === "classification" ? "mean radius" : "bmi") + '")');
      method(c, "explain & plots", "plot_feature_importance", "model=None, top=15, n_repeats=10, scoring=None, save_path=None, show_plot=True",
        "Horizontal bars of the permutation importance, most important feature on top, with ± 1 std whiskers.",
        [P.model, ["top", "int", "15", "Number of features to show."], ["n_repeats", "int", "10", "Shuffles per feature."], P.scoring, P.save_path, P.show_plot],
        "None.", c.ex + '.plot_feature_importance(top=10)');
      method(c, "explain & plots", "plot_partial_dependence", "features=None, model=None, class_label=None, grid_points=20, save_path=None, show_plot=True",
        "One line per feature showing how the average prediction moves as that feature changes. Defaults to the most important features.",
        [["features", "str | int | list | None", "None", "Features to draw. None picks the top ones by importance."], P.model,
          ["class_label", "any", "None", "Classification only."], ["grid_points", "int", "20", "Points along each range."], P.save_path, P.show_plot],
        "None.", c.ex + '.plot_partial_dependence(["' + (c.task === "classification" ? 'mean radius", "worst area' : 'bmi", "bp') + '"])');
    }

    /* --- plots (task specific) --- */
    var cmpMetric = ["metric", "str", c.cmp, c.task === "classification" ? "'F1 Score', 'Accuracy', 'Precision', 'Recall' or 'ROC AUC'." : c.task === "regression" ? "'R2 Score', 'MAE', 'MSE' or 'RMSE'." : "Any score column of the report."];
    if (c.task === "anomaly") cmpMetric = ["metric", "str | None", "None", "Default: 'F1 Score' when labels were given, otherwise 'Agreement'."];
    method(c, "explain & plots", "plot_comparison", "models=None, save_path=None, show_plot=True, metric=" + (c.task === "anomaly" ? "None" : "'" + c.cmp + "'"),
      "Ranks all models on one metric as a single sorted bar chart with the best model highlighted.",
      [P.models, P.save_path, P.show_plot, cmpMetric], "None.", c.ex + '.plot_comparison(metric="' + c.cmp + '")');

    if (c.task === "classification") {
      method(c, "explain & plots", "plot_confusion_matrices", "models=None, save_path=None, show_plot=True", "Grid of confusion matrices, one per model, labelled with the original class names.", [P.models, P.save_path, P.show_plot], "None.", 'clf.plot_confusion_matrices()');
      method(c, "explain & plots", "plot_roc_curves", "models=None, save_path=None, show_plot=True", "ROC curves of all models in one combined plot (one-vs-rest for multi-class).", [P.models, P.save_path, P.show_plot], "None.", 'clf.plot_roc_curves()');
    } else if (c.task === "regression") {
      method(c, "explain & plots", "plot_true_vs_predicted", "models=None, save_path=None, show_plot=True", "True vs predicted values for every model, with the ideal diagonal.", [P.models, P.save_path, P.show_plot], "None.", 'reg.plot_true_vs_predicted()');
    } else if (c.task === "clustering") {
      method(c, "explain & plots", "plot_clusters", "models=None, top=6, save_path=None, show_plot=True", "Scatter plots of the best models coloured by cluster (grey crosses are noise). More than two features are projected to two dimensions.", [P.models, P.top, P.save_path, P.show_plot], "None.", 'clu.plot_clusters(top=4)');
      method(c, "explain & plots", "plot_k_search", "save_path=None, show_plot=True", "Elbow curve (Inertia) and Silhouette against k, with the best k marked. Needs find_optimal_k() first.", [P.save_path, P.show_plot], "None.", 'clu.find_optimal_k()\nclu.plot_k_search()');
      method(c, "explain & plots", "plot_silhouette", "model=None, save_path=None, show_plot=True", "Silhouette of every single row grouped by cluster. Long bars past the dashed average line are well-placed rows.", [P.model, P.save_path, P.show_plot], "None.", 'clu.plot_silhouette()');
    } else if (c.task === "anomaly") {
      method(c, "explain & plots", "plot_anomalies", "models=None, top=6, save_path=None, show_plot=True", "Scatter plots of the best detectors; flagged rows are red crosses. More than two features are projected to two dimensions.", [P.models, P.top, P.save_path, P.show_plot], "None.", 'ad.plot_anomalies()');
      method(c, "explain & plots", "plot_scores", "model=None, save_path=None, show_plot=True", "Histogram of the anomaly scores with the cut-off line. Rows right of it are flagged.", [P.model, P.save_path, P.show_plot], "None.", 'ad.plot_scores()');
    } else if (c.task === "reduction") {
      method(c, "explain & plots", "plot_embeddings", "models=None, top=6, save_path=None, show_plot=True", "Scatter plots of the first two components of the best methods, coloured by y when given.", [P.models, P.top, P.save_path, P.show_plot], "None.", 'red.plot_embeddings()');
      method(c, "explain & plots", "plot_variance", "save_path=None, show_plot=True", "Scree plot: variance of every PCA component (bars) and the running total (line).", [P.save_path, P.show_plot], "None.", 'red.plot_variance()');
    }

    /* --- save & load --- */
    method(c, "save & load", "save_report", "df_or_filepath=None, filepath=None",
      "Saves the report table as CSV, Excel, HTML or JSON, chosen by the file extension. Accepts a DataFrame and a path, or just a path to save the last report.",
      [["df_or_filepath", "DataFrame | str | None", "None", "Report DataFrame, or the output path when saving the last report."], ["filepath", "str | None", "None", "Output path (.csv, .xlsx, .html, .json)."]],
      "None.", c.ex + '.save_report("results.csv")');
    method(c, "save & load", "save_html_report", "path='report.html', title=None",
      "Writes ONE self-contained HTML file with the results table, the plots and any warnings or failed models. No extra files needed to open it.",
      [["path", "str", "'report.html'", "Output file."], ["title", "str | None", "None", "Heading of the report."]],
      "str: the path written.", c.ex + '.save_html_report("report.html", title="My benchmark")');
    method(c, "save & load", "save_model", "path, model=None",
      "Saves a fitted model together with its preprocessing (joblib). Reload with load_model(path).",
      [["path", "str", "required", "Output path."], P.model], "str: the path written.", c.ex + '.save_model("best_model.joblib")');
    method(c, "save & load", "export_model", "model=None",
      "Bundles a fitted model with its preprocessing into a TrainedModel (default: the best one).",
      [P.model], "TrainedModel.", 'tm = ' + c.ex + '.export_model()');
    if (sup) {
      method(c, "save & load", "evaluate_model", "model, X_test=None, y_true=None",
        "Evaluates a fitted " + (c.task === "classification" ? "classifier" : "regressor") + " on the test split (or on data you pass) and returns the evaluation values.",
        [["model", "estimator", "required", "A fitted estimator."], ["X_test", "array | None", "None", "Defaults to the instance's scaled test split."], ["y_true", "array | None", "None", "Defaults to the instance's test target."]],
        c.task === "classification" ? "tuple (report, matrix, accuracy, precision, recall, f1, fpr, tpr, roc_auc)." : "tuple (mae, mse, rmse, r2, y_pred).",
        'res = ' + c.ex + '.evaluate_model(' + c.ex + '.get_model("' + best + '"))');
      var legacy = c.task === "classification"
        ? ["AdaBoost_model", "DecisionTree_model", "GradientBoosting_model", "KNN_model", "Logistic_model", "Naive_Bayes_model", "RandomForest_model", "Support_vector_model"]
        : ["AdaBoost_model", "DecisionTree_model", "GradientBoosting_model", "KNN_model", "Lasso_model", "LinearRegression_model", "RandomForest_model", "Ridge_model", "SVR_model"];
      add({
        id: c.cls + ".legacy_models", group: c.label + ": save & load", cls: c.cls, name: "legacy one-model methods",
        sig: legacy.map(function (n) { return n + "(**params)"; }).join("\n"),
        summary: "The original one-method-per-model API still works unchanged: " + legacy.join(", ") + ". Prefer run_model('key') in new code.",
        params: [P.kw], returns: "The same evaluation values as before (see evaluate_model).",
        example: c.ex + '.' + legacy[c.task === "classification" ? 4 : 7] + '()'
      });
    }
  });

  /* ---------- TrainedModel methods ---------- */
  var TM = { cls: "TrainedModel", label: "TrainedModel" };
  method(TM, "methods", "predict", "X", "Predicts for new rows. Classification returns the ORIGINAL labels (strings stay strings).",
    [["X", "DataFrame | ndarray", "required", "Raw rows with the training columns."]], "ndarray.", 'tm.predict(new_rows)');
  method(TM, "methods", "transform", "X", "Maps new rows to the new feature space (dimensionality-reduction models).",
    [["X", "DataFrame | ndarray", "required", "Raw rows with the training columns."]], "ndarray.", 'tm.transform(new_rows)');
  method(TM, "methods", "predict_proba", "X", "Class probabilities, one column per class (classification only).",
    [["X", "DataFrame | ndarray", "required", "Raw rows with the training columns."]], "DataFrame.", 'tm.predict_proba(new_rows)');
  method(TM, "methods", "save", "path", "Writes the bundle to a joblib file. Reload with load_model().",
    [["path", "str", "required", "Output path."]], "str: the path written.", 'tm.save("model.joblib")');

  return items;
})();

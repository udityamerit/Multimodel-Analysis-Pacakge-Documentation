/**
 * Multimodel Analysis Package — Enterprise Documentation Application Logic
 * Author: Uditya Narayan Tiwari (udityamerit)
 * Version: 1.1.0 (Enhanced with Dataset Profiles & Real-time Formula Playground)
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initScrollSpy();
    initClipboardCopy();
    initCodeTabs();
    initApiSearch();
    initSimulator();
    initFormulaPlayground();
});

/* ==========================================================================
   Dataset Profiles (Data Sources & Specifications for Simulation)
   ========================================================================== */
const DATASET_PROFILES = {
    classification: [
        {
            id: 'churn',
            name: 'Customer Churn Prediction',
            unit: 'Binary Label ("Yes" / "No")',
            desc: 'Predicting customer attrition in telecom/SaaS. Feature matrix (X) includes customer tenure, monthly billing, and support ticket frequency. Target variable (y) is label-encoded automatically. Evaluated under realistic 80/20 class distribution.',
            accBase: 0.948,
            aucBase: 0.984
        },
        {
            id: 'iris',
            name: 'Botanical Species Taxonomic ID',
            unit: 'Categorical (3 Balanced Classes)',
            desc: 'Multiclass classification across Iris setosa, versicolor, and virginica using petal and sepal continuous morphological dimensions. Evaluated using One-vs-Rest (OvR) macro ROC-AUC calculation.',
            accBase: 0.975,
            aucBase: 0.992
        },
        {
            id: 'fraud',
            name: 'Financial Transaction Fraud Detection',
            unit: 'Binary Label (Fraud / Legitimate)',
            desc: 'High-dimensional anonymized banking transaction logs featuring extreme 99.2% / 0.8% class imbalance. Highlights the necessity of weighted Precision, Recall, and F1 scoring over raw accuracy.',
            accBase: 0.991,
            aucBase: 0.965
        }
    ],
    regression: [
        {
            id: 'weather',
            name: 'Atmospheric Temperature Forecasting',
            unit: 'Temperature (°C)',
            prefix: '',
            suffix: ' °C',
            desc: 'Predicting continuous surface air temperature (°C) 24 hours ahead using barometric pressure, relative humidity, and wind vector time-series features. Notice: All error metrics (MAE, RMSE) are expressed in unit °C.',
            r2Base: 0.945,
            maeBase: 0.85,
            mseBase: 1.42,
            rmseBase: 1.19
        },
        {
            id: 'demand',
            name: 'Supply Chain Warehouse Demand',
            unit: 'Unit Volume (Item Count)',
            prefix: '',
            suffix: ' units',
            desc: 'Forecasting daily SKU order volume across regional fulfillment centers. Target represents physical inventory count. Error metrics reflect absolute unit discrepancies without monetary units.',
            r2Base: 0.889,
            maeBase: 124.3,
            mseBase: 28900,
            rmseBase: 170.0
        },
        {
            id: 'housing',
            name: 'Real Estate Property Valuation',
            unit: 'Currency ($ USD)',
            prefix: '$',
            suffix: '',
            desc: 'Estimating continuous residential real estate sale prices using square footage, neighborhood indices, and construction year. Because target variable y is US Dollars, MAE and RMSE represent financial currency errors ($).',
            r2Base: 0.912,
            maeBase: 1420.5,
            mseBase: 3241000,
            rmseBase: 1800.2
        }
    ]
};

/* ==========================================================================
   1. Theme Toggler (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;
    
    if (!toggleBtn || !themeIcon) return;

    const savedTheme = localStorage.getItem('multimodel_theme') || 'light';
    setTheme(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('multimodel_theme', theme);
        themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

/* ==========================================================================
   2. Mobile Sidebar Toggle
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    
    if (!menuBtn || !sidebar) return;

    const navLinks = sidebar.querySelectorAll('.sidebar-link');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && !sidebar.contains(e.target) && e.target !== menuBtn) {
            sidebar.classList.remove('open');
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        });
    });
}

/* ==========================================================================
   3. Scroll-Spy Navigation
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.sidebar-nav .sidebar-link');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    }, { passive: true });
}

/* ==========================================================================
   4. Copy to Clipboard Utility
   ========================================================================== */
function initClipboardCopy() {
    const copyInstallBtn = document.getElementById('copy-install-btn');
    if (copyInstallBtn) {
        copyInstallBtn.addEventListener('click', () => {
            const textToCopy = copyInstallBtn.getAttribute('data-clipboard');
            copyToClipboard(textToCopy, copyInstallBtn, 'Copy', 'Copied! ✓');
        });
    }

    const codeCopyBtn = document.getElementById('code-copy-btn');
    if (codeCopyBtn) {
        codeCopyBtn.addEventListener('click', () => {
            const activePane = document.querySelector('.code-pane.active');
            if (activePane) {
                const textToCopy = activePane.innerText || activePane.textContent;
                copyToClipboard(textToCopy, codeCopyBtn, 'Copy Code', 'Copied! ✓');
            }
        });
    }

    function copyToClipboard(text, buttonEl, originalLabel, successLabel) {
        navigator.clipboard.writeText(text).then(() => {
            const span = buttonEl.querySelector('span');
            if (span) {
                span.textContent = successLabel;
            } else {
                buttonEl.textContent = successLabel;
            }
            buttonEl.style.background = 'var(--accent-emerald)';
            buttonEl.style.color = '#fff';
            buttonEl.style.borderColor = 'var(--accent-emerald)';
            
            setTimeout(() => {
                if (span) {
                    span.textContent = originalLabel;
                } else {
                    buttonEl.textContent = originalLabel;
                }
                buttonEl.style.background = '';
                buttonEl.style.color = '';
                buttonEl.style.borderColor = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            const span = buttonEl.querySelector('span');
            if (span) span.textContent = 'Error!'; else buttonEl.textContent = 'Error!';
        });
    }
}

/* ==========================================================================
   5. Tabbed Code Showcase
   ========================================================================== */
function initCodeTabs() {
    const tabs = document.querySelectorAll('.code-tab');
    const panes = document.querySelectorAll('.code-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   6. API Search & Table Filtering
   ========================================================================== */
function initApiSearch() {
    const searchInput = document.getElementById('api-search-input');
    const tableRows = document.querySelectorAll('#api-table tbody tr.api-row');
    const countLabel = document.getElementById('api-count-label');

    if (!searchInput || !tableRows.length) return;

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let visibleCount = 0;

        tableRows.forEach(row => {
            const searchData = row.getAttribute('data-search') || '';
            const rowText = row.textContent.toLowerCase();
            const matches = searchData.includes(query) || rowText.includes(query);

            if (matches) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        if (countLabel) {
            countLabel.textContent = `Showing ${visibleCount} of ${tableRows.length} entries`;
        }
    });
}

/* ==========================================================================
   7. Interactive Benchmarking Simulator (Playground)
   ========================================================================== */
function initSimulator() {
    const runBtn = document.getElementById('run-sim-btn');
    const taskSelect = document.getElementById('sim-task-type');
    const datasetSelect = document.getElementById('sim-dataset');
    const samplesSelect = document.getElementById('sim-samples');
    const progressBox = document.getElementById('sim-progress-box');
    const progressBar = document.getElementById('sim-progress-bar');
    const statusText = document.getElementById('progress-status-text');
    const percentText = document.getElementById('progress-percent-text');
    const tableHeader = document.getElementById('sim-table-header');
    const tableBody = document.getElementById('sim-table-body');

    // Dataset Info Banner Elements
    const dsTitle = document.getElementById('ds-title');
    const dsBadge = document.getElementById('ds-target-badge');
    const dsDesc = document.getElementById('ds-description');

    if (!runBtn || !taskSelect || !datasetSelect || !tableBody) return;

    // Populate dataset dropdown when task changes
    function populateDatasets(taskType) {
        const profiles = DATASET_PROFILES[taskType] || [];
        datasetSelect.innerHTML = '';
        profiles.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.unit})`;
            datasetSelect.appendChild(opt);
        });
        updateDatasetBanner(taskType, profiles[0].id);
    }

    function updateDatasetBanner(taskType, dsId) {
        const profiles = DATASET_PROFILES[taskType] || [];
        const activeProfile = profiles.find(p => p.id === dsId) || profiles[0];
        if (activeProfile && dsTitle && dsBadge && dsDesc) {
            dsTitle.textContent = activeProfile.name;
            dsBadge.textContent = `Target Unit: ${activeProfile.unit}`;
            dsDesc.textContent = activeProfile.desc;
        }
    }

    // Initialize dropdowns
    populateDatasets(taskSelect.value);

    taskSelect.addEventListener('change', () => {
        populateDatasets(taskSelect.value);
        runSimulation(taskSelect.value, datasetSelect.value, parseInt(samplesSelect.value, 10), true);
    });

    datasetSelect.addEventListener('change', () => {
        updateDatasetBanner(taskSelect.value, datasetSelect.value);
        runSimulation(taskSelect.value, datasetSelect.value, parseInt(samplesSelect.value, 10), true);
    });

    samplesSelect.addEventListener('change', () => {
        runSimulation(taskSelect.value, datasetSelect.value, parseInt(samplesSelect.value, 10), true);
    });

    // Run default simulation on page load
    runSimulation(taskSelect.value, datasetSelect.value, parseInt(samplesSelect.value, 10), true);

    runBtn.addEventListener('click', () => {
        runSimulation(taskSelect.value, datasetSelect.value, parseInt(samplesSelect.value, 10), false);
    });

    function runSimulation(taskType, dsId, sampleSize, isInstant) {
        const profiles = DATASET_PROFILES[taskType] || [];
        const activeProfile = profiles.find(p => p.id === dsId) || profiles[0];

        runBtn.disabled = true;
        runBtn.style.opacity = '0.6';
        runBtn.style.cursor = 'not-allowed';

        if (!isInstant) {
            progressBox.classList.add('active');
            progressBar.style.width = '0%';
            percentText.textContent = '0%';
            statusText.textContent = `Fitting ${taskType} estimators on ${sampleSize.toLocaleString()} rows (${activeProfile.name})...`;
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 28px; color: var(--text-muted); font-weight: 500;">⚡ Executing parallel cross-evaluation (n_jobs=-1)...</td></tr>';
        }

        let progress = 0;
        const intervalTime = isInstant ? 5 : 120;
        const step = isInstant ? 50 : 15;

        const timer = setInterval(() => {
            progress += step;
            if (progress > 100) progress = 100;

            if (!isInstant) {
                progressBar.style.width = `${progress}%`;
                percentText.textContent = `${progress}%`;

                if (progress === 30) statusText.textContent = 'Standardizing feature arrays & label encoding targets...';
                if (progress === 60) statusText.textContent = 'Computing statistical metrics & ROC-AUC curves...';
                if (progress === 90) statusText.textContent = 'Generating diagnostic leaderboard & formatting tables...';
            }

            if (progress === 100) {
                clearInterval(timer);
                setTimeout(() => {
                    if (!isInstant) progressBox.classList.remove('active');
                    runBtn.disabled = false;
                    runBtn.style.opacity = '1';
                    runBtn.style.cursor = 'pointer';
                    renderResults(taskType, activeProfile, sampleSize);
                }, isInstant ? 20 : 250);
            }
        }, intervalTime);
    }

    function renderResults(taskType, profile, sampleSize) {
        // Dynamic noise variance based on sample size (more samples -> higher stability)
        const sampleFactor = sampleSize === 50000 ? 0.002 : (sampleSize === 10000 ? 0.005 : 0.012);
        const noise = () => (Math.random() * sampleFactor * 2 - sampleFactor);

        if (taskType === 'classification') {
            tableHeader.innerHTML = `
                <th>Rank</th>
                <th>Estimator Name</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>ROC-AUC</th>
            `;

            const baseAcc = profile.accBase || 0.94;
            const baseAuc = profile.aucBase || 0.97;

            const clfModels = [
                { name: 'Random Forest Classifier', acc: baseAcc + noise(), prec: baseAcc + 0.003 + noise(), rec: baseAcc + noise(), f1: baseAcc + 0.001 + noise(), auc: baseAuc + noise() },
                { name: 'Gradient Boosting Classifier', acc: baseAcc - 0.006 + noise(), prec: baseAcc - 0.004 + noise(), rec: baseAcc - 0.006 + noise(), f1: baseAcc - 0.005 + noise(), auc: baseAuc - 0.005 + noise() },
                { name: 'Support Vector Machine (SVC)', acc: baseAcc - 0.017 + noise(), prec: baseAcc - 0.015 + noise(), rec: baseAcc - 0.017 + noise(), f1: baseAcc - 0.016 + noise(), auc: baseAuc - 0.013 + noise() },
                { name: 'Logistic Regression', acc: baseAcc - 0.033 + noise(), prec: baseAcc - 0.031 + noise(), rec: baseAcc - 0.033 + noise(), f1: baseAcc - 0.032 + noise(), auc: baseAuc - 0.022 + noise() },
                { name: 'AdaBoost Classifier', acc: baseAcc - 0.050 + noise(), prec: baseAcc - 0.048 + noise(), rec: baseAcc - 0.050 + noise(), f1: baseAcc - 0.049 + noise(), auc: baseAuc - 0.039 + noise() },
                { name: 'K-Nearest Neighbors (KNN)', acc: baseAcc - 0.063 + noise(), prec: baseAcc - 0.059 + noise(), rec: baseAcc - 0.063 + noise(), f1: baseAcc - 0.061 + noise(), auc: baseAuc - 0.046 + noise() },
                { name: 'Decision Tree Classifier', acc: baseAcc - 0.096 + noise(), prec: baseAcc - 0.094 + noise(), rec: baseAcc - 0.096 + noise(), f1: baseAcc - 0.095 + noise(), auc: baseAuc - 0.134 + noise() },
                { name: 'Gaussian Naive Bayes', acc: baseAcc - 0.124 + noise(), prec: baseAcc - 0.117 + noise(), rec: baseAcc - 0.124 + noise(), f1: baseAcc - 0.121 + noise(), auc: baseAuc - 0.083 + noise() },
            ];

            clfModels.sort((a, b) => b.acc - a.acc);

            let rowsHtml = '';
            clfModels.forEach((model, idx) => {
                const rank = idx + 1;
                const rankBadgeClass = rank <= 3 ? `rank-${rank}` : '';
                const highlightClass = rank === 1 ? 'score-highlight' : '';
                const badge = rank <= 3 ? `<span class="rank-badge ${rankBadgeClass}">#${rank}</span>` : `#${rank}`;
                
                // Clamp percentages between 0 and 100
                const formatPct = val => Math.min(Math.max(val * 100, 0), 99.99).toFixed(2) + '%';
                const formatAuc = val => Math.min(Math.max(val, 0), 0.999).toFixed(3);

                rowsHtml += `
                    <tr>
                        <td>${badge}</td>
                        <td class="model-name">${model.name} ${rank === 1 ? '(Best)' : ''}</td>
                        <td class="${highlightClass}">${formatPct(model.acc)}</td>
                        <td>${formatPct(model.prec)}</td>
                        <td>${formatPct(model.rec)}</td>
                        <td>${formatPct(model.f1)}</td>
                        <td>${formatAuc(model.auc)}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = rowsHtml;

        } else {
            // Regression Task (With dynamic Unit formatting!)
            tableHeader.innerHTML = `
                <th>Rank</th>
                <th>Estimator Name</th>
                <th>R² Score</th>
                <th>MAE (${profile.unit})</th>
                <th>MSE</th>
                <th>RMSE (${profile.unit})</th>
                <th>Recommendation</th>
            `;

            const baseR2 = profile.r2Base || 0.90;
            const baseMae = profile.maeBase || 100;
            const baseMse = profile.mseBase || 10000;
            const baseRmse = profile.rmseBase || 120;
            const prefix = profile.prefix !== undefined ? profile.prefix : '';
            const suffix = profile.suffix !== undefined ? profile.suffix : '';

            const regModels = [
                { name: 'Gradient Boosting Regressor', r2: baseR2 + noise(), mae: baseMae * (1 - noise()*2), mse: baseMse * (1 - noise()*4), rmse: baseRmse * (1 - noise()*2) },
                { name: 'Random Forest Regressor', r2: baseR2 - 0.007 + noise(), mae: baseMae * 1.04, mse: baseMse * 1.08, rmse: baseRmse * 1.04 },
                { name: 'Ridge Regression', r2: baseR2 - 0.048 + noise(), mae: baseMae * 1.27, mse: baseMse * 1.53, rmse: baseRmse * 1.23 },
                { name: 'Linear Regression', r2: baseR2 - 0.050 + noise(), mae: baseMae * 1.28, mse: baseMse * 1.55, rmse: baseRmse * 1.24 },
                { name: 'Lasso Regression', r2: baseR2 - 0.051 + noise(), mae: baseMae * 1.29, mse: baseMse * 1.56, rmse: baseRmse * 1.25 },
                { name: 'Support Vector Regressor (SVR)', r2: baseR2 - 0.127 + noise(), mae: baseMae * 1.62, mse: baseMse * 2.43, rmse: baseRmse * 1.56 },
                { name: 'Decision Tree Regressor', r2: baseR2 - 0.170 + noise(), mae: baseMae * 1.78, mse: baseMse * 2.91, rmse: baseRmse * 1.70 },
            ];

            regModels.sort((a, b) => b.r2 - a.r2);

            let rowsHtml = '';
            regModels.forEach((model, idx) => {
                const rank = idx + 1;
                const rankBadgeClass = rank <= 3 ? `rank-${rank}` : '';
                const highlightClass = rank === 1 ? 'score-highlight' : '';
                const badge = rank <= 3 ? `<span class="rank-badge ${rankBadgeClass}">#${rank}</span>` : `#${rank}`;
                
                const formatVal = val => prefix + val.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}) + suffix;
                const formatMse = val => Math.round(val).toLocaleString();

                rowsHtml += `
                    <tr>
                        <td>${badge}</td>
                        <td class="model-name">${model.name} ${rank === 1 ? '(Best)' : ''}</td>
                        <td class="${highlightClass}">${model.r2.toFixed(4)}</td>
                        <td>${formatVal(model.mae)}</td>
                        <td>${formatMse(model.mse)}</td>
                        <td>${formatVal(model.rmse)}</td>
                        <td>${rank === 1 ? 'Optimal Baseline' : (rank <= 3 ? 'Strong Baseline' : 'Sub-optimal')}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = rowsHtml;
        }
    }
}

/* ==========================================================================
   8. Interactive Metric & Formula Playground (NEW Enhancement)
   ========================================================================== */
function initFormulaPlayground() {
    const tpInput = document.getElementById('calc-tp');
    const fpInput = document.getElementById('calc-fp');
    const fnInput = document.getElementById('calc-fn');
    const tnInput = document.getElementById('calc-tn');

    const outAcc = document.getElementById('out-acc');
    const outPrec = document.getElementById('out-prec');
    const outRec = document.getElementById('out-rec');
    const outF1 = document.getElementById('out-f1');

    if (!tpInput || !fpInput || !fnInput || !tnInput) return;

    function calculateMetrics() {
        const tp = parseInt(tpInput.value, 10) || 0;
        const fp = parseInt(fpInput.value, 10) || 0;
        const fn = parseInt(fnInput.value, 10) || 0;
        const tn = parseInt(tnInput.value, 10) || 0;

        const total = tp + fp + fn + tn;
        const acc = total > 0 ? (tp + tn) / total : 0;
        const prec = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const rec = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const f1 = (prec + rec) > 0 ? (2 * prec * rec) / (prec + rec) : 0;

        if (outAcc) outAcc.textContent = (acc * 100).toFixed(1) + '%';
        if (outPrec) outPrec.textContent = (prec * 100).toFixed(1) + '%';
        if (outRec) outRec.textContent = (rec * 100).toFixed(1) + '%';
        if (outF1) outF1.textContent = (f1 * 100).toFixed(1) + '%';

        // Update value displays next to sliders
        document.getElementById('val-tp').textContent = tp;
        document.getElementById('val-fp').textContent = fp;
        document.getElementById('val-fn').textContent = fn;
        document.getElementById('val-tn').textContent = tn;

        // Dynamically update slider track fill progress with each slider's accent color
        [tpInput, fpInput, fnInput, tnInput].forEach(el => {
            if (!el) return;
            const min = parseFloat(el.min) || 0;
            const max = parseFloat(el.max) || 100;
            const val = parseFloat(el.value) || 0;
            const percent = ((val - min) / (max - min)) * 100;
            el.style.background = `linear-gradient(to right, currentColor 0%, currentColor ${percent}%, var(--code-header) ${percent}%, var(--code-header) 100%)`;
        });
    }

    [tpInput, fpInput, fnInput, tnInput].forEach(el => {
        el.addEventListener('input', calculateMetrics);
    });

    calculateMetrics();
}

// Global Multi-OS Installation Tab Switcher
window.switchInstallOS = function(osType) {
    // Update tab active state
    const tabs = document.querySelectorAll('.install-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-os') === osType) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
        } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        }
    });

    const cmdEl     = document.getElementById('install-command');
    const copyBtn   = document.getElementById('copy-install-btn');
    const promptEl  = document.getElementById('install-prompt');
    const subtextEl = document.getElementById('install-subtext');
    const labelEl   = document.getElementById('terminal-label');

    if (!cmdEl || !copyBtn) return;

    const osMap = {
        windows: {
            cmd:    'py -m pip install multimodel-analysis',
            prompt: 'PS C:\\>',
            label:  'Windows PowerShell',
            hint:   'Recommended for Windows PowerShell and Command Prompt using the Python Launcher (<code>py</code>).'
        },
        mac: {
            cmd:    'python3 -m pip install multimodel-analysis',
            prompt: '$',
            label:  'macOS Terminal',
            hint:   'Recommended for macOS Terminal using Apple Python 3 or a Homebrew-managed installation.'
        },
        linux: {
            cmd:    'pip3 install multimodel-analysis',
            prompt: '$',
            label:  'Linux / bash',
            hint:   'Standard command for Ubuntu, Debian, RHEL, and Arch. Use a virtual environment on PEP 668-managed systems.'
        },
        conda: {
            cmd:    'conda create -n ml-env python=3.11 -y && conda activate ml-env && pip install multimodel-analysis',
            prompt: '(base) $',
            label:  'Conda / Anaconda Prompt',
            hint:   'Creates an isolated Conda environment with Python 3.11, then installs the package via pip.'
        },
        docker: {
            cmd:    'docker run --rm -it python:3.11-slim pip install multimodel-analysis',
            prompt: '$',
            label:  'Docker CLI',
            hint:   'Pulls a lightweight Python 3.11 container and installs multimodel-analysis in an isolated environment.'
        }
    };

    const config = osMap[osType];
    if (!config) return;

    cmdEl.textContent = config.cmd;
    copyBtn.setAttribute('data-clipboard', config.cmd);
    if (promptEl)  promptEl.textContent  = config.prompt;
    if (labelEl)   labelEl.textContent   = config.label;
    if (subtextEl) subtextEl.innerHTML   = config.hint;

    // Reset copy button
    const copySpan = copyBtn.querySelector('span');
    if (copySpan) copySpan.textContent = 'Copy';
    copyBtn.style.background = '';
    copyBtn.style.color = '';
};

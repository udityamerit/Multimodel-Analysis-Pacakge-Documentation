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
    initApiModal();
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

/* ==========================================================================
   Interactive API Code Example Modal Data & Logic
   ========================================================================== */
const API_EXAMPLES_DATA = {
    // --- 1. STANDALONE & ALIASES ---
    'save_report': {
        tag: 'STANDALONE UTILITY — NONE',
        title: 'save_report(df=None, filepath="report.csv")',
        desc: 'Exports comparison tabular report DataFrame to disk. Automatically detects file format (.csv, .xlsx, .xls, .html, .json) from file extension.',
        codeRaw: `import pandas as pd
from multimodel_analysis import save_report

# 1. Prepare metrics report DataFrame
df_report = pd.DataFrame({
    'Model': ['Random Forest', 'Logistic Regression'],
    'Accuracy': [0.95, 0.88],
    'F1 Score': [0.94, 0.87]
})

# 2. Export to multiple publication formats
save_report(df_report, "metrics.csv")
save_report(df_report, "metrics.xlsx")
save_report(df_report, "metrics.html")
save_report(df_report, "metrics.json")`,
        codeHtml: `<span class="kw">import</span> pandas <span class="kw">as</span> pd
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="fn">save_report</span>

<span class="cm"># 1. Prepare metrics report DataFrame</span>
<span class="var">df_report</span> = pd.<span class="cls">DataFrame</span>({
    <span class="str">'Model'</span>: [<span class="str">'Random Forest'</span>, <span class="str">'Logistic Regression'</span>],
    <span class="str">'Accuracy'</span>: [<span class="num">0.95</span>, <span class="num">0.88</span>],
    <span class="str">'F1 Score'</span>: [<span class="num">0.94</span>, <span class="num">0.87</span>]
})

<span class="cm"># 2. Export to multiple publication formats</span>
<span class="fn">save_report</span>(<span class="var">df_report</span>, <span class="str">"metrics.csv"</span>)
<span class="fn">save_report</span>(<span class="var">df_report</span>, <span class="str">"metrics.xlsx"</span>)
<span class="fn">save_report</span>(<span class="var">df_report</span>, <span class="str">"metrics.html"</span>)
<span class="fn">save_report</span>(<span class="var">df_report</span>, <span class="str">"metrics.json"</span>)`
    },
    'reg_alias_class': {
        tag: 'BACKWARD COMPATIBILITY — CLASS ALIAS',
        title: 'MultiModelRegressior',
        desc: 'Backward-compatibility class alias mapping directly to MultiModelRegressor to ensure non-breaking integration for legacy codebases.',
        codeRaw: `import pandas as pd
import numpy as np
from multimodel_analysis import MultiModelRegressior

# MultiModelRegressior is an exact alias for MultiModelRegressor
X = pd.DataFrame(np.random.randn(100, 4))
y = pd.Series(np.random.randn(100))

reg = MultiModelRegressior(X=X, y=y, test_size=0.2, random_state=42)
results = reg.run_all_models()

print(f"Alias works seamlessly: {type(reg).__name__}")
# Output: Alias works seamlessly: MultiModelRegressor`,
        codeHtml: `<span class="kw">import</span> pandas <span class="kw">as</span> pd
<span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressior</span>

<span class="cm"># MultiModelRegressior is an exact alias for MultiModelRegressor</span>
<span class="var">X</span> = pd.<span class="cls">DataFrame</span>(np.random.<span class="fn">randn</span>(<span class="num">100</span>, <span class="num">4</span>))
<span class="var">y</span> = pd.<span class="cls">Series</span>(np.random.<span class="fn">randn</span>(<span class="num">100</span>))

<span class="var">reg</span> = <span class="cls">MultiModelRegressior</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)
<span class="var">results</span> = <span class="var">reg</span>.<span class="fn">run_all_models</span>()

<span class="fn">print</span>(<span class="str">f"Alias works seamlessly: {<span class="fn">type</span>(<span class="var">reg</span>).__name__}"</span>)
<span class="cm"># Output: Alias works seamlessly: MultiModelRegressor</span>`
    },

    // --- 2. MULTIMODELCLASSIFIER METHODS ---
    'clf_Logistic_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'Logistic_model(random_state=None, max_iter=1000, **kwargs)',
        desc: 'Trains a Logistic Regression classifier and evaluates metrics. Supports random seed overrides and custom hyperparameters like C and solver.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

# Default run with instance random_state (42)
metrics = classifier.Logistic_model()

# Override parameters: max_iter and regularization C
custom_metrics = classifier.Logistic_model(random_state=100, max_iter=2000, C=0.5)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="cm"># Default run with instance random_state (42)</span>
<span class="var">metrics</span> = <span class="var">classifier</span>.<span class="fn">Logistic_model</span>()

<span class="cm"># Override parameters: max_iter and regularization C</span>
<span class="var">custom_metrics</span> = <span class="var">classifier</span>.<span class="fn">Logistic_model</span>(random_state=<span class="num">100</span>, max_iter=<span class="num">2000</span>, C=<span class="num">0.5</span>)`
    },
    'clf_Support_vector_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'Support_vector_model(random_state=None, kernel=\'linear\', probability=True, **kwargs)',
        desc: 'Trains a Support Vector Classifier (SVC) with probability estimation enabled for ROC-AUC scoring.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

# Default linear kernel SVC
svc_res = classifier.Support_vector_model()

# Custom RBF kernel with specified random_state
svc_custom = classifier.Support_vector_model(random_state=99, kernel='rbf', C=1.5)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="cm"># Default linear kernel SVC</span>
<span class="var">svc_res</span> = <span class="var">classifier</span>.<span class="fn">Support_vector_model</span>()

<span class="cm"># Custom RBF kernel with specified random_state</span>
<span class="var">svc_custom</span> = <span class="var">classifier</span>.<span class="fn">Support_vector_model</span>(random_state=<span class="num">99</span>, kernel=<span class="str">'rbf'</span>, C=<span class="num">1.5</span>)`
    },
    'clf_DecisionTree_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'DecisionTree_model(random_state=None, **kwargs)',
        desc: 'Trains a Decision Tree Classifier and evaluates split performance and accuracy.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

dt_res = classifier.DecisionTree_model(random_state=123, max_depth=5)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="var">dt_res</span> = <span class="var">classifier</span>.<span class="fn">DecisionTree_model</span>(random_state=<span class="num">123</span>, max_depth=<span class="num">5</span>)`
    },
    'clf_KNN_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'KNN_model(n_neighbors=None, **kwargs)',
        desc: 'Trains a K-Nearest Neighbors Classifier. Automatically calculates optimal n_neighbors if omitted and strips random_state safely.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

# Auto-detects n_neighbors based on dataset size
knn_res = classifier.KNN_model()

# Custom n_neighbors
knn_custom = classifier.KNN_model(n_neighbors=7)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="cm"># Auto-detects n_neighbors based on dataset size</span>
<span class="var">knn_res</span> = <span class="var">classifier</span>.<span class="fn">KNN_model</span>()

<span class="cm"># Custom n_neighbors</span>
<span class="var">knn_custom</span> = <span class="var">classifier</span>.<span class="fn">KNN_model</span>(n_neighbors=<span class="num">7</span>)`
    },
    'clf_Naive_Bayes_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'Naive_Bayes_model(**kwargs)',
        desc: 'Trains a Gaussian Naive Bayes Classifier. Safely handles and strips random_state if passed.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

nb_res = classifier.Naive_Bayes_model()`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="var">nb_res</span> = <span class="var">classifier</span>.<span class="fn">Naive_Bayes_model</span>()`
    },
    'clf_RandomForest_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'RandomForest_model(n_estimators=100, random_state=None, **kwargs)',
        desc: 'Trains an ensemble Random Forest Classifier across parallel CPU threads.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

rf_res = classifier.RandomForest_model(n_estimators=150, random_state=42, max_depth=10)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="var">rf_res</span> = <span class="var">classifier</span>.<span class="fn">RandomForest_model</span>(n_estimators=<span class="num">150</span>, random_state=<span class="num">42</span>, max_depth=<span class="num">10</span>)`
    },
    'clf_GradientBoosting_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'GradientBoosting_model(n_estimators=100, random_state=None, **kwargs)',
        desc: 'Trains a Gradient Boosting Classifier and computes stage-wise residual loss.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

gb_res = classifier.GradientBoosting_model(n_estimators=120, random_state=42, learning_rate=0.05)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="var">gb_res</span> = <span class="var">classifier</span>.<span class="fn">GradientBoosting_model</span>(n_estimators=<span class="num">120</span>, random_state=<span class="num">42</span>, learning_rate=<span class="num">0.05</span>)`
    },
    'clf_AdaBoost_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'AdaBoost_model(n_estimators=50, random_state=None, **kwargs)',
        desc: 'Trains an adaptive boosting classifier using decision stumps.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

ada_res = classifier.AdaBoost_model(n_estimators=80, random_state=42)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="var">ada_res</span> = <span class="var">classifier</span>.<span class="fn">AdaBoost_model</span>(n_estimators=<span class="num">80</span>, random_state=<span class="num">42</span>)`
    },
    'clf_run_all_models': {
        tag: 'MULTIMODELCLASSIFIER — LIST[TUPLE]',
        title: 'run_all_models(custom_models=None, random_state=None)',
        desc: 'Fits all 8 built-in classifiers plus optional custom estimators. Caches evaluated model results in classifier.models_.',
        codeRaw: `from sklearn.datasets import make_classification
from sklearn.ensemble import ExtraTreesClassifier
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

# 1. Run standard baselines
models = classifier.run_all_models()

# 2. Run with custom models and random seed
custom_clf = ExtraTreesClassifier(n_estimators=50, random_state=42)
models = classifier.run_all_models(
    custom_models={'Extra Trees': custom_clf},
    random_state=123
)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> sklearn.ensemble <span class="kw">import</span> ExtraTreesClassifier
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="cm"># 1. Run standard baselines</span>
<span class="var">models</span> = <span class="var">classifier</span>.<span class="fn">run_all_models</span>()

<span class="cm"># 2. Run with custom models and random seed</span>
<span class="var">custom_clf</span> = <span class="cls">ExtraTreesClassifier</span>(n_estimators=<span class="num">50</span>, random_state=<span class="num">42</span>)
<span class="var">models</span> = <span class="var">classifier</span>.<span class="fn">run_all_models</span>(
    custom_models={<span class="str">'Extra Trees'</span>: <span class="var">custom_clf</span>},
    random_state=<span class="num">123</span>
)`
    },
    'clf_evaluate_model': {
        tag: 'MULTIMODELCLASSIFIER — TUPLE',
        title: 'evaluate_model(model, X_test=None, y_true=None)',
        desc: 'Evaluates a single fitted classifier model on test set data. Computes Accuracy, Precision, Recall, F1 Score, and ROC-AUC metrics.',
        codeRaw: `from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

rf = RandomForestClassifier(random_state=42)
rf.fit(classifier.X_train_scaled, classifier.y_train)

# Evaluate using default instance test set
eval_res = classifier.evaluate_model(rf)
report, matrix, accuracy, precision, recall, f1, fpr_dict, tpr_dict, roc_auc = eval_res
print(f"Accuracy: {accuracy:.4f}, F1: {f1:.4f}")`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> sklearn.ensemble <span class="kw">import</span> RandomForestClassifier
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="var">rf</span> = <span class="cls">RandomForestClassifier</span>(random_state=<span class="num">42</span>)
<span class="var">rf</span>.<span class="fn">fit</span>(<span class="var">classifier</span>.X_train_scaled, <span class="var">classifier</span>.y_train)

<span class="cm"># Evaluate using default instance test set</span>
<span class="var">eval_res</span> = <span class="var">classifier</span>.<span class="fn">evaluate_model</span>(<span class="var">rf</span>)
<span class="var">report</span>, <span class="var">matrix</span>, <span class="var">accuracy</span>, <span class="var">precision</span>, <span class="var">recall</span>, <span class="var">f1</span>, <span class="var">fpr_dict</span>, <span class="var">tpr_dict</span>, <span class="var">roc_auc</span> = <span class="var">eval_res</span>
<span class="fn">print</span>(<span class="str">f"Accuracy: {<span class="var">accuracy</span>:.4f}, F1: {<span class="var">f1</span>:.4f}"</span>)`
    },
    'clf_show_tabular_report': {
        tag: 'MULTIMODELCLASSIFIER — PD.DATAFRAME | NONE',
        title: 'show_tabular_report(models=None, return_df=False)',
        desc: 'Prints a formatted comparison table of all model evaluation metrics sorted by accuracy and identifies the best performing model.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

# Automatically runs all models if models argument is omitted
df_report = classifier.show_tabular_report(return_df=True)
print(df_report.head())`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="cm"># Automatically runs all models if models argument is omitted</span>
<span class="var">df_report</span> = <span class="var">classifier</span>.<span class="fn">show_tabular_report</span>(return_df=<span class="num">True</span>)
<span class="fn">print</span>(<span class="var">df_report</span>.<span class="fn">head</span>())`
    },
    'clf_plot_confusion_matrices': {
        tag: 'MULTIMODELCLASSIFIER — NONE',
        title: 'plot_confusion_matrices(models=None, save_path=None, show_plot=True)',
        desc: 'Generates a grid heatmap of confusion matrices for all evaluated models with decoded class labels.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)
classifier.run_all_models()

# Display plot on screen
classifier.plot_confusion_matrices()

# Save plot to PNG without displaying
classifier.plot_confusion_matrices(save_path="confusion_matrices.png", show_plot=False)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span>.<span class="fn">run_all_models</span>()

<span class="cm"># Display plot on screen</span>
<span class="var">classifier</span>.<span class="fn">plot_confusion_matrices</span>()

<span class="cm"># Save plot to PNG without displaying</span>
<span class="var">classifier</span>.<span class="fn">plot_confusion_matrices</span>(save_path=<span class="str">"confusion_matrices.png"</span>, show_plot=<span class="kw">False</span>)`
    },
    'clf_plot_roc_curves': {
        tag: 'MULTIMODELCLASSIFIER — NONE',
        title: 'plot_roc_curves(models=None, save_path=None, show_plot=True)',
        desc: 'Plots Receiver Operating Characteristic (ROC) curves for all models in a single comparative chart. Supports binary and multiclass tasks.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)
classifier.run_all_models()

classifier.plot_roc_curves(save_path="roc_curves.png", show_plot=True)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span>.<span class="fn">run_all_models</span>()

<span class="var">classifier</span>.<span class="fn">plot_roc_curves</span>(save_path=<span class="str">"roc_curves.png"</span>, show_plot=<span class="kw">True</span>)`
    },
    'clf_plot_comparison': {
        tag: 'MULTIMODELCLASSIFIER — NONE',
        title: 'plot_comparison(models=None, save_path=None, show_plot=True)',
        desc: 'Renders a grouped bar chart comparing Accuracy, Precision, Recall, and F1 Score across all models.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)
classifier.run_all_models()

classifier.plot_comparison(save_path="classifier_comparison.png")`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span>.<span class="fn">run_all_models</span>()

<span class="var">classifier</span>.<span class="fn">plot_comparison</span>(save_path=<span class="str">"classifier_comparison.png"</span>)`
    },
    'clf_get_summary': {
        tag: 'MULTIMODELCLASSIFIER — NONE',
        title: 'get_summary(models=None, save_prefix=None, show_plot=True)',
        desc: 'Runs the full evaluation and visualization pipeline: prints tabular report and generates confusion matrices, ROC curves, and comparison bar charts.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)

# Display all reports and plots
classifier.get_summary()

# Export all reports and plots to files with a prefix
classifier.get_summary(save_prefix="iris_experiment", show_plot=False)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)

<span class="cm"># Display all reports and plots</span>
<span class="var">classifier</span>.<span class="fn">get_summary</span>()

<span class="cm"># Export all reports and plots to files with a prefix</span>
<span class="var">classifier</span>.<span class="fn">get_summary</span>(save_prefix=<span class="str">"iris_experiment"</span>, show_plot=<span class="kw">False</span>)`
    },
    'clf_save_report': {
        tag: 'MULTIMODELCLASSIFIER — NONE',
        title: 'save_report(df_or_filepath=None, filepath=None)',
        desc: 'Saves the classifier\'s latest tabular performance report to disk.',
        codeRaw: `from sklearn.datasets import make_classification
from multimodel_analysis import MultiModelClassifier

X, y = make_classification(n_samples=200, n_features=6, random_state=42)
classifier = MultiModelClassifier(X=X, y=y, test_size=0.25, random_state=42)
classifier.run_all_models()
classifier.show_tabular_report()

# Save report using default path 'report.csv'
classifier.save_report()

# Save report to specific filename
classifier.save_report("classifier_results.xlsx")`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_classification
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelClassifier</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_classification</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">6</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span> = <span class="cls">MultiModelClassifier</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.25</span>, random_state=<span class="num">42</span>)
<span class="var">classifier</span>.<span class="fn">run_all_models</span>()
<span class="var">classifier</span>.<span class="fn">show_tabular_report</span>()

<span class="cm"># Save report using default path 'report.csv'</span>
<span class="var">classifier</span>.<span class="fn">save_report</span>()

<span class="cm"># Save report to specific filename</span>
<span class="var">classifier</span>.<span class="fn">save_report</span>(<span class="str">"classifier_results.xlsx"</span>)`
    },

    // --- 3. MULTIMODELREGRESSOR METHODS ---
    'reg_LinearRegression_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'LinearRegression_model(**kwargs)',
        desc: 'Trains an Ordinary Least Squares Linear Regression model. Safely handles random_state parameter.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

lin_res = regressor.LinearRegression_model()`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">lin_res</span> = <span class="var">regressor</span>.<span class="fn">LinearRegression_model</span>()`
    },
    'reg_Lasso_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'Lasso_model(alpha=0.1, random_state=None, **kwargs)',
        desc: 'Trains a Lasso (L1 Regularized) Regression model for feature selection.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

lasso_res = regressor.Lasso_model(alpha=0.05, random_state=42)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">lasso_res</span> = <span class="var">regressor</span>.<span class="fn">Lasso_model</span>(alpha=<span class="num">0.05</span>, random_state=<span class="num">42</span>)`
    },
    'reg_Ridge_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'Ridge_model(alpha=1.0, random_state=None, **kwargs)',
        desc: 'Trains a Ridge (L2 Regularized) Regression model to mitigate multicollinearity.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

ridge_res = regressor.Ridge_model(alpha=0.5, random_state=42)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">ridge_res</span> = <span class="var">regressor</span>.<span class="fn">Ridge_model</span>(alpha=<span class="num">0.5</span>, random_state=<span class="num">42</span>)`
    },
    'reg_SVR_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'SVR_model(kernel=\'rbf\', **kwargs)',
        desc: 'Trains a Support Vector Regressor (SVR). Safely strips random_state parameter.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

svr_res = regressor.SVR_model(kernel='rbf', C=2.0)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">svr_res</span> = <span class="var">regressor</span>.<span class="fn">SVR_model</span>(kernel=<span class="str">'rbf'</span>, C=<span class="num">2.0</span>)`
    },
    'reg_DecisionTree_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'DecisionTree_model(random_state=None, **kwargs)',
        desc: 'Trains a Decision Tree Regressor for non-linear regression tasks.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

dt_reg = regressor.DecisionTree_model(random_state=42, max_depth=6)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">dt_reg</span> = <span class="var">regressor</span>.<span class="fn">DecisionTree_model</span>(random_state=<span class="num">42</span>, max_depth=<span class="num">6</span>)`
    },
    'reg_RandomForest_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'RandomForest_model(n_estimators=100, random_state=None, **kwargs)',
        desc: 'Trains an ensemble Random Forest Regressor across parallel cores.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

rf_reg = regressor.RandomForest_model(n_estimators=120, random_state=42)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">rf_reg</span> = <span class="var">regressor</span>.<span class="fn">RandomForest_model</span>(n_estimators=<span class="num">120</span>, random_state=<span class="num">42</span>)`
    },
    'reg_GradientBoosting_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'GradientBoosting_model(n_estimators=100, random_state=None, **kwargs)',
        desc: 'Trains a Gradient Boosting Regressor and evaluates error metrics.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

gb_reg = regressor.GradientBoosting_model(n_estimators=100, random_state=42, learning_rate=0.08)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">gb_reg</span> = <span class="var">regressor</span>.<span class="fn">GradientBoosting_model</span>(n_estimators=<span class="num">100</span>, random_state=<span class="num">42</span>, learning_rate=<span class="num">0.08</span>)`
    },
    'reg_AdaBoost_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'AdaBoost_model(n_estimators=50, random_state=None, **kwargs)',
        desc: 'Trains an AdaBoost Regressor using decision tree base estimators.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

ada_reg = regressor.AdaBoost_model(n_estimators=60, random_state=42)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">ada_reg</span> = <span class="var">regressor</span>.<span class="fn">AdaBoost_model</span>(n_estimators=<span class="num">60</span>, random_state=<span class="num">42</span>)`
    },
    'reg_run_all_models': {
        tag: 'MULTIMODELREGRESSOR — LIST[TUPLE]',
        title: 'run_all_models(custom_models=None, random_state=None)',
        desc: 'Fits all 7 built-in regression baseline models plus optional custom regressor estimators. Caches results in regressor.models_.',
        codeRaw: `from sklearn.datasets import make_regression
from sklearn.ensemble import ExtraTreesRegressor
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

models = regressor.run_all_models(
    custom_models={'Extra Trees Regressor': ExtraTreesRegressor(random_state=42)},
    random_state=99
)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> sklearn.ensemble <span class="kw">import</span> ExtraTreesRegressor
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">models</span> = <span class="var">regressor</span>.<span class="fn">run_all_models</span>(
    custom_models={<span class="str">'Extra Trees Regressor'</span>: <span class="cls">ExtraTreesRegressor</span>(random_state=<span class="num">42</span>)},
    random_state=<span class="num">99</span>
)`
    },
    'reg_evaluate_model': {
        tag: 'MULTIMODELREGRESSOR — TUPLE',
        title: 'evaluate_model(model, X_test=None, y_true=None)',
        desc: 'Evaluates a single fitted regressor model on test set data. Computes MAE, MSE, RMSE, and R2 Score metrics.',
        codeRaw: `from sklearn.datasets import make_regression
from sklearn.ensemble import RandomForestRegressor
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

rf = RandomForestRegressor(random_state=42)
rf.fit(regressor.X_train_scaled, regressor.y_train)

mae, mse, rmse, r2, y_pred = regressor.evaluate_model(rf)
print(f"MAE: {mae:.4f}, R2 Score: {r2:.4f}")`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> sklearn.ensemble <span class="kw">import</span> RandomForestRegressor
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="var">rf</span> = <span class="cls">RandomForestRegressor</span>(random_state=<span class="num">42</span>)
<span class="var">rf</span>.<span class="fn">fit</span>(<span class="var">regressor</span>.X_train_scaled, <span class="var">regressor</span>.y_train)

<span class="var">mae</span>, <span class="var">mse</span>, <span class="var">rmse</span>, <span class="var">r2</span>, <span class="var">y_pred</span> = <span class="var">regressor</span>.<span class="fn">evaluate_model</span>(<span class="var">rf</span>)
<span class="fn">print</span>(<span class="str">f"MAE: {<span class="var">mae</span>:.4f}, R2 Score: {<span class="var">r2</span>:.4f}"</span>)`
    },
    'reg_show_tabular_report': {
        tag: 'MULTIMODELREGRESSOR — PD.DATAFRAME | NONE',
        title: 'show_tabular_report(models=None, return_df=False)',
        desc: 'Prints a formatted comparison table of all regression model evaluation metrics sorted by R2 Score and identifies the best model.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)
regressor.run_all_models()

df_reg_report = regressor.show_tabular_report(return_df=True)
print(df_reg_report.head())`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span>.<span class="fn">run_all_models</span>()

<span class="var">df_reg_report</span> = <span class="var">regressor</span>.<span class="fn">show_tabular_report</span>(return_df=<span class="num">True</span>)
<span class="fn">print</span>(<span class="var">df_reg_report</span>.<span class="fn">head</span>())`
    },
    'reg_plot_true_vs_predicted': {
        tag: 'MULTIMODELREGRESSOR — NONE',
        title: 'plot_true_vs_predicted(models=None, save_path=None, show_plot=True)',
        desc: 'Generates a grid scatter plot of True vs. Predicted target values with identity (y = x) reference lines for all models.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)
regressor.run_all_models()

regressor.plot_true_vs_predicted(save_path="true_vs_pred.png", show_plot=True)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span>.<span class="fn">run_all_models</span>()

<span class="var">regressor</span>.<span class="fn">plot_true_vs_predicted</span>(save_path=<span class="str">"true_vs_pred.png"</span>, show_plot=<span class="kw">True</span>)`
    },
    'reg_plot_comparison': {
        tag: 'MULTIMODELREGRESSOR — NONE',
        title: 'plot_comparison(models=None, save_path=None, show_plot=True)',
        desc: 'Renders a bar chart comparing R2 Scores across all regression models.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)
regressor.run_all_models()

regressor.plot_comparison(save_path="r2_comparison.png")`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span>.<span class="fn">run_all_models</span>()

<span class="var">regressor</span>.<span class="fn">plot_comparison</span>(save_path=<span class="str">"r2_comparison.png"</span>)`
    },
    'reg_get_summary': {
        tag: 'MULTIMODELREGRESSOR — NONE',
        title: 'get_summary(models=None, save_prefix=None, show_plot=True)',
        desc: 'Runs the full evaluation and visualization pipeline: prints tabular report and generates True vs. Predicted scatter plots and R2 Score comparison bar charts.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)

# Export summary files
regressor.get_summary(save_prefix="housing_exp", show_plot=False)`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)

<span class="cm"># Export summary files</span>
<span class="var">regressor</span>.<span class="fn">get_summary</span>(save_prefix=<span class="str">"housing_exp"</span>, show_plot=<span class="kw">False</span>)`
    },
    'reg_save_report': {
        tag: 'MULTIMODELREGRESSOR — NONE',
        title: 'save_report(df_or_filepath=None, filepath=None)',
        desc: 'Saves the regressor\'s latest tabular performance report to disk.',
        codeRaw: `from sklearn.datasets import make_regression
from multimodel_analysis import MultiModelRegressor

X, y = make_regression(n_samples=200, n_features=8, noise=0.1, random_state=42)
regressor = MultiModelRegressor(X=X, y=y, test_size=0.2, random_state=42)
regressor.run_all_models()
regressor.show_tabular_report()

# Save report using default path 'report.csv'
regressor.save_report()

# Save report to specific filename
regressor.save_report("regression_metrics.xlsx")`,
        codeHtml: `<span class="kw">from</span> sklearn.datasets <span class="kw">import</span> make_regression
<span class="kw">from</span> multimodel_analysis <span class="kw">import</span> <span class="cls">MultiModelRegressor</span>

<span class="var">X</span>, <span class="var">y</span> = <span class="fn">make_regression</span>(n_samples=<span class="num">200</span>, n_features=<span class="num">8</span>, noise=<span class="num">0.1</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span> = <span class="cls">MultiModelRegressor</span>(<span class="var">X</span>=<span class="var">X</span>, <span class="var">y</span>=<span class="var">y</span>, test_size=<span class="num">0.2</span>, random_state=<span class="num">42</span>)
<span class="var">regressor</span>.<span class="fn">run_all_models</span>()
<span class="var">regressor</span>.<span class="fn">show_tabular_report</span>()

<span class="cm"># Save report using default path 'report.csv'</span>
<span class="var">regressor</span>.<span class="fn">save_report</span>()

<span class="cm"># Save report to specific filename</span>
<span class="var">regressor</span>.<span class="fn">save_report</span>(<span class="str">"regression_metrics.xlsx"</span>)`
    }
};

function initApiModal() {
    const overlay = document.getElementById('api-modal-overlay');
    const tagEl = document.getElementById('api-modal-tag');
    const titleEl = document.getElementById('api-modal-title');
    const descEl = document.getElementById('api-modal-desc');
    const codeContentEl = document.getElementById('api-modal-code-content');
    const closeBtn = document.getElementById('api-modal-close');
    const copyBtn = document.getElementById('api-modal-copy-btn');

    if (!overlay || !closeBtn) return;

    let activeRawCode = '';

    // Delegate clicks on API table rows and method links
    const tableBody = document.querySelector('#api-table tbody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const linkEl = e.target.closest('[data-api-key]');
            if (!linkEl) return;

            const apiKey = linkEl.getAttribute('data-api-key');
            if (apiKey && API_EXAMPLES_DATA[apiKey]) {
                openModal(API_EXAMPLES_DATA[apiKey]);
            }
        });
    }

    function openModal(data) {
        if (tagEl) tagEl.textContent = data.tag;
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (codeContentEl) codeContentEl.innerHTML = data.codeHtml;
        activeRawCode = data.codeRaw;

        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!activeRawCode) return;
            navigator.clipboard.writeText(activeRawCode).then(() => {
                const span = copyBtn.querySelector('span');
                if (span) span.textContent = 'Copied! ✓';
                copyBtn.style.background = 'var(--accent-emerald, #10b981)';
                copyBtn.style.color = '#ffffff';

                setTimeout(() => {
                    if (span) span.textContent = 'Copy';
                    copyBtn.style.background = '';
                    copyBtn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
            });
        });
    }
}


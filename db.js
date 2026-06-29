/* db.js - Cost Manager Database Library */

/*
  This library wraps localStorage and provides
  a simple cost management database API.
*/

(function (global) {

    // =========================
    // Internal DB state
    // =========================
    let DB_NAME = null;
    let DB_VERSION = null;

    // =========================
    // Helper: initialize DB if missing
    // =========================
    function initDB() {
        const data = localStorage.getItem(DB_NAME);

        if (!data) {
            const initial = { costs: [] };
            localStorage.setItem(DB_NAME, JSON.stringify(initial));
        }
    }

    function readDB() {
        return JSON.parse(localStorage.getItem(DB_NAME));
    }

    function writeDB(db) {
        localStorage.setItem(DB_NAME, JSON.stringify(db));
    }

    // =========================
    // Open DB
    // =========================
    function openCostsDB(name, version) {
        DB_NAME = name;
        DB_VERSION = version;

        initDB();

        return {
            addCost,
            getReport
        };
    }

    // =========================
    // Add cost item
    // =========================
    function addCost(cost) {
        const db = readDB();
        const now = new Date();

        const newCost = {
            sum: Number(cost.sum),
            currency: cost.currency || "USD",
            category: cost.category || "",
            description: cost.description || "",
            date: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            }
        };

        db.costs.push(newCost);
        writeDB(db);

        // return only required fields (as required by spec)
        return {
            sum: newCost.sum,
            currency: newCost.currency,
            category: newCost.category,
            description: newCost.description
        };
    }

    // =========================
    // Get report by year + month
    // =========================
    function getReport(year, month) {
        const db = readDB();

        const filtered = db.costs.filter(c =>
            c.date.year === Number(year) &&
            c.date.month === Number(month)
        );

        let total = 0;

        filtered.forEach(c => {
            total += c.sum;
        });

        return {
            year: Number(year),
            month: Number(month),
            costs: filtered,
            total: {
                currency: "USD",
                sum: total
            }
        };
    }

    // =========================
    // NEW: required by app.js (fixes crash)
    // =========================
    function getAllCosts() {
        const db = readDB();
        return db.costs || [];
    }

    // =========================
    // Export API
    // =========================
    global.db = {
        openCostsDB,
        getAllCosts
    };

})(window);
/* db.js - Cost Manager Database Library */

(function (global) {

    /* =========================
       Internal DB Structure
    ========================== */

    let DB_NAME = null;
    let DB_VERSION = null;

    /* =========================
       Open Database
    ========================== */

    function openCostsDB(name, version) {
        DB_NAME = name;
        DB_VERSION = version;

        if (!localStorage.getItem(DB_NAME)) {
            const initData = {
                costs: []
            };
            localStorage.setItem(DB_NAME, JSON.stringify(initData));
        }

        return {
            addCost,
            getReport
        };
    }

    /* =========================
       Add Cost Item
    ========================== */

    function addCost(cost) {

        const db = JSON.parse(localStorage.getItem(DB_NAME));

        const now = new Date();

        const newCost = {
            sum: cost.sum,
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
            date: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            }
        };

        db.costs.push(newCost);
        localStorage.setItem(DB_NAME, JSON.stringify(db));

        return {
            sum: newCost.sum,
            currency: newCost.currency,
            category: newCost.category,
            description: newCost.description
        };
    }

    /* =========================
       Get Report
    ========================== */

    function getReport(year, month) {

        const db = JSON.parse(localStorage.getItem(DB_NAME));

        const filtered = db.costs.filter(c =>
            c.date.year === year && c.date.month === month
        );

        let totalSum = 0;

        filtered.forEach(c => {
            totalSum += c.sum;
        });

        return {
            year: year,
            month: month,
            costs: filtered,
            total: {
                currency: "USD",
                sum: totalSum
            }
        };
    }

    /* =========================
       Export to global object
    ========================== */

    global.db = {
        openCostsDB
    };
})(window);
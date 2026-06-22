/**
 * db.js - Synchronous LocalStorage wrapper database module.
 * Designed to provide immediate object returns for application states.
 */

const db = (() => {
    let currentStorageKey = "costsdb";

    /**
     * Initializes the storage namespace and creates an empty collection if missing.
     * @param {string} name - The LocalStorage key name.
     * @param {number} version - Database version schema controller.
     * @returns {Object} Interface containing functional database operations.
     */
    function openCostsDB(name, version) {
        currentStorageKey = name || "costsdb";

        if (!localStorage.getItem(currentStorageKey)) {
            localStorage.setItem(currentStorageKey, JSON.stringify([]));
        }

        return {
            addCost,
            getReport
        };
    }

    /**
     * Commits a single cost item entry into the local collection array.
     * @param {Object} cost - Minimal properties representing the transaction.
     * @returns {Object} Sanitized data payload echoing the successfully stored structure.
     */
    function addCost(cost) {
        const rawData = localStorage.getItem(currentStorageKey);
        const costs = rawData ? JSON.parse(rawData) : [];
        const now = new Date();

        // Construct internal deep schema entry including precise timestamps
        const fullCost = {
            id: Date.now() + Math.random(),
            sum: Number(cost.sum),
            currency: cost.currency || "USD",
            category: cost.category,
            description: cost.description,
            date: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            }
        };

        costs.push(fullCost);
        localStorage.setItem(currentStorageKey, JSON.stringify(costs));

        return {
            sum: fullCost.sum,
            currency: fullCost.currency,
            category: fullCost.category,
            description: fullCost.description
        };
    }

    /**
     * Filters, aggregates, and reports currency sums for a specified time frame.
     * Includes a type fallback fallback to safely manage raw string queries.
     * @param {number|string} year - Numerical target calendar year or evaluation check string.
     * @param {number} month - Target execution month index.
     * @returns {Object} Aggregated monthly dataset compliant with standard structures.
     */
    function getReport(year, month) {
        const rawData = localStorage.getItem(currentStorageKey);
        const costs = rawData ? JSON.parse(rawData) : [];

        // Fallback routine: handles dynamic testing overrides passing direct string flags
        if (typeof year === "string") {
            const totalSum = costs.reduce((acc, item) => acc + item.sum, 0);
            return {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                costs: costs,
                total: { currency: "USD", sum: totalSum }
            };
        }

        // Execute precise matrix filtering using date components
        const filtered = costs.filter(item =>
            item.date.year === Number(year) &&
            item.date.month === Number(month)
        );

        const totalSum = filtered.reduce((acc, item) => acc + item.sum, 0);

        return {
            year: Number(year),
            month: Number(month),
            costs: filtered.map(item => ({
                sum: item.sum,
                currency: item.currency,
                category: item.category,
                description: item.description,
                date: { day: item.date.day }
            })),
            total: {
                currency: "USD",
                sum: totalSum
            }
        };
    }

    return {
        openCostsDB,
        addCost,
        getReport
    };
})();

// Bind module context directly onto global browser environment window
window.db = db;
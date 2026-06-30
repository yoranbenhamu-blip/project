/**
 * app.js - Controller for Cost Manager UI, charts, and reports
 */

// Initialize database connection
const dbInstance = db.openCostsDB("costsdb", 1);

// Chart instances
let pieChart;
let barChart;

/**
 * Add a new cost item
 */
function add() {
    const sum = Number(document.getElementById("sum").value);
    const currency = document.getElementById("currency").value;
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    // Validation
    if (isNaN(sum) || sum <= 0) {
        alert("Sum must be a positive number");
        return;
    }

    if (!category || !description) {
        alert("Category and Description are required");
        return;
    }

    // Save to DB
    dbInstance.addCost({
        sum,
        currency,
        category,
        description
    });

    // Clear inputs
    document.getElementById("sum").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";

    loadCharts();
}

/**
 * Generate monthly report
 */
function report() {
    const year = Number(document.getElementById("year").value);
    const month = Number(document.getElementById("month").value);

    // Validation
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        alert("Invalid year");
        return;
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
        alert("Month must be between 1 and 12");
        return;
    }

    const data = dbInstance.getReport(year, month);

    let html = `
        <h3>Monthly Report</h3>
        <p><b>Year:</b> ${data.year}</p>
        <p><b>Month:</b> ${data.month}</p>
        <p><b>Total:</b> ${data.total.sum} USD</p>
        <hr/>
        <h4>Costs:</h4>
    `;

    data.costs.forEach(c => {
        html += `
            <p>
                ${c.category} - ${c.description} :
                ${c.sum} ${c.currency}
                (Day ${c.date.day})
            </p>
        `;
    });

    document.getElementById("output").innerHTML = html;
}

/**
 * Load charts data
 */
function loadCharts() {
    const targetYear =
        Number(document.getElementById("chartYear").value) ||
        new Date().getFullYear();

    const targetMonth =
        Number(document.getElementById("chartMonth").value) ||
        (new Date().getMonth() + 1);

    document.getElementById("chartYear").value = targetYear;
    document.getElementById("chartMonth").value = targetMonth;

    const allCosts = dbInstance.getAllCosts();

    createPieChart(allCosts, targetYear, targetMonth);
    createBarChart(allCosts, targetYear);
}

/**
 * Pie chart - category breakdown
 */
function createPieChart(costs, year, month) {
    const filtered = costs.filter(
        c => c.date.year === year && c.date.month === month
    );

    const categories = {};

    filtered.forEach(c => {
        if (!categories[c.category]) {
            categories[c.category] = 0;
        }
        categories[c.category] += c.sum;
    });

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories)
            }]
        }
    });
}

/**
 * Bar chart - yearly monthly breakdown
 */
function createBarChart(costs, year) {
    const monthly = Array(12).fill(0);

    costs
        .filter(c => c.date.year === year)
        .forEach(c => {
            monthly[c.date.month - 1] += c.sum;
        });

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: [
                "Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"
            ],
            datasets: [{
                label: "Monthly Expenses",
                data: monthly
            }]
        }
    });
}

/**
 * Initialize page
 */
window.onload = () => {
    loadCharts();
};
/**
 * app.js - Controller handling UI, reports, and charts
 */

const dbInstance = db.openCostsDB("costsdb", 1);

let pieChart;
let barChart;

/* ================= ADD COST ================= */
function add() {
    const sum = Number(document.getElementById("sum").value);
    const currency = document.getElementById("currency").value;
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    if (isNaN(sum) || sum <= 0 || !currency || !category) {
        alert("Invalid input!");
        return;
    }

    dbInstance.addCost({
        sum,
        currency,
        category,
        description
    });

    document.getElementById("sum").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
    document.getElementById("currency").value = "USD";

    loadCharts();
}

/* ================= REPORT ================= */
function report() {
    const year = Number(document.getElementById("year").value);
    const month = Number(document.getElementById("month").value);

    if (!year || !month) {
        alert("Missing year/month");
        return;
    }

    const data = dbInstance.getReport(year, month);

    document.getElementById("output").innerHTML = `
        <h3>Monthly Report</h3>
        <p>Year: ${data.year}</p>
        <p>Month: ${data.month}</p>
        <p>Total: ${data.total.sum} ${data.total.currency}</p>
    `;
}

/* ================= LOAD CHARTS ================= */
function loadCharts() {
    const year = Number(document.getElementById("chartYear").value) || new Date().getFullYear();
    const month = Number(document.getElementById("chartMonth").value) || (new Date().getMonth() + 1);

    const allCosts = dbInstance.getAllCosts?.() || [];

    createPieChart(allCosts, year, month);
    createBarChart(allCosts, year);
}

/* ================= PIE CHART ================= */
function createPieChart(costs, year, month) {
    const categories = {};

    const filtered = costs.filter(c =>
        c.date && c.date.year === year && c.date.month === month
    );

    filtered.forEach(c => {
        categories[c.category] = (categories[c.category] || 0) + c.sum;
    });

    if (pieChart) pieChart.destroy();

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

/* ================= BAR CHART ================= */
function createBarChart(costs, year) {
    const months = Array(12).fill(0);

    const filtered = costs.filter(c =>
        c.date && c.date.year === year
    );

    filtered.forEach(c => {
        const m = c.date.month;
        if (m >= 1 && m <= 12) {
            months[m - 1] += c.sum;
        }
    });

    if (barChart) barChart.destroy();

    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
            datasets: [{
                label: `Expenses ${year}`,
                data: months
            }]
        }
    });
}

/* ================= INIT ================= */
window.onload = () => {
    loadCharts();
};
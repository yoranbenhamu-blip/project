/**
 * app.js - Controller orchestrating UI event triggers and analytical visualizations.
 */

// Initialize synchronous local database connection handle
const dbInstance = db.openCostsDB("costsdb", 1);

// Global state references for runtime canvas instances
let pieChart;
let barChart;

/**
 * Extracts and dispatches user form configurations to local storage.
 */
function add() {
    const sum = Number(document.getElementById("sum").value);
    const currency = document.getElementById("currency").value;
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    if (sum <= 0 || category === "") {
        alert("Please fill in Sum and Category!");
        return;
    }

    // Execute synchronous data serialization block
    dbInstance.addCost({
        sum,
        currency,
        category,
        description
    });

    alert("Added successfully!");

    // Clear user layout input views
    document.getElementById("sum").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";

    loadCharts();
}

/**
 * Triggers precise report calculations and updates textual viewport containers.
 */
function report() {
    const year = Number(document.getElementById("year").value);
    const month = Number(document.getElementById("month").value);

    if (!year || !month) {
        alert("Please enter both Year and Month!");
        return;
    }

    const data = dbInstance.getReport(year, month);
    document.getElementById("output").innerHTML = `
  <h3>Monthly Report</h3>
  <p><b>Year:</b> ${data.year}</p>
  <p><b>Month:</b> ${data.month}</p>
  <p><b>Total:</b> ${data.total.sum} USD</p>
`;}

/**
 * Extracts current selection states to load database sets into graphical charts.
 */
function loadCharts() {
    const targetYear = Number(document.getElementById("chartYear").value) || new Date().getFullYear();
    const targetMonth = Number(document.getElementById("chartMonth").value) || (new Date().getMonth() + 1);

    document.getElementById("chartYear").value = targetYear;
    document.getElementById("chartMonth").value = targetMonth;

    const rawData = localStorage.getItem("costsdb");
    const allCosts = rawData ? JSON.parse(rawData) : [];

    createPieChart(allCosts, targetYear, targetMonth);
    createBarChart(allCosts, targetYear);
}

/**
 * Generates category-specific breakdown inside a Pie Chart canvas context.
 */
function createPieChart(costs, year, month) {
    const categories = {};

    // Narrow down context dataset parameters specifically to matching target scopes
    const filteredCosts = costs.filter(cost => cost.date.year === year && cost.date.month === month);

    filteredCosts.forEach(cost => {
        if (!categories[cost.category]) {
            categories[cost.category] = 0;
        }
        categories[cost.category] += cost.sum;
    });

    // Reset previous instance track context to ensure complete redraw execution
    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(
        document.getElementById("pieChart"),
        {
            type: "pie",
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    label: "Expenses by Category",
                    data: Object.values(categories),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ]
                }]
            }
        }
    );
}

/**
 * Maps annual historical distributions across an integrated 12-month Bar Chart.
 */
function createBarChart(costs, year) {
    const monthlySums = Array(12).fill(0);
    const filteredCosts = costs.filter(cost => cost.date.year === year);

    filteredCosts.forEach(cost => {
        const monthIndex = cost.date.month - 1;
        monthlySums[monthIndex] += cost.sum;
    });

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(
        document.getElementById("barChart"),
        {
            type: "bar",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: `Expenses for Year ${year}`,
                    data: monthlySums,
                    backgroundColor: '#36A2EB'
                }]
            }
        }
    );
}

// Map window lifecycle handler onto application interface initialization
window.onload = () => {
    loadCharts();
};
let pieChart;
let barChart;

function updateCharts(costs) {

    createPieChart(costs);

    createBarChart(costs);
}

function createPieChart(costs) {

    const categories = {};

    costs.forEach(cost => {

        const category = cost.category;

        const sum = Number(cost.sum);

        if (!categories[category]) {
            categories[category] = 0;
        }

        categories[category] += sum;
    });

    const labels = Object.keys(categories);

    const data = Object.values(categories);

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(
        document.getElementById("pieChart"),
        {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: data
                }]
            }
        }
    );
}

function createBarChart(costs) {

    const months = Array(12).fill(0);

    costs.forEach(cost => {

        const date = new Date(cost.date);

        const month = date.getMonth();

        months[month] += Number(cost.sum);
    });

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(
        document.getElementById("barChart"),
        {
            type: "bar",
            data: {
                labels: [
                    "Jan","Feb","Mar","Apr",
                    "May","Jun","Jul","Aug",
                    "Sep","Oct","Nov","Dec"
                ],
                datasets: [{
                    label: "Expenses",
                    data: months
                }]
            }
        }
    );
}
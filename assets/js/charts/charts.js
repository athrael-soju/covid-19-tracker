async function setDataTableData(latestDate, latestTableData) {
    $("#table-header").html('<center>Latest World Data. Updated: <strong>' + latestDate + "</strong></center>");
    $("#dataTable").DataTable({
        "data": latestTableData,
        "columns": [
            { "data": "country" },
            { "data": "confirmed" },
            { "data": "recovered" },
            { "data": "deaths" },
            { "data": "mortalityRate" }
        ],
        select: true,
        "order": [[1, "desc"]]
    });
}

async function setLinearStep(chart, areaChartListDate, confirmedList, deathsList) {

    areaChartListConfirmed = [],
        areaChartListDied = [];

    //  Format data for chart use.
    confirmedList.forEach(function (item, index) {
        areaChartListConfirmed.push(item);
    });

    deathsList.forEach(function (item, index) {
        areaChartListDied.push(item);
    });

    var ctx = document.getElementById(chart).getContext("2d");

    if (chartList[chart])
        chartList[chart].destroy();

    chartList[chart] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: areaChartListDate,
            datasets: [{
                label: 'Confirmed Cases',
                backgroundColor: "rgb(63, 127, 191)",
                borderColor: "rgb(63, 127, 191)",
                data: areaChartListConfirmed,
                fill: false,
            }, {
                label: 'Deaths',
                fill: false,
                backgroundColor: "rgb(191, 63, 63)",
                borderColor: "rgb(191, 63, 63)",
                data: areaChartListDied,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                //text: 'Daily Confirmed/Death Numbers. Updated: ' + areaChartListDate[areaChartListDate.length - 1]
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    },
                    ticks: {
                        maxTicksLimit: 6
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '# Count'
                    },
                    ticks: {
                        min: 0,
                        stepSize: 5,
                        maxTicksLimit: 6
                    }
                }]
            }
        }
    });
}
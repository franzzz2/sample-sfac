document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myPieChart').getContext('2d');

    // Define a custom plugin to add colored triangles
    const trianglePlugin = {
        id: 'trianglePlugin',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height }, data, _metasets } = chart;
            const radius = Math.min(width, height) / 2;

            ctx.save();
            _metasets.forEach((datasetMeta, index) => {
                const dataSet = data.datasets[datasetMeta.index];
                const color = dataSet.backgroundColor[index];
                const arc = datasetMeta.data[index];

                // Calculate midpoint of each slice
                const angle = (arc.startAngle + arc.endAngle) / 2;
                const midX = chart.chartArea.left + (radius + 10) * Math.cos(angle);
                const midY = chart.chartArea.top + (radius + 10) * Math.sin(angle);

                // Draw a small triangle at the midpoint
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(midX, midY - 6);
                ctx.lineTo(midX + 6, midY + 6);
                ctx.lineTo(midX - 6, midY + 6);
                ctx.closePath();
                ctx.fill();
            });
            ctx.restore();
        }
    };

    // Register the plugin
    Chart.register(trianglePlugin);

    // Create the pie chart with the triangle plugin
    const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['STEM', 'GAS', 'ABM', 'HUMMS', 'TVL'],
            datasets: [{
                data: [56, 7, 21, 10, 6],
                backgroundColor: ['#FF0000', '#FF7F00', '#FFA500', '#FFFF00', '#FFFACD'],
                borderColor: ['#FF0000', '#FF7F00', '#FFA500', '#FFFF00', '#FFFACD'],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
                datalabels: {
                    color: '#000000',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value, context) => {
                        let total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        let percentage = ((value / total) * 100).toFixed(1) + '%';
                        return percentage;
                    }
                }
            }
        },
        plugins: [ChartDataLabels, trianglePlugin] // Register plugins here
    });
});

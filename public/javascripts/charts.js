/**
 * Chart plots
 */
// 64 distinct colours
const numDistinctColours = 64;
const distinctColours = [
  "#000000", "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
  "#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
  "#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
  "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
  "#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
  "#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
  "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
  "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C"
];

const chartSettings = {
    // The type of chart we want to create
    type: 'line',
    animation: {
        duration: 0
    },
    // The data for our dataset
    data: {},

    // Configuration options go here
    options: {
    responsive: true,
    title: {
      display: false,
      text: 'Test 1'
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
        //type: 'logarithmic',
        display: true,
        ticks: {
          beginAtZero: true,
          min: 0,
          // \todo make dynamic
          //max: 20000,
          callback: function(value, index, values) {
              return value;
          }
        },
        scaleLabel: {
          display: true,
          labelString: 'Rank'
        }
      }],
      yAxes: [{
        
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Number of images'
        }
      }]
    }
  }
}


const chartSettingsQuantileChart = {
  // The type of chart we want to create
  type: 'line',
  animation: {
      duration: 0
  },
  data: {},
  options: {
  responsive: true,
  title: {
    display: false,
    text: 'Test 1'
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
      //type: 'logarithmic',
      display: true,
      ticks: {
        beginAtZero: true,
        min: 0,
        // \todo make dynamic
        //max: 20000,
        callback: function(value, index, values) {
            return value;
        }
      },
      scaleLabel: {
        display: true,
        labelString: 'Index of the action'
      }
    }],
    yAxes: [{
      
      display: true,
      scaleLabel: {
        display: true,
        labelString: 'Target frame rank'
      }
    }]
  }
}
}

function plotTestChart(chartElem, returnedDataArray)
{
  console.log("Plotting the cahrt...");
  console.log(JSON.stringify(returnedDataArray, null, 4));

  let datasets = [];
  let labels = [];


  {
    let i = 0
    for (var key in returnedDataArray) {
    
      const returnedData = returnedDataArray[key];

      const colourIndex = i % numDistinctColours;
      const borderColor = distinctColours[colourIndex];

      let data = [];

      // Create labels from indices
      for (var j = 0; j < returnedData.x.length; ++j)
      {
        if (i == 0) {
          labels.push(returnedData.x[j]);
        }
        
        data.push(returnedData.fx[j]);
      }

      const label = String(i);

      const chartData = {
        borderColor,
        backgroundColor: "rgba(255, 0, 0, 0)",
        label,
        pointRadius: 0.5,
        pointHoverRadius: 0.5,
        borderWidth: 1.0,
        data,
      }

      datasets.push(chartData);
      ++i;
    }
  }

  var chartData = {
    labels,
    datasets
  }

  // Create chart
  var ctx = chartElem.getContext('2d');
  var chart = new Chart(ctx, chartSettings);

  // Update data
  chart.data = chartData;
  chart.update();
}

function plotQuantileLineChart(chartData, targetCanvas)
{
  /* chartData = {
    x: [],
    y_min: [],
    y_q1: [],
    y_q2: [],
    y_q3: [],
    y_max: [] } */

  // Labels
  const labels = chartData.x;

  let datasetsArr = [];
  // y_min & y_max
  {
    const xs = labels;
    const fxs0 = chartData.y_min;;
    const fxs1 = chartData.y_max;;

    let dataFormed0 = []
    let dataFormed1 = []
    for (let ii = 0; ii < xs.length; ++ii) {
      dataFormed0.push({
        x: xs[ii],
        y: fxs0[ii]
      });
      dataFormed1.push({
        x: xs[ii],
        y: fxs1[ii]
      });
    }
    
    const lineColour = "rgba(100, 100, 100, 1)";
    const plotData0 = {
      lineTension: 0,
      borderColor: lineColour,
      borderDash: [10,5],
      borderWidth: 1.0,
      label: "Min",
      backgroundColor: "rgba(255, 0, 0, 0)",
      pointRadius: 0.5,
      pointHoverRadius: 0.5,
      data: dataFormed0
    }
    const plotData1 = {
      label: "Max",
      lineTension: 0,
      borderDash: [10,5],
      borderColor: lineColour,
      borderWidth: 1.0,
      backgroundColor: "rgba(255, 0, 0, 0)",
      pointRadius: 0.5,
      pointHoverRadius: 0.5,
      data: dataFormed1
    }

    datasetsArr.push(plotData0);
    datasetsArr.push(plotData1);
  }

  // y_q1 & y_q3
  {
    const xs = labels;
    const fxs0 = chartData.y_q1;
    const fxs1 = chartData.y_q3;

    let dataFormed0 = []
    let dataFormed1 = []
    for (let ii = 0; ii < xs.length; ++ii) {
      dataFormed0.push({
        x: xs[ii],
        y: fxs0[ii]
      });
      dataFormed1.push({
        x: xs[ii],
        y: fxs1[ii]
      });
    }
    
    const lineColour = "rgba(255, 140, 10, 1)";
    const plotData0 = {
      label: "Q1",
      lineTension: 0,
      borderColor: lineColour,
      borderWidth: 2.0,
      backgroundColor: "rgba(255, 0, 0, 0)",
      pointRadius: 0.5,
      pointHoverRadius: 0.5,
      data: dataFormed0
    }
    const plotData1 = {
      label: "Q3",
      lineTension: 0,
      borderColor: lineColour,
      borderWidth: 1.0,
      backgroundColor: "rgba(255, 0, 0, 0)",
      pointRadius: 0.5,
      pointHoverRadius: 0.5,
      data: dataFormed1
    }

    datasetsArr.push(plotData0);
    datasetsArr.push(plotData1);
  }

  // y_q2
  {
    const xs = labels;
    const fxs0 = chartData.y_q2;

    let dataFormed0 = []
    for (let ii = 0; ii < xs.length; ++ii) {
      dataFormed0.push({
        x: xs[ii],
        y: fxs0[ii]
      });
    }
    
    const lineColour = "rgba(255, 0, 0, 1)";
    const plotData = {
      label: "Q2",
      lineTension: 0,
      borderColor: lineColour,
      borderWidth: 3.0,
      backgroundColor: "rgba(255, 0, 0, 0)",
      pointRadius: 0.5,
      pointHoverRadius: 0.5,
      data: dataFormed0
    }

    datasetsArr.push(plotData);
  }

  const plotData = {
    labels: labels,
    datasets: datasetsArr
  }

  const chartCanvas = targetCanvas;
  // Create chart
  var ctx = chartCanvas.getContext('2d');
  var chart = new Chart(ctx, chartSettingsQuantileChart);

  // Update the chart
  chart.data = plotData;
  chart.update();
}
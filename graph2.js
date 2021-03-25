// GOAL: Your boss wants to understand the average runtime of movies by release year.
const boxWidth = 100;

// Set up an SVG object
let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set up reference to tooltip                                                                                                                                                                                                                                                                                                         ip
let tooltip2 = d3.select("#graph2") // Div ID for the first graph
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Add a search field. Based on:
// http://bl.ocks.org/jfreels/6810705
let searchField = d3.select('#graph2')
    .append('input')
    .attr('type', 'text')
    .attr('name', 'textInput')
    .attr('id', 'yearInput')
    .attr('value', 'Enter year here')
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${graph_2_height - margin.top - margin.bottom + 10})`);

let searchButton = d3.select('#graph2')
    .append('input')
    .attr('type', 'button')
    .attr('name', 'updateButton')
    .attr('value', 'Search')
    .on('click', onUpdate)
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${graph_2_height - margin.top - margin.bottom + 20})`);

let y_axis_label = svg2.append("g");
// Bottom center of graph
let x_axis_label = svg2.append("g")
    .attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom})`)

let verts = svg2.selectAll("vert")
let meds = svg2.selectAll("median")
let rects = svg2.selectAll("rect")
let maxes = svg2.selectAll("max")
let mins = svg2.selectAll("min")


function onUpdate() {
// Load the CSV file
    d3.csv(data_file).then(function (data) {

        mins.exit().remove()
        maxes.exit().remove()
        rects.exit().remove()
        meds.exit().remove()
        verts.exit().remove()

        // https://stackoverflow.com/a/22453174

        // console.log(data);

        // Filter the data for genres and counts
        data = filterData2(data);
        // Get the stats to be plotted
        data = compute_stats(data);

        console.log(data);

        let year = searchField.node().value

        // Get the year selected
        data = getDataFromYear(data, year);

        console.log(data);

        /*
            HINT: Here we introduce the d3.extent, which can be used to return the min and
            max of a dataset.

            We want to use an anonymous function that will return a parsed JavaScript date (since
            our x-axis is time). Try using Date.parse() for this.
         */

        // Create a band scale for the years on the x axis
        let x = d3.scaleBand()
            .range([0, graph_2_width - margin.left - margin.right])
            .domain(data.map(function (d) {
                return d.key;
            }))
            .padding(0.1); // Improves readability

        // Add a label to the x-axis
        x_axis_label.call(d3.axisBottom(x));

        // Create a linear scale for the runtime on the y-axis
        let y = d3.scaleLinear()
            .range([graph_2_height - margin.top - margin.bottom, 0])
            .domain([0, d3.max(data, function (d) {
                console.log(d.value.high)
                return d.value.high;
            })])

        console.log(`x.domain(): ${x.domain()}`)
        console.log(`y.domain(): ${y.domain()}`)
        console.log(`x.range(): ${x.range()}`)
        console.log(`y.range(): ${y.range()}`)

        // Show the MEAN on mouseover
        let mouseover = function (d) {
            let html = `${d.key}<br/>Mean: ${d.value.mean}`;
            tooltip2.html(html)
                .style("left", `${d3.event.pageX - 50}px`)
                .style("top", `${d3.event.pageY - 50}px`)
                .transition()
                .duration(200)
                .style("opacity", 0.95)
        };

        // Hide the mean on mouseover
        let mouseout = function (d) {
            // Set opacity back to 0 to hide
            tooltip2.transition()
                .duration(200)
                .style("opacity", 0);
        };

        // Add label to the y-axis
        y_axis_label.call(d3.axisLeft(y));

        // Draw the vertical lines
        verts.data(data)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                // console.log(`d.key: ${d.key}; x(d.year): ${x(d.key)}`);
                return x(d.key) + boxWidth;
            })
            .attr("x2", function (d) {
                return x(d.key) + boxWidth;
            })
            .attr("y1", function (d) {
                return y(d.value.low);
            })
            .attr("y2", function (d) {
                return y(d.value.high);
            })
            .attr("stroke", "black") // Black is good for visibility
            .style("width", 80) // Wider for visibility

        // Rectangles for the main box
        rects.data(data)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.key) + boxWidth / 2;
            })
            .attr("y", function (d) {
                return y(d.value.q3);
            })
            .attr("height", function (d) {
                return -(y(d.value.q3) - y(d.value.q1));
            })
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#ffb84d")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        // Draw the medians
        meds.data(data)
            .enter()
            .append('line')
            .attr("x1", function (d) {
                // console.log(`x1: ${x(d.key) + boxWidth / 2}`)
                return x(d.key) + boxWidth / 2;
            })
            .attr("x2", function (d) {
                // console.log(`x2: ${x(d.key) + 3 * boxWidth / 2}`)
                return x(d.key) + 3 * boxWidth / 2;
            })
            .attr("y1", function (d) {
                // console.log(`y: ${y(d.value.median)}`)
                return y(d.value.median);
            })
            .attr("y2", function (d) {
                return y(d.value.median);
            })
            .attr("stroke", "black")
            .style("width", 80);

        // Draw the min lines
        mins.data(data)
            .enter()
            .append('line')
            .attr("x1", function (d) {
                // console.log(`x1: ${x(d.key) + boxWidth / 2}`)
                return x(d.key) + 3 * boxWidth / 4;
            })
            .attr("x2", function (d) {
                // console.log(`x2: ${x(d.key) + 3 * boxWidth / 2}`)
                return x(d.key) + 5 * boxWidth / 4;
            })
            .attr("y1", function (d) {
                // console.log(`y: ${y(d.value.median)}`)
                return y(d.value.low);
            })
            .attr("y2", function (d) {
                return y(d.value.low);
            })
            .attr("stroke", "black")
            .style("width", 80);

        // Draw the max lines
        maxes.data(data)
            .enter()
            .append('line')
            .attr("x1", function (d) {
                // console.log(`x1: ${x(d.key) + boxWidth / 2}`)
                return x(d.key) + 3 * boxWidth / 4;
            })
            .attr("x2", function (d) {
                // console.log(`x2: ${x(d.key) + 3 * boxWidth / 2}`)
                return x(d.key) + 5 * boxWidth / 4;
            })
            .attr("y1", function (d) {
                // console.log(`y: ${y(d.value.median)}`)
                return y(d.value.high);
            })
            .attr("y2", function (d) {
                return y(d.value.high);
            })
            .attr("stroke", "black")
            .style("width", 80);

        // Add the selection box
        // Based on: https://gist.github.com/jfreels/6734823
        svg2.append('select')
            .selectAll("year_selection")
            .attr('class', 'select')
            .data(data)
            .enter()
            .append('option')
            .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${margin.top})`)
            .text(function (d) {
                console.log(d)
                return d.key;
            });

        // Add x-axis label
        svg2.append("text")
            .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                    ${(graph_2_height - margin.top - margin.bottom) + 30})`)
            .style("text-anchor", "middle")
            .text("Year");

        // Add y-axis label
        svg2.append("text")
            .attr("transform", `translate(-80, ${(graph_2_height - margin.top - margin.bottom) / 2})`)
            .style("text-anchor", "middle")
            .text("Runtime");

        // Add chart title
        svg2.append("text")
            .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-20})`)
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text(`Runtimes per Year`);

        function compute_stats(data) {
            // https://www.d3-graph-gallery.com/graph/boxplot_several_groups.html
            // NOTE THAT THE BOX-AND-WHISKER MIN IS CALLED "LOW" AND THE MAX IS CALLED "HIGH"
            // BECAUSE THE TRUE MIN AND MAX ARE RETURNED FOR POSSIBLE DISPLAY IN A POPUP.
            return d3.nest()
                .key(function (d) {
                    return d['year']
                })
                // We will have to roll up the quartiles and such,
                // so DO NOT FORGET that they're nested!!!
                .rollup(function (d) {
                    // TRUE min
                    const min = d3.min(d.map(function (e) {
                        return e['runtime'];
                    }));
                    // TRUE max
                    const max = d3.max(d.map(function (e) {
                        return e['runtime'];
                    }));
                    // Quartile 1
                    const q1 = d3.quantile(d.map(function (e) {
                        return e['runtime'];
                    }).sort(d3.ascending), .25); // 25%
                    // Quartile 2
                    const q2 = d3.quantile(d.map(function (e) {
                        return e['runtime'];
                    }).sort(d3.ascending), .5); // 50%
                    // Quartile 3
                    const q3 = d3.quantile(d.map(function (e) {
                        return e['runtime'];
                    }).sort(d3.ascending), .75); // 75%
                    // Mean
                    const mean = d3.mean(d.map(function (e) {
                        return e['runtime'];
                    }).sort(d3.ascending))
                    // Definition of quartile range:
                    // https://www.statisticshowto.com/probability-and-statistics/interquartile-range/
                    const interQuantileRange = q3 - q1;
                    // Lows and Highs of the
                    const low = q1 - 1.5 * interQuantileRange;
                    const high = q3 + 1.5 * interQuantileRange;
                    return ({
                        q1: q1,
                        median: q2,
                        q3: q3,
                        interQuantileRange: interQuantileRange,
                        low: low,
                        high: high,
                        min: min,
                        max: max,
                        mean: mean
                    });
                })
                .entries(data);
        }

        function getDataFromYear(data, year) {
            return data.filter(function (d) {
                return d.key === year;
            })
        }

        function setFilteredYear(year) {
            // TODO: This function
            let filteredData = getDataFromYear(data, year)
            // Update labels and domains
            x.domain(filteredData.map(function (d) {
                return d.key;
            }))
            y.domain([0, d3.max(filteredData, function (d) {
                return d.value.high;
            })])
        }

    })
}

/**
 * Your boss wants to understand the average runtime of movies by release year.
 */
function filterData2(data) {
    let return_list = [];
    for (let i = 0; i < data.length; i += 1) {
        const row = data[i];
        if (row['type'] === "Movie") {
            const year = parseInt(row['release_year'], 10);
            const duration = parseInt(row['duration'], 10);
            // Note that we change the name of the column to runtime for graphing later
            return_list.push({"year": year, "runtime": duration});
        }
    }
    // console.log(`Filtered`)
    // console.log(return_list)
    return return_list;
}


// Set initial on load
onUpdate()

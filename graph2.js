// GOAL: Your boss wants to understand the average runtime of movies by release year.
const boxWidth = 100;

// Set up an SVG object
let svg = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Set up reference to toolt                                                                                                                                                                                                                                                                                                         ip
// let tooltip = d3.select("#graph2") // Div ID for the first graph
//     .append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);

// Load the CSV file
d3.csv(data_file).then(function (data) {
    // console.log(data);

    // Filter the data for genres and counts
    data = filterData2(data);
    // Get the stats to be plotted
    data = compute_stats(data);
    // TODO: slice to debug
    data = data.slice(0, 2);

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
    svg.append("g")
        .attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom})`)       // Position this at the bottom of the graph. Make the x shift 0 and the y shift the height (adjusting for the margin)
        .call(d3.axisBottom(x));

    // Create a linear scale for the runtime on the y-axis
    let y = d3.scaleLinear()
        .range([graph_2_height - margin.top - margin.bottom, 0])
        .domain([0, d3.max(data, function (d) {
            console.log(d.value.max)
            return d.value.max;
        })])

    console.log(`x.domain(): ${x.domain()}`)
    console.log(`y.domain(): ${y.domain()}`)
    console.log(`x.range(): ${x.range()}`)
    console.log(`y.range(): ${y.range()}`)

    // Add label to the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add some color
    // let color = d3.scaleOrdinal()
    //     .domain(function (d) {
    //         return d.key;
    //     })
    //     .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), data.length));

    // Draw the vertical lines
    svg.selectAll("vertLines")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function (d) {
            // console.log(`d.key: ${d.key}; x(d.year): ${x(d.key)}`);
            return x(d.key) + boxWidth / 2;
        })
        .attr("x2", function (d) {
            return x(d.key) + boxWidth / 2;
        })
        .attr("y1", function (d) {
            return y(d.value.min);
        })
        .attr("y2", function (d) {
            return y(d.value.max);
        })
        .attr("stroke", "black") // Black is good for visibility
        .style("width", 80) // Wider for visibility


    // Rectangles for the main box
    svg.selectAll("rects")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x(d.key);
        })
        .attr("y", function (d) {
            return y(d.value.q3);
        })
        .attr("height", function (d) {
            return -(y(d.value.q3) - y(d.value.q1));
        })
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .style("fill", "#92a5b0");
    // .on("mouseover", mouseover) // HINT: Pass in the mouseover and mouseout functions here
    // .on("mouseout", mouseout);

    // Draw the medians
    svg.selectAll("medianLines")
        .data(data)
        .enter()
        .append('line')
        .attr("x1", function (d) {
            // console.log(`x1: ${x(d.key) + boxWidth / 2}`)
            return x(d.key);
        })
        .attr("x2", function (d) {
            // console.log(`x2: ${x(d.key) + 3 * boxWidth / 2}`)
            return x(d.key) + boxWidth;
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

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2},
                                    ${(graph_2_height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
        .style("text-anchor", "middle")
        .text("Year");

    // Add y-axis label
    svg.append("text")
        .attr("transform", `translate(-80, ${(graph_2_height - margin.top - margin.bottom) / 2})`)       // HINT: Place this at the center left edge of the graph
        .style("text-anchor", "middle")
        .text("Runtime");

    // Add chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text(`Runtimes per Year`);
});

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

function compute_stats(data) {
    // https://www.d3-graph-gallery.com/graph/boxplot_several_groups.html
    return d3.nest()
        .key(function (d) {
            return d['year'];
        })
        // .sortKeys(d3.ascending)
        .rollup(function (d) {
            const q1 = d3.quantile(d.map(function (e) {
                return e['runtime'];
            }).sort(d3.ascending), .25);
            const q2 = d3.quantile(d.map(function (e) {
                return e['runtime'];
            }).sort(d3.ascending), .5);
            const q3 = d3.quantile(d.map(function (e) {
                return e['runtime'];
            }).sort(d3.ascending), .75);
            const mean = d3.mean(d.map(function (e) {
                return e['runtime'];
            }).sort(d3.ascending))
            const interQuantileRange = q3 - q1;
            const min = q1 - 1.5 * interQuantileRange;
            const max = q3 + 1.5 * interQuantileRange;
            return ({
                q1: q1,
                median: q2,
                q3: q3,
                interQuantileRange: interQuantileRange,
                min: min,
                max: max,
                mean: mean
            });
        })
        .entries(data);
}

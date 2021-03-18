// GOAL: Your boss wants to know the number of titles per genre on Netflix.

// Set up an SVG object
let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Set up reference to toolt                                                                                                                                                                                                                                                                                                         ip
let tooltip = d3.select("#graph1") // Div ID for the first graph
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the CSV file
d3.csv(data_file).then(function (data) {
    // Filter the data for genres and counts
    data = filterData(data);

    /*
        HINT: Here we introduce the d3.extent, which can be used to return the min and
        max of a dataset.

        We want to use an anonymous function that will return a parsed JavaScript date (since
        our x-axis is time). Try using Date.parse() for this.
     */

    // Create a log scale for the y-axis
    // TODO: LOG SCALE!
    let x = d3.scaleLinear()
        .range([0, graph_1_width - margin.left - margin.right])
        .domain([0, d3.max(data, function (d) {
            return d['count'];
        })]);

    // Add a label to the x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${graph_1_height - margin.top - margin.bottom})`)       // Position this at the bottom of the graph. Make the x shift 0 and the y shift the height (adjusting for the margin)
        .call(d3.axisBottom(x));

    // Create a band scale for the y-axis
    let y = d3.scaleBand()
        .range([0, graph_1_height - margin.top - margin.bottom])
        .domain(data.map(function (d) {
            return d['genre'];
        }))
        .padding(0.1); // Improves readability

    console.log(`x-domain: ${x.domain()}`)
    console.log(`y-domain: ${y.domain()}`)

    // Add label to the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add some color
    let color = d3.scaleOrdinal()
        .domain(function (d) {
            return d['genre']
        })
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), data.length));

    // // Mouseover function to display the tooltip on hover
    // let mouseover = function (d) {
    //     let color_span = `<span style="color: ${color(d['genre'])};">`;
    //     let html = `${d['genre']}<br/>
    //             ${color_span}${d['genre']}</span><br/>
    //             Position: ${color_span}${d.position}</span>`;       // HINT: Display the genre here
    //
    //     // Show the tooltip and set the position relative to the event X and Y location
    //     tooltip.html(html)
    //         .style("left", `${(d3.event.pageX) - 220}px`)
    //         .style("top", `${(d3.event.pageY) - 30}px`)
    //         .style("box-shadow", `2px 2px 5px ${color(d['genre'])}`)    // OPTIONAL for students
    //         .transition()
    //         .duration(200)
    //         .style("opacity", 0.9)
    // };

    // // Mouseout function to hide the tool on exit
    // let mouseout = function (d) {
    //     // Set opacity back to 0 to hide
    //     tooltip.transition()
    //         .duration(200)
    //         .style("opacity", 0);
    // };

    // Creates a reference to all the scatterplot dots
    let bars = svg.selectAll("rect").data(data);

    // TODO: Render the bar elements on the DOM
    bars.enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", x(0))
        .attr("y", function (d) {
            console.log(`Genre: ${d['genre']}; y: ${y(d['genre'])}`)
            return y(d['genre']);
        })               // TODO: HINT: Use function(d) { return ...; } to apply styles based on the data point
        .attr("width", function (d) {
            console.log(`Genre: ${d['genre']}; x: ${x(d['count'])}`)
            return x(d['count']);
        })   // TODO: This
        .attr("height", y.bandwidth())      // TODO: HINT: y.bandwidth() makes a reasonable display height
        .style("fill", function (d) {
            return color(d['genre']);
        })
    // .on("mouseover", mouseover) // HINT: Pass in the mouseover and mouseout functions here
    // .on("mouseout", mouseout);

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2},
                                    ${(graph_1_height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
        .style("text-anchor", "middle")
        .text("Count of Titles");

    // Add y-axis label
    svg.append("text")
        .attr("transform", `translate(-80, ${(graph_1_height - margin.top - margin.bottom) / 2})`)       // HINT: Place this at the center left edge of the graph
        .style("text-anchor", "middle")
        .text("Genres");

    // Add chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text(`Titles per Genre`);
});


/**
 * Your boss wants to know the number of titles per genre on Netflix.
 */
function filterData(data) {
    // {'genre1': count1, genre2: count2, ...}
    let genre_counts = {};
    for (let i = 0; i < data.length; i++) {
        const genres_str = data[i]['listed_in'];
        const genres = genres_str.split(',');
        for (let j = 0; j < genres.length; j++) {
            const genre = genres[j];
            const clean_genre = genre.trim();
            if (clean_genre in genre_counts) {
                genre_counts[clean_genre] += 1;
            } else {
                genre_counts[clean_genre] = 1;
            }
        }
    }
    console.log(genre_counts)
    // Convert to something easier for D3
    // [{"genre": comedy, "count": 2}, {"genre": action, "count": 3}, ...]
    let return_list = [];
    for (let genre in genre_counts) {
        return_list.push({"genre": genre, "count": genre_counts[genre]})
    }
    console.log(return_list);
    // Let's go ahead and sort them too while we're at it
    let sorted_data = return_list.sort(function (a, b) {
        return b["count"] - a["count"]
    });
    console.log(sorted_data);
    return sorted_data;
}



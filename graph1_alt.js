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
    data = filterData1Alt(data);

    let root = d3.stratify()  // Stratidy explained: https://observablehq.com/@d3/d3-stratify
        .id(function (d) {
            return d.genre;
        })
        .parentId(function (d) {
            return d.parent;
        })
        (data);

    root.sum(function (d) {
        return d.count
    })

    // https://www.d3-graph-gallery.com/graph/treemap_basic.html
    d3.treemap()
        .size([graph_1_width - margin.left - margin.right, graph_1_height - margin.top - margin.bottom])
        .padding(3)
        (root) // Note that we're passing in the root as an argument to this function!

    // Double check that things were added properly!
    // console.log(root.leaves())

    let color = d3.scaleOrdinal()
        .domain(data.map(function (d) {
            return d.genre;
        }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#ff5c7a"), data.length));

    // Mouseover function to display the tooltip on hover
    let mouseover = function (d) {
        let html = `${d.data.genre}<br/>${d.data.count}`;
        // Show the tooltip and set the position relative to the event X and Y location
        tooltip.html(html)
            .style("left", `${d3.event.pageX - 50}px`)
            .style("top", `${d3.event.pageY - 50}px`)
            .transition()
            .duration(200)
            .style("opacity", 0.95)
    };

    // Mouseout function to hide the tool on exit
    let mouseout = function (d) {
        // Set opacity back to 0 to hide
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    };

    // Draw the rectangles:
    svg.selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr('x', function (d) {
            return d.x0;
        })
        .attr('y', function (d) {
            return d.y0;
        })
        .attr('width', function (d) {
            return d.x1 - d.x0;
        })
        .attr('height', function (d) {
            return d.y1 - d.y0;
        })
        .style("stroke", "black")
        .style("fill", "#b9c8c6")
        .on("mouseover", mouseover) // HINT: Pass in the mouseover and mouseout functions here
        .on("mouseout", mouseout);

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
function filterData1Alt(data) {
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
    // console.log(genre_counts)
    // Convert to something easier for D3
    // [{"genre": comedy, "count": 2}, {"genre": action, "count": 3}, ...]
    let return_list = [];
    for (let genre in genre_counts) {
            return_list.push({"genre": genre, "count": genre_counts[genre], "parent": "Origin"});
    }
    // console.log(return_list);
    // Let's go ahead and sort them too while we're at it
    let sorted_data = return_list.sort(function (a, b) {
        return b["count"] - a["count"];
    });
    return_list.push({"genre": "Origin", "count": null, "parent": null}); // Add the origin
    // console.log(sorted_data);
    return sorted_data;
}



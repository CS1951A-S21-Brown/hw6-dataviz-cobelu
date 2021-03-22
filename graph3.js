/*
Lastly, we want to learn about the cast and directors.
You have two choices here:
1) the top director + actor pairs by number of movies made
2) a flow chart where each actor is a node, and a link refers to a movie they both acted in
(just the connection, no need to specify number of movies made together or which movies those are)
 */

// Set up an SVG object
let svg = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set up reference to tooltip                                                                                                                                                                                                                                                                                                         ip
let tooltip = d3.select("#graph3") // Div ID for the first graph
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Define force values for the graph
const forceX = d3.forceX(graph_3_width / 2).strength(0.05);
const forceY = d3.forceY((graph_3_height + margin.top) / 2).strength(0.05);
// Define the force simulation
let simulation = d3.forceSimulation()
    .force('x', forceX)
    .force('y', forceY)
    // Use data id field for links
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter((graph_3_width - margin.right) / 2,
        (graph_3_height - margin.top) / 2));


// Load the CSV file
d3.csv(data_file).then(function (data) {
    // console.log(data);
    // TODO: sample
    data = data.slice(0, 2)

    console.log(data);

    // Filter the data for nodes and edges
    data = filterData3(data);

    console.log(data);

    // Show the MEAN on mouseover
    let mouseover = function (d) {
        let html = `${d.key}<br/>Mean: ${d.value.mean}`;
        tooltip.html(html)
            .style("left", `${d3.event.pageX - 50}px`)
            .style("top", `${d3.event.pageY - 50}px`)
            .transition()
            .duration(200)
            .style("opacity", 0.95)
    };

    // Hide the mean on mouseover
    let mouseout = function (d) {
        // Set opacity back to 0 to hide
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    };

    // Define the sizes of nodes for the level of collaboration
    let node_size = d3.scaleLinear()
        .range([4, 10])
        .domain(d3.extent(data.nodes, function (d) {
            return parseInt(d.count);
        }));

    // Draw the edges
    svg.selectAll("edges")
        .data(data.edges)
        .enter()
        .append("line")
        .style("stroke", "#aaa")

    // Draw the nodes
    svg.selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 20)
        .attr("r", function (d) {
            return node_size(parseInt(d.count))
        })
        .style("fill", "#69b3a2")

    // Add chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-20})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text(`Runtimes per Year`);

});

function filterData3(data) {
    let nodes = [];
    let edges = [];
    // Get the
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const title = row['title']
        const cast = row['cast'];
        let cast_list = cast.split(',');
        for (let j = 0; j < cast_list.length; j++) {
            cast_list[j] = cast_list[j].trim()
        }
        console.log(cast_list)
        for (let a = 0; a < cast_list.length; a++) {
            const cast_member = cast_list[a];
            if (!(cast_list[a] in nodes)) {
                // If it's not there, add it
                nodes.push({"name": cast_member})
            }
            // Add the connection to the others
            for (let b = 0; b < cast_list.length; b++) {
                const other_cast_member = cast_list[b];
                if (cast_member !== other_cast_member) {
                    // "In the links part, elements must be called source and target to be recognized by d3"
                    // https://www.d3-graph-gallery.com/graph/network_basic.html
                    edges.push({"source": cast_member, "target": other_cast_member, "in": title})
                }
            }
        }
    }
    return {"nodes": nodes, "edges": edges};
}

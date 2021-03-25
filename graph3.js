/*
Lastly, we want to learn about the cast and directors.
You have two choices here:
1) the top director + actor pairs by number of movies made
2) a flow chart where each actor is a node, and a link refers to a movie they both acted in
(just the connection, no need to specify number of movies made together or which movies those are)
 */

// Based on code which uses v2: http://bl.ocks.org/jose187/4733747
// Based on code which uses v4: https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3

// Set up an SVG object
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set up reference to tooltip                                                                                                                                                                                                                                                                                                         ip
let tooltip3 = d3.select("#graph3") // Div ID for the first graph
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Create a force to affect the nodes
// https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3
let force = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id
    }))
    .force("charge", d3.forceManyBody()) // https://www.d3indepth.com/force-layout/
    .force("center", d3.forceCenter((graph_3_width - margin.right - margin.left) / 2, (graph_3_width - margin.left - margin.right) / 2)) // Center it in the middle
    .force("y", d3.forceY(0))
    .force("x", d3.forceX(0));


// Load the CSV file
d3.csv(data_file).then(function (data) {
    // console.log(data);
    // Pull a sample
    data = data.slice(0, 10)

    console.log(data);

    // Filter the data for nodes and edges
    data = filterData4(data);

    console.log("filtered data:")
    console.log(data)

    // let color = d3.scaleOrdinal()
    //     .domain(data.map(function (d) {
    //         return d.nodes.type
    //     }))
    //     .range(d3.quantize(d3.interpolateHcl("#0080ff", "#ffa500"), data.length));

    let link = svg3.selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "#000000")
        .style("stroke-width", 0.5);

    let node = svg3.selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 2)
        // .style("fill", function (d) {
        //     return color(d.nodes.type)
        // })

    let ticked = function () {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
        node
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    }

    // Add the forces to the nodes and links
    force.nodes(data.nodes)
        .on("tick", ticked);
    force.force("link")
        .links(data.links);

})

// function filterData3(data) {
//     let nodes = [];
//     let edges = [];
//     // Get the
//     for (let i = 0; i < data.length; i++) {
//         const row = data[i];
//         const title = row['title']
//         const cast = row['cast'];
//         let cast_list = cast.split(',');
//         for (let j = 0; j < cast_list.length; j++) {
//             cast_list[j] = cast_list[j].trim()
//         }
//         console.log(cast_list)
//         for (let a = 0; a < cast_list.length; a++) {
//             const cast_member = cast_list[a];
//             if (!(cast_list[a] in nodes)) {
//                 // If it's not there, add it
//                 nodes.push({"id": cast_member})
//             }
//             // Add the connection to the others
//             for (let b = 0; b < cast_list.length; b++) {
//                 const other_cast_member = cast_list[b];
//                 if (cast_member !== other_cast_member) {
//                     // "In the links part, elements must be called source and target to be recognized by d3"
//                     // https://www.d3-graph-gallery.com/graph/network_basic.html
//                     edges.push({"source": cast_member, "target": other_cast_member, "in": title})
//                 }
//             }
//         }
//     }
//     return {"nodes": nodes, "links": edges};
// }

function filterData4(data) {
    let return_data = {"nodes": [], "links": []};
    // Get the
    for (let i = 0; i < data.length; i++) {
        // Consider the row
        const row = data[i];
        // Consider the director(s)
        const director = row['director']
        let director_list = director.split(',');
        for (let j = 0; j < director_list.length; j++) {
            director_list[j] = director_list[j].trim()
        }
        if (director_list === [""]) {
            // Skip the movies without a director
            continue;
        }
        // Consider the cast members
        const cast = row['cast'];
        let cast_list = cast.split(',');
        for (let j = 0; j < cast_list.length; j++) {
            cast_list[j] = cast_list[j].trim()
        }
        // Create a pairing
        for (let a = 0; a < director_list.length; a++) {
            const some_director = director_list[a];
            // Add the director in if it's not there
            let director_node = {"id": some_director, "type": "director"};
            if (!(director_node in return_data.nodes)) {
                return_data.nodes.push(director_node)
            }
            for (let b = 0; b < cast_list.length; b++) {
                const some_actor = cast_list[b]
                let actor_node = {"id": some_actor, "type": "actor"};
                if (!(some_actor in return_data.nodes)) {
                    return_data.nodes.push(actor_node)
                }
                return_data.links.push({"source": some_director, "target": some_actor})
            }
        }
    }
    // Part 1 stuff that I guess isn't going to work
    // let unique_pairs = uniqueEntries(out_data)
    // // Maybe?: https://stackoverflow.com/q/11649255
    // // console.log("Unique Pairs:")
    // // console.log(unique_pairs)
    // // Fix the data
    // for (let i = 0; i < unique_pairs.length; i++) {
    //     let count = 0;
    //     let pair = unique_pairs[i];
    //     for (let j = 0; j < out_data.length; j++) {
    //         if (pair === out_data[j]) {
    //             count = count + 1
    //         }
    //     }
    //     return_data.push({"data": pair, "count": count})
    // }
    // console.log("Returned Data:")
    // console.log(return_data)
    // Sort: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    // return_data.sort((a, b) => (a.count > b.count) ? 1 : -1)
    // Return
    return return_data;
}

// function uniqueEntries(originalArray) {
//     // Convert to set, then to array again to get unique entries
//     return Array.from(new Set(originalArray))
// }

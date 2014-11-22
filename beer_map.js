/**
 * Created by PSkip on 2/24/14.
 */
var width = 960,
    height = 500,
    centered;

var perCapById = d3.map();
var stateById = d3.map();
var rankById = d3.map();

var quantize = d3.scale.quantize()
    .domain([20, 46])
    .range(d3.range(8).map(function(i) { return "q" + i + "-9"; }));

/*Recent Add */
var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);//Recent Add


var svg = d3.select(".wpd3-38-0").append("svg")
    .attr("width", width)
    .attr("height", height);

//Recent Add
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g"); //Recent add

queue()
    .defer(d3.json, "http://theunchartedblog.net/wp-content/uploads/2014/04/us.json")
    .defer(d3.csv, "http://theunchartedblog.net/wp-content/uploads/2014/04/beer.csv", function(d) { perCapById.set(d.id, +d.perCapCons); stateById.set(d.id, d.state); rankById.set(d.id, +d.perCapRank);})
    .await(ready);



function ready(error, us) {
    g.append("g")//changed svg.append to g.append
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("class", function(d) { return quantize(perCapById.get(d.id)); })
        .attr("d", path)
        .on("click",clicked); //Recent add

}

function clicked(d) {
    var x, y, k;
    var bubble = $("#bubble");
    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
        /*bubble.innerHTML = "<ul><li>State: " + stateById.get(d.id) + "</li><li>2012 Per Capita Consumption: " + perCapById.get(d.id) + " gallons</li><li>Rank: " + ordinalize(rankById.get(d.id)) +"</li></ul> ";*/
        $("#listState").text("State: " + stateById.get(d.id));
        $("#listPerCap").text("2012 Per Capita Consumption: " + perCapById.get(d.id) + " gallons");
        $("#listRank").text("Rank: " + ordinalize(rankById.get(d.id)));
        bubble.css("display", "inline");
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
        bubble.css("display", "none");
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

/*Helper func for innerHTML of bubble*/
function ordinalize(num) {
    if (num.toString() === "11") {
        return "11th"
    }
    if (num.toString() === "12") {
        return "12th"
    }
    if (num.toString() === "13") {
        return "13th"
    }
    var str = num.toString().slice(-1),
        ord = '';
    switch (str) {
        case '1':
            ord = 'st';
            break;
        case '2':
            ord = 'nd';
            break;
        case '3':
            ord = 'rd';
            break;
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '0':
            ord = 'th';
            break;
    }
    return num + ord;
}
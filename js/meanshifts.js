var ms1Dat = {
    iteration: -1,
    onChanges: [],
    get onChange() { var self=this; return function() { self.onChanges.forEach(v => v(self.iteration));}; }
};

async function addMSGui() {
    await Promise.all([
        moonPromise,
        moonMSPromise,
        moonMSPtsPromise]);
    await Promise.all(moonMSPromises);

    var iterations = moonMSCsvs.map(row => row[0]);
    var canvas_id = "meanshifts-canvas";
    var canvas = document.getElementById(canvas_id);
    var parent_section = getClosest(canvas, "section");
    
    var msGui = new dat.GUI();
    var msGuiController = msGui.add(ms1Dat, 'iteration', -1, iterations.length - 1, 1);
    msGuiController
       .onChange(ms1Dat.onChange)
       .listen();
    slide_hider(parent_section, msGui.domElement);
    var boundWASDlistener = msGuiWASDlistener.bind(null, iterations.length-1)
    slide_observer(parent_section,
        () => document.addEventListener('keydown', boundWASDlistener),
        () => document.removeEventListener('keydown', boundWASDlistener));
}

function msGuiWASDlistener(maxiters, e) {
    if (e.code === "KeyA") {
        if (ms1Dat.iteration === -1 ) { return; }
        ms1Dat.iteration -= 1;
        ms1Dat.onChange();
    }
    else if (e.code === "KeyD") {     
        if (ms1Dat.iteration === maxiters) { return; }
        ms1Dat.iteration += 1;
        ms1Dat.onChange();
    }
}


    
async function meanshiftGraph() {
    await Promise.all([
        moonPromise,
        moonMSPromise,
        moonMSPtsPromise]);
    await Promise.all(moonMSPromises);

    var iterations = moonMSCsvs.map(row => row[0]);
    var canvas_id = "meanshifts-canvas";
    var canvas = document.getElementById(canvas_id);
    var parent_section = getClosest(canvas, "section");
    /*
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize(){
        canvas.width = canvas.parentNode.offsetWidth;
        canvas.height = canvas.parentNode.offsetHeight; 
    }
    slide_observer(parent_section, onWindowResize);
    */

    // Create scale functions
    var xScale = d3.scaleLinear()  // xScale is width of graphic
                    .domain([-2, 2])
                    .range([0,1]); // output range

    var yScale = d3.scaleLinear()  // yScale is height of graphic
                    .domain([-2, 2])
                    .range([1,0]);  // remember y starts on top going down so we flip

    // Create SVG element
    var svg = d3.select("#" + canvas_id)  // This is where we put our vis
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1 1")
        .classed("svg-content", true);

    // Create Data circles
    svg.append("g")
        .attr("id", "data")
        .selectAll("circle")
        .data(moons_xy)
        .enter()
        .append("circle")  // Add circle svg
        .attr("cx", function(d) {
            return xScale(d[0]);  // Circle's X
        })
        .attr("cy", function(d) {  // Circle's Y
            return yScale(d[1]);
        })
        .attr("r", ".01");  // radius

    svg.append("g")
        .attr("id", "iterate")
        .selectAll("path")
        .data([moonMSPts[0]])
        .enter()
        .append("path")
        .attr('transform', function(d) {
            return 'translate(' + [xScale(d[0]), yScale(d[1])] + ') rotate(45)' ;
        })
        .attr("stroke", "#ff0000")
        .attr("fill", "#ff0000")
        .attr('stroke-width',0.002)
        .attr("d", d3.symbol()
            .type(d3.symbolCross)
            .size(0.002)()
        );

    function initializeGraph() {
        console.log("initializing!");
        // Update Circles
        svg.selectAll("#data")
            .selectAll("circle")
            .attr("r", ".01");  // radius
        svg.selectAll("#iterate")
            .selectAll("path")
            .data([moonMSPts[0]])
            .attr('transform', function(d) {
                return 'translate(' + [xScale(d[0]), yScale(d[1])] + ') rotate(45)' ;
            })
            .attr("stroke", "#ff0000")
            .attr("fill", "#ff0000")
            .attr('stroke-width',0.002)
            .attr("d", d3.symbol()
                .type(d3.symbolCross)
                .size(0.002)()
            );
    }
    //slide_observer(parent_section, initializeGraph);
 
    function updateGraph(i) {
        if (i === -1) { initializeGraph(); return ;}
        // Update Circles
        svg.selectAll("#data")
            .selectAll("circle")
            //.transition()
            //.duration(400)
            .attr("r", function(d, j) { return String(0.1*moonMSWeights[i][j]); });  // radius
        svg.selectAll("#iterate")
            .selectAll("path")
            .data([moonMSPts[i]])
            //.transition()
            //.duration(400)
            .attr('transform', function(d) {
                return 'translate(' + [xScale(d[0]), yScale(d[1])] + ') rotate(45)' ;
            })
            .attr("stroke", "#ff0000")
            .attr("fill", "#ff0000")
            .attr('stroke-width',0.002)
            .attr("d", d3.symbol()
                .type(d3.symbolCross)
                .size(0.002)()
            );
    }
    ms1Dat.onChanges.push(updateGraph);
}

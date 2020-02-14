var trigCircleDat = {
    angle: Math.PI/3,
    onChanges: [],
    get onChange() { var self=this; return function() { self.onChanges.forEach(v => v(self.angle));}; }
};

async function addTrigCircleGui() {
    var trigCircleSection = document.getElementById("trig-circle-section");
    var trigCirclegui = new dat.GUI();
    var trigCircleguiController = trigCirclegui.add(trigCircleDat, 'angle', 0, 2*Math.PI,Math.PI/60);
    trigCircleguiController
       .onChange(trigCircleDat.onChange)
       .listen();
    slide_hider(trigCircleSection, trigCirclegui.domElement);
    slide_observer(trigCircleSection,
        () => document.addEventListener('keydown', trigGuiWASDlistener),
        () => document.removeEventListener('keydown', trigGuiWASDlistener));
        
}
    
function fixMathJax(root_el) {
    var mathjax_nodes = $(root_el).find('.mathjax');
    var mathjax_svg_nodes = mathjax_nodes.find("svg");
    if (mathjax_svg_nodes.length == mathjax_nodes.length) {
        var mathjax_text_nodes = mathjax_nodes.find("text");
        mathjax_nodes.append(i => mathjax_svg_nodes[i]);
        mathjax_text_nodes.remove(); }
    else 
        window.requestAnimationFrame(() => fixMathJax(root_el));
}

function pifrac2latex(a,b) {
    var num;
    var frac;
    var sign = a/b < 0 ? "-" : "";
    if (Math.abs(a) == 1) num = "\\pi";
    else num = Math.abs(a) + "\\pi";
    if (b == 1)
        return sign + num;
    return sign + "\\frac{" + num + "}{" + b + "}"
}

function trigGuiWASDlistener(e) {
    if (e.code === "KeyA") {
        trigCircleDat.angle -= Math.PI/60;
        trigCircleDat.onChange();
    }
    else if (e.code === "KeyD") {     
        trigCircleDat.angle += Math.PI/60;
        trigCircleDat.onChange();
    }
}


async function trigCircle() {
    const canvas_id = "trig-canvas";
    var canvas = document.getElementById(canvas_id);
    var parent_section = getClosest(canvas, "section");

    var xScale = d3.scaleLinear()  // xScale is width of graphic
                    .domain([-1.5, 1.5])
                    .range([0,100]); // output range

    var yScale = d3.scaleLinear()  // yScale is height of graphic
                    .domain([-1.5, 1.5])
                    .range([100,0]);  // remember y starts on top going down so we flip
    var center = [xScale(0), yScale(0)];
    var radius = xScale(1) - xScale(0);

    // Create SVG element
    var svg = d3.select("#" + canvas_id)  // This is where we put our vis
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 100 100")
        .classed("svg-content", true);

    var points = [trigCircleDat.angle];

    var hypotenuse = svg
        .append("g")
        .classed("hypotenuse", true)
        .selectAll("line")
        .data(points)
        .enter()
        .append("line")
        .attr('x1', center[0])
        .attr('y1', center[1])
        .attr('x2', d => xScale(Math.cos(d)))
        .attr('y2', d => yScale(Math.sin(d)));

    var y = svg
        .append("g")
        .classed("y", true)
        .selectAll("line")
        .data(points)
        .enter()
        .append("line")
        .attr('x1', d => xScale(Math.cos(d)))
        .attr('y1', center[1])
        .attr('x2', d => xScale(Math.cos(d)))
        .attr('y2', d => yScale(Math.sin(d)));

    var x = svg
        .append("g")
        .classed("x", true)
        .selectAll("line")
        .data(points)
        .enter()
        .append("line")
        .attr('x1', center[0])
        .attr('y1', center[1])
        .attr('x2', d => xScale(Math.cos(d)))
        .attr('y2', center[0]);

    var circle = svg
        .append('circle')
        .attr("cx", center[0])
        .attr("cy", center[1])
        .attr('r', radius)
        .attr('stroke-width',1)
        .style('fill', 'none')
        .style("stroke","#000000");

    var fractions_of_pi = [
        [1,6], [1,4], [1,3], [1,2], [2,3], [3,4], [5,6], [1,1], [7,6], [5,4], [4,3], [3,2], [5,3], [7,4], [11,6], [2,1]
    ] 
    fractions_of_pi.forEach((v) => {
        var val = v[0]*Math.PI/v[1];
        var latex = "$" + pifrac2latex(...v) + "$";

        const textX = xScale(1.25*Math.cos(val));
        const textY = yScale(1.25*Math.sin(val));
        const lineX = xScale(1.1*Math.cos(val));
        const lineY = yScale(1.1*Math.sin(val));

        svg.append('g')
            .classed('tick', true)
            .classed("mathjax", true)
            .attr('transform', "translate(" + [textX - 3.5, textY - 3.5] + ")")
            .append('text')
            .text(() => latex);

        svg.append('line')
            .classed("radial",true)
            .attr('x1', center[0])
            .attr('y1', center[1])
            .attr('x2', lineX)
            .attr('y2', lineY);
    });

    trigCircleDat.onChanges.push(updateGraph);

    var previous_update = + new Date();
    function updateGraph(angle) {
        console.log("pickles");
        var now = + new Date();
        var delay = Math.min(now - previous_update, 600);
        previous_update = now;
        // Update Lines
        hypotenuse
            .data([angle])
            .transition()
            .duration(delay)
            .attr('x1', center[0])
            .attr('y1', center[1])
            .attr('x2', d => xScale(Math.cos(d)))
            .attr('y2', d => yScale(Math.sin(d)));

        y
            .data([angle])
            .transition()
            .duration(delay)
            .attr('x1', d => xScale(Math.cos(d)))
            .attr('y1', center[1])
            .attr('x2', d => xScale(Math.cos(d)))
            .attr('y2', d => yScale(Math.sin(d)));

        x
            .data([angle])
            .transition()
            .duration(delay)
            .attr('x1', center[0])
            .attr('y1', center[1])
            .attr('x2', d => xScale(Math.cos(d)))
            .attr('y2', center[0]);
    }

  fixMathJax("#" + canvas_id);
}



async function sinWave() {
    const canvas_id = "sin-canvas";
    var canvas = document.getElementById(canvas_id);
    var parent_section = getClosest(canvas, "section");

    var xScale = d3.scaleLinear()  // xScale is width of graphic
                    .domain([0, 2*Math.PI])
                    .range([0,100]); // output range

    var yScale = d3.scaleLinear()  // yScale is height of graphic
                    .domain([-1.5, 1.5])
                    .range([100,0]);  // remember y starts on top going down so we flip

    // Create SVG element
    var svg = d3.select("#" + canvas_id)  // This is where we put our vis
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 100 100")
        .classed("svg-content", true);

    var fractions_of_pi = [
        [1,4], [1,2], [3,4], [1,1], [5,4], [3,2], [7,4], [2,1]
    ]; 
    var xAxis = svg
        .append("g")
        .classed("axis", true)
        .attr("transform", "translate(0," + yScale(0) + ")")
        .call(d3.axisBottom(xScale)
            .ticks(fractions_of_pi.map(v => v[0]/v[1]*Math.PI))
            .tickSizeOuter(0)
            .tickFormat(""));

    var yAxis = svg
        .append("g")
        .classed("axis", true)
        //.attr("transform", "translate(" + xScale(0) + ",0)")
        .call(d3.axisRight(yScale)
            .tickValues([-1,1])
            .tickSize(3)
            .tickSizeOuter(0));

    var points = [trigCircleDat.angle];

    var y = svg
        .append("g")
        .classed("y", true)
        .selectAll("line")
        .data(points)
        .enter()
        .append("line")
        .attr('x1', d => xScale(d))
        .attr('y1', yScale(0))
        .attr('x2', d => xScale(d))
        .attr('y2', d => yScale(Math.sin(d)));

    var thetaSpace = math.dotMultiply(math.range(0,120), Math.PI/60);
    var scaledThetaSpace = thetaSpace.map(xScale);
    var scaledYSpace = thetaSpace.map(Math.sin).map(yScale)._data;
    var lineData = scaledThetaSpace._data.map((v,i) => [v, scaledYSpace[i]]);
    console.log(lineData);
    var line = d3.line()
        .x(d => d[0])
        .y(d => d[1])

    var wave = svg
        .append("path")
        .datum(lineData)
        .attr('stroke-width',0.5)
        .attr("fill","transparent")
        .style("stroke","#ff7f00")
        .attr("d", line);


    fractions_of_pi.forEach((v) => {
        var val = v[0]*Math.PI/v[1];
        var latex = "$" + pifrac2latex(...v) + "$";

        const textX = xScale(val);
        const textY = yScale(0);

        svg.append('g')
            .classed('tick', true)
            .classed("mathjax", true)
            .attr('transform', "translate(" + [textX - 3.5, textY + 5] + ")")
            .append('text')
            .text(() => latex);

    });

    trigCircleDat.onChanges.push(updateGraph);

    var previous_update = + new Date();
    function updateGraph(angle) {
        var now = + new Date();
        var delay = Math.min(now - previous_update, 600);
        previous_update = now;
        // Update Lines
        y
            .data([angle])
            .transition()
            .duration(delay)
            .attr('x1', d => xScale(d))
            .attr('y1', yScale(0))
            .attr('x2', d => xScale(d))
            .attr('y2', d => yScale(Math.sin(d)));
    }

  fixMathJax("#" + canvas_id);
}











async function docReady() {
    await addTrigCircleGui(); 
    trigCircle();
    sinWave();
}
$(document).ready(docReady);

var lsvmDat = {};

async function lsvmGraph() {
    await moonPromise; 
    var pts = [];
    await loadCsvCsvs("data/localsvm/moons_lsvm_filelist", pts);
    console.log("pts");
    console.log(pts);
    var canvas_id = "lsvm-canvas";
    var viridis_colors = d3.scaleSequential().domain([0,1]).interpolator(d3.interpolateViridis);
    shiftyGraph(canvas_id, lsvmDat, moons_xy, pts, moons_labels.map(viridis_colors)); 
}

$(document).ready(lsvmGraph);

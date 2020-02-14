
async function loadCsvCsvs(csvsListPth, storage_array) {
    return $.get(csvsListPth)
        .then(
            csvlist => Promise.all($.csv.toArrays(csvlist).map(
                (v,i) => $.get(v[1])
                    .then(csv => storage_array[i] = $.csv.toArrays(csv).map(v => v.map(parseFloat))))));
}

var moonCsvFile = "data/moons.dat";
var moons, moons_xy, moons_labels;
var moonPromise = $.get(moonCsvFile, function(csv) { 
    moons = $.csv.toArrays(csv)
    moons_xy = moons.map(v => [v[0], v[1]].map(parseFloat));
    moons_labels = moons.map(v => parseInt(v[2]));
});

var moonKdCsvsFile = "data/kd/moons_kd_filelist";
var moonKdCsvs;
var moon_kds = [];
var moonKdsPromises = [];
var moonKdsPromise = $.get(moonKdCsvsFile, csv => moonKdCsvs = $.csv.toArrays(csv))
    .then(() => moonKdsPromises = moonKdCsvs.map((v,i) => $.get(v[2], csv => moon_kds[i] = $.csv.toArrays(csv))));

var moonMSCsvsFile = "data/ms/moons_ms_filelist";
var moonMSCsvs;
var moonMSWeights = [];
var moonMSPromises = [];
var moonMSPromise = $.get(moonMSCsvsFile, csv => moonMSCsvs = $.csv.toArrays(csv))
    .then(
        () => moonMSPromises = moonMSCsvs.map(
            (v,i) => $.get(v[1], 
                csv => moonMSWeights[i] = $.csv.toArrays(csv).map(v => parseFloat(v[0])))));
var moonMSFile = "data/ms/meanshift_somepoint";
var moonMSPts;
var moonMSPtsPromise = $.get(moonMSFile, csv => moonMSPts = $.csv.toArrays(csv).map(v => v.map(parseFloat)));

var moonMS2CsvsFile = "data/ms2/moons_ms_filelist";
var moonMS2Csvs;
var moonMS2Pts = [];
var moonMS2Promises;
var moonMS2Promise = $.get(moonMS2CsvsFile, csv => moonMS2Csvs = $.csv.toArrays(csv))
    .then(
        () => moonMS2Promises = moonMS2Csvs.map(
            (v,i) => $.get(v[1], 
                csv => moonMS2Pts[i] = $.csv.toArrays(csv).map(v => v.map(parseFloat)))));

var moonSCMSCsvsFile = "data/scms/moons_scms_filelist";
var moonSCMSCsvs;
var moonSCMSPts = [];
var moonSCMSPromises;
var moonSCMSPromise = $.get(moonSCMSCsvsFile, csv => moonSCMSCsvs = $.csv.toArrays(csv))
    .then(
        () => moonSCMSPromises = moonSCMSCsvs.map(
            (v,i) => $.get(v[1], 
                csv => moonSCMSPts[i] = $.csv.toArrays(csv).map(v => v.map(parseFloat)))));

import * as THREE from '../lib/three.js-master/build/three.module.js';
import { TrackballControls } from '../lib/three.js-master/examples/jsm/controls/TrackballControls.js';
import { OrbitControls } from '../lib/three.js-master/examples/jsm/controls/OrbitControls.js';
import { SceneUtils } from '../lib/three.js-master/examples/jsm/utils/SceneUtils.js';
import { WireframePlot, viridis_colors } from './wireframe.js';
import { ScatterPlot } from './scatter.js';

class Gaussian {

    constructor(mu,sigma) {
        this.mu = mu; 
        this.sigma = sigma; 
        this.sigmainv = math.inv(sigma); 
        this.sigmadet = math.det(sigma);
    }
    
    pdf(x) { return (2*math.PI)**(-this.mu.length/2) * 
                    this.sigmadet**(-1/2) * 
                    math.exp(-1/2* math.multiply(math.multiply(x-this.mu, this.sigmainv), x-this.mu))
                    ; }
}

function convex_combo(v1,v2,alpha) {
    return math.add(
        math.multiply(v1, 1-alpha), 
        math.multiply(v2, alpha));
}


async function kernelDensityGraph() {
    var canvas_element = "#kd-canvas";

    var canvas, renderer, scene, camera, controls, light;
    [canvas, renderer, scene, camera, controls, light] = init_three(canvas_element)
    var parent_section = getClosest(canvas, "section");
    
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize(){

        canvas.width = canvas.parentNode.offsetWidth;
        canvas.height = canvas.parentNode.offsetHeight; 
        camera.aspect = canvas.width/canvas.height;
        camera.updateProjectionMatrix();

        renderer.setSize( canvas.width, canvas.height );
        renderer.render(scene, camera);
    }
    slide_observer(parent_section, onWindowResize);

    await moonKdsPromise;
    await Promise.all(moonKdsPromises);
    await moonPromise;

    var bandwidths = moonKdCsvs.map(row => row[1]);

    // bgcolor
    renderer.setClearColor( 0xffffff, 1 );

    var shape = [moon_kds[0].length, moon_kds[0][0].length]
    var flat_plane = math.range(0,shape[0]).map(i => math.range(0,shape[1])._data.map(() => 0))._data;
    var plot = new WireframePlot(flat_plane,-2,2,-2,2);

    var moon_scatter = new ScatterPlot(moons_xy, 0.06, 
        parseInt(viridis_colors(1000).slice(1),16)
    );
    
    var camera_initial_position = math.matrix([0,0,2.7]);
    var that = this;
    this.bandwidth = 0;
    
    var rotation_stop_flag = false;
    var rotator0 = {alpha: 0};
    var rotator1 = {alpha: 1};
    var camera_final_position = math.matrix([0,-2,2]);
    
    var grower0 = {alpha: 0};
    var grower1 = {alpha: 1};
    var growth_initial_position = math.matrix(plot.data);
    var growth_final_position = math.matrix(moon_kds[0]);

    function initialize_slide() {
        camera.position.set.apply(camera.position, camera_initial_position._data);
        camera.lookAt(scene.position);	
        that.bandwidth = 0;
        
        // clear up the scene
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        
        for (const ball of moon_scatter.meshes) { scene.add(ball); } 
        
        plot.update(flat_plane);
        for (const mesh of plot.meshes) { scene.add(mesh); }
        renderer.render(scene, camera);
        rotator0 = {alpha: 0};
    }
    fragment_observer(document.getElementById("kdinitial"), initialize_slide); 
    fragment_observer(document.getElementById("kdinitial"), 
        function() {rotation_stop_flag=true;},
        function() {rotation_stop_flag=false;}); 
    initialize_slide()


    function rotation_updater(timestamp) {
        if (rotation_stop_flag) { return STOP; }
        TWEEN.update();
        camera.position.set.apply(camera.position, convex_combo(camera_initial_position, camera_final_position, rotator0.alpha)._data); 
	    camera.lookAt(scene.position);	
        if (rotator0.alpha === 1) return STOP;
        return GO;
    }
    function start_rotator() { 
        console.log("starting rotation!");
        var rotation_tween = new TWEEN.Tween(rotator0).to(rotator1,1000);
        rotation_tween.start();
        grower0 = {alpha: 0};
        animate(scene, camera, renderer, rotation_updater);
    }
    fragment_observer(document.getElementById("kdrotator"), start_rotator); 


    function growth_updater(timestamp) {
        TWEEN.update();
        plot.update(convex_combo(growth_initial_position, growth_final_position, grower0.alpha)._data)
        if (grower0.alpha === 1) return STOP;
        return GO;
    }
    function start_grower() { 
        console.log("starting grower!");
        for (const ball of moon_scatter.meshes) { scene.remove(ball); } 
        var growth_tween = new TWEEN.Tween(grower0).to(grower1,1000);
        growth_tween.start();
        animate(scene, camera, renderer, growth_updater);
    }
    fragment_observer(document.getElementById("kdgrower"), start_grower); 
 

    var gui = new dat.GUI();
    slide_hider(parent_section, gui.domElement);
    gui.add(this, 'bandwidth', 0, bandwidths.length - 1, 1)
       .onChange(updateMesh)
       .listen();

    function WASDlistener(e) {
        if (e.code === "KeyA") {
            this.bandwidth = this.bandwidth === 0 ? 0 : this.bandwidth - 1;
            updateMesh(this.bandwidth);
        }
        else if (e.code === "KeyD") {     
            this.bandwidth = this.bandwidth === bandwidths.length - 1 ? bandwidths.length - 1 : this.bandwidth + 1;
            updateMesh(this.bandwidth);
        }
    }

    function addWASD() {
        document.addEventListener('keydown', WASDlistener);
    }
    function removeWASD() {
        document.removeEventListener('keydown', WASDlistener);
    }
    slide_observer(parent_section, addWASD, removeWASD);
 
    function updateMesh(i) {
        plot.update(moon_kds[i])
        renderer.render(scene, camera);
    }

}

var STOP = 2;
var WAIT = 1;
var GO = 0;
function animate(scene, camera, renderer, updater, initial_time=null) {
    if (initial_time === null) { initial_time = Date.now()/1000; }
    var condition = updater(initial_time);
    switch (condition) {
        case GO: {renderer.render(scene, camera);}
        case WAIT: {
            requestAnimationFrame( () => animate(scene, camera, renderer, updater, initial_time) );
            break;
        }
        case STOP: {return;}
    }
}
 

function init_three(canvas_element,fov=75,aspect=null,near=0.1,far=5) {
    
    var canvas = document.querySelector(canvas_element);
    if (aspect === null) { aspect = canvas.clientWidth/canvas.clientHeight; }

    var renderer = new THREE.WebGLRenderer({canvas, antialias:true});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0,-2,2);
	camera.lookAt(scene.position);	
	scene.add(camera);

    	
	var controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener('change', () => renderer.render(scene, camera));
	
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,5,0);
    scene.add(light);
    
    return [canvas, renderer, scene, camera, controls, light]
}


$(document).ready(kernelDensityGraph);

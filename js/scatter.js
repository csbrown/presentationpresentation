import * as THREE from '../lib/three.js-master/build/three.module.js';

class ScatterPlot {
    
    constructor(data, rad=1, color=0x004488) {
        this.shape=[data.length, data[0].length];
        this.rad=rad; 
        this.color=color; 
        this.geometries = data.map(() => new THREE.SphereGeometry(rad,6,6));
        this.data = data;
        this.update(this.data);
        this.makeMesh();
    }

    update(data) {
        this.geometries.forEach(function(v,i) { 
            v.translate(data[i][0], data[i][1], data[i].length < 3 ? 0 : data[i][2]);
            v.verticesNeedUpdate = true;
        });
    }

    makeMesh() {
        this.materials = this.geometries.map(() => new THREE.MeshBasicMaterial( { color: this.color } ) );
        this.meshes = this.geometries.map((v,i) => new THREE.Mesh( this.geometries[i], this.materials[i] ));
    }
}

export {ScatterPlot};

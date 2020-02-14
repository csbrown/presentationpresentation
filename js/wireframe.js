import * as THREE from '../lib/three.js-master/build/three.module.js';

var viridis_colors = d3.scaleSequential().domain([0,1000]).interpolator(d3.interpolateViridis);
class WireframePlot {
    
    constructor(data, xmin=-1,xmax=-1,ymin=-1,ymax=1) {
        this.shape=[data.length, data[0].length];
        this.xmin=xmin; 
        this.xmax=xmax; 
        this.ymin=ymin; 
        this.ymax=ymax;
        this.geometry = new THREE.Geometry();
        this.xrange = xmax-xmin
        this.yrange = ymax-ymin
        this.data = data;
        this.makeGeometry();
        this.makeColor();
        this.makeMesh();
    }

    makeGeometry() {
        for (var i=0; i<this.shape[0]; i++) { //i is the x index
            for (var j=0; j<this.shape[1]; j++) { //j is the y index
                this.geometry.vertices.push(
                    new THREE.Vector3(this.xmin + i/this.shape[0]*this.xrange, this.ymin + j/this.shape[1]*this.yrange, 0)
                ); 
            }
        }
        //geometry.vertices[k] -> i = k%z.length, j = k//z[0].length
        for (var i=1; i<this.shape[0]; i++) {
            for (var j=1; j<this.shape[1]; j++) { // the square to the upper left of the vertex
                this.geometry.faces.push(
                    new THREE.Face3(this.shape[1]*i+j, this.shape[1]*(i-1)+j, this.shape[1]*(i-1) + (j-1)) 
                );
                this.geometry.faces.push(
                    new THREE.Face3(this.shape[1]*i+j, this.shape[1]*i+(j-1), this.shape[1]*(i-1) + (j-1))
                );
            }
        }
    }

    update(z) {
        this.data = z;
        for (var i=0; i<this.shape[0]; i++) { //i is the x index
            for (var j=0; j<this.shape[1]; j++) { //j is the y index
                this.geometry.vertices[i*this.shape[1] + j].z = z[i][j];
            }
        }
        this.updateColor();
        this.geometry.verticesNeedUpdate = true;
        this.facesMesh.geometry.colorsNeedUpdate = true;
    }

    makeColor() {
        this.geometry.computeBoundingBox();
        var zMin = this.geometry.boundingBox.min.z;
        var zMax = this.geometry.boundingBox.max.z;
        var zRange = zMax - zMin;
        var color, point, face, numberOfSides, vertexIndex;
        // faces are indexed using characters
        var faceIndices = [ 'a', 'b', 'c' ];
        // first, assign colors to vertices as desired
        for ( var i = 0; i < this.geometry.vertices.length; i++ ) 
        {
            point = this.geometry.vertices[ i ];
            if (this.geometry.colors[i] === undefined) {
                this.geometry.colors[i] = new THREE.Color( 0x0000ff );
            }
            //this.geometry.colors[i].setHSL( 0.7*(1 - (point.z - zMin) / Math.max(zRange, 0.001)), 1, 0.5 );
            //this.geometry.colors[i].setRGB( (point.z - zMin) / Math.max(zRange, 0.001), 0, 1-(point.z-zMin)/Math.max(zRange,0.001));
            this.geometry.colors[i].setHex( parseInt(viridis_colors(1000*(point.z - zMin) / Math.max(zRange, 0.001)).slice(1),16));
        }
        // copy the colors as necessary to the face's vertexColors array.
        for ( var i = 0; i < this.geometry.faces.length; i++ ) 
        {
            face = this.geometry.faces[ i ];
            for( var j = 0; j < 3 ; j++ ) //3 sides to a face 
            {
                vertexIndex = face[ faceIndices[ j ] ];
                face.vertexColors[ j ] = this.geometry.colors[ vertexIndex ];
            }
        }

    }

    updateColor() {
        this.geometry.computeBoundingBox();
        var zMin = this.geometry.boundingBox.min.z;
        var zMax = this.geometry.boundingBox.max.z;
        var zRange = zMax - zMin;
        var point;
        for ( var i = 0; i < this.geometry.vertices.length; i++ ) 
        {
            point = this.geometry.vertices[ i ];
            //this.geometry.colors[i].setHSL( 0.7*(1 - (point.z - zMin) / Math.max(zRange, 0.001)), 1, 0.5 );
            //this.geometry.colors[i].setRGB( (point.z - zMin) / Math.max(zRange, 0.001), 0, 1 - (point.z-zMin)/Math.max(zRange,0.001));
            this.geometry.colors[i].setHex( parseInt(viridis_colors(1000*(point.z - zMin) / Math.max(zRange, 0.001)).slice(1),16));
        }
    }

    makeMesh() {
 
        this.wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true} );
	    this.wireMesh = new THREE.Mesh( this.geometry, this.wireMaterial );

        this.facesMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, side:THREE.DoubleSide } );
    	this.facesMesh = new THREE.Mesh( this.geometry, this.facesMaterial );
	    this.facesMesh.doubleSided = true;

        this.meshes = [this.wireMesh, this.facesMesh];
    }
}

export {WireframePlot, viridis_colors};

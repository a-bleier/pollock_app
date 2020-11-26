<template>
  <div id="webgl"></div>
</template>

<script>
import * as THREE from 'three';
// import * as EvoApi from "../evo-api"

/*
    Can't be put in data, because Vue will break stuff
*/
var dBcamera = null
var dBcube = null
var dBrenderer= null
var dBscene = null

export default {
  name: "DrawBoard",
//   data() {
//     return {
//         dBcamera: null
//     };
//   },
  methods: {
    init() {

      dBscene = new THREE.Scene();
      dBcamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      dBrenderer = new THREE.WebGLRenderer();
      dBrenderer.setSize(window.innerWidth,window.innerHeight);
      document.getElementById("webgl").appendChild(dBrenderer.domElement);

      var geometry = new THREE.BoxGeometry();
      var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      dBcube = new THREE.Mesh(geometry, material);
      dBscene.add(dBcube);
      dBcamera.position.z = 5;
      dBrenderer.render(dBscene, dBcamera);
    },
    animate() {
      window.requestAnimationFrame(this.animate);

      dBcube.rotation.x += 0.01;
      dBcube.rotation.y += 0.01;

      dBrenderer.render(dBscene, dBcamera);
    },
  },
  mounted(){
      this.init()
  }
};
</script>

<style scoped>
</style>
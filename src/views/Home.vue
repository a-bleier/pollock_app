<template>
  <FileLoader @load="saveFile"/>
  <button @click="convert">Convert</button>
  <img :src="currentImageFile" id="preview">

  <div id="canvas-container">

  </div>
  
</template>

<script>
// @ is an alias to /src
import FileLoader from "../components/FileLoader"
import {generateEdges} from "../edge_detection.js"

export default {
  name: 'Home',
  components: {
   FileLoader
  },
  data(){
    return {
      currentImageFile : null,
      image : null
    }
  },
  methods : {
    saveFile(data){
      this.currentImageFile = data
      this.image = new Image;
      this.image.src = this.currentImageFile;

    },
    convert(){
      //The user will not see the byproducts, he will only see the thumbnail of the image he uploaded
      var canvas = document.createElement("canvas")
      document.getElementById("canvas-container").appendChild(canvas)
      canvas.width=this.image.width
      canvas.height=this.image.height
      let ctx = canvas.getContext("2d")
      ctx.drawImage(this.image,0,0,this.image.width, this.image.height);
      let originImage = ctx.getImageData(0,0,canvas.width, canvas.height)   
      let originPixelData = originImage.data    

      let edgeData = generateEdges(originPixelData, this.image.width, this.image.height)
      
      console.log(edgeData)
      originImage.data.set(edgeData)
      ctx.putImageData(originImage,0,0)
    }
  },

}
</script>

<style>
  #preview {
    height: 400px;
    width: 400px;
  }

  canvas {
    height: 400px;
    width: 400px;
  }
</style>
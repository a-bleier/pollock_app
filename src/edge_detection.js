var edgeDetectionConfig = {
    operator : "sobel",
    grayScaleMode : "natural",
    invertEdgeImage : true, //The edges will be black when true
    edgeThreshold : 150
}

/*
    @param pixels: Uint8ClampedArray, contains rgba values
    @param width: the width of the image
    @param height: the height of the image

    @return: new Uint8ClampedArray
*/
export function sobel(pixels, width, height){
    console.log("sobel")
    let gx = [1,0,-1,2,0,-2,1,0,-1]
    let gy = [1,2,1,0,0,0,-1,-2,-1]
    //TODO: alloc buffer and write in it instead of dynamically increasing an array
    let values = []

    for(let i = 0; i < width*height*4; i+=4){

        //as long Uint8ClampedArray is used, the produced NaN due to out of bounds calculation will be
        //converted to 0
        //This will produce wrong edge data on the image boundaries
        //TODO: fix: either crop or say out of bounds is 0 or ignore the boundaries
        let vx = gx[0] * pixels[i-width*4-4] + gx[1] * pixels[i-width*4] + gx[2] * pixels[i-width*4+4] + 
        gx[3] * pixels[i-4] + gx[4] * pixels[i] + gx[5] * pixels[i+4] + 
        gx[6] * pixels[i+4*width-4] + gx[7] * pixels[i+4*width] + gx[8] * pixels[i+4*width+4]

        let vy = gy[0] * pixels[i-width*4-4] + gy[1] * pixels[i-width*4] + gy[2] * pixels[i-width*4+4] + 
        gy[3] * pixels[i-4] + gy[4] * pixels[i] + gy[5] * pixels[i+4] + 
        gy[6] * pixels[i+4*width-4] + gy[7] * pixels[i+4*width] + gy[8] * pixels[i+4*width+4]

        values.push(255-Math.sqrt( Math.pow(vx,2) + Math.pow(vy,2) ))
        values.push(255-Math.sqrt( Math.pow(vx,2) + Math.pow(vy,2) ))
        values.push(255-Math.sqrt( Math.pow(vx,2) + Math.pow(vy,2) ))
        values.push(255)
    }

    for(let i = 0; i < width*height*4; i+=4){
        if(values[i] > edgeDetectionConfig.edgeThreshold){
            values[i] = 255
            values[i+1] = 255
            values[i+2] = 255
        } else {
            values[i] = 0
            values[i+1] = 0
            values[i+2] = 0
        }

    }

    return Uint8ClampedArray.from(values)
}

export function toGrayScale(pixels){
    console.log(`choosing gray scaling mode ${edgeDetectionConfig.grayScaleMode}`)
    if(edgeDetectionConfig.grayScaleMode === "natural"){
        naturalGrayScaling(pixels)
    }
}

function naturalGrayScaling(pixels){
    for(let i = 0; i < pixels.length; i+=4){
        let red = pixels[i]
        let green = pixels[i+1]
        let blue = pixels[i+2]

        let value = 0.21*red + 0.72*green + 0.07*blue

        pixels[i] = value
        pixels[i+1] = value
        pixels[i+2] = value
    }
}

export function generateEdges(pixels, width, height){
  
    console.log(pixels)
    let pixelData = pixels.slice(0,pixels.length)
    console.log(pixelData)
    console.log("start generating edges")
    toGrayScale(pixelData)
    //FIXME: gaussian blur doesn't really wokr; it makes no difference
    // pixelData = gaussianBlur(pixelData, width, height)
    pixelData = applyMeanFilter(pixelData, width, height,5)
    if(edgeDetectionConfig.operator === "sobel"){
        pixelData = sobel(pixelData, width, height)
    }

    return pixelData
}

//Returns a n x n Kernel
function makeGaussKernel(n, sigma){
    let kernel = new Array(n*n)
    let d = (n-1)/2
    for(let y = -d; y <= d; y++){
        for(let x = -d; x <= d; x++){
            kernel[(y+d) * n + x + d] = 1/(2 * Math.PI * sigma*sigma) * Math.pow(Math.E, (-1) * (x*x + y*y)/2*sigma*sigma)
        }
    }
    let sum = 0
    for(let i = 0; i < kernel.length; i++){
        sum += kernel[i]
    }
    console.log(kernel)
    for(let i = 0; i < kernel.length; i++){
        kernel[i] /= sum
    }
    return kernel
}

function gaussianBlur(pixels, width, height) {

    const kernelSize = 49
    const kernel = makeGaussKernel(kernelSize,10)

    // return applyGaussianFilter(pixels, width, height, [1,2,1,2,4,2,1,2,1], 3)
    return applyGaussianFilter(pixels, 
        width, 
        height, 
        [1,4,7,4,1,
        4,16,26,16,4,
        7,26,41,26,7,
        4,16,26,16,4,
        1,4,7,4,1],
        5
    )
    //TODO don't hardcode the kernel, but compute it with the Gaussian distribution
    
}

function applyGaussianFilter(pixelData, width, height, filter, size){
    console.log("before filter")
    console.log(pixelData)
    let newData = new Array(4*width*height)

    let filterSum = 0

    for(let i = 0; i < size*size; i++){
        filterSum += filter[i]
    }

    let dBound = (size-1)/2

    for(let i = 0; i < width*height*4; i+=4){
        let x = Math.floor(i/4)%width
        let y = Math.floor(i/4/width)

        

        //When a part of the filter is out of bounds, the current pixel will be ignored      

        if(x < dBound || y < dBound || x >= (width-dBound) || y >= (height-dBound) ){
            newData[i] = pixelData[i]
            newData[i+1] = pixelData[i]
            newData[i+2] = pixelData[i]
            newData[i+3] = 255
            
            continue
        }

        let sum = 0
        for(let yd = -dBound; yd <= dBound; yd++){
            for(let xd = -dBound; xd <= dBound; xd++){
                sum += pixelData[i+4*width*yd+4*xd]*filter[(yd+dBound)*size+xd+dBound]
            }
        }

        let avg = sum / filterSum
        // console.log(avg)
        newData[i] = avg
        newData[i+1] = avg
        newData[i+2] = avg
        newData[i+3] = 255
    }

    return Uint8ClampedArray.from(newData)
}

function applyMeanFilter(pixelData, width, height, size){
    console.log("before filter")
    console.log(pixelData)
    let newData = new Array(4*width*height)

    let filterSum = 0



    let dBound = (size-1)/2

    for(let i = 0; i < width*height*4; i+=4){
        let x = Math.floor(i/4)%width
        let y = Math.floor(i/4/width)

        

        //When a part of the filter is out of bounds, the current pixel will be ignored      

        if(x < dBound || y < dBound || x >= (width-dBound) || y >= (height-dBound) ){
            newData[i] = pixelData[i]
            newData[i+1] = pixelData[i]
            newData[i+2] = pixelData[i]
            newData[i+3] = 255
            
            continue
        }

        let sum = 0
        for(let yd = -dBound; yd <= dBound; yd++){
            for(let xd = -dBound; xd <= dBound; xd++){
                sum += pixelData[i+4*width*yd+4*xd]
            }
        }

        let avg = sum / (size*size)
        // console.log(avg)
        newData[i] = avg
        newData[i+1] = avg
        newData[i+2] = avg
        newData[i+3] = 255
    }

    return Uint8ClampedArray.from(newData)
}


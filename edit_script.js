let arrowLayer, backwardArrow, forwardArrow, rotationTransformer;
let stage = new Konva.Stage({
    container: 'buttonContainer',
    width: width,
    height: height,
});

function setup() {
    createCanvas(0, 0);
    img = createImg(imageSrc);
    img.size(width, height);
    img.hide(); // hide the image in the browser
    frameRate(1);
}

function calcMaxLength (a, b) {
    return Math.sqrt(Math.pow(a.x-b.x, 2) + (Math.pow(a.y-b.y, 2)))
}

function initJson() {
    // Retrieve the JSON string
    var jsonString = localStorage.getItem("routeJson");

    // Parse the JSON string back to JS object
    routeJson = JSON.parse(jsonString);
}

/**
 * Initializes the canvas and adds the route image, forward/backward arrows, and status text to the canvas.
 */
function initCanvas() {
    let imageLayer = new Konva.Layer()
    
    // Create and add our route image to the canvas
    let imageObj = new Image();
    imageObj.src = imageSrc;
    imageObj.onload = function () {
        let imageHeightWidth = calculateAspectRatioFit(imageObj.width, imageObj.height, width, height)
        let route = new Konva.Image({
          x: (width-imageHeightWidth.width)/2,
          y: 0,
          image: imageObj,
          width: imageHeightWidth.width,
          height: imageHeightWidth.height,
        });

      imageLayer.add(route);
      imageLayer.batchDraw();
    };
    
    stage.add(imageLayer)
    editMode = true;
    makeSkeletonLayer()

    // Arrow layer holds all of the meta UI basically, such as forward/backward arrows
    // and the page indicator
    arrowLayer = new Konva.Layer();
    //poseText tells the user what pose they are currently on
    arrowLayer = new Konva.Layer();

    simpleText = new Konva.Text({
        x: stage.width()-75,
        y: stage.height()-50,
        text:""+(selectedPose+1)+"/"+routeJson.poses.length,
        fontSize: 30,
        fontFamily: 'Sans-serif',
        fill: 'White',
      });


    deleteText = new Konva.Text({
        x: stage.width()-(170 ),
        y: stage.height()-50,
        text:"Delete",
        fontSize: 30,
        fontFamily: 'Sans-serif',
        fill: 'Red',
      });
      deleteText.on('click touchend', function () {
          if (routeJson.poses.length > 1) {
                routeJson.poses = routeJson.poses.filter(item => item !== routeJson.poses[selectedPose])
              if (selectedPose > 0) {
                  selectedPose--
              }
              checkArrows();
              updateSkeletonLayerLocations();
              arrowLayer.draw();
          }
      })
    
    forwardArrow = new Konva.Wedge({
      x: stage.width()-5,
      y: stage.height() / 2,
      radius: 50,
      angle: 60,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 4,
      rotation: 150,
    });

    forwardArrow.on('click touchend', function () {
        var t = document.getElementById("poseDesc");
        routeJson.poses[selectedPose].description = t.value;
        
        if (selectedPose < routeJson.poses.length-1)
            selectedPose++
        t.value = routeJson.poses[selectedPose].description;
        
        checkArrows();
        arrowLayer.draw()
        updateSkeletonLayerLocations()
    })


    addVerticalLine = new Konva.Line({
        points: [width-50, (height/2)-30, width-50, (height/2)+30],
        stroke: 'white',
        strokeWidth: 10,
      });
      
    addVerticalLine.on('click touchend', function () {
        if (addVerticalLine.opacity() > 0) {
          routeJson.poses.push(JSON.parse(JSON.stringify(routeJson.poses[selectedPose])))
          selectedPose++
          checkArrows();
          arrowLayer.draw()
          updateSkeletonLayerLocations()
        }
    })

    addHorizontalLine = new Konva.Line({
        points: [width-20, (height/2), width-80, (height/2)],
        stroke: 'white',
        strokeWidth: 10,
      });
      
    addHorizontalLine.on('click touchend', function () {
        if (addHorizontalLine.opacity() > 0) {
          var t = document.getElementById("poseDesc");
          routeJson.poses[selectedPose].description = t.value;
          routeJson.poses.push(JSON.parse(JSON.stringify(routeJson.poses[selectedPose])))
          selectedPose++
          simpleText.text(""+(selectedPose+1)+"/"+routeJson.poses.length)
          checkArrows();
          arrowLayer.draw()
          updateSkeletonLayerLocations()
    }
    })

    

    backwardArrow = new Konva.Wedge({
        x: 5,
        y: stage.height() / 2,
        radius: 50,
        angle: 60,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 4,
        rotation: 330,
      });
      backwardArrow.on('click touchend', function () {
        var t = document.getElementById("poseDesc");
        routeJson.poses[selectedPose].description = t.value;
          if (selectedPose > 0)
                selectedPose--;
        t.value = routeJson.poses[selectedPose].description;
          simpleText.text(""+(selectedPose+1)+"/"+routeJson.poses.length)
          checkArrows();
          arrowLayer.draw()
          updateSkeletonLayerLocations();
      })
      checkArrows();
    // add the shape to the layer
    arrowLayer.add(forwardArrow);
    arrowLayer.add(backwardArrow);
    arrowLayer.add(addVerticalLine);
    arrowLayer.add(addHorizontalLine);
    arrowLayer.add(simpleText);
    arrowLayer.add(deleteText);
    // add the layer to the stage
    stage.add(arrowLayer);
    
}

function checkArrows () {
    simpleText.text(""+(selectedPose+1)+"/"+routeJson.poses.length)
    if (selectedPose == 0) {
        backwardArrow.opacity(0.0);
    } else {
        backwardArrow.opacity(1.0);
    }
    if (selectedPose == (routeJson.poses.length-1)) {
        forwardArrow.opacity(0.0);
        forwardArrow.moveToBottom();
        addVerticalLine.opacity(1.0);
        addHorizontalLine.opacity(1.0);
    } else {
        forwardArrow.opacity(1.0);
        addVerticalLine.opacity(0.0);
        addHorizontalLine.opacity(0.0);
        addVerticalLine.moveToBottom();
        addHorizontalLine.moveToBottom();
    }
}

initJson();
initCanvas();


let img; let poseNet; let poses = [];
let selectedPose = 0;
let poseText;
let width = window.innerWidth;
let height = window.innerHeight-150;
let arrowLayer, backwardArrow, forwardArrow, rotationTransformer;
let stage = new Konva.Stage({
    container: 'buttonContainer',
    width: width,
    height: height,
});
let imageSrc
try {
    imageSrc = localStorage.getItem('capturedImage')
} catch (error) {
    console.log(error)
}


let defaultPose =  {
    "description": "",
    "rotation": 0,
    "leftAnkle" : {
        "x": 0,
        "y": 0
    },
    "leftKnee" : {
        "x": 0,
        "y": 0
    },
    "leftHip" : {
        "x": 0,
        "y": 0
    },
    "rightAnkle" : {
        "x": 0,
        "y": 0
    },
    "rightKnee" : {
        "x": 0,
        "y": 0
    },
    "rightHip" : {
        "x": 0,
        "y": 0
    },
    "leftWrist" : {
        "x": 0,
        "y": 0
    },
    "leftElbow" : {
        "x": 0,
        "y": 0
    },
    "leftShoulder" : {
        "x": 0,
        "y": 0
    },
    "rightWrist" : {
        "x": 0,
        "y": 0
    },
    "rightElbow" : {
        "x": 0,
        "y": 0
    },
    "rightShoulder" : {
        "x": 0,
        "y": 0
    },
    "body" : {
        "x": 0,
        "y": 0
    },
    "head": {
        "x": 0,
        "y": 0
    },
    "nose": {
        "x": 0,
        "y": 0
    }
}

let routeJson = {
    "routeName": "My cool route",
    "routeDescription": "This route is very hard, uses a lot of slopers",
    "stickmanLimits": {
        "leftCalf": 100,
        "leftThigh": 100,
        "rightCalf": 100,
        "rightThigh": 100,
        "leftForearm": 100,
        "leftUpperArm": 100,
        "rightForearm": 100,
        "rightUpperArm": 100,
        "bodyWidth": 100,
        "bodyHeight": 100
    },
    "poses": [
       
    ]
}

let skeletonLayer, bodyGroup, leftLowerLeg, leftUpperLeg, leftAnkleAnchor, leftKneeAnchor, leftHipAnchor, rightLowerLeg, rightUpperLeg, rightAnkleAnchor, rightKneeAnchor, rightHipAnchor, leftForearm, leftUpperArm, leftWristAnchor, leftElbowAnchor, leftShoulderAnchor, rightForearm, rightUpperArm, rightWristAnchor, rightElbowAnchor, rightShoulderAnchor, bodyAnchor; 

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

function updateSkeletonLayerLocations () {
    // Set the X/Y coordinates as well as rotation to what is stored in the selected poses routeJson.
    
    // This "resets" the location and rotation for the body group
    // so that we can add a different location/rotation at the end
    bodyGroup.rotation(0)
    rotationTransformer.rotation(0)
    bodyGroup.absolutePosition({
        x: 0,
        y: 0
    });

    // Set the anchors to the desired locations and then the limbs match the anchors
    leftKneeAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].leftKnee.x,
        y: routeJson.poses[selectedPose].leftKnee.y
    });
    leftHipAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].leftHip.x,
        y: routeJson.poses[selectedPose].leftHip.y
    });
    leftAnkleAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].leftAnkle.x,
        y: routeJson.poses[selectedPose].leftAnkle.y
    });
    leftLowerLeg.points([leftAnkleAnchor.x(), leftAnkleAnchor.y(), leftKneeAnchor.x(), leftKneeAnchor.y()])
    leftUpperLeg.points([leftKneeAnchor.x(), leftKneeAnchor.y(), leftHipAnchor.x(), leftHipAnchor.y()])
    
    rightAnkleAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].rightAnkle.x,
        y: routeJson.poses[selectedPose].rightAnkle.y
      });
    rightKneeAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].rightKnee.x,
        y: routeJson.poses[selectedPose].rightKnee.y
      });
    rightHipAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].rightHip.x,
        y: routeJson.poses[selectedPose].rightHip.y
    });
    rightLowerLeg.points([rightAnkleAnchor.x(), rightAnkleAnchor.y(), rightKneeAnchor.x(), rightKneeAnchor.y()])
    rightUpperLeg.points([rightKneeAnchor.x(), rightKneeAnchor.y(), rightHipAnchor.x(), rightHipAnchor.y()])
    
    leftWristAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].leftWrist.x,
        y: routeJson.poses[selectedPose].leftWrist.y
      });
    leftElbowAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].leftElbow.x,
        y: routeJson.poses[selectedPose].leftElbow.y
      });
    leftShoulderAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].leftShoulder.x,
        y: routeJson.poses[selectedPose].leftShoulder.y
    });
    leftForearm.points([leftWristAnchor.x(), leftWristAnchor.y(), leftElbowAnchor.x(), leftElbowAnchor.y()])
    leftUpperArm.points([leftElbowAnchor.x(), leftElbowAnchor.y(), leftShoulderAnchor.x(), leftShoulderAnchor.y()])

    rightWristAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].rightWrist.x,
        y: routeJson.poses[selectedPose].rightWrist.y
      });
    rightElbowAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].rightElbow.x,
        y: routeJson.poses[selectedPose].rightElbow.y
      });
    rightShoulderAnchor.absolutePosition({
        x: routeJson.poses[selectedPose].rightShoulder.x,
        y: routeJson.poses[selectedPose].rightShoulder.y
    });
    rightForearm.points([rightWristAnchor.x(), rightWristAnchor.y(), rightElbowAnchor.x(), rightElbowAnchor.y()])
    rightUpperArm.points([rightElbowAnchor.x(), rightElbowAnchor.y(), rightShoulderAnchor.x(), rightShoulderAnchor.y()])


    //Body anchor is based on the anchor points
    bodyAnchor.points([rightShoulderAnchor.x(), rightShoulderAnchor.y(), leftShoulderAnchor.x(), leftShoulderAnchor.y(), leftHipAnchor.x(), leftHipAnchor.y(), rightHipAnchor.x(), rightHipAnchor.y()])
    
    // Now we apply the rotation and position for the current pose, which takes all the points
    // that were placed locally, and then moves them to where they need to be
    rotationTransformer.rotation(routeJson.poses[selectedPose].rotation)
    bodyGroup.rotation(routeJson.poses[selectedPose].rotation)
    bodyGroup.absolutePosition({
        x: routeJson.poses[selectedPose].body.x,
        y: routeJson.poses[selectedPose].body.y
    });

    skeletonLayer.draw();
}

function makeSkeletonLayer () {
    // Let's begin by creating a skeleton layer which will
    // hold all of our limbs, body, and transformer.
    skeletonLayer = new Konva.Layer()

    /**
     * Left Leg
     */

    leftUpperLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftKnee.x, routeJson.poses[selectedPose].leftKnee.y, routeJson.poses[selectedPose].leftHip.x, routeJson.poses[selectedPose].leftHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    leftLowerLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftAnkle.x, routeJson.poses[selectedPose].leftAnkle.y, routeJson.poses[selectedPose].leftKnee.x, routeJson.poses[selectedPose].leftKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    leftHipAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftHip.x,
        y: routeJson.poses[selectedPose].leftHip.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    leftKneeAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftKnee.x,
        y: routeJson.poses[selectedPose].leftKnee.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = leftHipAnchor.absolutePosition().x;
            var y = leftHipAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.leftThigh;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1) {
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            }
            else return pos;
        },
    })

    leftKneeAnchor.on('dragmove', function() {
        leftUpperLeg.points([
            leftKneeAnchor.x(), 
            leftKneeAnchor.y(), 
            leftHipAnchor.x(), 
            leftHipAnchor.y()
        ])

        leftLowerLeg.points([
            leftAnkleAnchor.x(),
            leftAnkleAnchor.y(),
            leftKneeAnchor.x(),
            leftKneeAnchor.y()
        ])
        routeJson.poses[selectedPose].leftKnee.x = leftKneeAnchor.x()
        routeJson.poses[selectedPose].leftKnee.y = leftKneeAnchor.y()
    })

    leftAnkleAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftAnkle.x,
        y: routeJson.poses[selectedPose].leftAnkle.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = leftKneeAnchor.absolutePosition().x;
            var y = leftKneeAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.leftCalf;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1)
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            else return pos;
        },
    })

    leftAnkleAnchor.on('dragmove', function() {
        leftLowerLeg.points([
            leftAnkleAnchor.x(), 
            leftAnkleAnchor.y(),
            leftKneeAnchor.x(), 
            leftKneeAnchor.y()
        ])
        routeJson.poses[selectedPose].leftAnkle.x = leftAnkleAnchor.x()
        routeJson.poses[selectedPose].leftAnkle.y = leftAnkleAnchor.y()
    })

    /**
     * Right Leg
     */

    rightUpperLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightKnee.x, routeJson.poses[selectedPose].rightKnee.y, routeJson.poses[selectedPose].rightHip.x, routeJson.poses[selectedPose].rightHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    rightLowerLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightAnkle.x, routeJson.poses[selectedPose].rightAnkle.y, routeJson.poses[selectedPose].rightKnee.x, routeJson.poses[selectedPose].rightKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    rightHipAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightHip.x,
        y: routeJson.poses[selectedPose].rightHip.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    rightKneeAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightKnee.x,
        y: routeJson.poses[selectedPose].rightKnee.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = rightHipAnchor.absolutePosition().x;
            var y = rightHipAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.rightThigh;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1) {
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            }
            else return pos;
        },
    })

    rightKneeAnchor.on('dragmove', function() {
        rightUpperLeg.points([
            rightKneeAnchor.x(), 
            rightKneeAnchor.y(), 
            rightHipAnchor.x(), 
            rightHipAnchor.y()
        ])

        rightLowerLeg.points([
            rightAnkleAnchor.x(),
            rightAnkleAnchor.y(),
            rightKneeAnchor.x(),
            rightKneeAnchor.y()
        ])
        routeJson.poses[selectedPose].rightKnee.x = rightKneeAnchor.x()
        routeJson.poses[selectedPose].rightKnee.y = rightKneeAnchor.y()
    })

    rightAnkleAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightAnkle.x,
        y: routeJson.poses[selectedPose].rightAnkle.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = rightKneeAnchor.absolutePosition().x;
            var y = rightKneeAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.rightCalf;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1) {
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            }
            else return pos;
        },
    })

    rightAnkleAnchor.on('dragmove', function() {
        rightLowerLeg.points([
            rightAnkleAnchor.x(), 
            rightAnkleAnchor.y(), 
            rightKneeAnchor.x(), 
            rightKneeAnchor.y()
        ])
        routeJson.poses[selectedPose].rightAnkle.x = rightAnkleAnchor.x()
        routeJson.poses[selectedPose].rightAnkle.y = rightAnkleAnchor.y()
    })

    /**
     * Left Arm
     */

    leftUpperArm = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftElbow.x, routeJson.poses[selectedPose].leftElbow.y, routeJson.poses[selectedPose].leftShoulder.x, routeJson.poses[selectedPose].leftShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    leftForearm = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftWrist.x, routeJson.poses[selectedPose].leftWrist.y, routeJson.poses[selectedPose].leftElbow.x, routeJson.poses[selectedPose].leftElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    leftShoulderAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftShoulder.x,
        y: routeJson.poses[selectedPose].leftShoulder.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    leftElbowAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftElbow.x,
        y: routeJson.poses[selectedPose].leftElbow.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = leftShoulderAnchor.absolutePosition().x;
            var y = leftShoulderAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.leftUpperArm;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1) {
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            }
            else return pos;
        },
    })

    leftElbowAnchor.on('dragmove', function() {
        leftForearm.points([
            leftWristAnchor.x(), 
            leftWristAnchor.y(), 
            leftElbowAnchor.x(), 
            leftElbowAnchor.y()
        ])

        leftUpperArm.points([
            leftElbowAnchor.x(),
            leftElbowAnchor.y(),
            leftShoulderAnchor.x(),
            leftShoulderAnchor.y()
        ])
        routeJson.poses[selectedPose].leftElbow.x = leftElbowAnchor.x()
        routeJson.poses[selectedPose].leftElbow.y = leftElbowAnchor.y()
    });

    leftWristAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftWrist.x,
        y: routeJson.poses[selectedPose].leftWrist.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = leftElbowAnchor.absolutePosition().x;
            var y = leftElbowAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.leftForearm;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1) {
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            }
            else return pos;
        },
    })

    leftWristAnchor.on('dragmove', function() {
        leftForearm.points([
            leftWristAnchor.x(), 
            leftWristAnchor.y(), 
            leftElbowAnchor.x(), 
            leftElbowAnchor.y()
        ])
        routeJson.poses[selectedPose].leftWrist.x = leftWristAnchor.x()
        routeJson.poses[selectedPose].leftWrist.y = leftWristAnchor.y()
    });
 
    /**
     * Right Arm
     */

    rightUpperArm = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightElbow.x, routeJson.poses[selectedPose].rightElbow.y, routeJson.poses[selectedPose].rightShoulder.x, routeJson.poses[selectedPose].rightShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    rightForearm = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightWrist.x, routeJson.poses[selectedPose].rightWrist.y, routeJson.poses[selectedPose].rightElbow.x, routeJson.poses[selectedPose].rightElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    rightShoulderAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightShoulder.x,
        y: routeJson.poses[selectedPose].rightShoulder.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    rightElbowAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightElbow.x,
        y: routeJson.poses[selectedPose].rightElbow.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = rightShoulderAnchor.absolutePosition().x;
            var y = rightShoulderAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.rightUpperArm;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1) {
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            }
            else return pos;
        },
    })

    rightElbowAnchor.on('dragmove', function() {
        rightForearm.points([
            rightWristAnchor.x(), 
            rightWristAnchor.y(), 
            rightElbowAnchor.x(), 
            rightElbowAnchor.y()
        ])

        rightUpperArm.points([
            rightElbowAnchor.x(),
            rightElbowAnchor.y(),
            rightShoulderAnchor.x(),
            rightShoulderAnchor.y()
        ])
        routeJson.poses[selectedPose].rightElbow.x = rightElbowAnchor.x()
        routeJson.poses[selectedPose].rightElbow.y = rightElbowAnchor.y()
    });

    rightWristAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightWrist.x,
        y: routeJson.poses[selectedPose].rightWrist.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            var x = rightElbowAnchor.absolutePosition().x;
            var y = rightElbowAnchor.absolutePosition().y;
            var radius = routeJson.stickmanLimits.rightForearm;
            var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
            if (scale < 1) {
                return {
                    y: Math.round((pos.y - y) * scale + y),
                    x: Math.round((pos.x - x) * scale + x),
                };
            }
            else return pos;
        },
    })

    rightWristAnchor.on('dragmove', function() {
        rightForearm.points([
            rightWristAnchor.x(), 
            rightWristAnchor.y(), 
            rightElbowAnchor.x(), 
            rightElbowAnchor.y()
        ])
        routeJson.poses[selectedPose].rightWrist.x = rightWristAnchor.x()
        routeJson.poses[selectedPose].rightWrist.y = rightWristAnchor.y()
    });

    //-----------------------------------------------------------------------------------------------

    /**
     * Create and initialize any event listeners for the bodyGroup
     */
    bodyGroup = new Konva.Group({
        draggable: true,
    });

    bodyGroup.on('dragend', function () {
        routeJson.poses[selectedPose].body.x = bodyGroup.x()
        routeJson.poses[selectedPose].body.y = bodyGroup.y()
    })

    bodyGroup.on('mouseover', function () {
        document.body.style.cursor = 'pointer';
    });

    bodyGroup.on('mouseout', function () {
        document.body.style.cursor = 'default';
    });

    //-------------------------------------------------------------------------------------------------

    // Create the body
    bodyAnchor = new Konva.Line({
        points: [rightShoulderAnchor.x(), rightShoulderAnchor.y(), leftShoulderAnchor.x(), leftShoulderAnchor.y(), leftHipAnchor.x(), leftHipAnchor.y(), rightHipAnchor.x(), rightHipAnchor.y()],
        closed: true,
        stroke: 'black',
        fill: '#000',
        strokeWidth: 5,
        opacity: 0.5
    })

    const bodyWidth = Math.abs(routeJson.poses[selectedPose].leftShoulder.x - routeJson.poses[selectedPose].rightShoulder.x)

    head = new Konva.Circle({
        x: (leftShoulderAnchor.x() + rightShoulderAnchor.x()) / 2,
        y: routeJson.poses[selectedPose].nose.y,
        radius: bodyWidth / 2,
        fill: 'black',
        opacity: 0.5
    })

    /** 
     * Let's begin adding the limbs and bodyAnchor to the bodyGroup.
     */

    // Body
    bodyGroup.add(bodyAnchor)

    bodyGroup.add(head)

    // Left/right arm(s)
    bodyGroup.add(leftUpperArm)
    bodyGroup.add(rightUpperArm)
    bodyGroup.add(leftForearm)
    bodyGroup.add(rightForearm)
    bodyGroup.add(leftShoulderAnchor)
    bodyGroup.add(rightShoulderAnchor)
    bodyGroup.add(leftElbowAnchor)
    bodyGroup.add(rightElbowAnchor)
    bodyGroup.add(leftWristAnchor)
    bodyGroup.add(rightWristAnchor)

    // Left/right leg(s)
    bodyGroup.add(leftUpperLeg)
    bodyGroup.add(rightUpperLeg)
    bodyGroup.add(leftLowerLeg)
    bodyGroup.add(rightLowerLeg)
    bodyGroup.add(leftAnkleAnchor)
    bodyGroup.add(rightAnkleAnchor)
    bodyGroup.add(leftKneeAnchor)
    bodyGroup.add(rightKneeAnchor)
    bodyGroup.add(leftHipAnchor)
    bodyGroup.add(rightHipAnchor)
    

    // Create a Konva Transformer, rotationTransformer which allows
    // creates its own group that can be rotated/scaled. In our case
    // we will disable resizing but keep rotation and apply it only
    // to the bodyGroup node.
    rotationTransformer = new Konva.Transformer({
        nodes: [bodyGroup],
        resizeEnabled: false,
    })
    
    // Add the rotationTransformer and bodyGroup to the layer to be added to the canvas.
    skeletonLayer.add(rotationTransformer)
    skeletonLayer.add(bodyGroup)

    // Sets the rotation value and X/Y coordinates of the body group when 
    // any transformation on the body is finished.
    rotationTransformer.on('transformend', function() {
        routeJson.poses[selectedPose].rotation = rotationTransformer.rotation()
        routeJson.poses[selectedPose].body.x = bodyGroup.x()
        routeJson.poses[selectedPose].body.y = bodyGroup.y()
    })

    bodyGroup.x(routeJson.poses[selectedPose].body.x)
    bodyGroup.y(routeJson.poses[selectedPose].body.ya)
    // Move the non-anchor lines to the bottom, so that the anchors appear on top.
    leftUpperArm.moveToBottom()
    leftForearm.moveToBottom()
    leftUpperLeg.moveToBottom()
    leftLowerLeg.moveToBottom()
    rightUpperArm.moveToBottom()
    rightForearm.moveToBottom()
    rightUpperLeg.moveToBottom()
    rightLowerLeg.moveToBottom()

    // Move the body anchor to the bottom so that limbs appear over the body.
    bodyAnchor.moveToBottom()

    // Finally, add the entire skeletonLayer to the canvas stage.
    stage.add(skeletonLayer)

}


// https://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
 }

initJson();
initCanvas();


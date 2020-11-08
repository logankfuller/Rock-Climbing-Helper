let img; let poseNet; let poses = [];
let selectedPose = 0;
let poseText;
let width = 515;
let height = 720;
let arrowLayer, backwardArrow, forwardArrow, rotationTransformer;
let stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});

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
    // Retrieve the JSON string
    var jsonString = localStorage.getItem("routeJson");
    
    // Parse the JSON string back to JS object
    routeJson = JSON.parse(jsonString);
}

function calcMaxLength (a, b) {
    return Math.sqrt(Math.pow(a.x-b.x, 2) + (Math.pow(a.y-b.y, 2)))
}

/**
 * Initializes the canvas and adds the route image, forward/backward arrows, and status text to the canvas.
 */
function initCanvas() {
    let imageLayer = new Konva.Layer()
    
    // Create and add our route image to the canvas
    let imageObj = new Image();
    imageObj.src = 'data/route.jpg';
    imageObj.onload = function () {
      let route = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: 515,
        height: 720,
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
    poseText = new Konva.Text({
        x: stage.width()-75,
        y: stage.height()-50,
        text:""+(selectedPose+1)+"/"+routeJson.poses.length,
        fontSize: 30,
        fontFamily: 'Sans-serif',
        fill: 'White',
      });
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
    forwardArrow.on('click', function () {
        if (selectedPose < routeJson.poses.length-1)
            selectedPose++
        poseText.text(`${selectedPose + 1}/${routeJson.poses.length}`)
        checkArrows();
        arrowLayer.draw()
        updateSkeletonLayerLocations()
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
    backwardArrow.on('click', function () {
        if (selectedPose > 0)
            selectedPose--;
        poseText.text(`${selectedPose + 1}/${routeJson.poses.length}`)
        checkArrows();
        arrowLayer.draw()
        updateSkeletonLayerLocations();
    })
    checkArrows();

    arrowLayer.add(forwardArrow);
    arrowLayer.add(backwardArrow);
    arrowLayer.add(poseText);

    stage.add(arrowLayer);
}

// Checks to see whether or not the forward/previous arrow should be visible.
function checkArrows () {
    if (selectedPose == 0) {
        backwardArrow.opacity(0.0);
    } else {
        backwardArrow.opacity(1.0);
    }
    if (selectedPose == (routeJson.poses.length-1)) {
        forwardArrow.opacity(0.0);
    } else {
        forwardArrow.opacity(1.0);
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
    skeletonLayer = new Konva.Layer()

    leftLowerLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftAnkle.x, routeJson.poses[selectedPose].leftAnkle.y, routeJson.poses[selectedPose].leftKnee.x, routeJson.poses[selectedPose].leftKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    leftUpperLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftKnee.x, routeJson.poses[selectedPose].leftKnee.y, routeJson.poses[selectedPose].leftHip.x, routeJson.poses[selectedPose].leftHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    leftAnkleAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftAnkle.x,
        y: routeJson.poses[selectedPose].leftAnkle.y,
        radius: 10,
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

    leftKneeAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftKnee.x,
        y: routeJson.poses[selectedPose].leftKnee.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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

    leftHipAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftHip.x,
        y: routeJson.poses[selectedPose].leftHip.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })


    rightLowerLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightAnkle.x, routeJson.poses[selectedPose].rightAnkle.y, routeJson.poses[selectedPose].rightKnee.x, routeJson.poses[selectedPose].rightKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    rightUpperLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightKnee.x, routeJson.poses[selectedPose].rightKnee.y, routeJson.poses[selectedPose].rightHip.x, routeJson.poses[selectedPose].rightHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    rightAnkleAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightAnkle.x,
        y: routeJson.poses[selectedPose].rightAnkle.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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

    rightKneeAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightKnee.x,
        y: routeJson.poses[selectedPose].rightKnee.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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

    rightHipAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightHip.x,
        y: routeJson.poses[selectedPose].rightHip.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })


    leftForearm = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftWrist.x, routeJson.poses[selectedPose].leftWrist.y, routeJson.poses[selectedPose].leftElbow.x, routeJson.poses[selectedPose].leftElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    leftUpperArm = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftElbow.x, routeJson.poses[selectedPose].leftElbow.y, routeJson.poses[selectedPose].leftShoulder.x, routeJson.poses[selectedPose].leftShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    leftWristAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftWrist.x,
        y: routeJson.poses[selectedPose].leftWrist.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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

    leftElbowAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftElbow.x,
        y: routeJson.poses[selectedPose].leftElbow.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
    })
    
    leftShoulderAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftShoulder.x,
        y: routeJson.poses[selectedPose].leftShoulder.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
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
 
    rightForearm = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightWrist.x, routeJson.poses[selectedPose].rightWrist.y, routeJson.poses[selectedPose].rightElbow.x, routeJson.poses[selectedPose].rightElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    rightUpperArm = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightElbow.x, routeJson.poses[selectedPose].rightElbow.y, routeJson.poses[selectedPose].rightShoulder.x, routeJson.poses[selectedPose].rightShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    rightWristAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightWrist.x,
        y: routeJson.poses[selectedPose].rightWrist.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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

    rightElbowAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightElbow.x,
        y: routeJson.poses[selectedPose].rightElbow.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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

    rightShoulderAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightShoulder.x,
        y: routeJson.poses[selectedPose].rightShoulder.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })
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
    // Create the body
    bodyAnchor = new Konva.Line({
        points: [rightShoulderAnchor.x(), rightShoulderAnchor.y(), leftShoulderAnchor.x(), leftShoulderAnchor.y(), leftHipAnchor.x(), leftHipAnchor.y(), rightHipAnchor.x(), rightHipAnchor.y()],
        closed: true,
        stroke: 'black',
        fill: '#000',
        strokeWidth: 5,
    })

    bodyGroup.add(bodyAnchor)

     bodyGroup.add(leftAnkleAnchor)
     bodyGroup.add(rightAnkleAnchor)
     bodyGroup.add(leftKneeAnchor)
     bodyGroup.add(rightKneeAnchor)
     bodyGroup.add(leftHipAnchor)
     bodyGroup.add(rightHipAnchor)

     bodyGroup.add(leftShoulderAnchor)
     bodyGroup.add(rightShoulderAnchor)
     bodyGroup.add(leftElbowAnchor)
     bodyGroup.add(rightElbowAnchor)
     bodyGroup.add(leftWristAnchor)
     bodyGroup.add(rightWristAnchor)

     bodyGroup.add(leftUpperLeg)
     bodyGroup.add(rightUpperLeg)
     bodyGroup.add(leftLowerLeg)
     bodyGroup.add(rightLowerLeg)
     bodyGroup.add(leftUpperArm)
     bodyGroup.add(rightUpperArm)
     bodyGroup.add(leftForearm)
     bodyGroup.add(rightForearm)

    

    rotationTransformer = new Konva.Transformer({
        nodes: [bodyGroup],
        resizeEnabled: false,
    })
    
    skeletonLayer.add(rotationTransformer)

    skeletonLayer.add(bodyGroup)

    // Sets the rotation value of the body group 
    rotationTransformer.on('transformend', function() {
        routeJson.poses[selectedPose].rotation = rotationTransformer.rotation()
        routeJson.poses[selectedPose].body.x = bodyGroup.x()
        routeJson.poses[selectedPose].body.y = bodyGroup.y()
    })

    leftUpperArm.moveToBottom()
    leftForearm.moveToBottom()
    leftUpperLeg.moveToBottom()
    leftLowerLeg.moveToBottom()
    rightUpperArm.moveToBottom()
    rightForearm.moveToBottom()
    rightUpperLeg.moveToBottom()
    rightLowerLeg.moveToBottom()


    stage.add(skeletonLayer)
}


setup();
initCanvas();

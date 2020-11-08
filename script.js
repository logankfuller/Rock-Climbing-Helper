let img; let poseNet; let poses = [];
let selectedPose = 0;
let simpleText;
let width = 515;
let height = 720;
let arrowLayer;
let backwardArrow;
let forwardArrow;

let stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});

let skeletonLayer;

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

let bodyGroup, leftLowerLeg, leftUpperLeg, leftAnkleAnchor, leftKneeAnchor, leftHipAnchor, rightLowerLeg, rightUpperLeg, rightAnkleAnchor, rightKneeAnchor, rightHipAnchor, leftForearm, leftUpperArm, leftWristAnchor, leftElbowAnchor, leftShoulderAnchor, rightForearm, rightUpperArm, rightWristAnchor, rightElbowAnchor, rightShoulderAnchor, bodyAnchor; 

function setup() {
    createCanvas(width, height);
    img = createImg('data/route.jpg', imageReady);
    img.size(width, height);
    img.hide(); // hide the image in the browser
    frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
}

function imageReady() {
    let options = {
        imageScaleFactor: 1,
        minConfidence: 0.1
    }
    poseNet = ml5.poseNet(modelReady, options);

    poseNet.on('pose', function (results) {
        poses = results;
    });
}

function modelReady() {
    select('#status').html('Model Loaded');
    poseNet.singlePose(img)
}

function draw() {
    if (poses.length > 0) {
        initJson()
        initCanvas();
        noLoop();
    }
}

function calcMaxLength (a, b) {
    return Math.sqrt(Math.pow(a.x-b.x, 2) + (Math.pow(a.y-b.y, 2)))
}

/** 
 * Initializes the JSON by calculating the limb length limits, and default pose coordinates
 */
function initJson() {
    for(pose in defaultPose) {
        if(pose in poses[selectedPose].pose) {
            defaultPose[pose] = poses[selectedPose].pose[pose]
        }
    }

    routeJson.poses.push(JSON.parse(JSON.stringify(defaultPose)))
    routeJson.poses.push(JSON.parse(JSON.stringify(defaultPose)))

    // Calculate and assign limb length limits
    routeJson.stickmanLimits.rightCalf = calcMaxLength(defaultPose.rightAnkle, defaultPose.rightKnee)
    routeJson.stickmanLimits.rightThigh = calcMaxLength(defaultPose.rightHip, defaultPose.rightKnee)
    routeJson.stickmanLimits.leftCalf = calcMaxLength(defaultPose.leftAnkle, defaultPose.leftKnee)
    routeJson.stickmanLimits.leftThigh = calcMaxLength(defaultPose.leftHip, defaultPose.leftKnee)
    routeJson.stickmanLimits.leftUpperArm = calcMaxLength(defaultPose.leftShoulder, defaultPose.leftElbow)
    routeJson.stickmanLimits.leftForearm = calcMaxLength(defaultPose.leftElbow, defaultPose.leftWrist)
    routeJson.stickmanLimits.rightUpperArm = calcMaxLength(defaultPose.rightShoulder, defaultPose.rightElbow)
    routeJson.stickmanLimits.rightForearm = calcMaxLength(defaultPose.rightElbow, defaultPose.rightWrist)

    // Calculate and assign bodyWidth limit
    let bodyWidth = (calcMaxLength(defaultPose.leftShoulder, defaultPose.rightShoulder) + calcMaxLength(defaultPose.leftHip, defaultPose.rightHip)) / 2
    routeJson.stickmanLimits.bodyWidth = bodyWidth

    // Calculate and assign bodyHeight limit
    let bodyHeight = (calcMaxLength(defaultPose.leftShoulder, defaultPose.leftHip) + calcMaxLength(defaultPose.rightShoulder, defaultPose.rightHip)) / 2
    routeJson.stickmanLimits.bodyHeight = bodyHeight

    console.log("Finished initializing JSON: ", routeJson)
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

    arrowLayer = new Konva.Layer();

    simpleText = new Konva.Text({
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
        simpleText.text(`${selectedPose + 1}/${routeJson.poses.length}`)
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
        simpleText.text(`${selectedPose + 1}/${routeJson.poses.length}`)
        checkArrows();
        arrowLayer.draw()
        updateSkeletonLayerLocations();
    })
    
    checkArrows();

    arrowLayer.add(forwardArrow);
    arrowLayer.add(backwardArrow);
    arrowLayer.add(simpleText);

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
    console.log("Body Group: ", bodyGroup)
    console.log("Route JSON: ", routeJson.poses)
    console.log("Transform: ", bodyGroup.getAbsoluteRotation())

    // Set the X/Y coordinates as well as rotation to what is stored in the selected poses routeJson.
    bodyGroup.absolutePosition({
        x: routeJson.poses[selectedPose].body.x,
        y: routeJson.poses[selectedPose].body.y
    })
    console.log("setting body group x position to " + routeJson.poses[selectedPose].body.x)
    //bodyGroup.x(routeJson.poses[selectedPose].body.x)
    console.log("setting body group y position to " + routeJson.poses[selectedPose].body.y)
    //bodyGroup.y(routeJson.poses[selectedPose].body.y)
    console.log("setting body group rotation to " + routeJson.poses[selectedPose].rotation)
    bodyGroup.rotation(routeJson.poses[selectedPose].rotation)

    console.log("Position should be ", routeJson.poses[selectedPose].body)
    console.log("But found it at: ", bodyGroup.position())
    
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

    bodyAnchor.points([rightShoulderAnchor.x(), rightShoulderAnchor.y(), leftShoulderAnchor.x(), leftShoulderAnchor.y(), leftHipAnchor.x(), leftHipAnchor.y(), rightHipAnchor.x(), rightHipAnchor.y()])
    bodyGroup.x(routeJson.poses[selectedPose].body.x)
    bodyGroup.y(routeJson.poses[selectedPose].body.y)
    skeletonLayer.draw();
}

function makeSkeletonLayer () {
    skeletonLayer = new Konva.Layer()

    bodyGroup = new Konva.Group({
        draggable: true,
    });

    bodyGroup.on('dragend', function () {
        routeJson.poses[selectedPose].body.x = bodyGroup.x()
        routeJson.poses[selectedPose].body.y = bodyGroup.y()
    })

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
            var x = routeJson.poses[selectedPose].leftKnee.x + bodyGroup.x();
            var y = routeJson.poses[selectedPose].leftKnee.y + bodyGroup.y();
            var radius = routeJson.stickmanLimits.leftCalf;
            console.log(radius)
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
        let distance = calcMaxLength(routeJson.poses[selectedPose].leftAnkle, routeJson.poses[selectedPose].leftKnee)
        console.log(leftAnkleAnchor)
        console.log(distance)
        console.log('Distance Limit: ' + routeJson.stickmanLimits.leftCalf)
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

    // Create the body
    bodyAnchor = new Konva.Line({
        points: [rightShoulderAnchor.x(), rightShoulderAnchor.y(), leftShoulderAnchor.x(), leftShoulderAnchor.y(), leftHipAnchor.x(), leftHipAnchor.y(), rightHipAnchor.x(), rightHipAnchor.y()],
        closed: true,
        stroke: 'black',
        fill: '#000',
        strokeWidth: 5,
    })

    bodyGroup.add(bodyAnchor)

    // bodyGroup.add(leftAnkleAnchor)
    // bodyGroup.add(rightAnkleAnchor)
    // bodyGroup.add(leftKneeAnchor)
    // bodyGroup.add(rightKneeAnchor)
    // bodyGroup.add(leftHipAnchor)
    // bodyGroup.add(rightHipAnchor)

    // bodyGroup.add(leftShoulderAnchor)
    // bodyGroup.add(rightShoulderAnchor)
    // bodyGroup.add(leftElbowAnchor)
    // bodyGroup.add(rightElbowAnchor)
    // bodyGroup.add(leftWristAnchor)
    // bodyGroup.add(rightWristAnchor)

    // bodyGroup.add(leftUpperLeg)
    // bodyGroup.add(rightUpperLeg)
    // bodyGroup.add(leftLowerLeg)
    // bodyGroup.add(rightLowerLeg)
    // bodyGroup.add(leftUpperArm)
    // bodyGroup.add(rightUpperArm)
    // bodyGroup.add(leftForearm)
    // bodyGroup.add(rightForearm)

    bodyGroup.on('mouseover', function () {
        document.body.style.cursor = 'pointer';
    });

    bodyGroup.on('mouseout', function () {
        document.body.style.cursor = 'default';
    });

    let rotationTransformer = new Konva.Transformer({
        nodes: [bodyGroup],
        resizeEnabled: false,
    })
    skeletonLayer.add(rotationTransformer)

    skeletonLayer.add(bodyGroup)

    // Sets the rotation value of the body group 
    bodyGroup.on('transformend', function() {
        console.log("Setting rotation to " + bodyGroup.rotation() + " degrees.")
        routeJson.poses[selectedPose].rotation = bodyGroup.rotation()
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
let img; let poseNet; let poses = [];
let selectedPose = 0;
let poseText;
let width = window.innerWidth;
let height = window.innerHeight-150;
let nextButton, declineText, acceptText;
let stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});
let imageSrc = 'data/image4.jpg'

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

let skeletonLayer, bodyGroup, head, leftLowerLeg, leftUpperLeg, leftAnkleAnchor, leftKneeAnchor, leftHipAnchor, rightLowerLeg, rightUpperLeg, rightAnkleAnchor, rightKneeAnchor, rightHipAnchor, leftForearm, leftUpperArm, leftWristAnchor, leftElbowAnchor, leftShoulderAnchor, rightForearm, rightUpperArm, rightWristAnchor, rightElbowAnchor, rightShoulderAnchor, bodyAnchor; 

function setup() {
    createCanvas(0, 0);
    img = createImg(imageSrc, imageReady);
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
    calcLimits()
    
    

    console.log("Finished initializing JSON: ", routeJson)
}
function calcLimits() {
    // Calculate and assign limb length limits
    routeJson.stickmanLimits.rightCalf = calcMaxLength(routeJson.poses[selectedPose].rightAnkle, routeJson.poses[selectedPose].rightKnee)
    routeJson.stickmanLimits.rightThigh = calcMaxLength(routeJson.poses[selectedPose].rightHip, routeJson.poses[selectedPose].rightKnee)
    routeJson.stickmanLimits.leftCalf = calcMaxLength(routeJson.poses[selectedPose].leftAnkle, routeJson.poses[selectedPose].leftKnee)
    routeJson.stickmanLimits.leftThigh = calcMaxLength(routeJson.poses[selectedPose].leftHip, routeJson.poses[selectedPose].leftKnee)
    routeJson.stickmanLimits.leftUpperArm = calcMaxLength(routeJson.poses[selectedPose].leftShoulder, routeJson.poses[selectedPose].leftElbow)
    routeJson.stickmanLimits.leftForearm = calcMaxLength(routeJson.poses[selectedPose].leftElbow, routeJson.poses[selectedPose].leftWrist)
    routeJson.stickmanLimits.rightUpperArm = calcMaxLength(routeJson.poses[selectedPose].rightShoulder, routeJson.poses[selectedPose].rightElbow)
    routeJson.stickmanLimits.rightForearm = calcMaxLength(routeJson.poses[selectedPose].rightElbow, routeJson.poses[selectedPose].rightWrist)
    // Calculate and assign bodyWidth limit
    let bodyWidth = (calcMaxLength(routeJson.poses[selectedPose].leftShoulder, routeJson.poses[selectedPose].rightShoulder) + calcMaxLength(routeJson.poses[selectedPose].leftHip, routeJson.poses[selectedPose].rightHip)) / 2
    routeJson.stickmanLimits.bodyWidth = bodyWidth

    // Calculate and assign bodyHeight limit
    let bodyHeight = (calcMaxLength(routeJson.poses[selectedPose].leftShoulder, routeJson.poses[selectedPose].leftHip) + calcMaxLength(routeJson.poses[selectedPose].rightShoulder, routeJson.poses[selectedPose].rightHip)) / 2
    routeJson.stickmanLimits.bodyHeight = bodyHeight
}

function setDraggable (isDraggable){
    leftHipAnchor.draggable(isDraggable)
    leftKneeAnchor.draggable(isDraggable)
    leftAnkleAnchor.draggable(isDraggable)

    rightHipAnchor.draggable(isDraggable)
    rightKneeAnchor.draggable(isDraggable)
    rightAnkleAnchor.draggable(isDraggable)

    leftShoulderAnchor.draggable(isDraggable)
    leftElbowAnchor.draggable(isDraggable)
    leftWristAnchor.draggable(isDraggable)

    rightShoulderAnchor.draggable(isDraggable)
    rightElbowAnchor.draggable(isDraggable)
    rightWristAnchor.draggable(isDraggable)

    bodyGroup.draggable(isDraggable)
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
      let route = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: width,
        height: height,
      });

      imageLayer.add(route);
      imageLayer.batchDraw();
    };
    
    stage.add(imageLayer)

    makeSkeletonLayer()

    let controlLayer = new Konva.Layer();
    acceptText = new Konva.Text({
        x: (width/2)+100,
        y: stage.height()-60,
        text:"Accept",
        fontSize: 30,
        fontFamily: 'Sans-serif',
        fill: 'Green',
        opacity: 0.0
    });
    acceptText.on('click touchend', function () {
        calcLimits();
        localStorage.setItem("routeJson", JSON.stringify(routeJson));
        window.location.href = "edit_page.html";
      }) 
    declineText = new Konva.Text({
        x: (width/2)-200,
        y: stage.height()-60,
        text:"Reject",
        fontSize: 30,
        fontFamily: 'Sans-serif',
        fill: 'Red',
        opacity: 0.0
    });
    declineText.on('click touchend', function () {
        if (acceptText.opacity != 0.0) {
            nextButton.opacity(1.0)
            declineText.opacity(0.0)
            acceptText.opacity(0.0)
            routeJson.poses[selectedPose] = JSON.parse(JSON.stringify(defaultPose))
            updateSkeletonLayerLocations()
            setDraggable(false)
            controlLayer.draw()
        }
      }) 
    let backSquare = new Konva.Rect({
        x: 0,
        y: height-100,
        width: width,
        height: 100,
        fill: 'black',
        opacity: 0.5,
        strokeWidth: 4
      });
    nextButton = new Konva.Circle({
        x: width/2,
        y: height-50,
        radius: 25,
        stroke: '#ffff',
        fill: '#ffff',
        strokeWidth: 2
    })
    nextButton.on('click touchend', function() {
        print('a')
        
        if (nextButton.opacity != 0.0) {
            print('o')
            nextButton.opacity(0.0)
            declineText.opacity(1.0)
            acceptText.opacity(1.0)
            setDraggable(true)
            bodyGroup.draggable(false)
            controlLayer.draw()
        }
    })
    controlLayer.add(backSquare)
    controlLayer.add(nextButton)
    controlLayer.add(declineText)
    controlLayer.add(acceptText)

    
    stage.add(controlLayer)
}

function updateSkeletonLayerLocations () {
    // Set the X/Y coordinates as well as rotation to what is stored in the selected poses routeJson.
    
    // This "resets" the location and rotation for the body group
    // so that we can add a different location/rotation at the end
    bodyGroup.rotation(0)
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
    
    // that were placed locally, and then moves them to where they need to be
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
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true
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
        radius: 5,
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
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
    })
    leftHipAnchor.on('dragmove', function() {
        leftUpperLeg.points([
            leftKneeAnchor.x(), 
            leftKneeAnchor.y(), 
            leftHipAnchor.x(), 
            leftHipAnchor.y()
        ])
        bodyAnchor.points([
            rightShoulderAnchor.x(), 
            rightShoulderAnchor.y(), 
            leftShoulderAnchor.x(), 
            leftShoulderAnchor.y(), 
            leftHipAnchor.x(), 
            leftHipAnchor.y(), 
            rightHipAnchor.x(), 
            rightHipAnchor.y()])
        routeJson.poses[selectedPose].leftHip.x = leftHipAnchor.x()
        routeJson.poses[selectedPose].leftHip.y = leftHipAnchor.y()
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
        radius: 5,
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
        radius: 5,
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
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
    })
    rightHipAnchor.on('dragmove', function() {
        rightUpperLeg.points([
            rightKneeAnchor.x(), 
            rightKneeAnchor.y(), 
            rightHipAnchor.x(), 
            rightHipAnchor.y()
        ])
        bodyAnchor.points([
            rightShoulderAnchor.x(), 
            rightShoulderAnchor.y(), 
            leftShoulderAnchor.x(), 
            leftShoulderAnchor.y(), 
            leftHipAnchor.x(), 
            leftHipAnchor.y(), 
            rightHipAnchor.x(), 
            rightHipAnchor.y()])
        routeJson.poses[selectedPose].rightHip.x = rightHipAnchor.x()
        routeJson.poses[selectedPose].rightHip.y = rightHipAnchor.y()
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
        radius: 5,
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
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
    })
    
    leftShoulderAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftShoulder.x,
        y: routeJson.poses[selectedPose].leftShoulder.y,
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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

    leftShoulderAnchor.on('dragmove', function() {
        leftUpperArm.points([
            leftElbowAnchor.x(),
            leftElbowAnchor.y(),
            leftShoulderAnchor.x(),
            leftShoulderAnchor.y()
        ])
        bodyAnchor.points([
            rightShoulderAnchor.x(), 
            rightShoulderAnchor.y(), 
            leftShoulderAnchor.x(), 
            leftShoulderAnchor.y(), 
            leftHipAnchor.x(), 
            leftHipAnchor.y(), 
            rightHipAnchor.x(), 
            rightHipAnchor.y()])
        routeJson.poses[selectedPose].leftShoulder.x = leftShoulderAnchor.x()
        routeJson.poses[selectedPose].leftShoulder.y = leftShoulderAnchor.y()
    })
    
 
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
        radius: 5,
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
        radius: 5,
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
        radius: 5,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
    })
    rightShoulderAnchor.on('dragmove', function() {
        rightUpperArm.points([
            rightElbowAnchor.x(),
            rightElbowAnchor.y(),
            rightShoulderAnchor.x(),
            rightShoulderAnchor.y()
        ])
        bodyAnchor.points([
            rightShoulderAnchor.x(), 
            rightShoulderAnchor.y(), 
            leftShoulderAnchor.x(), 
            leftShoulderAnchor.y(), 
            leftHipAnchor.x(), 
            leftHipAnchor.y(), 
            rightHipAnchor.x(), 
            rightHipAnchor.y()])
        routeJson.poses[selectedPose].rightShoulder.x = rightShoulderAnchor.x()
        routeJson.poses[selectedPose].rightShoulder.y = rightShoulderAnchor.y()
    })
    bodyGroup = new Konva.Group({
        draggable: false,
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

    bodyGroup.add(bodyAnchor)

    bodyGroup.add(head)

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

    

    skeletonLayer.add(bodyGroup)

    leftUpperArm.moveToBottom()
    leftForearm.moveToBottom()
    leftUpperLeg.moveToBottom()
    leftLowerLeg.moveToBottom()
    rightUpperArm.moveToBottom()
    rightForearm.moveToBottom()
    rightUpperLeg.moveToBottom()
    rightLowerLeg.moveToBottom()


    setDraggable(false)

    stage.add(skeletonLayer)
}
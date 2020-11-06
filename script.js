let img; let poseNet; let poses = [];
let selectedPose = 0;

let width = 515;
    let height = 720;

    let stage = new Konva.Stage({
        container: 'container',
        width,
        height
    });

let defaultPose =  {
    "Description": "",
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

function setup() {
    createCanvas(515, 720);
    img = createImg('data/route.jpg', imageReady);
    img.size(width, height);
    img.hide(); // hide the image in the browser
    frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
}
// when the image is ready, then load up poseNet
function imageReady(){
    // set some options
    let options = {
        imageScaleFactor: 1,
        minConfidence: 0.1
    }
    
    // assign poseNet
    poseNet = ml5.poseNet(modelReady, options);

    // This sets up an event that listens to 'pose' events
    poseNet.on('pose', function (results) {
        poses = results;
        console.log(poses)
    });
}
// when poseNet is ready, do the detection
function modelReady() {
    select('#status').html('Model Loaded');
    
    // When the model is ready, run the singlePose() function...
    // If/When a pose is detected, poseNet.on('pose', ...) will be listening for the detection results 
    // in the draw() loop, if there are any poses, then carry out the draw commands
    poseNet.singlePose(img)
}
// draw() will not show anything until poses are found
function draw() {
    if (poses.length > 0) {
        image(img, 0, 0, width, height);
        initJson()
        initCanvas();
        drawSkeleton(poses);
        drawKeypoints(poses);
        //drawStickman();
        noLoop(); // stop looping when the poses are estimated
    }
}
// The following comes from https://ml5js.org/docs/posenet-webcam // A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                fill(255);
                stroke(20);
                strokeWeight(4);
                ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
            }
        }
    }
}
// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255);
            strokeWeight(1);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}

function initJson() {

    defaultPose.leftAnkle = poses[selectedPose].pose.leftAnkle
    defaultPose.leftKnee = poses[selectedPose].pose.leftKnee
    defaultPose.leftHip = poses[selectedPose].pose.leftHip

    defaultPose.rightAnkle = poses[selectedPose].pose.rightAnkle
    defaultPose.rightKnee = poses[selectedPose].pose.rightKnee
    defaultPose.rightHip = poses[selectedPose].pose.rightHip

    defaultPose.leftWrist = poses[selectedPose].pose.leftWrist
    defaultPose.leftElbow = poses[selectedPose].pose.leftElbow
    defaultPose.leftShoulder = poses[selectedPose].pose.leftShoulder

    defaultPose.rightWrist = poses[selectedPose].pose.rightWrist
    defaultPose.rightElbow = poses[selectedPose].pose.rightElbow
    defaultPose.rightShoulder = poses[selectedPose].pose.rightShoulder

    routeJson.poses.push(defaultPose)


    routeJson.stickmanLimits.rightCalf = calcMaxLength(defaultPose.rightAnkle, defaultPose.rightKnee)
    routeJson.stickmanLimits.rightThigh = calcMaxLength(defaultPose.rightHip, defaultPose.rightKnee)
    routeJson.stickmanLimits.leftCalf = calcMaxLength(defaultPose.leftAnkle, defaultPose.leftKnee)
    routeJson.stickmanLimits.leftThigh = calcMaxLength(defaultPose.leftHip, defaultPose.leftKnee)
    routeJson.stickmanLimits.leftUpperArm = calcMaxLength(defaultPose.leftShoulder, defaultPose.leftElbow)
    routeJson.stickmanLimits.leftForearm = calcMaxLength(defaultPose.leftElbow, defaultPose.leftWrist)
    routeJson.stickmanLimits.rightUpperArm = calcMaxLength(defaultPose.rightShoulder, defaultPose.rightElbow)
    routeJson.stickmanLimits.rightForearm = calcMaxLength(defaultPose.rightElbow, defaultPose.rightWrist)
    let bodyWidth = (calcMaxLength(defaultPose.leftShoulder, defaultPose.rightShoulder) + calcMaxLength(defaultPose.leftHip, defaultPose.rightHip))/2
    routeJson.stickmanLimits.bodyWidth = bodyWidth
    let bodyHeight = (calcMaxLength(defaultPose.leftShoulder, defaultPose.leftHip) + calcMaxLength(defaultPose.rightShoulder, defaultPose.rightHip))/2
    routeJson.stickmanLimits.bodyHeight = bodyHeight

    console.log(routeJson)
}

function calcMaxLength (a, b) {
    return (Math.sqrt(Math.pow(Math.abs(a.x-b.x),2) + Math.pow(Math.abs(a.y-b.x),2)))
}

function initCanvas() {
    let layer = new Konva.Layer()

    let bodyGroup = new Konva.Group();




    let leftLowerLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftAnkle.x, routeJson.poses[selectedPose].leftAnkle.y, routeJson.poses[selectedPose].leftKnee.x, routeJson.poses[selectedPose].leftKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let leftUpperLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftKnee.x, routeJson.poses[selectedPose].leftKnee.y, routeJson.poses[selectedPose].leftHip.x, routeJson.poses[selectedPose].leftHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    let leftAnkleAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftAnkle.x,
        y: routeJson.poses[selectedPose].leftAnkle.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
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
        routeJson.poses[selectedPose].leftKnee.x = leftKneeAnchor.x()
        routeJson.poses[selectedPose].leftKnee.y = leftKneeAnchor.y()
    })

    let leftKneeAnchor = new Konva.Circle({
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
        routeJson.poses[selectedPose].leftHip.x = leftHipAnchor.x()
        routeJson.poses[selectedPose].leftHip.y = leftHipAnchor.y()
        routeJson.poses[selectedPose].leftAnkle.x = leftAnkleAnchor.x()
        routeJson.poses[selectedPose].leftAnkle.y = leftAnkleAnchor.y()
        routeJson.poses[selectedPose].leftKnee.x = leftKneeAnchor.x()
        routeJson.poses[selectedPose].leftKnee.y = leftKneeAnchor.y()
    })

    let leftHipAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftHip.x,
        y: routeJson.poses[selectedPose].leftHip.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })


    let rightLowerLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightAnkle.x, routeJson.poses[selectedPose].rightAnkle.y, routeJson.poses[selectedPose].rightKnee.x, routeJson.poses[selectedPose].rightKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let rightUpperLeg = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightKnee.x, routeJson.poses[selectedPose].rightKnee.y, routeJson.poses[selectedPose].rightHip.x, routeJson.poses[selectedPose].rightHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    let rightAnkleAnchor = new Konva.Circle({
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
        routeJson.poses[selectedPose].rightKnee.x = rightKneeAnchor.x()
        routeJson.poses[selectedPose].rightKnee.y = rightKneeAnchor.y()
    })

    let rightKneeAnchor = new Konva.Circle({
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

        routeJson.poses[selectedPose].rightHip.x = rightHipAnchor.x()
        routeJson.poses[selectedPose].rightHip.y = rightHipAnchor.y()
        routeJson.poses[selectedPose].rightAnkle.x = rightAnkleAnchor.x()
        routeJson.poses[selectedPose].rightAnkle.y = rightAnkleAnchor.y()
        routeJson.poses[selectedPose].rightKnee.x = rightKneeAnchor.x()
        routeJson.poses[selectedPose].rightKnee.y = rightKneeAnchor.y()
    })

    let rightHipAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightHip.x,
        y: routeJson.poses[selectedPose].rightHip.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })


    let leftForearm = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftWrist.x, routeJson.poses[selectedPose].leftWrist.y, routeJson.poses[selectedPose].leftElbow.x, routeJson.poses[selectedPose].leftElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    let leftUpperArm = new Konva.Line({
        points: [routeJson.poses[selectedPose].leftElbow.x, routeJson.poses[selectedPose].leftElbow.y, routeJson.poses[selectedPose].leftShoulder.x, routeJson.poses[selectedPose].leftShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let leftWristAnchor = new Konva.Circle({
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
        routeJson.poses[selectedPose].leftElbow.x = leftElbowAnchor.x()
        routeJson.poses[selectedPose].leftElbow.y = leftElbowAnchor.y()
    });

    let leftElbowAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftElbow.x,
        y: routeJson.poses[selectedPose].leftElbow.y,
        radius: 10,
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
        routeJson.poses[selectedPose].leftWrist.x = leftWristAnchor.x()
        routeJson.poses[selectedPose].leftWrist.y = leftWristAnchor.y()
        routeJson.poses[selectedPose].leftElbow.x = leftElbowAnchor.x()
        routeJson.poses[selectedPose].leftElbow.y = leftElbowAnchor.y()
        routeJson.poses[selectedPose].leftShoulder.x = leftShoulderAnchor.x()
        routeJson.poses[selectedPose].leftShoulder.y = leftShoulderAnchor.y()
    });
    
    let leftShoulderAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftShoulder.x,
        y: routeJson.poses[selectedPose].leftShoulder.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })

    



    let rightForearm = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightWrist.x, routeJson.poses[selectedPose].rightWrist.y, routeJson.poses[selectedPose].rightElbow.x, routeJson.poses[selectedPose].rightElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    let rightUpperArm = new Konva.Line({
        points: [routeJson.poses[selectedPose].rightElbow.x, routeJson.poses[selectedPose].rightElbow.y, routeJson.poses[selectedPose].rightShoulder.x, routeJson.poses[selectedPose].rightShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let rightWristAnchor = new Konva.Circle({
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
        routeJson.poses[selectedPose].rightElbow.x = rightElbowAnchor.x()
        routeJson.poses[selectedPose].rightElbow.y = rightElbowAnchor.y()
    });

    let rightElbowAnchor = new Konva.Circle({
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
        routeJson.poses[selectedPose].rightWrist.x = rightWristAnchor.x()
        routeJson.poses[selectedPose].rightWrist.y = rightWristAnchor.y()
        routeJson.poses[selectedPose].rightElbow.x = rightElbowAnchor.x()
        routeJson.poses[selectedPose].rightElbow.y = rightElbowAnchor.y()
        routeJson.poses[selectedPose].rightShoulder.x = rightShoulderAnchor.x()
        routeJson.poses[selectedPose].rightShoulder.y = rightShoulderAnchor.y()
    });

    let rightShoulderAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightShoulder.x,
        y: routeJson.poses[selectedPose].rightShoulder.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })

    // Create the body
    let bodyAnchor = new Konva.Line({
        points: [rightShoulderAnchor.x(), rightShoulderAnchor.y(), leftShoulderAnchor.x(), leftShoulderAnchor.y(), leftHipAnchor.x(), leftHipAnchor.y(), rightHipAnchor.x(), rightHipAnchor.y()],
        closed: true,
        stroke: 'black',
        fill: '#000',
        strokeWidth: 5,
        draggable: true
    })

    bodyGroup.add(rightAnkleAnchor)
    bodyGroup.add(rightKneeAnchor)
    bodyGroup.add(rightHipAnchor)
    bodyGroup.add(rightLowerLeg)
    bodyGroup.add(rightUpperLeg)

    bodyAnchor.on('dragmove', function() {
        console.log(bodyGroup)
    });

    

    layer.add(bodyAnchor)

    layer.add(rightAnkleAnchor)
    layer.add(rightKneeAnchor)
    layer.add(rightHipAnchor)
    layer.add(rightLowerLeg)
    layer.add(rightUpperLeg)
    
    layer.add(rightElbowAnchor)
    layer.add(rightShoulderAnchor)
    layer.add(rightWristAnchor)
    layer.add(rightForearm)
    layer.add(rightUpperArm)

    layer.add(leftAnkleAnchor)
    layer.add(leftKneeAnchor)
    layer.add(leftHipAnchor)
    layer.add(leftLowerLeg)
    layer.add(leftUpperLeg)

    layer.add(leftElbowAnchor)
    layer.add(leftShoulderAnchor)
    layer.add(leftWristAnchor)
    layer.add(leftForearm)
    layer.add(leftUpperArm)
    

    let imageLayer = new Konva.Layer()

    var imageObj = new Image();
    imageObj.onload = function () {
      var route = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: 515,
        height: 720,
      });

      // add the shape to the layer
      imageLayer.add(route);
      imageLayer.batchDraw();
    };
    imageObj.src = '/data/route.jpg';
    
    stage.add(imageLayer)
    stage.add(layer)

}

// function drawStickman() {
//     var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
//     fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    
//     function makeLine(coords) {
//       return new fabric.Line(coords, {
//         fill: 'red',
//         stroke: 'red',
//         strokeWidth: 5,
//         selectable: false,
//         evented: false,
//       });
//     }

//     // poses[0].pose.leftAnkle.x
  
//     // Hmm, how to convert coordinates from exact coordinate to corner coordinates?
//     // 0,0            100,0
//     //
//     //                               ---> 30,50 = +30 on x, -50 from top of y-axis
//     //
//     // 0,100          100,100
//     var leftLowerLeg = makeLine([ 250, 175, 250, 250 ]);
  
//     canvas.add(leftLowerLeg);
//   }
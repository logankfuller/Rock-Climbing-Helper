let img; let poseNet; let poses = [];

console.log()

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

function calcMaxLength (a, b) {
    console.log(a.x, a.y, b.x, b.y)
    return (Math.sqrt(Math.pow(Math.abs(a.x-b.x,2)) + Math.pow(Math.abs(a.y-b.x,2))))
}

function initCanvas() {
    let width = 515
    let height = 720

    let stage = new Konva.Stage({
        container: 'container',
        width,
        height
    });

    let layer = new Konva.Layer()

    let bodyGroup = new Konva.Group({
        draggable: true
    });

    let leftLowerLeg = new Konva.Line({
        points: [poses[0].pose.leftAnkle.x, poses[0].pose.leftAnkle.y, poses[0].pose.leftKnee.x, poses[0].pose.leftKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let leftUpperLeg = new Konva.Line({
        points: [poses[0].pose.leftKnee.x, poses[0].pose.leftKnee.y, poses[0].pose.leftHip.x, poses[0].pose.leftHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    let leftAnkleAnchor = new Konva.Circle({
        x: poses[0].pose.leftAnkle.x,
        y: poses[0].pose.leftAnkle.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
    })

    leftAnkleAnchor.on('dragmove', function() {
        let distance = calcMaxLength(leftAnkleAnchor.attrs, leftKneeAnchor.attrs)
        console.log('Distance: ' + distance)
        if(distance > 200) {
            console.log('too long')
        } else {
            console.log('too short')
        }
        leftLowerLeg.points([
            leftAnkleAnchor.x(), 
            leftAnkleAnchor.y(), 
            leftKneeAnchor.x(), 
            leftKneeAnchor.y()
        ])
    })

    let leftKneeAnchor = new Konva.Circle({
        x: poses[0].pose.leftKnee.x,
        y: poses[0].pose.leftKnee.y,
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
    })

    let leftHipAnchor = new Konva.Circle({
        x: poses[0].pose.leftHip.x,
        y: poses[0].pose.leftHip.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })

    let rightLowerLeg = new Konva.Line({
        points: [poses[0].pose.rightAnkle.x, poses[0].pose.rightAnkle.y, poses[0].pose.rightKnee.x, poses[0].pose.rightKnee.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let rightUpperLeg = new Konva.Line({
        points: [poses[0].pose.rightKnee.x, poses[0].pose.rightKnee.y, poses[0].pose.rightHip.x, poses[0].pose.rightHip.y],
        stroke: 'green',
        strokeWidth: 5,
    })

    let rightAnkleAnchor = new Konva.Circle({
        x: poses[0].pose.rightAnkle.x,
        y: poses[0].pose.rightAnkle.y,
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
    })

    let rightKneeAnchor = new Konva.Circle({
        x: poses[0].pose.rightKnee.x,
        y: poses[0].pose.rightKnee.y,
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
    })

    let rightHipAnchor = new Konva.Circle({
        x: poses[0].pose.rightHip.x,
        y: poses[0].pose.rightHip.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })

    let leftForearm = new Konva.Line({
        points: [poses[0].pose.leftWrist.x, poses[0].pose.leftWrist.y, poses[0].pose.leftElbow.x, poses[0].pose.leftElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    let leftUpperArm = new Konva.Line({
        points: [poses[0].pose.leftElbow.x, poses[0].pose.leftElbow.y, poses[0].pose.leftShoulder.x, poses[0].pose.leftShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let leftWristAnchor = new Konva.Circle({
        x: poses[0].pose.leftWrist.x,
        y: poses[0].pose.leftWrist.y,
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
    });

    let leftElbowAnchor = new Konva.Circle({
        x: poses[0].pose.leftElbow.x,
        y: poses[0].pose.leftElbow.y,
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
    });

    let leftShoulderAnchor = new Konva.Circle({
        x: poses[0].pose.leftShoulder.x,
        y: poses[0].pose.leftShoulder.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        //draggable: true,
    })

    let rightForearm = new Konva.Line({
        points: [poses[0].pose.rightWrist.x, poses[0].pose.rightWrist.y, poses[0].pose.rightElbow.x, poses[0].pose.rightElbow.y],
        stroke: 'blue',
        strokeWidth: 5,
    })

    let rightUpperArm = new Konva.Line({
        points: [poses[0].pose.rightElbow.x, poses[0].pose.rightElbow.y, poses[0].pose.rightShoulder.x, poses[0].pose.rightShoulder.y],
        stroke: 'red',
        strokeWidth: 5,
    })

    let rightWristAnchor = new Konva.Circle({
        x: poses[0].pose.rightWrist.x,
        y: poses[0].pose.rightWrist.y,
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
    });

    let rightElbowAnchor = new Konva.Circle({
        x: poses[0].pose.rightElbow.x,
        y: poses[0].pose.rightElbow.y,
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
    });

    let rightShoulderAnchor = new Konva.Circle({
        x: poses[0].pose.rightShoulder.x,
        y: poses[0].pose.rightShoulder.y,
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
    })

    bodyGroup.add(bodyAnchor)

    bodyGroup.add(leftAnkleAnchor)
    bodyGroup.add(rightAnkleAnchor)
    bodyGroup.add(leftKneeAnchor)
    bodyGroup.add(rightKneeAnchor)
    bodyGroup.add(leftHipAnchor)
    bodyGroup.add(rightHipAnchor)

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

    bodyGroup.on('mouseover', function () {
        document.body.style.cursor = 'pointer';
    });

    bodyGroup.on('mouseout', function () {
        document.body.style.cursor = 'default';
    });

    layer.add(bodyGroup)

    leftUpperArm.moveToBottom()
    leftForearm.moveToBottom()
    leftUpperLeg.moveToBottom()
    leftLowerLeg.moveToBottom()
    rightUpperArm.moveToBottom()
    rightForearm.moveToBottom()
    rightUpperLeg.moveToBottom()
    rightLowerLeg.moveToBottom()

    stage.add(layer)
}
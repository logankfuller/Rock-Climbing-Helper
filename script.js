let img; let poseNet; let poses = [];
function setup() {
    createCanvas(360, 640);
    img = createImg('data/model.jpg', imageReady);
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
        let leftLegX = poses[0].pose.leftAnkle.x - poses[0].pose.leftHip.x;
        let leftLegY = poses[0].pose.leftAnkle.y - poses[0].pose.leftHip.y;
        
        let rightLegX = poses[0].pose.rightAnkle.x - poses[0].pose.rightHip.x;
        let rightLegY = poses[0].pose.rightAnkle.y - poses[0].pose.rightHip.y;

        document.getElementById('left_leg').innerHTML = "Left Leg Length: " + Math.sqrt(Math.abs(Math.pow(leftLegX, 2) + Math.pow(leftLegY, 2)))
        document.getElementById('right_leg').innerHTML = "Right Leg Length: " + Math.sqrt(Math.abs(Math.pow(rightLegX, 2) + Math.pow(rightLegY, 2)))
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
        drawSkeleton(poses);
        drawKeypoints(poses);
        drawStickman();
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

function drawStickman() {
    console.log('hello')
    var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
  
    function makeCircle(left, top, line1, line2, line3, line4) {
      var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666'
      });
      c.hasControls = c.hasBorders = false;
  
      c.line1 = line1;
      c.line2 = line2;
      c.line3 = line3;
      c.line4 = line4;
  
      return c;
    }
  
    function makeLine(coords) {
      return new fabric.Line(coords, {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 5,
        selectable: false,
        evented: false,
      });
    }
  
    var line = makeLine([ 250, 125, 250, 175 ]),
        line2 = makeLine([ 250, 175, 250, 250 ]),
        line3 = makeLine([ 250, 250, 300, 350]),
        line4 = makeLine([ 250, 250, 200, 350]),
        line5 = makeLine([ 250, 175, 175, 225 ]),
        line6 = makeLine([ 250, 175, 325, 225 ]);
  
    canvas.add(line, line2, line3, line4, line5, line6);
  
    canvas.add(
      makeCircle(line.get('x1'), line.get('y1'), null, line),
      makeCircle(line.get('x2'), line.get('y2'), line, line2, line5, line6),
      makeCircle(line2.get('x2'), line2.get('y2'), line2, line3, line4),
      makeCircle(line3.get('x2'), line3.get('y2'), line3),
      makeCircle(line4.get('x2'), line4.get('y2'), line4),
      makeCircle(line5.get('x2'), line5.get('y2'), line5),
      makeCircle(line6.get('x2'), line6.get('y2'), line6)
    );
  
    canvas.on('object:moving', function(e) {
      var p = e.target;
      p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
      p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
      p.line3 && p.line3.set({ 'x1': p.left, 'y1': p.top });
      p.line4 && p.line4.set({ 'x1': p.left, 'y1': p.top });
      canvas.renderAll();
    });
  }
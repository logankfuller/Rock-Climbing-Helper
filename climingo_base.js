let img; let poseNet; let poses = [];
let selectedPose = 0;
let poseText;
let width = window.innerWidth;
let height = window.innerHeight-150;
let editMode = false;

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


// https://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
}

function genericBoundFunction(pos, x, y, radius) {
        var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        if (scale < 1 && editMode)
        return {
            y: Math.round((pos.y - y) * scale + y),
            x: Math.round((pos.x - x) * scale + x),
        };
        else return pos;
}


function updateSkeletonLayerLocations () {
    // Set the X/Y coordinates as well as rotation to what is stored in the selected poses routeJson.
    
    // This "resets" the location and rotation for the body group
    // so that we can add a different location/rotation at the end
    bodyGroup.rotation(0)
    if (typeof rotationTransformer !== 'undefined') {
        rotationTransformer.rotation(0)
    }
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
    if (typeof rotationTransformer !== 'undefined') {
        rotationTransformer.rotation(routeJson.poses[selectedPose].rotation)
    }
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    leftKneeAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftKnee.x,
        y: routeJson.poses[selectedPose].leftKnee.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, leftHipAnchor.absolutePosition().x, leftHipAnchor.absolutePosition().y, routeJson.stickmanLimits.leftThigh)
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, leftKneeAnchor.absolutePosition().x, leftKneeAnchor.absolutePosition().y, routeJson.stickmanLimits.leftCalf)
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    rightKneeAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightKnee.x,
        y: routeJson.poses[selectedPose].rightKnee.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, rightHipAnchor.absolutePosition().x, rightHipAnchor.absolutePosition().y, routeJson.stickmanLimits.rightThigh)
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, rightKneeAnchor.absolutePosition().x, rightKneeAnchor.absolutePosition().y, routeJson.stickmanLimits.rightCalf)
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    leftElbowAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].leftElbow.x,
        y: routeJson.poses[selectedPose].leftElbow.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, leftShoulderAnchor.absolutePosition().x, leftShoulderAnchor.absolutePosition().y, routeJson.stickmanLimits.leftUpperArm)
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, leftElbowAnchor.absolutePosition().x, leftElbowAnchor.absolutePosition().y, routeJson.stickmanLimits.leftForearm)
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
    })

    rightElbowAnchor = new Konva.Circle({
        x: routeJson.poses[selectedPose].rightElbow.x,
        y: routeJson.poses[selectedPose].rightElbow.y,
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, rightShoulderAnchor.absolutePosition().x, rightShoulderAnchor.absolutePosition().y, routeJson.stickmanLimits.rightUpperArm)
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
        radius: 10,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        draggable: true,
        dragBoundFunc: function (pos) {
            return genericBoundFunction(pos, rightElbowAnchor.absolutePosition().x, rightElbowAnchor.absolutePosition().y, routeJson.stickmanLimits.rightForearm)
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
        draggable: editMode,
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
    if (editMode) {
    rotationTransformer = new Konva.Transformer({
        nodes: [bodyGroup],
        resizeEnabled: false,
    })
    
    // Add the rotationTransformer and bodyGroup to the layer to be added to the canvas.
    skeletonLayer.add(rotationTransformer)
    }

    skeletonLayer.add(bodyGroup)

    if (editMode) {
    // Sets the rotation value and X/Y coordinates of the body group when 
    // any transformation on the body is finished.
    rotationTransformer.on('transformend', function() {
        routeJson.poses[selectedPose].rotation = rotationTransformer.rotation()
        routeJson.poses[selectedPose].body.x = bodyGroup.x()
        routeJson.poses[selectedPose].body.y = bodyGroup.y()
    })
    }

    bodyGroup.x(routeJson.poses[selectedPose].body.x)
    bodyGroup.y(routeJson.poses[selectedPose].body.y)
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
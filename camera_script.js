let nextButton, declineText, acceptText;
let stage
let loadingMessage = document.getElementById("loading");
let canvasContainer = document.getElementById("container");
let buttonContainer = document.getElementById("buttonContainer");
let controlLayer
let uploading = false

// // Clear localStorage so that we're not working with previously saved data
// // This would eventually be replaced by a database
// localStorage.clear()

// I just want to state that I have to do this the hard way because 
// stupid phone cameras keep needing 512 MP cameras so that people
// can share dumb photos.

if(!window.indexedDB) {
    alert("IndexedDB is not supported. This app WILL NOT work with this browser.")
}

let request = window.indexedDB.open("ImageDB", 1),
    db,
    tx,
    store

request.onupgradeneeded = function(e) {
    let db = request.result,
        store = db.createObjectStore("ImageStore", {
            keyPath: "key"
        })
}

request.onerror = function(e) {
    console.log("There was an error: " + e.target.errorCode)
}

request.onsuccess = function(e) {
    db = request.result

    db.onerror = function(e) {
        console.log("ERROR" + e.target.errorCode)
    }
}

// Immediately hide the container holding the canvas which we will show later
canvasContainer.style.display = "none"
loadingMessage.style.display = "none"



function setup() {
    createCanvas(0, 0);
    frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
}

function imageReady() {
    let imageHeightWidth = calculateAspectRatioFit(img.width, img.height, width, height)

    img.size(imageHeightWidth.width, imageHeightWidth.height);
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

        declineText.opacity(1.0)
        acceptText.opacity(1.0)
        setDraggable(true)
        bodyGroup.draggable(false)
        controlLayer.draw()
        document.getElementById('message').innerHTML = "Is this picture ok? Adjust the stickman if the dimensions are not correct.";

    }
}

function calcMaxLength(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + (Math.pow(a.y - b.y, 2)))
}

/** 
 * Initializes the JSON by calculating the limb length limits, and default pose coordinates
 */
function initJson() {
    for (pose in defaultPose) {
        if (pose in poses[selectedPose].pose) {
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

function setDraggable(isDraggable) {
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
        let imageHeightWidth = calculateAspectRatioFit(imageObj.width, imageObj.height, width, height)
        let route = new Konva.Image({
            x: (width - imageHeightWidth.width) / 2,
            y: 0,
            image: imageObj,
            width: imageHeightWidth.width,
            height: imageHeightWidth.height,
        });
        routeJson.poses[selectedPose].body.x += (width - imageHeightWidth.width) / 2
        defaultPose.body.x = routeJson.poses[selectedPose].body.x
        updateSkeletonLayerLocations()

        imageLayer.add(route);
        imageLayer.batchDraw();
    };

    stage.add(imageLayer)
    editMode = false;
    makeSkeletonLayer()
    loadingMessage.style.display = "none"
    canvasContainer.style.display = "flex"

    controlLayer = new Konva.Layer();
    acceptText = new Konva.Text({
        x: (width / 2) + 100,
        y: stage.height() - 60,
        text: "Accept",
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
        x: (width / 2) - 200,
        y: stage.height() - 60,
        text: "Reject",
        fontSize: 30,
        fontFamily: 'Sans-serif',
        fill: 'Red',
        opacity: 0.0
    });
    declineText.on('click touchend', function () {
        if (acceptText.opacity != 0.0) {
            declineText.opacity(0.0)
            acceptText.opacity(0.0)
            routeJson.poses[selectedPose] = JSON.parse(JSON.stringify(defaultPose))
            updateSkeletonLayerLocations()
            setDraggable(false)
            controlLayer.draw()
            document.getElementById('message').innerHTML = "Please begin by taking a picture of yourself next to the route.";
            buttonContainer.style.display = "none"
            canvasContainer.style.display = "none"
        }
    })
    let backSquare = new Konva.Rect({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        fill: 'black',
        opacity: 0.5,
        strokeWidth: 4
    });

    controlLayer.add(backSquare)

    controlLayer.add(declineText)
    controlLayer.add(acceptText)


    stage.add(controlLayer)
}


function readURL() {
    loadingMessage.style.display = "flex"

    if (this.files && this.files[0]) {

        var reader = new FileReader();

        reader.onload = function (e) {
            tx = db.transaction("ImageStore", "readwrite")
            store = tx.objectStore("ImageStore")
            store.put({key: 1, image: e.target.result})
            //localStorage.setItem('capturedImage', e.target.result)
            try {
                // imageSrc = localStorage.getItem('capturedImage')
                dbImagePromise = store.get(1)
                dbImagePromise.onsuccess = function() {
                    imageSrc = dbImagePromise.result.image
                    
                    stage = new Konva.Stage({
                        container: 'container',
                        width: width,
                        height: height,
                    });
        
                    tx.oncomplete = function() {
                        db.close()
                    }
        
                    img = createImg(imageSrc, imageReady);
                    img.hide(); // hide the image in the browser
        
                    buttonContainer.style.display = "none"
                    canvasContainer.style.display = "none"
                }
            } catch (error) {
                console.log(error)
            }

            
        }

        reader.readAsDataURL(this.files[0]);
    }
}
const input = document.getElementById('uploadImage')
input.addEventListener('change', readURL)
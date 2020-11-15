let arrowLayer, backwardArrow, forwardArrow, rotationTransformer, addButton, saveButton;
let stage = new Konva.Stage({
  container: 'buttonContainer',
  width: width,
  height: height,
});

saveButton = document.getElementById('saveButton')
saveButton.addEventListener('click', function() {
  localStorage.setItem("routeJson", JSON.stringify(routeJson))
})

if (!window.indexedDB) {
  alert("IndexedDB is not supported. This app WILL NOT work with this browser.")
}

let request = window.indexedDB.open("ImageDB", 1),
  db,
  tx,
  store

request.onupgradeneeded = function (e) {
  let db = request.result,
    store = db.createObjectStore("ImageStore", {
      keyPath: "key"
    })
}

request.onerror = function (e) {
  console.log("There was an error: " + e.target.errorCode)
}

request.onsuccess = function (e) {
  db = request.result

  tx = db.transaction("ImageStore", "readwrite")
  store = tx.objectStore("ImageStore")
  dbImagePromise = store.get(1)
  dbImagePromise.onsuccess = function () {
    imageSrc = dbImagePromise.result.image

    initJson();
    initCanvas();
  }

  db.onerror = function (e) {
    console.log("ERROR" + e.target.errorCode)
  }
}

// function setup() {
//   createCanvas(0, 0);
//   img = createImg(imageSrc);
//   img.size(width, height);
//   img.hide(); // hide the image in the browser
//   frameRate(1);
// }

function calcMaxLength(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + (Math.pow(a.y - b.y, 2)))
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
      x: (width - imageHeightWidth.width) / 2,
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
    x: stage.width() - 75,
    y: stage.height() - 50,
    text: "" + (selectedPose + 1) + "/" + routeJson.poses.length,
    fontSize: 30,
    fontFamily: 'Sans-serif',
    fill: 'black',
  });


  deleteText = new Konva.Text({
    x: stage.width() - (170),
    y: stage.height() - 50,
    text: "Delete",
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
    x: stage.width() - 5,
    y: stage.height() / 2,
    radius: 50,
    angle: 60,
    fill: 'black',
    stroke: 'white',
    strokeWidth: 1,
    rotation: 150,
  });

  forwardArrow.on('click touchend', function () {
    var t = document.getElementById("poseDesc");
    routeJson.poses[selectedPose].description = t.value;

    if (selectedPose < routeJson.poses.length - 1)
      selectedPose++
    t.value = routeJson.poses[selectedPose].description;

    checkArrows();
    arrowLayer.draw()
    updateSkeletonLayerLocations()
  })

  forwardArrow.on('mousedown touchstart', function () {
    forwardArrow.scale({
      x: 1.25,
      y: 1.25
    });
    arrowLayer.draw()
    setTimeout(function () {
      forwardArrow.scale({
        x: 1,
        y: 1
      });
      arrowLayer.draw()
    }, 250)
  })

  addButton = new Konva.Group()

  addVerticalLine = new Konva.Line({
    points: [width - 50, (height / 2) - 30, width - 50, (height / 2) + 30],
    stroke: 'black',
    strokeWidth: 10,
  });

  addHorizontalLine = new Konva.Line({
    points: [width - 20, (height / 2), width - 80, (height / 2)],
    stroke: 'black',
    strokeWidth: 10,
  });

  addButton.add(addHorizontalLine)
  addButton.add(addVerticalLine)

  addButton.on('mousedown touchstart', function () {
    addHorizontalLine.stroke("green")
    addVerticalLine.stroke("green")
    setTimeout(function () {
      addHorizontalLine.stroke("black")
      addVerticalLine.stroke("black")
      arrowLayer.draw()
    }, 250)
  })

  addButton.on('mouseup touchend', function() {
    if (addButton.opacity() > 0) {
      var t = document.getElementById("poseDesc");
      routeJson.poses[selectedPose].description = t.value;
      routeJson.poses.push(JSON.parse(JSON.stringify(routeJson.poses[selectedPose])))
      selectedPose++
      simpleText.text("" + (selectedPose + 1) + "/" + routeJson.poses.length)
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
    fill: 'black',
    stroke: 'white',
    strokeWidth: 1,
    rotation: 330,
  });

  backwardArrow.on('click touchend', function () {
    var t = document.getElementById("poseDesc");
    routeJson.poses[selectedPose].description = t.value;
    if (selectedPose > 0)
      selectedPose--;
    t.value = routeJson.poses[selectedPose].description;
    simpleText.text("" + (selectedPose + 1) + "/" + routeJson.poses.length)
    checkArrows();
    arrowLayer.draw()
    updateSkeletonLayerLocations();
  })

  backwardArrow.on('mousedown touchstart', function () {
    backwardArrow.scale({
      x: 1.25,
      y: 1.25
    });
    arrowLayer.draw()
    setTimeout(function () {
      backwardArrow.scale({
        x: 1,
        y: 1
      });
      arrowLayer.draw()
    }, 250)
  })
  checkArrows();
  // add the shape to the layer
  arrowLayer.add(forwardArrow);
  arrowLayer.add(backwardArrow);
  arrowLayer.add(simpleText);
  arrowLayer.add(addButton)
  arrowLayer.add(deleteText);
  // add the layer to the stage
  stage.add(arrowLayer);

}

function checkArrows() {
  simpleText.text("" + (selectedPose + 1) + "/" + routeJson.poses.length)
  if (selectedPose == 0) {
    backwardArrow.opacity(0.0);
  } else {
    backwardArrow.opacity(1.0);
  }
  if (selectedPose == (routeJson.poses.length - 1)) {
    forwardArrow.opacity(0.0);
    forwardArrow.moveToBottom();
    addButton.opacity(1.0);
  } else {
    forwardArrow.opacity(1.0);
    addButton.opacity(0.0);
    addButton.moveToBottom();
  }
}
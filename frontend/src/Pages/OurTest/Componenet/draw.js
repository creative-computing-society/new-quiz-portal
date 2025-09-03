import {
  FaceLandmarker,
  DrawingUtils,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export let imagewithoutLandmark="";

const base64ToBlob = (base64, mime) => {
  const sliceSize = 1024;
  const byteCharacters = atob(base64);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);
  
  for (let sliceIndex = 0; sliceIndex < slicesCount; sliceIndex++) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);
    
    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; offset++, i++) {
      bytes[i] = byteCharacters.charCodeAt(offset);
    }
    
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  
  return new Blob(byteArrays, { type: mime });
};

const uploadToCloudinary = async (base64Image) => {
  try {
    const uploadPreset = "quizPortal";
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      console.warn("Cloudinary cloud name not configured");
      return null;
    }

    const blob = base64ToBlob(base64Image, "image/png");
    const data = JSON.parse(localStorage.getItem("user"));

    const renamedFile = new File([blob], `${data?.rollNo || 'user'}_${Date.now()}.png`, { 
      type: blob.type 
    });

    const formData = new FormData();
    formData.append("file", renamedFile);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("Image uploaded to Cloudinary:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Failed to upload to Cloudinary:", error);
    return null;
  }
};
async function start(video, canvas, callback) {
  var canvasCtx = canvas.getContext("2d");
  var drawingUtils = new DrawingUtils(canvasCtx);
  let lastFrameTime = -1;
  let results;
  let faceLandmarker = null;
  let isInitialized = false;

  try {
    faceLandmarker = await FaceLandmarker.createFromOptions(
      await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      ),
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 3,
      }
    );
    isInitialized = true;
    console.log("Face landmarker initialized successfully");
  } catch (error) {
    console.error("Failed to initialize face landmarker:", error);
    return {
      changeSize: () => {},
      callback,
      error: "Failed to initialize face detection"
    };
  }

  let lastCaptureTime = 0;
  let isRunning = false;

  async function loop() {
    if (!isInitialized || !faceLandmarker || !isRunning) {
      return;
    }

    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      console.warn("Invalid video dimensions, retrying...");
      setTimeout(() => window.requestAnimationFrame(loop), 100);
      return;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const currentTime = performance.now();
    if (currentTime - lastCaptureTime >= 30000) {
      try {
        const imageData = canvas.toDataURL("image/png");
        imagewithoutLandmark = imageData.split(",")[1];
        console.log("Captured image for proctoring");
        
        // Optional: Upload to cloudinary if configured
        // await uploadToCloudinary(imagewithoutLandmark);
        
        lastCaptureTime = currentTime;
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    }

    const startTimeMs = performance.now();
    if (lastFrameTime === video.currentTime) {
      if (isRunning) {
        window.requestAnimationFrame(loop);
      }
      return;
    }

    lastFrameTime = video.currentTime;
    try {
      results = await faceLandmarker.detectForVideo(video, startTimeMs);
      
      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        // Multiple faces detected - potential cheating
        if (results.faceLandmarks.length > 1) {
          console.warn(`Multiple faces detected: ${results.faceLandmarks.length}`);
          // This information can be used by parent component for cheat detection
          if (callback) {
            callback([`Multiple faces detected: ${results.faceLandmarks.length}`]);
          }
        }

        // Draw face landmarks
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0F050", lineWidth: 0.4 }
          );
        }
      } else {
        // No face detected
        console.warn("No face detected");
        if (callback) {
          callback(["No face detected"]);
        }
      }
    } catch (error) {
      console.error("Error during face landmark detection:", error);
    }

    canvasCtx.restore();
    
    if (isRunning) {
      window.requestAnimationFrame(loop);
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } 
    });
    video.srcObject = stream;
    
    const startLoop = () => {
      isRunning = true;
      console.log("Starting face detection loop");
      loop();
    };
    
    video.addEventListener("loadeddata", startLoop, { once: true });
    video.addEventListener("error", (e) => {
      console.error("Video error:", e);
      isRunning = false;
    });

  } catch (error) {
    console.error("Failed to get user media:", error);
    return {
      changeSize: () => {},
      callback,
      error: "Camera access denied or not available"
    };
  }

  const retObject = {
    changeSize: function setDimensions(options = {}) {
      if (options.width) {
        canvas.width = options.width;
        canvas.height = options.width * 0.75; // Maintain aspect ratio
      }
      if (options.height) {
        canvas.height = options.height;
        canvas.width = options.height * (4/3); // Maintain aspect ratio
      }
      console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
    },
    stop: function() {
      isRunning = false;
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    },
    callback,
  };
  return retObject;
}

export { start as default };

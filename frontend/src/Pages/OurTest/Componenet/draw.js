import {
  FaceLandmarker,
  DrawingUtils,
  FilesetResolver,
  FaceLandmarkerResult,
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
  const cloudName = "dxjugdocf";  // Replace with your Cloudinary cloud name
  const uploadPreset = "quizPortal"; // Replace with your Cloudinary upload preset

  const blob = base64ToBlob(base64Image, "image/png");
  const data = JSON.parse(localStorage.getItem("user"));

  const renamedFile = new File([blob], `${data?.rollNo}_${Date.now()}`, { type: blob.type });

  const formData = new FormData();
  formData.append("file", renamedFile);
  formData.append("upload_preset", uploadPreset);

  // try {
  //   const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
  //     method: "POST",
  //     body: formData,
  //   });
  //   const data = await response.json();
  //   // console.log("Cloudinary response:", data);
  //   return data;
  // } catch (error) {
  //   // console.error("Error uploading to Cloudinary:", error);
  // }
};
async function start(video, canvas, callback) {
  var canvasCtx = canvas.getContext("2d");
  var drawingUtils = new DrawingUtils(canvasCtx);
  let lastFrameTime = -1;
  let results;
  let lastCheatAttemptTime = 0;
  const userData = JSON.parse(localStorage.getItem("user"));
  const CHEAT_ATTEMPT_COOLDOWN = 5000; // 5 seconds cooldown

  const faceLandmarker = await FaceLandmarker.createFromOptions(
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

  async function sendCheatAttemptRequest() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/v1/users/cheatAttempt`,
        {
          credentials: "include",
          headers: {
            Authorization: `${localStorage.getItem("jwt")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Cheat attempt reported successfully");
    } catch (error) {
      // console.error('Error reporting cheat attempt:', error);
    }
  }

  let lastCaptureTime = 0; // To keep track of the last capture time

  async function loop() {
    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      console.error("Invalid video dimensions");
      return;
    }

    canvasCtx.save();
    canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Capture image every 1500 milliseconds
    const currentTime = performance.now();
    if (currentTime - lastCaptureTime >= 30000) {
      // 30000 milliseconds
      const imageData = canvas.toDataURL("image/png"); // Capture image data as base64
      imagewithoutLandmark = imageData.split(",")[1]; // Extract the base64 part
      console.log("Captured ImageData:", imagewithoutLandmark); // Log the base64 image
      await uploadToCloudinary(imagewithoutLandmark); // Upload the image to Cloudinary

      lastCaptureTime = currentTime; // Update the last capture time
    }

    const startTimeMs = performance.now();
    if (lastFrameTime === video.currentTime) {
      window.requestAnimationFrame(loop);
      return;
    }

    lastFrameTime = video.currentTime;
    try {
      results = await faceLandmarker.detectForVideo(video, startTimeMs);
      if (!results || !results.faceLandmarks) {
        console.error("No face landmarks detected");
        return;
      }

      // Check if more than one face is detected
      if (results.faceLandmarks.length > 1) {
        const currentTime = Date.now();
        if (currentTime - lastCheatAttemptTime > CHEAT_ATTEMPT_COOLDOWN) {
          await sendCheatAttemptRequest();
          lastCheatAttemptTime = currentTime;
        }
      }

      for (const landmarks of results.faceLandmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#C0C0F050", lineWidth: 0.4 }
        );
        // ... (rest of the drawing code remains the same)
      }
    } catch (error) {
      console.error("Error during face landmark detection:", error);
    }

    canvasCtx.restore();
    window.requestAnimationFrame(loop);
  }

  video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  video.addEventListener("loadeddata", loop, { once: true });
  video.addEventListener("error", () => console.error("Error loading video"));

  const retObject = {
    changeSize: function setDimentsons(object) {
      // ... (unchanged)
    },
    callback,
  };
  return retObject;
}

export { start as default };

import React, { useEffect, useCallback, useRef } from "react";
import start from "./draw";

const CustomWebcam = ({ onImageCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // console.log(data);
  // Function to capture image from canvas and handle it
  const captureImage = useCallback(async () => {
    const canvas = canvasRef.current;

    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      // console.log("ImageData", imageData);
      
      const base64Image = imageData.split(",")[1];

      // Call the onImageCapture callback with base64 image
      onImageCapture(base64Image);


    }
  }, [onImageCapture]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let drawInstance = null;

    const logger = (warnings) => {
      if (warnings && warnings.length > 0) {
        console.log("Face detection warnings:", warnings);
        // You can pass these warnings to parent component if needed
        // onImageCapture could be extended to handle warnings
      }
    };

    const initializeFaceDetection = async () => {
      try {
        const result = await start(video, canvas, logger);
        
        if (result.error) {
          console.error("Face detection initialization failed:", result.error);
          return;
        }
        
        drawInstance = result;
        drawInstance.changeSize({ width: 300 });
        console.log("Face detection initialized successfully");
        
      } catch (err) {
        console.error("Error starting video:", err);
      }
    };

    initializeFaceDetection();

    // Set up an interval to capture the image every 30 seconds
    const intervalId = setInterval(captureImage, 30000);

    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      if (drawInstance && drawInstance.stop) {
        drawInstance.stop();
      }
    };
  }, [captureImage]);

  return (
    <div className="container">
      <video
        ref={videoRef}
        playsInline
        autoPlay
        style={{ display: "none" }}
      ></video>
      <canvas
        ref={canvasRef}
        className="output_canvas"
        style={{ width: '200px', height: '150px' }}
      ></canvas>
    </div>
  );
};

export default CustomWebcam;

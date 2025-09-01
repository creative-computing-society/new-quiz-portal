import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import styles from "../Style/leftContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCamera,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../Assets/black-logo.png";
import { useLocation, useNavigate } from "react-router-dom";

const url = `${process.env.REACT_APP_BACKEND}/api/v1/users/postdetails/`;
let errorMessage = "";
const LeftContainer = () => {
  const cloudName = "dxjugdocf";
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  const [techStack, setTechStack] = useState("");
  const [github, setGithub] = useState("");
  const [links, setLinks] = useState("");
  const [nonTech, setNonTech] = useState([]);
  const [nonTechLinks, setNonTechLinks] = useState("");
  const [message, setMessage] = useState("");
  const [button, setButton] = useState(
    <button type="submit" className={styles.button}>
      <div>Submit</div>
      <div className={styles.arrow}>&rarr;</div>
    </button>
  );
  const [file, setFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  const data = JSON.parse(localStorage.getItem("user"));

  const handleCheck = (e) => {
    const { checked, value } = e.target;
    setNonTech((prev) =>
      checked ? [...prev, value] : prev.filter((e) => e !== value)
    );
  };

  const handleFileChange = async function (e) {
    const file = e.target.files[0];
    setFile(file);
    setCapturedImage(URL.createObjectURL(file));
  };

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      // Convert base64 to blob
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `${data?.rollNo}_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setFile(file);
        });
    }
    setShowCamera(false);
  }, [webcamRef, data?.rollNo]);

  const resetImage = () => {
    setFile(null);
    setCapturedImage(null);
  };

  const uploadToCloudinary = async (file) => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ku3dohd4");

      // try {
      //   const res = await fetch(
      //     `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      //     {
      //       method: "POST",
      //       body: formData,
      //     }
      //   );

      //   if (!res.ok) {
      //     const errorData = await res.json();
      //     console.error("Upload error details:", errorData);
      //     throw new Error(
      //       `Upload failed: ${errorData.message || "Unknown error"}`
      //     );
      //   }

      //   const reply = await res.json();
      //   console.log("Image uploaded successfully:", reply.secure_url);
      //   return reply.secure_url;
      // } catch (error) {
      //   console.error("Upload failed:", error);
      //   setMessage("Image upload failed. Please try again.");
      //   throw error;
      // }
    }
  };
  const isValidURL = (urlString) => {
    const urlArray = urlString.split(",").map((url) => url.trim()); // Split by comma and trim spaces
    return true;
    // const regex =
    //   /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\.[\w-]{2,})*(\/[\w-]*)*(\?.*)?$/i;

    // return urlArray.every((url) => regex.test(url)); // Check that all URLs are valid
  };

  const isValidGitHubURL = (urlString) => {
    const urlArray = urlString.split(",").map((url) => url.trim()); // Split by comma and trim spaces
  
    // Regular expression to match GitHub URLs
    const regex = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+$/i;
  
    return urlArray.every((url) => regex.test(url)); // Check that all URLs are valid
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!isValidGitHubURL(github)) {
      setMessage("Please enter a valid link for Github.");
      return;
    }
    // Validate URLs before submitting
    if (!isValidURL(links)) {
      setMessage("Please enter a valid link for Tech Links.");
      return;
    }

    if (nonTechLinks && !isValidURL(nonTechLinks)) {
      setMessage("Please enter a valid link for Non-Tech work.");
      return;
    }

    setButton(
      <button type="submit" className={styles.button} disabled>
        <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
      </button>
    );

    try {
      let imageUrl = null;
      let base64data = "";
      if (file) {
        imageUrl = await uploadToCloudinary(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        base64data = await new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result.replace(/^data:image\/jpeg;base64,/, ""));
          };
        });
      }

      const formData = new FormData();
      formData.append("github", github);
      formData.append("techStack", techStack);
      formData.append("links", links);
      formData.append("nonTechFields", nonTech.toString());
      formData.append("nonTechLinks", nonTechLinks);
      if (file) {
        formData.append("image", file);
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `${localStorage.getItem("jwt")}`,
        },
      });
      errorMessage = response.message;

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));

      setTechStack("");
      setLinks("");
      setGithub("");
      setNonTech([]);
      setNonTechLinks("");
      setFile(null);
      setCapturedImage(null);
      errorMessage = "";

      const checklist = document.getElementsByTagName("input");
      for (const element of checklist) {
        if (element.type === "checkbox") {
          element.checked = false;
        }
      }

      setButton(
        <button type="submit" className={styles.button} disabled>
          <div>Updated!</div>
        </button>
      );

      if (data.result === true) {
        navigate("/home");
      }
    } catch (error) {
      setMessage(errorMessage || "Please verify your image and details!");
      setButton(
        <button type="submit" className={styles.button}>
          <div>Submit</div>
          <div className={styles.arrow}>&rarr;</div>
        </button>
      );
    }
  };

  return (
    <div className={styles.leftContainer}>
      <img src={logo} alt="ccs-logo" className={styles.logo} />
      <h3 className={styles.heading}>Update Your Profile</h3>
      <form
        action=""
        onSubmit={submitForm}
        className={styles.leftContainerForm}
      >
        <input
          required
          type="text"
          name="techStack"
          id="techStack"
          autoComplete="off"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="Tech Stack"
          className={styles.inputBox}
        />
        <input
          required
          type="text"
          name="github"
          id="github"
          autoComplete="off"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          placeholder="Github"
          className={styles.inputBox}
        />
        <input
          required
          type="text"
          name="links"
          id="links"
          autoComplete="off"
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder="Leetcode,LinkedIn etc (https://example.com)"
          className={styles.inputBox}
        />
        <div className={styles.checkboxes}>
          <div className={styles.checkHeading}>
            Select the Non-Tech fields you wish to contribute to (if any)
          </div>
          <div className={styles.check}>
            <input
              type="checkbox"
              name="nonTechDomain"
              id="marketing"
              value="Marketing"
              onChange={handleCheck}
            />
            <label htmlFor="marketing">
              <span>Marketing</span>
            </label>
          </div>
          <div className={styles.check}>
            <input
              type="checkbox"
              name="nonTechDomain"
              id="contentWriting"
              value="Content Writing"
              onChange={handleCheck}
            />
            <label htmlFor="contentWriting">
              <span>Content Writing</span>
            </label>
          </div>
          <div className={styles.check}>
            <input
              type="checkbox"
              name="nonTechDomain"
              id="designing"
              value="Designing"
              onChange={handleCheck}
            />
            <label htmlFor="designing">
              <span>Designing</span>
            </label>
          </div>
          <div className={styles.check}>
            <input
              type="checkbox"
              name="nonTechDomain"
              id="videoEditing"
              value="Video Editing"
              onChange={handleCheck}
            />
            <label htmlFor="videoEditing">
              <span>Video Editing</span>
            </label>
          </div>
          <div className={styles.check}>
            <input
              type="checkbox"
              name="nonTechDomain"
              id="publicRelations"
              value="Public Relations"
              onChange={handleCheck}
            />
            <label htmlFor="publicRelations">
              <span>Public Relations</span>
            </label>
          </div>
          <input
            type="text"
            name="nonTechLinks"
            id="nonTechLinks"
            autoComplete="off"
            value={nonTechLinks}
            onChange={(e) => setNonTechLinks(e.target.value)}
            placeholder="Non Tech field Link (if any)"
            className={styles.inputBox}
          />
        </div>

        <div className={styles.imageSection}>
          {!capturedImage && (
            <>
              <div className={styles.checkHeading}>
                Make sure your face is clearly visible
              </div>
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className={styles.cameraButton}
              >
                <FontAwesomeIcon icon={faCamera} /> Capture Image
              </button>
            </>
          )}
          {capturedImage && (
            <div className={styles.previewContainer}>
              <img
                src={capturedImage}
                alt="Captured"
                className={styles.preview}
              />
              <button
                type="button"
                onClick={resetImage}
                className={styles.resetButton}
              >
                <FontAwesomeIcon icon={faTimes} /> Reset
              </button>
            </div>
          )}
        </div>

        {showCamera && (
          <div className={styles.cameraContainer}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className={styles.webcam}
            />
            <button
              type="button"
              onClick={captureImage}
              className={styles.captureButton}
            >
              Click Image
            </button>
          </div>
        )}
        {message && <p className={styles.message}>{message}</p>}
        {button}
      </form>
    </div>
  );
};

export default LeftContainer;

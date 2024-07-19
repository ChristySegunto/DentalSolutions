import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import * as faceapi from 'face-api.js';

const Scanface = ({ patient_username, onCapturedImagesChange }) => {
    const [numImages, setNumImages] = useState(5);
    const [capturedImages, setCapturedImages] = useState(0);
    const [borderColor, setBorderColor] = useState('red');
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [faceInOvalStartTime, setFaceInOvalStartTime] = useState(null); // Track face entry time
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);

    useEffect(() => {
        onCapturedImagesChange(capturedImages);
    }, [capturedImages, onCapturedImagesChange]);

    // Load face-api models
    const loadModels = async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri('models/tiny_face_detector');
        await faceapi.nets.faceLandmark68Net.loadFromUri('models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.loadFromUri('models/face_recognition');
    };

    useEffect(() => {
        loadModels();
        startVideo();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(detectFace, 100);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        drawOverlay();
    }, [borderColor]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((error) => {
                console.error('Error accessing camera:', error);
                alert('Failed to access camera. Please check if camera permissions are granted.');
            });
    };

    const handleCaptureImage = async () => {
        if (!videoRef.current || capturedImages >= numImages) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const formData = new FormData();

        formData.append('patient_username', patient_username);
        formData.append('image', blob, `${patient_username}_capture${capturedImages + 1}.png`);

        try {
            const response = await axios.post('http://localhost:8000/api/capture-images/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response.data);
            alert('Image captured successfully!');
            setCapturedImages(capturedImages + 1);
        } catch (error) {
            if (error.response) {
                console.error('Error capturing image:', error.response.status, error.response.data);
                alert(`Error capturing image: ${error.response.data}`);
            } else if (error.request) {
                console.error('Request made but no response received:', error.request);
                alert('No response received from the server. Please check network connection.');
            } else {
                console.error('Error setting up the request:', error.message);
                alert('Error setting up the request. Please try again later.');
            }
        }
    };

    const detectFace = async () => {
        if (videoRef.current) {
            const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());
            if (detections) {
                const canvas = overlayCanvasRef.current;
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const ovalWidth = 150;
                const ovalHeight = 200;

                const { x, y, width, height } = detections.box;
                const faceCenterX = x + width / 2;
                const faceCenterY = y + height / 2;

                const isFaceCenterWithinOval = (
                    faceCenterX > centerX - ovalWidth &&
                    faceCenterX < centerX + ovalWidth &&
                    faceCenterY > centerY - ovalHeight &&
                    faceCenterY < centerY + ovalHeight
                );

                const isFaceWithinOval = (
                    x >= centerX - ovalWidth &&
                    x + width <= centerX + ovalWidth &&
                    y >= centerY - ovalHeight &&
                    y + height <= centerY + ovalHeight
                );

                console.log(`Face detected: Center within oval: ${isFaceCenterWithinOval}, Full face within oval: ${isFaceWithinOval}`);

                if (isFaceCenterWithinOval || isFaceWithinOval) {
                    setBorderColor('green');
                    setButtonEnabled(true);
                } else {
                    setBorderColor('red');
                    setFaceInOvalStartTime(null); // Reset timer when face leaves oval
                    setButtonEnabled(false);
                }
            } else {
                setBorderColor('red');
                setFaceInOvalStartTime(null); // Reset timer if no face detected
                setButtonEnabled(false);
            }
        }
    };

    const drawOverlay = () => {
        const canvas = overlayCanvasRef.current;
        const context = canvas.getContext('2d');

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const ovalWidth = 150;
        const ovalHeight = 200;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.ellipse(centerX, centerY, ovalWidth, ovalHeight, 0, 0, 2 * Math.PI);
        context.fill();

        context.globalCompositeOperation = 'source-over';

        context.beginPath();
        context.ellipse(centerX, centerY, ovalWidth, ovalHeight, 0, 0, 2 * Math.PI);
        context.strokeStyle = borderColor;
        context.lineWidth = 7;
        context.stroke();
    };

    return (
        <>
            <div className="scanface-custom mb-3">
                <h2>SCAN FACE</h2>
                <div className='d-flex justify-content-center'>
                    <div className="video-container" style={{ position: 'relative' }}>
                        <video ref={videoRef} autoPlay playsInline muted className="video-preview"></video>
                        <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
                        <canvas ref={overlayCanvasRef} className="overlay-canvas" width="640" height="480"></canvas>
                    </div>
                </div>
                
                <div className='facedirectioncontainer d-flex justify-content-center'>
                    <div className='d-flex justify-content-center align-items-center'>
                        {capturedImages === 0 && (
                            <p className="facedirection-message">Capture front face</p>
                        )}

                        {capturedImages === 1 && (
                            <p className="facedirection-message">Capture left part of the face</p>
                        )}

                        {capturedImages === 2 && (
                            <p className="facedirection-message">Capture right part of the face</p>
                        )}

                        {capturedImages === 3 && (
                            <p className="facedirection-message">Capture top part of the face</p>
                        )}

                        {capturedImages === 4 && (
                            <p className="facedirection-message">Capture bottom part of the face</p>
                        )}

                        {capturedImages === 5 && (
                            <p className="facedirection-message">Please click the submit button to save.</p>
                        )}

                    </div>
                </div>
                
                
                <div className="form-group">
                    <label>Patient Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={patient_username}
                        readOnly
                    />
                </div>
                <div className='d-flex justify-content-center mt-3 mb-5'>
                    <button
                        onClick={handleCaptureImage}
                        disabled={!buttonEnabled}
                        className="capture-button btn"
                        style={{ backgroundColor: buttonEnabled ? '#005590' : '#7a8185', color: '#fff' }}

                    >
                        Capture Image ({capturedImages}/{numImages})
                    </button>
                </div>
                
            </div>


            <style jsx>{`
                .overlay-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .capture-button {
                    margin-top: 10px;
                    // background-color: ${buttonEnabled ? '#005590' : '#7a8185'};
                }
                .facedirectioncontainer{
                    background-color: '#fff';
                    box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 0.06);
                    width: 50%;
                    height: 10%;
                    border-radius: 10px;
                    margin: 10px auto; // Change this line
                }
                .facedirection-message{
                    color: #005590;
                    font-size: 25px;
                    margin: 0;
                }


            `}</style>
        </>
    );
};

export default Scanface;

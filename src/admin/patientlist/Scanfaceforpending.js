//scan face for pending

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from './../../settings/supabase';
import './Scanfaceforpending.css';
import * as faceapi from 'face-api.js';
import { addISOWeekYears } from 'date-fns';

const Scanfaceforpending = () => {
    const { patient_id } = useParams();
    const [numImages, setNumImages] = useState(5);
    const [capturedImages, setCapturedImages] = useState(0);
    const [patient_username, setUsername] = useState('');

    const [borderColor, setBorderColor] = useState('red');
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [faceInOvalStartTime, setFaceInOvalStartTime] = useState(null); // Track face entry time

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);

    const [submitDisabled, setSubmitDisabled] = useState(true);  // Update initial state
    const navigate = useNavigate(); 
    const [showModal, setShowModal] = useState(false);
    const [modalHeader, setModalHeader] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    const [loading, setLoading] = useState(true); // Loading state for models
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);

    
    const loadModels = async () => {
        setLoading(true);
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
            setModelsLoaded(true); // Add this line
        } catch (error) {
            console.error('Error loading models:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            await loadModels();  // Ensure models are loaded
            startVideo();        // Then start video
        };
        initialize();
    }, []);

    useEffect(() => {
        const fetchPatientName = async () => {
            try {
                const { data } = await supabase
                    .from('patient')
                    .select('user_id')
                    .eq('patient_id', patient_id)
                    .single();

                if (data) {
                    const userId = data.user_id;
                    const { data: userData } = await supabase
                        .from('user')
                        .select('username')
                        .eq('user_id', userId)
                        .single();

                    if (userData) {
                        setUsername(userData.username);
                    }
                }
            } catch (error) {
                console.error('Error fetching patient name:', error);
                alert('Error fetching patient name. Please try again later.');
            }
        };

        fetchPatientName();
    }, [patient_id]);

    useEffect(() => {
        console.log("capturedImages changed:", capturedImages);
        if (capturedImages >= 1) {  // Change this condition to 1
            setSubmitDisabled(false);
        } else {
            setSubmitDisabled(true);
        }
    }, [capturedImages]);


    


    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        canvasRef.current.width = videoRef.current.videoWidth;
                        canvasRef.current.height = videoRef.current.videoHeight;
                        overlayCanvasRef.current.width = videoRef.current.videoWidth;
                        overlayCanvasRef.current.height = videoRef.current.videoHeight;
                        drawOverlay();
                    };
                    setMediaStream(stream); // Store the stream reference
                }
            })
            .catch((error) => {
                console.error('Error accessing camera:', error);
                alert('Failed to access camera. Please check if camera permissions are granted.');
            });
    };
    

    // Call startVideo when component mounts
    useEffect(() => {
        startVideo();
    }, []);

    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaStream]);

    useEffect(() => {
        drawOverlay();
    }, [borderColor]);

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
            const response = await axios.post('https://dentalsolutionsmain.xyz/api/capture-images/', formData, {
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

    const handleGoToPatientRecord = async () => {
        try {
            const { data, error } = await supabase
                .from('patient')
                .update({ verification_status: 'verified', patient_pendingstatus: null })
                .eq('patient_id', patient_id) // Assuming 'id' is the correct column for patient ID
                .single();

            if (error) {
                throw error;
            }
            
            navigate(`/patientrecord/${patient_id}`);
            
        } catch (error) {
            console.error('Error updating patient verification status:', error.message);
            setModalMessage("Error occurred while updating patient verification status. Please try again later.");
            setModalHeader("Error");
            setShowModal(true);
        }
    };

    const detectFace = async () => {
        if (!modelsLoaded) {
            console.warn('Models not loaded yet');
            return;
        }
        if (videoRef.current) {
            // Ensure video is playing
            if (videoRef.current.readyState === 4) {
                const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());
                console.log('Detections:', detections);
    
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
            } else {
                console.warn('Video not ready for detection');
            }
        }
    };

    useEffect(() => {
        if (modelsLoaded) {
            const intervalId = setInterval(detectFace, 100);
            return () => clearInterval(intervalId);
        }
    }, [modelsLoaded]);
    
    

    const drawOverlay = () => {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return; // Ensure canvas is not null
    
        const context = canvas.getContext('2d');
        if (!context) return; // Ensure context is not null
    
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
        context.strokeStyle = borderColor; // Update strokeStyle with borderColor
        context.lineWidth = 7;
        context.stroke();
    };
    

   

    return (
        <>
            <div className="scanfacecontainer">
                <h2>SCAN FACE</h2>
                <div className='divider'></div>

                {loading ? (
                    <div className="spinner-container row d-flex justify-content-center">
                        <div class="spinner-border text-secondary" role="status"></div>
                        <p className='text-center'>Loading models, please wait...</p>
                    </div>
                ) : (
                <>
                <div className='videobox d-flex justify-content-center'>
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
                <div className='d-flex justify-content-center'>
                    <button
                        onClick={handleCaptureImage}
                        disabled={!buttonEnabled}
                        className="capture-button btn"
                        style={{ backgroundColor: buttonEnabled ? '#005590' : '#7a8185', color: '#fff' }}
                    >
                        Capture Image ({capturedImages}/{numImages})
                    </button>
                </div>
                </>
                )}
                <div className='d-flex justify-content-center'>
                    <button
                        className='d-flex justify-content-center m-4 submitbtn btn'
                        style={{ backgroundColor: submitDisabled ? '#005590' : '#7a8185', color: '#fff' }}
                        onClick={handleGoToPatientRecord}
                        disabled={submitDisabled}  // Bind the disabled state here
                    >
                        Submit
                    </button>
                </div>
                
                {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{modalHeader}</h2>
                        <p>{modalMessage}</p>
                        <button onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
                )}
            </div>

            <style jsx>{`
                .overlay-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 1;
                }
                .capture-button {
                    margin-top: 10px;
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

export default Scanfaceforpending;


import React, { useState, useRef, useEffect } from "react";
import './Verifypatient.css';
import { Modal, Button } from 'react-bootstrap';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const Verifypatient = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [borderColor, setBorderColor] = useState('red'); // Default border color

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Load face-api models
    const loadModels = async () => {
        await faceapi.nets.tinyFaceDetector.loadFromUri('models/tiny_face_detector');
        await faceapi.nets.faceLandmark68Net.loadFromUri('models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.loadFromUri('models/face_recognition');
    };

    useEffect(() => {
        loadModels();
        handleScan();
    }, []);

    const handleScan = async () => {
        await loadModels(); // Ensure models are loaded before starting the scan
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                    videoRef.current.addEventListener('loadeddata', startFaceDetection);
                }
            })
            .catch(err => {
                console.error('Error accessing the camera: ', err);
                alert('Error accessing the camera. Please check your camera permissions.');
            });
    };

    const handleReset = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();

            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
        setShowModal(false);
        setBorderColor('red'); // Reset border color
    };

    const handleViewRecord = () => {
        alert('Viewing patient record...');
        console.log('Viewing patient record...');
        setShowModal(false);
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (isScanning && streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            setIsScanning(false);
            setBorderColor('red'); // Reset border color
        }
    };

    const startFaceDetection = async () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = faceapi.createCanvasFromMedia(video);
            canvasRef.current.innerHTML = ''; // Clear any existing canvas
            canvasRef.current.append(canvas);

            const displaySize = { width: video.width, height: video.height };
            faceapi.matchDimensions(canvas, displaySize);

            setInterval(async () => {
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);

                if (detections.length > 0) {
                    setBorderColor('green');
                } else {
                    setBorderColor('red');
                }
            }, 1000);
        }
    };

    const handleCheckRecord = async () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg');

            try {
                const response = await axios.post('http://localhost:8000/api/compare-face', { image: imageData });
                if (response.data.match) {
                    setScanResult('Patient Exist. Do you want to view the record?');
                } else {
                    setScanResult('No matching patient found.');
                }
                setShowModal(true);
            } catch (error) {
                console.error('Error checking record:', error);
                setScanResult('Error checking patient record.');
                setShowModal(true);
            }
        }
    };

    return (
        <>
            <div className="verifypatientform container-fluid">
                <div className="verifypatient-header d-flex align-items-center">
                    <h3>VERIFY PATIENT</h3>
                </div>

                <div className='scanface-form'>
                    <h4>SCAN FACE</h4>
                    <h5>Verify if the patient already has a record.</h5>

                    <div className='image-box'>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="camera-feed"
                            width="640"
                            height="480"
                            style={{ borderColor: borderColor, borderStyle: 'solid', borderWidth: '5px' }}
                        ></video>
                        <div ref={canvasRef} className='canvas-container'></div>
                    </div>

                    <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
                        <Modal.Header closeButton className="d-block text-center">
                            <Modal.Title>Patient Exist</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center">
                            <p>{scanResult}</p>
                            {scanResult === 'Patient Exist. Do you want to view the record?' && (
                                <>
                                    <Button className="viewbtn" onClick={handleViewRecord}>View Record</Button>
                                    <Button className="resetbtn" onClick={handleReset}>Reset</Button>
                                </>
                            )}
                        </Modal.Body>
                    </Modal>

                    <div className="scanbtn-div">
                        <Button className="scanbtn btn" onClick={handleCheckRecord}>Scan</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Verifypatient;
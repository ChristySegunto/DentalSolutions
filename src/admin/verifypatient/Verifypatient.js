import React, { useState, useRef, useEffect } from "react";
import './Verifypatient.css';
import { Modal, Button, ModalTitle, ModalBody } from 'react-bootstrap';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import supabase from '../../settings/supabase';

const Verifypatient = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [borderColor, setBorderColor] = useState('red'); // Default border color
    const [patientUsername, setPatientUsername] = useState('Unknown');
    const navigate = useNavigate();

    const [ModalTitle, setModalTitle] = useState('');
    const [ModalBody, setModalBody] = useState('');

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
        if (!isGetUserMediaSupported()) {
            alert('getUserMedia is not supported by your browser. Please use a different browser.');
            return;
        }
    
        loadModels();
        handleScan();
    
        return () => {
            if (streamRef.current) {
                const tracks = streamRef.current.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const isGetUserMediaSupported = () => {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    };
    
    if (isGetUserMediaSupported()) {
        console.log('getUserMedia is supported in this browser.');
    } else {
        console.log('getUserMedia is not supported in this browser.');
    }

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

        setIsScanning(false);
        setShowModal(false);
        setBorderColor('red'); // Reset border color
    };

    const handleViewRecord = async () => {
        try {
            // Query Supabase to check if patient exists
            const { data, error } = await supabase
                .from('user')  // Replace with your actual table name
                .select('*')
                .eq('username', patientUsername)  // Replace with actual column name
                .single();  // Use `.single()` to return a single record

            if (error) {
                throw error;
            }

            if (data) {
                const { data: patientData, error: patientError } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('user_id', data.user_id)

                if (patientError) {
                    throw patientError;
                }

                if (patientData) {
                    navigate(`/patientrecord/${patientData[0].patient_id}`); // Redirect to patient record page
                }
            } else {
                alert('No patient record found.');
            }
        } catch (error) {
            console.error('Error fetching patient record:', error);
            alert('Error fetching patient record.');
        }

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
                const response = await axios.post('http://localhost:8000/api/compare-face/', { image: imageData });
                if (response.data.match) {
                    setPatientUsername(response.data.patient_username || 'Unknown'); // Set patient username from response
                    setModalTitle('Patient Exist');
                    setModalBody('Do you want to view the record of ' + response.data.patient_username + '?');
                    setShowModal(true);
                } else {
                    setModalTitle('No Record Found');
                    setModalBody('No records found. Do you want to try again or add patient?');
                    setShowModal(true);
                }
                setShowModal(true);
            } catch (error) {
                console.error('Error checking record:', error);
                setModalTitle('Error checking patient record.');
                setModalBody('An error occurred while checking the patient record. Please try again.');
                setShowModal(true);
            }
        }
    };

    const handleGoToAddPatient = () => {
        navigate('/addpatient');
    }

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
                        <Modal.Header closeButton>
                            <Modal.Title>{ModalTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center">
                            <p>{ModalBody}</p>
                            {ModalTitle === 'Patient Exist' && (
                                <>
                                    <Button className="viewbtn" onClick={handleViewRecord}>View Record</Button>
                                    <Button className="resetbtn" onClick={handleReset}>Reset</Button>
                                </>
                            )}

                            {ModalTitle === 'No Record Found' && (
                                <>
                                <Button className="addpatientbtn" onClick={handleGoToAddPatient}>Add Patient</Button>
                                <Button className="tryagainbtn" onClick={handleReset}>Try Again</Button>
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
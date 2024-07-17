import React, { useState, useRef } from "react";
import './Verifypatient.css';
import Dropdown from 'react-bootstrap/Dropdown';
import { Modal, Button, Form, Col } from 'react-bootstrap';

const Verifypatient = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null); // To hold reference to the camera stream

    const handleScan = () => {
        // Open camera for scanning
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                // Use the stream to display video feed
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream; // Save the stream reference
                    setIsScanning(true);
                }
            })
            .catch(err => {
                console.error('Error accessing the camera: ', err);
                alert('Error accessing the camera. Please check your camera permissions.');
            });
    };

    const handleReset = () => {
        // Reset scanning or close camera stream
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();

            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
        setShowModal(false);
    };

    const handleViewRecord = () => {
        // Implement logic to view patient record
        alert('Viewing patient record...');
        // For demonstration, we'll just log to console and close modal
        console.log('Viewing patient record...');
        setShowModal(false); // Close modal after viewing record
    };

    const handleModalClose = () => {
        setShowModal(false); // Close modal
        // Stop camera feed if it's running
        if (isScanning && streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            setIsScanning(false);
        }
    };

    // Simulated face detection logic
    const simulateFaceDetection = () => {
        // Simulate face detection after 2 seconds
        setTimeout(() => {
            setScanResult('Patient Exist. Do you want to view the record?');
            setShowModal(true);
        }, 2000); // Adjust delay as needed or replace with actual face detection logic
    };

    const startScan = () => {
        handleScan();
        simulateFaceDetection();
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
                        {/* Display video feed from camera */}
                        <video ref={videoRef} autoPlay muted className="camera-feed"></video>
                    </div>
                

                <div className='loader-container'>
                    {isScanning && <div className="loader"></div>}
                </div>

                <Modal show={showModal} onHide={handleModalClose} centered backdrop="static">
                    <Modal.Header closeButton className="d-block text-center">
                        <Modal.Title>Patient Exist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <p>{scanResult}</p>
                        {scanResult === 'Patient Exist. Do you want to view the record?!' && (
                            <>
                                <Button className="viewbtn" onClick={handleViewRecord}>View Record</Button>
                                <Button className="resetbtn" onClick={handleReset}>Reset</Button>
                            </>
                        )}
                    </Modal.Body>
                </Modal>
            </div>

                {!isScanning && (
                    <div className="scanbtn-div">
                        <Button className="scanbtn btn" onClick={startScan}>Scan</Button>
                    </div>
                )}
            
        </div>
                        

        </>
        
    )
}

export default Verifypatient;
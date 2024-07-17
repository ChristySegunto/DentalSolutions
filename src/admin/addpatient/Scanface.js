import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Scanface = () => {
    const [patientName, setPatientName] = useState('');
    const [numImages, setNumImages] = useState(5);
    const [capturedImages, setCapturedImages] = useState(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleCaptureImage = async () => {
        if (!videoRef.current || capturedImages >= numImages) return;
    
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const formData = new FormData();

        // Append image data with custom filename
        formData.append('patient_name', patientName);
        formData.append('image', blob, `${patientName}_capture${capturedImages + 1}.png`);
        formData.append('save_path', `patient/${patientName}/raw/`); // Adjust save path here
    
        try {
            const response = await axios.post('http://localhost:8000/api/capture_images/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response.data);
            alert('Image captured successfully!');
            setCapturedImages(capturedImages + 1);
        } catch (error) {
            console.log('Error object:', error);
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
    

    // Function to start video capture
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

    // Call startVideo when component mounts
    useEffect(() => {
        startVideo();
    }, []);

    return (
        <div className="scanface-custom">
            <h2>SCAN FACE</h2>
            <div className="video-container">
                <video ref={videoRef} autoPlay playsInline muted className="video-preview"></video>
                <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
            </div>
            <div className="form-group">
                <label>Patient Name:</label>
                <input
                    type="text"
                    className="form-control"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handleCaptureImage} disabled={capturedImages >= numImages}>
                Capture Image ({capturedImages}/{numImages})
            </button>
        </div>
    );
};

export default Scanface;


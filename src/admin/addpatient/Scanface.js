import React, { useState } from 'react';
import axios from 'axios';

const Scanface = () => {
    const [patientName, setPatientName] = useState('');
    const [numImages, setNumImages] = useState(5);

    const handleCaptureImages = async () => {
        try {
            const response = await axios.post('http://localhost:5000/capture-images', {
                patient_name: patientName,
                num_images: numImages
            });
            console.log(response.data);
            alert('Images captured successfully!');
        } catch (error) {
            console.error('Error capturing images:', error);
            alert('Error capturing images. Please check server logs.');
        }
    };

    return (
        <div className="scanface-custom">
            <h2>SCAN FACE</h2>
            <div className="form-group">
                <label>Patient Name:</label>
                <input
                    type="text"
                    className="form-control"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Number of Images to Capture:</label>
                <input
                    type="number"
                    className="form-control"
                    value={numImages}
                    onChange={(e) => setNumImages(parseInt(e.target.value))}
                />
            </div>
            <button className="btn btn-primary" onClick={handleCaptureImages}>
                Capture Images
            </button>
        </div>
    );
};

export default Scanface;
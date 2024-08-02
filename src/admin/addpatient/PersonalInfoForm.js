import React, { useState, useEffect } from "react";
import './Addpatient.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

import { Modal, Button, Form, Col } from 'react-bootstrap';



const PersonalInfoForm = ({ patientData, onUpdatePatientData, calculateAge }) => {
    const [patientInfo, setPatientInfo] = useState({
        patient_fname: patientData.patient_fname,
        patient_mname: patientData.patient_mname,
        patient_lname: patientData.patient_lname,
        patient_age: patientData.patient_age,
        patient_gender: patientData.patient_gender,
        patient_birthdate: patientData.patient_birthdate,
        patient_address: patientData.patient_address,
        patient_email: patientData.patient_email,
        patient_contact: patientData.patient_contact
    });

    const [showGuardianForm, setShowGuardianForm] = useState(false);
    const [contactError, setContactError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [fnameError, setFNameError] = useState('');
    const [mnameError, setMNameError] = useState('');
    const [lnameError, setLNameError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const handleCloseModal = () => setShowModal(false);

    useEffect(() => {
        // Update parent component when patientInfo changes
        onUpdatePatientData(patientInfo);
    }, [patientInfo]);

    useEffect(() => {
        if (patientInfo.patient_birthdate) {
            const age = calculateAge(patientInfo.patient_birthdate);
            if (age >= 1) {
                setPatientInfo(prevInfo => ({
                    ...prevInfo,
                    patient_age: age
                }));
                setShowGuardianForm(age < 18);
            } else {
                setPatientInfo(prevInfo => ({
                    ...prevInfo,
                    patient_birthdate: null,
                    patient_age: ''
                }));
                setModalMessage("Patient must be at least 1 year old.");
                setShowModal(true);
            }
        }
    }, [patientInfo.patient_birthdate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        
        if (name === 'patient_fname') {
            const lettersRegex = /^[A-Za-z\s]*$/;

            if (lettersRegex.test(value)) {
                setFNameError('');
            } else {
                setFNameError('Please enter a valid first name.');
            }

            setPatientInfo(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));

        } else if (name === 'patient_mname') {
            const lettersRegex = /^[A-Za-z\s]*$/;

            if (lettersRegex.test(value)) {
                setMNameError('');
            } else {
                setMNameError('Please enter a valid middle name.');
            }

            setPatientInfo(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));
        } else if (name === 'patient_lname') {
            const lettersRegex = /^[A-Za-z\s]*$/;

            if (lettersRegex.test(value)) {
                setLNameError('');
            } else {
                setLNameError('Please enter a valid last name.');
            }

            setPatientInfo(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));
        } else if (name === 'patient_contact') { // Allow only numbers in the contact field
            // Regex for validating cellphone numbers
            const cellphoneRegex = /^[0-9]{11}$/;


                if (cellphoneRegex.test(value)) {
                    setContactError('');
                } else {
                    setContactError('Please enter a valid 11-digit cellphone number.');
                }

                setPatientInfo(prevInfo => ({
                    ...prevInfo,
                    [name]: value
                }));

        } else if (name === 'patient_email') {
            // Regex for validating email addresses
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(value)) {
                setEmailError('');
            } else {
                setEmailError('Please enter a valid email address.');
            }

            setPatientInfo(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));

        } else {
            setPatientInfo(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));
        }
    };

    const handleDateChange = (date) => {
        if (!date) {
            // If the date is cleared, reset the birthdate and age fields, and hide the guardian form
            setPatientInfo(prevInfo => ({
                ...prevInfo,
                patient_birthdate: null,
                patient_age: ''
            }));
            setShowGuardianForm(false);
            return;
        }
    
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const age = calculateAge(utcDate);
        
        if (age < 1) {
            setModalMessage("Patient must be at least 1 year old.");
            setShowModal(true);
            return;
        }
    
        setPatientInfo(prevInfo => ({
            ...prevInfo,
            patient_birthdate: utcDate,
            patient_age: age
        }));
    
        setShowGuardianForm(age < 18);
    };
    return (
        <div className="personalinfo">
            <div className='fullName row'>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">First Name<span className="required">*</span></Form.Label>
                    <Form.Control type="text" name="patient_fname" placeholder="Enter first name" isInvalid={!!fnameError} value={patientInfo.patient_fname} onChange={handleChange} required />
                    <Form.Control.Feedback type="invalid">{fnameError}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Middle Name</Form.Label>
                    <Form.Control type="text" name="patient_mname" placeholder="Enter middle name" isInvalid={!!mnameError} value={patientInfo.patient_mname} onChange={handleChange} />
                    <Form.Control.Feedback type="invalid">{mnameError}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Last Name<span className="required">*</span></Form.Label>
                    <Form.Control type="text" name="patient_lname" placeholder="Enter last name" isInvalid={!!lnameError} value={patientInfo.patient_lname} onChange={handleChange} required />
                    <Form.Control.Feedback type="invalid">{lnameError}</Form.Control.Feedback>
                </Form.Group>
            </div>
            <div className='ageGenderBday row'>
                <Form.Group className="col-lg-5 col-md-4 mb-3" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">Birthdate<span className="required">*</span></Form.Label>
                    <DatePicker
                        selected={patientInfo.patient_birthdate}
                        onChange={handleDateChange}
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        placeholderText="Select birthdate"
                        className="form-control"
                        required
                    />
                </Form.Group>

                <Modal show={showModal} onHide={handleCloseModal} centered className="custom-modal">
                    <Modal.Header closeButton>
                    <Modal.Title>Invalid Age</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{modalMessage}</Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    </Modal.Footer>
                    </Modal>

                <Form.Group className="col-lg-2 col-md-6 mb-3" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">Age<span className="required">*</span></Form.Label>
                    <Form.Control type="number" name="patient_age" placeholder="Enter age" value={patientInfo.patient_age} disabled />
                </Form.Group>
                <Form.Group className="col-lg-5 col-md-6 mb-3" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">Gender<span className="required">*</span></Form.Label>
                    <Form.Select name="patient_gender" value={patientInfo.patient_gender} onChange={handleChange} aria-label="Select gender" required>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </Form.Select>
                </Form.Group>
            </div>

            <div className='address row'>
                <Form.Group className="col-lg-12 mb-3" controlId="formBasicAddress">
                    <Form.Label className="form-label-custom">Address<span className="required">*</span></Form.Label>
                    <Form.Control type="text" name="patient_address" placeholder="Enter address" value={patientInfo.patient_address} onChange={handleChange} required />
                </Form.Group>
            </div>

            <div className='contactEmail row'>
                <Form.Group className="col-lg-6 col-md-6 mb-5" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">Email Address</Form.Label>
                    <Form.Control type="email" name="patient_email" placeholder="Enter email" value={patientInfo.patient_email} onChange={handleChange} isInvalid={!!emailError}  required />
                    <Form.Control.Feedback type="invalid">
                        {emailError}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-lg-6 col-md-6 mb-5" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">Contact Number<span className="required">*</span></Form.Label>
                    <Form.Control type="tel" name="patient_contact" pattern="09[09]{9}0
                    " placeholder="09xxxxxxxxx" value={patientInfo.patient_contact} onChange={handleChange} isInvalid={!!contactError} required />
                    <Form.Control.Feedback type="invalid">{contactError}</Form.Control.Feedback>
                </Form.Group>
            </div>

            {showGuardianForm && (
                <>
                    <div className='guardianInfo row'>
                        <div className="divider"></div>
                        <h3 className="header-guardian">FOR MINORS</h3>
                        {/* Render additional form fields for guardian information */}
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Parent/Guardian Name<span className="required">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Enter guardian's name" required />
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                            <Form.Label className="form-label-custom">Relationship with the patient<span className="required">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Enter relationship" required />
                        </Form.Group>
                    </div>

                    <div className='guardianContact row mb-4'>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Parent/Guardian Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter guardian's email" required />
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                            <Form.Label className="form-label-custom">Parent/Guardian Contact Number<span className="required">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Enter guardian's contact number" required />
                        </Form.Group>
                    </div>
                </>
            )}

        </div>
    )
}

export default PersonalInfoForm;
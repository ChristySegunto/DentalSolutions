import React, { useState, useEffect } from "react";
import './PreRegistration.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

import { Form, Modal, Button } from 'react-bootstrap';

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
        patient_contact: patientData.patient_contact,
        guardian_name: patientData.guardian_name,
        guardian_relationship: patientData.guardian_relationship,
        guardian_email: patientData.guardian_email,
        guardian_number: patientData.guardian_number
    });

    const [contactError, setContactError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [fnameError, setFNameError] = useState('');
    const [mnameError, setMNameError] = useState('');
    const [lnameError, setLNameError] = useState('');
 const [addressError, setAddressError] = useState('');

    const [showGuardianForm, setShowGuardianForm] = useState(false);

    const [guardianInfo, setGuardianInfo] = useState({
        guardian_name: '',
        guardian_relationship: '',
        guardian_email: '',
        guardian_contact: ''
    });

    const [guardianNameError, setGuardianNameError] = useState('');
    const [guardianRelationshipError, setGuardianRelationshipError] = useState('');
    const [guardianEmailError, setGuardianEmailError] = useState('');
    const [guardianContactError, setGuardianContactError] = useState('');

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

    useEffect(() => {
        onUpdatePatientData(patientInfo);
    }, [patientInfo, onUpdatePatientData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        const nameRegex = /^[A-Za-zÀ-ÿ\s'-]*$/;
        const addressRegex = /^[A-Za-z0-9À-ÿ\s.,#'-]*$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+63[0-9]*$/;

        let updatedValue = value;
        let errorMessage = '';

        // Check max length
       
        switch (name) {
            case 'patient_fname':
            case 'patient_mname':
            case 'patient_lname':
                if (!nameRegex.test(value)) {
                    errorMessage = 'Only letters, spaces, hyphens, and apostrophes are allowed.';
                    return; // Prevent invalid characters from being typed
                }
                if (value.length === 100) {
                    errorMessage = 'Maximum character limit reached (100).';
                }
                break;
            case 'patient_address':
                if (!addressRegex.test(value)) {
                    errorMessage = 'Invalid character entered.';
                    return; // Prevent invalid characters from being typed
                }
                if (value.length === 50) {
                    errorMessage = 'Maximum character limit reached (50).';
                }
                break;
                case 'patient_email':
        if (value.length === 30) {
            errorMessage = 'Maximum character limit reached (30).';
        } else if (value && !isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address (e.g., user@example.com).';
        }
        break;
            case 'patient_contact':
                updatedValue = value.replace(/\D/g, '').slice(0, 10);
                break;
            // ... handle other fields
            default:
                break;
        }

        setPatientInfo(prevInfo => ({
            ...prevInfo,
            [name]: updatedValue
        }));

        // Error handling logic
        switch (name) {
            case 'patient_fname':
                setFNameError(errorMessage);
                break;
            case 'patient_mname':
                setMNameError(errorMessage);
                break;
            case 'patient_lname':
                setLNameError(errorMessage);
                break;
            case 'patient_address':
                setAddressError(errorMessage);
                break;
            case 'patient_email':
                setEmailError(errorMessage);
                break;
            case 'patient_contact':
                setContactError(errorMessage);
                break;
            default:
                break;
        }
    };
    
    const isValidEmail = (email) => {
        // This regex ensures the email follows the standard format
        // and ends with a common domain (.com, .org, .net, etc.)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|co|io|ai|me)$/;
        return emailRegex.test(email);
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

const handleGuardianChange = (e) => {
    const { name, value } = e.target;

    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let updatedValue = value;
    let errorMessage = '';

    switch (name) {
        case 'guardian_name':
        case 'guardian_relationship':
            if (!nameRegex.test(value)) {
                errorMessage = 'Only letters, spaces, hyphens, and apostrophes are allowed.';
                return; // Prevent invalid characters from being typed
            }
            if (value.length === 200) {
                errorMessage = 'Maximum character limit reached (200).';
            }
            break;
        case 'guardian_email':
            if (value.length === 30) {
                errorMessage = 'Maximum character limit reached (30).';
            } else if (value && !isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address (e.g., user@example.com).';
            }
            break;
        case 'guardian_contact':
            updatedValue = value.replace(/\D/g, '').slice(0, 10);
            if (updatedValue.length !== 10) {
                errorMessage = 'Please enter a valid 10-digit phone number.';
            }
            break;
        default:
            break;
    }

    setGuardianInfo(prevInfo => ({
        ...prevInfo,
        [name]: updatedValue
    }));

    // Set error messages
    switch (name) {
        case 'guardian_name':
            setGuardianNameError(errorMessage);
            break;
        case 'guardian_relationship':
            setGuardianRelationshipError(errorMessage);
            break;
        case 'guardian_email':
            setGuardianEmailError(errorMessage);
            break;
        case 'guardian_contact':
            setGuardianContactError(errorMessage);
            break;
        default:
            break;
    }
};

    return (
        <div className="personalinfo">
            <div className='fullName row'>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">First Name<span className="required">*</span></Form.Label>
                    <Form.Control 
                        type="text" 
                        name="patient_fname" 
                        placeholder="Enter first name" 
                        isInvalid={!!fnameError} 
                        value={patientInfo.patient_fname} 
                        onChange={handleChange} 
                        maxLength={100}
                        required 
                    />
                    <Form.Control.Feedback type="invalid">{fnameError}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Middle Name</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="patient_mname" 
                        placeholder="Enter middle name" 
                        isInvalid={!!mnameError} 
                        value={patientInfo.patient_mname} 
                        maxLength={30}
                        onChange={handleChange} 
                    />
                    <Form.Control.Feedback type="invalid">{mnameError}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Last Name<span className="required">*</span></Form.Label>
                    <Form.Control 
                        type="text" 
                        name="patient_lname" 
                        placeholder="Enter last name" 
                        isInvalid={!!lnameError} 
                        value={patientInfo.patient_lname} 
                        onChange={handleChange} 
                        maxLength={30}
                        required 
                    />
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
                    <Form.Control 
                        type="text" 
                        name="patient_address" 
                        placeholder="Enter address" 
                        isInvalid={!!addressError}
                        value={patientInfo.patient_address} 
                        onChange={handleChange} 
                        maxLength={50}
                        required 
                    />
                    <Form.Control.Feedback type="invalid">{addressError}</Form.Control.Feedback>
                </Form.Group>
            </div>

            <div className='contactEmail row'>
                <Form.Group className="col-lg-6 col-md-6 mb-5" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">Email Address</Form.Label>
                    <Form.Control 
                        type="email" 
                        name="patient_email" 
                        placeholder="Enter email" 
                        value={patientInfo.patient_email} 
                        onChange={handleChange} 
                        isInvalid={!!emailError}  
                        maxLength={30}
                        required 
                    />
                    <Form.Control.Feedback type="invalid">
                        {emailError}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-lg-6 col-md-6 mb-5" controlId="formBasicEmail">
                    <Form.Label className="form-label-custom">Contact Number<span className="required">*</span></Form.Label>
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">+63</span>
                        </div>
                        <Form.Control 
                            type="text" 
                            name="patient_contact" 
                            placeholder="9xxxxxxxxx" 
                            value={patientInfo.patient_contact} 
                            onChange={handleChange} 
                            isInvalid={!!contactError} 
                            required 
                        />
                    </div>
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
                            <Form.Control 
                        type="text" 
                        name="guardian_name"
                        placeholder="Enter guardian's name" 
                        value={guardianInfo.guardian_name}
                        onChange={handleGuardianChange}
                        isInvalid={!!guardianNameError}
                        required 
                        maxLength={200}
                    />
                    <Form.Control.Feedback type="invalid">{guardianNameError}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                            <Form.Label className="form-label-custom">Relationship with the patient<span className="required">*</span></Form.Label>
                            <Form.Control 
                        type="text" 
                        name="guardian_relationship"
                        placeholder="Enter relationship" 
                        value={guardianInfo.guardian_relationship}
                        onChange={handleGuardianChange}
                        isInvalid={!!guardianRelationshipError}
                        required 
                        maxLength={30}
                    />
                    <Form.Control.Feedback type="invalid">{guardianRelationshipError}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <div className='guardianContact row mb-4'>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Parent/Guardian Email</Form.Label>
                            <Form.Control 
                        type="email" 
                        name="guardian_email"
                        placeholder="Enter guardian's email" 
                        value={guardianInfo.guardian_email}
                        onChange={handleGuardianChange}
                        isInvalid={!!guardianEmailError}
                        maxLength={30}
                    />
                    <Form.Control.Feedback type="invalid">{guardianEmailError}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                            <Form.Label className="form-label-custom">Parent/Guardian Contact Number<span className="required">*</span></Form.Label>
                            <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">+63</span>
                        </div>
                        <Form.Control 
                            type="text" 
                            name="guardian_contact"
                            placeholder="9xxxxxxxxx" 
                            value={guardianInfo.guardian_contact}
                            onChange={handleGuardianChange}
                            isInvalid={!!guardianContactError}
                            required 
                        />
                    </div>
                    <Form.Control.Feedback type="invalid">{guardianContactError}</Form.Control.Feedback>
                        </Form.Group>

                        <Modal show={showModal} onHide={handleCloseModal} centered className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Invalid Input</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

                    </div>
                </>
            )}

        </div>
    )

};

export default PersonalInfoForm;
import React, { useState, useEffect } from "react";
import './PreRegistration.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

import { Form } from 'react-bootstrap';

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


    const [showGuardianForm, setShowGuardianForm] = useState(false);

    useEffect(() => {
        // Update parent component when patientInfo changes
        onUpdatePatientData(patientInfo);
    }, [patientInfo]);

    useEffect(() => {
        if (patientInfo.patient_birthdate) {
            const age = calculateAge(patientInfo.patient_birthdate);
            setPatientInfo(prevInfo => ({
                ...prevInfo,
                patient_age: age
            }));
            setShowGuardianForm(age < 18);
        }
    }, [patientInfo.patient_birthdate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Allow only numbers in the contact field
        if (name === 'patient_contact') {
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
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

        setPatientInfo(prevInfo => ({
            ...prevInfo,
            patient_birthdate: utcDate
        }));
    };

    return (
        <div className="personalinfo">
            <div className='fullName row'>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">First Name<span className="required">*</span></Form.Label>
                    <Form.Control type="text" name="patient_fname" placeholder="Enter first name" value={patientInfo.patient_fname} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Middle Name</Form.Label>
                    <Form.Control type="text" name="patient_mname" placeholder="Enter middle name" value={patientInfo.patient_mname} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Last Name<span className="required">*</span></Form.Label>
                    <Form.Control type="text" name="patient_lname" placeholder="Enter last name" value={patientInfo.patient_lname} onChange={handleChange} required />
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
                    <Form.Control type="text" name="patient_contact" placeholder="09xxxxxxxxx" value={patientInfo.patient_contact} onChange={handleChange} isInvalid={!!contactError} required />
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
                            <Form.Control type="text" name="guardian_name" placeholder="Enter guardian's name" value={patientInfo.guardian_name} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                            <Form.Label className="form-label-custom">Relationship with the patient<span className="required">*</span></Form.Label>
                            <Form.Control type="text" name="guardian_relationship" placeholder="Enter relationship" value={patientInfo.guardian_relationship} onChange={handleChange} required />
                        </Form.Group>
                    </div>

                    <div className='guardianContact row mb-4'>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Parent/Guardian Email</Form.Label>
                            <Form.Control type="email" name="guardian_email" placeholder="Enter guardian's email" value={patientInfo.guardian_email} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                            <Form.Label className="form-label-custom">Parent/Guardian Contact Number<span className="required">*</span></Form.Label>
                            <Form.Control type="text" name="guardian_number" placeholder="Enter guardian's contact number" value={patientInfo.guardian_number} onChange={handleChange} required />
                        </Form.Group>
                    </div>
                </>
            )}

        </div>
    )
}

export default PersonalInfoForm;
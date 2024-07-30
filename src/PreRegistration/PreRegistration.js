import React, { useState } from 'react';
import './PreRegistration.css'
import './../index.css'
import Dropdown from 'react-bootstrap/Dropdown';
import { Modal, Button } from 'react-bootstrap';
import PersonalInfoForm from './PersonalInfoForm'
import DentalAndMedForm from './DentalAndMedForm';
import AccountInfoForm from './AccountInfoForm';
import supabase from './../settings/supabase';
import { useNavigate } from 'react-router-dom'; // Import useHistory hook
import CryptoJS from 'crypto-js';



const Prereg = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [consentChecked, setConsentChecked] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [canProceed, setCanProceed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalHeader, setModalHeader] = useState("");
    const navigate = useNavigate();


    const handleGoToLoginPage = () => {
        navigate('/login');
    };

    const [patientData, setPatientData] = useState({
        patient_fname: '',
        patient_mname: '',
        patient_lname: '',
        patient_age: '',
        patient_gender: '',
        patient_birthdate: null,
        patient_address: '',
        patient_email: '',
        patient_contact: '',
        verification_status: '',
        guardian_name: '',
        guardian_relationship: '',
        guardian_email: '',
        guardian_number: ''
    });

    const [dentalAndMedData, setDentalAndMedData] = useState({
        patient_prevdentist: '',
        patient_lastdentalvisit:'',
        patient_physicianname:'',
        patient_physicianspecialty:'',
        patient_physicianaddress:'',
        patient_physiciannumber:'',
        isInGoodHealth: '',
        isInMedTreatment: '',
        everHadIllness: '',
        everBeenHospitalized: '',
        isTakingMedication: '',
        isUsingTobacco: '',
        isUsingDrugs: '',
        allergicToLocalAnesthetic:'',
        allergicToPenicillin:'',
        allergicToLatex:'',
        allergicToSulfaDrugs:'',
        allergicToAspirin:'',
        allergicToCodeine:'',
        allergicToNovocain:'',
        illnessHeartDisease:'',
        illnessAnemia:'',
        illnessAcidReflux:'',
        illnessHeartFailure:'',
        illnessLeukemia:'',
        illnessStomachUlcer:'',
        illnessAngina:'',
        illnessHivAids:'',
        illnessAutoimmune:'',
        illnessMitralValve:'',
        illnessFainting:'',
        illnessThyroid:'',
        illnessRheumatic:'',
        illnessLung:'',
        illnessFibromyalgia:'',
        illnessCongenitalHeart:'',
        illnessAsthma:'',
        illnessArthritis:'',
        illnessArtificialHeart:'',
        illnessEmphysema:'',
        illnessOsteoporosis:'',
        illnessHeartSurgery:'',
        illnessTuberculosis:'',
        illnessPsychiatric:'',
        illnessPacemaker:'',
        illnessCancer:'',
        illnessEpilepsy:'',
        illnessHighblood:'',
        illnessRadiation:'',
        illnessCerebralPalsy:'',
        illnessStroke:'',
        illnessChemotherapy:'',
        illnessDiabetes:'',
        illnessKidney:'',
        illnessBleedingProblem:'',
        illnessLiver:'',
        illnessHemophilia:'',
        illnessHepatitisAb:'',
        illnessHepatitisC:'',
        isPregnant: '',
        isNursing: '',
        isTakingPills: ''
    });

    const [accountInfoData, setAccountInfoData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [accountErrors, setAccountErrors] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const validatePassword = (data) =>{
        return(
            data.password === data.confirmPassword
        )
        
    }


    const validateDentalAndMedData = (data) => {
        // Validate required fields based on gender
        if (patientData.patient_gender === 'Female') {
            return (
                data.isInGoodHealth !== false &&
                data.isInMedTreatment !== false &&
                data.everHadIllness !== false &&
                data.everBeenHospitalized !== false &&
                data.isTakingMedication !== false &&
                data.isUsingTobacco !== false &&
                data.isUsingDrugs !== false &&
                data.isPregnant !== false &&
                data.isNursing !== false &&
                data.isTakingPills !== false
            );
        } else {
            return (
                data.isInGoodHealth !== false &&
                data.isInMedTreatment !== false &&
                data.everHadIllness !== false &&
                data.everBeenHospitalized !== false &&
                data.isTakingMedication !== false &&
                data.isUsingTobacco !== false &&
                data.isUsingDrugs !== false
            );
        }
    };

    const isValidUsername = (username) => /^[\p{L}\p{N}_-]+$/u.test(username);

    const isValidPassword = (password) => {
        const passwordRegex = /^[\p{Lu}][\p{L}]{0,28}[0-9]{1,10}\$/u;
        return passwordRegex.test(password);
    };
    
    const validateAccountInfoData = (data) => {
        let errors = {};
        if (data.username && !isValidUsername(data.username)) {
            errors.username = "Username can only contain letters, numbers, underscores, and hyphens.";
        }
        
        if (data.password) {
            if (!isValidPassword(data.password)) {
                errors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.";
            }
            
            if (data.password !== data.confirmPassword) {
                errors.confirmPassword = "Passwords do not match.";
            }
        }
        
        setAccountErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const validatePatientData = (data) => {
        return (
            data.patient_fname.trim() !== '' &&
            data.patient_lname.trim() !== '' &&
            data.patient_age !== '' &&
            data.patient_gender.trim() !== '' &&
            data.patient_address.trim() !== '' &&
            data.patient_contact.trim() !== ''
        );
    };


    

    const calculateAge = (birthdate) => {
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDifference = today.getMonth() - birthdate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }
        return Math.max(0, age); // Ensure age is not negative
    };

    const handleUpdatePatientData = (data) => {
        console.log('Updating patientData with:', data);
        setPatientData((prevData) => ({ ...prevData, ...data }));
    };

    const handleUpdateDentalAndMedData = (data) => {
        console.log('patient gender: ',patientData.patient_gender);
        console.log('Updating dentalAndMedData with:', data);
        setDentalAndMedData((prevData) => ({ ...prevData, ...data }));
    };

    const handleUpdateAccountInfoData = (data) => {
        console.log('Updating accountinfo with:', data);
        setAccountInfoData(data);
    };
    
    const isValidName = (name) => /^[A-Za-zÀ-ÿ\s'-]*$/.test(name);
    const isValidEmail = (email) => /^[A-Za-z0-9À-ÿ\s.,#'-]*$/.test(email);
    const isValidPhoneNumber = (phone) => /^09\d{9}$/.test(phone);
    
    const validateStep2 = (data) => {
        if (!isValidName(data.patient_fname) || !isValidName(data.patient_mname) || !isValidName(data.patient_lname)) {
            return "Names should only contain letters and spaces.";
        }
        if (data.patient_address.trim() === '') {
            return "Address cannot be empty.";
        }
        if (data.patient_email && !isValidEmail(data.patient_email)) {
            return "Invalid email format.";
        }
        if (!isValidPhoneNumber(data.patient_contact)) {
            return "Phone number should start with '09' followed by 9 digits.";
        }
        return null;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!selectedBranch || !consentChecked) {
                setModalMessage("Please select a branch and consent to proceed.");
                setModalHeader("Attention");
                setShowModal(true);
            } else {
                setCurrentStep((prevStep) => prevStep + 1);
                setShowModal(false);
            }
        } else if (currentStep === 2) {
            const validationError = validateStep2(patientData);
            if (validationError) {
                setModalMessage(validationError);
                setModalHeader("Invalid Input");
                setShowModal(true);
            } else if (!validatePatientData(patientData)) {
                setModalMessage("Please fill out the required information to proceed. All fields marked with an asterisk (*) are required.");
                setModalHeader("Complete Required Information");
                setShowModal(true);
            } else {
                setCurrentStep((prevStep) => prevStep + 1);
                setShowModal(false);
            }
        } else if (currentStep === 3) {
            if (!validateDentalAndMedData(dentalAndMedData)) {
                setModalMessage("Please fill out the required information to proceed. All fields marked with an asterisk (*) are required.");
                setModalHeader("Complete Required Information");
                setShowModal(true);
            } else {
                setCurrentStep((prevStep) => prevStep + 1);
                setShowModal(false);
            }

          }  else  if (currentStep === 4) {
                if (!validateAccountInfoData(accountInfoData)) {
                    let errorMessage = Object.values(accountErrors).join('\n');
                    setModalMessage(errorMessage);
                    setModalHeader("Invalid Input");
                    setShowModal(true);
                } else {
                    setCurrentStep((prevStep) => prevStep + 1);
                    setShowModal(false);
                }
        } 
    };


    const handlePrev = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const handleCheckboxChange = () => {
        setConsentChecked(!consentChecked);
        setCanProceed(!canProceed);
    };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch); // Update selected branch state
        setCanProceed(true);
    };

    const handleSubmit = async () => {
        if (currentStep === 4) { 
            if (!validateAccountInfoData(accountInfoData) || !validatePassword(accountInfoData)) {
                let errorMessage = Object.values(accountErrors).join('\n');
                setModalMessage(errorMessage);
                setModalHeader("Invalid Input");
                setShowModal(true);
                return;

            } else if (!validatePassword(accountInfoData)) {
            setModalMessage("Password and confirm password do not match. Please try again.");
            setModalHeader("Password Not Matched");
            setShowModal(true);
            return;

        }

                const hashedPassword = CryptoJS.SHA256(accountInfoData.password).toString();

                const { data: existingUsers, error: userQueryError } = await supabase
                    .from('user')
                    .select('username')
                    .eq('username', accountInfoData.username)
                    .single();

                if (existingUsers) {
                    // Username already exists, show modal
                    setModalMessage("Username already exists. Please choose a different username.");
                    setModalHeader("Username Exists");
                    setShowModal(true);
                    return;
                } else {
                    const userData = {
                        role: 'patient',
                        username: accountInfoData.username,
                        password: hashedPassword,
                        email: patientData.patient_email
                    }
    
                    const patientDataToInsert = {
                        patient_fname: patientData.patient_fname,
                        patient_mname: patientData.patient_mname,
                        patient_lname: patientData.patient_lname,
                        patient_age: patientData.patient_age,
                        patient_gender: patientData.patient_gender,
                        patient_birthdate: patientData.patient_birthdate,
                        patient_address: patientData.patient_address,
                        patient_email: patientData.patient_email,
                        patient_contact: patientData.patient_contact,
                        verification_status: 'not verified',
                        patient_pendingstatus: 'pending',
                        patient_branch: selectedBranch,
                        consent_checked: consentChecked,
                        guardian_name: patientData.guardian_name,
                        guardian_relationship: patientData.guardian_relationship,
                        guardian_email: patientData.guardian_email,
                        guardian_number: patientData.guardian_number
                    }
    
                    const dentalAndMedDataToInsert = {
                        patient_prevdentist: dentalAndMedData.patient_prevdentist,
                        patient_lastdentalvisit: dentalAndMedData.patient_lastdentalvisit,
                        patient_physicianname: dentalAndMedData.patient_physicianname,
                        patient_physicianspecialty: dentalAndMedData.patient_physicianspecialty,
                        patient_physicianaddress: dentalAndMedData.patient_physicianaddress,
                        patient_physiciannumber: dentalAndMedData.patient_physiciannumber,
                        isInGoodHealth: dentalAndMedData.isInGoodHealth,
                        isInMedTreatment: dentalAndMedData.isInMedTreatment,
                        everHadIllness: dentalAndMedData.everHadIllness,
                        everBeenHospitalized: dentalAndMedData.everBeenHospitalized,
                        isTakingMedication: dentalAndMedData.isTakingMedication,
                        isUsingTobacco: dentalAndMedData.isUsingTobacco,
                        isUsingDrugs: dentalAndMedData.isUsingDrugs,
                        allergicToLocalAnesthetic: dentalAndMedData.allergicToLocalAnesthetic,
                        allergicToPenicillin: dentalAndMedData.allergicToPenicillin,
                        allergicToLatex: dentalAndMedData.allergicToLatex,
                        allergicToSulfaDrugs: dentalAndMedData.allergicToSulfaDrugs,
                        allergicToAspirin: dentalAndMedData.allergicToAspirin,
                        allergicToCodeine: dentalAndMedData.allergicToCodeine,
                        allergicToNovocain: dentalAndMedData.allergicToNovocain,
                        illnessHeartDisease: dentalAndMedData.illnessHeartDisease,
                        illnessAnemia: dentalAndMedData.illnessAnemia,
                        illnessAcidReflux: dentalAndMedData.illnessAcidReflux,
                        illnessHeartFailure: dentalAndMedData.illnessHeartFailure,
                        illnessLeukemia: dentalAndMedData.illnessLeukemia,
                        illnessStomachUlcer: dentalAndMedData.illnessStomachUlcer,
                        illnessAngina: dentalAndMedData.illnessAngina,
                        illnessHivAids: dentalAndMedData.illnessHivAids,
                        illnessAutoimmune: dentalAndMedData.illnessAutoimmune,
                        illnessMitralValve: dentalAndMedData.illnessMitralValve,
                        illnessFainting: dentalAndMedData.illnessFainting,
                        illnessThyroid: dentalAndMedData.illnessThyroid,
                        illnessRheumatic: dentalAndMedData.illnessRheumatic,
                        illnessLung: dentalAndMedData.illnessLung,
                        illnessFibromyalgia: dentalAndMedData.illnessFibromyalgia,
                        illnessCongenitalHeart: dentalAndMedData.illnessCongenitalHeart,
                        illnessAsthma: dentalAndMedData.illnessAsthma,
                        illnessArthritis: dentalAndMedData.illnessArthritis,
                        illnessArtificialHeart: dentalAndMedData.illnessArtificialHeart,
                        illnessEmphysema: dentalAndMedData.illnessEmphysema,
                        illnessOsteoporosis: dentalAndMedData.illnessOsteoporosis,
                        illnessHeartSurgery: dentalAndMedData.illnessHeartSurgery,
                        illnessTuberculosis: dentalAndMedData.illnessTuberculosis,
                        illnessPsychiatric: dentalAndMedData.illnessPsychiatric,
                        illnessPacemaker: dentalAndMedData.illnessPacemaker,
                        illnessCancer: dentalAndMedData.illnessCancer,
                        illnessEpilepsy: dentalAndMedData.illnessEpilepsy,
                        illnessHighblood: dentalAndMedData.illnessHighblood,
                        illnessRadiation: dentalAndMedData.illnessRadiation,
                        illnessCerebralPalsy: dentalAndMedData.illnessCerebralPalsy,
                        illnessStroke: dentalAndMedData.illnessStroke,
                        illnessChemotherapy: dentalAndMedData.illnessChemotherapy,
                        illnessDiabetes: dentalAndMedData.illnessDiabetes,
                        illnessKidney: dentalAndMedData.illnessKidney,
                        illnessBleedingProblem: dentalAndMedData.illnessBleedingProblem,
                        illnessLiver: dentalAndMedData.illnessLiver,
                        illnessHemophilia: dentalAndMedData.illnessHemophilia,
                        illnessHepatitisAb: dentalAndMedData.illnessHepatitisAb,
                        illnessHepatitisC: dentalAndMedData.illnessHepatitisC,
                        isPregnant: dentalAndMedData.isPregnant,
                        isNursing: dentalAndMedData.isNursing,
                        isTakingPills: dentalAndMedData.isTakingPills
                    }
    
                    try {
                        const { data: userInsertData, error: userInsertError } = await supabase
                            .from('user')
                            .insert([userData])
                            .select()
                            .single();
                            
    
                        if (userInsertError) {
                            throw userInsertError;
                        }
    
                        console.log("User data inserted:", userInsertData);
    
                        const user_id = userInsertData.user_id;
    
                        const { data: patientInsertData, error: patientInsertError } = await supabase
                            .from('patient')
                            .insert([{ ...patientDataToInsert, user_id }])
                            .select()
                            .single();
    
                            if (patientInsertError) {
                                throw patientInsertError;
                            }
    
                        console.log("Patient data inserted:", patientInsertData);
    
                        const patient_id = patientInsertData.patient_id;
    
                        const { data: dentalAndMedInsertData, error: dentalAndMedInsertError } = await supabase
                            .from('patient_DentalAndMed')
                            .insert([{ ...dentalAndMedDataToInsert, patient_id }])
                            .select()
                            .single();
    
                            if (dentalAndMedInsertError) {
                                throw dentalAndMedInsertError;
                            }
    
                            console.log("Dental and Medical data inserted:", dentalAndMedInsertData);
    
                    } catch (error) {
                        console.error('Error inserting data:', error.message);
                        // Handle error scenarios
                        setModalMessage("Error occurred while submitting the form. Please try again later.");
                        setModalHeader("Error");
                        setShowModal(true);
                    }
    
    
                    // setCurrentStep(prevStep => prevStep + 1);
                    setShowModal(true); // Close modal on successful submission
                    setModalMessage("Please go to you selected branch for verification. Redirecting to login page...");
                    setModalHeader("Successful Pre-registration");
                    console.log("Submitting form data:");
                    console.log("Personal Info:", patientData);
                    console.log("Dental and Med Info:", dentalAndMedData);
                    console.log("Account Info:", accountInfoData);
                    
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                    
                }

                
            }
        }


    return (
        <div className='preregisterform'>
            <div className='step-container'>
                <div className="step">
                    <div className={`step-item ${currentStep === 1 ? 'active' : ''}`}>
                        <div className="step-circle">1</div>
                        <div className="step-title">STEP 1</div>
                        <div className="step-contenttitle">Consent Form</div>
                    </div>
                    <div className={`step-item ${currentStep === 2 ? 'active' : ''}`}>
                        <div className="step-circle">2</div>
                        <div className="step-title">STEP 2</div>
                        <div className="step-contenttitle">Personal Information</div>
                    </div>
                    <div className={`step-item ${currentStep === 3 ? 'active' : ''}`}>
                        <div className="step-circle">3</div>
                        <div className="step-title">STEP 3</div>
                        <div className="step-contenttitle">Dental and Medical History</div>
                    </div>
                    <div className={`step-item ${currentStep === 4 ? 'active' : ''}`}>
                        <div className="step-circle">4</div>
                        <div className="step-title">STEP 4</div>
                        <div className="step-contenttitle">Account Information</div>
                    </div>
                </div>

                <div className="step-content mt-4">
                    {currentStep === 1 && (
                        <div className='step1'>
                            <div className='chooseBranch-form'>
                                <p className="custom-label">SELECT A DENTAL SOLUTIONS BRANCH: </p>

                                <Dropdown>
                                    <Dropdown.Toggle className="custom-dropdown-toggle" id="dropdown-custom">
                                        {selectedBranch ? selectedBranch : 'Select Branch'}
                                    </Dropdown.Toggle>
                
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => handleBranchSelect('Alabang')}>Alabang</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleBranchSelect('Cubao')}>Cubao</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleBranchSelect('Leon Guinto')}>Leon Guinto</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleBranchSelect('Mabini')}>Mabini</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleBranchSelect('Makati')}>Makati</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            <div className='consentForm'>
                                <h2>CONSENT FORM</h2>

                                <h3>PERSONAL INFORMATION</h3>
                                    <p>I consent to the collection and use my personal information by Dental Solutions for the purpose of providing dental care.</p>
                                <h3>MEDICAL HISTORY</h3>
                                    <p>I consent to provide my medical history to Dental Solutions, recognizing that it is essential for safe and effective dental care.</p>
                                <h3>DENTAL HISTORY</h3>
                                    <p>I consent to provide my dental history to Dental Solutions to assist in my dental care.</p>
                                <h3>FACE RECOGNITION</h3>
                                    <p>I consent to the use of face recognition technology by Dental Solutions for the purposes of patient identification and security</p>
                                
                                <div className='divider'></div>

                                <h3>PATIENT CONSENT</h3>
                                <div className='patientconsent'>
                                <label htmlFor="consentCheckbox" className='consent-label'>
                                <input
                                    className="consentcheckbox"
                                    type="checkbox"
                                    id="consentCheckbox"
                                    checked={consentChecked}
                                    onChange={handleCheckboxChange}
                                />
                                <p className='consent-text'>I have read and understood the above information. I consent to the collection and use of my personal information, dental history, medical history, and facial recognition as described. I acknowledge that I have been informed of my rights under the Republic Act 10173 Data Privacy Act of 2012.</p>
                                </label>
                                </div>
                            </div>
                            <div className='btn1'>
                                <button className="nextbtn btn btn-primary" onClick={handleNext}>Next</button>
                            </div>
                            
                        </div>
                    )}

                    {currentStep === 2 && (
                        <>
                        <div className='step2'>
                            <div className='personalinfo-form'>
                                <h2>PERSONAL INFORMATION</h2>
                                <PersonalInfoForm patientData={patientData} onUpdatePatientData={handleUpdatePatientData} calculateAge={calculateAge} />

                            </div>

                            <div className='btns'>
                                <button className="prevbtn btn btn-secondary mr-2" onClick={handlePrev}>Previous</button>
                                <button className="nextbtn btn btn-primary" onClick={handleNext}>Next</button>
                            </div>
                            
                        </div>
                        </>
                    )}

                    {currentStep === 3 && (
                        <div className='step3'>

                            <DentalAndMedForm patient_gender={patientData.patient_gender} onUpdateDentalAndMedData={handleUpdateDentalAndMedData} />


                            <div className='btns'>
                                <button className="prevbtn btn btn-secondary mr-2" onClick={handlePrev}>Previous</button>
                                <button className="nextbtn btn btn-primary" onClick={handleNext}>Next</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className='step4'>
                            <AccountInfoForm onUpdateAccountInfoData={handleUpdateAccountInfoData}/>

                            <div className='btns'>
                                <button className="btn btn-secondary mr-2" onClick={handlePrev}>Previous</button>
                                <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
                            </div>
                            
                        </div>
                    )}


                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className='custom-modalheader'>{modalHeader}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='text-center custom-modalmessage'>{modalMessage}</Modal.Body>
                <Modal.Footer className='d-flex justify-content-center'>
                    <Button className="closebtn" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>

        
    );
};

export default Prereg;
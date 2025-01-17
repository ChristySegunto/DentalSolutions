import React, { useState, useRef } from 'react';
import './Addpatient.css';
import Dropdown from 'react-bootstrap/Dropdown';
import { Modal, Button, Form, Col } from 'react-bootstrap';
import PersonalInfoForm from './PersonalInfoForm'
import DentalAndMedForm from './DentalAndMedForm';
import AccountInfoForm from './AccountInfoForm';
import Scanface from './Scanface';
import supabase from './../../settings/supabase.js';
import { useNavigate } from 'react-router-dom'; // Import useHistory hook
import CryptoJS from 'crypto-js';



const Addpatient = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [consentChecked, setConsentChecked] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [canProceed, setCanProceed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalHeader, setModalHeader] = useState("");
    const navigate = useNavigate();
    const [patientId, setPatientId] = useState(null);
    const [username, setUsername] = useState('');
    const [capturedImages, setCapturedImages] = useState(0);
    const [patientFullName, setPatientFullName] = useState('');

    const handleGoToLoginPage = () => {
        navigate('/login');
    };

    const [personalInfoValidation, setPersonalInfoValidation] = useState({ isValid: true, errorMessage: '' });

    const handlePersonalInfoValidation = (isValid, errorMessage) => {
        setPersonalInfoValidation({ isValid, errorMessage });
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
        verification_status: ''
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

    const videoRef = useRef(null);



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
        const passwordRegex = /^[A-Z][a-zA-Z]{0,28}[0-9]{1,10}$/;
        return passwordRegex.test(password);
    };

    const validateAccountInfoData = (data) => {
        let errors = {};
        if (!isValidUsername(data.username)) {
            errors.username = "Username can only contain letters, numbers, underscores, and hyphens.";
        }
        
        if (!isValidPassword(data.password)) {
            errors.password = "Password must start with an uppercase letter, followed by up to 28 letters, then 1-10 numbers.";
        }
        
        if (data.password !== data.confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
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
        setPatientFullName(`${data.patient_fname} ${data.patient_lname}`);
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
    const isValidEmail = (email) => {
        // This regex ensures the email follows the standard format
        // and ends with a single, common domain extension
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        
        // Additional checks for common typos
        const invalidPatterns = [
            /\.{2,}/, // Catches multiple dots anywhere in the email
            /@.*@/, // Catches multiple @ symbols
            /\s/, // Catches any whitespace
            /\.com.*\./, // Catches .com followed by another dot
            /[^\w.@-]/ // Catches any characters that are not alphanumeric, dot, @, or hyphen
        ];
    
        if (!emailRegex.test(email)) {
            return false;
        }
    
        for (let pattern of invalidPatterns) {
            if (pattern.test(email)) {
                return false;
            }
        }
    
        return true;
    };
    const isValidPhoneNumber = (phone) => /^9\d{9}$/.test(phone);

const validateStep2 = (data) => {
    if (!isValidName(data.patient_fname) || !isValidName(data.patient_mname) || !isValidName(data.patient_lname)) {
        return "Names should only contain letters and spaces.";
    }
    if (data.patient_address.trim() === '') {
        return "Address cannot be empty.";
    }
    if (!isValidPhoneNumber(data.patient_contact)) {
        return "Phone number should start with '9' followed by 9 digits.";
    }
    return null;
};

    const handleNext = () => {
        if (currentStep === 1) {
            if (!selectedBranch || !consentChecked) {
                setModalMessage("Please select a branch and agree to the patient consent to proceed.");
                setModalHeader("Attention");
                setShowModal(true);
            } else {
                setCurrentStep((prevStep) => prevStep + 1);
                setShowModal(false);
            }
        }    else if (currentStep === 2) {
            if (!personalInfoValidation.isValid) {
                setModalMessage(personalInfoValidation.errorMessage);
                setModalHeader("Invalid Input");
                setShowModal(true);
            } else {
                const validationError = validateStep2(patientData);
                if (validationError) {
                    setModalMessage(validationError);
                    setModalHeader("Invalid Input");
                    setShowModal(true);
                } else if (!validatePatientData(patientData)) {
                    setModalMessage("Please fill out the required information to proceed. All fields marked with an asterisk (*) are required.");
                    setModalHeader("Complete Required Information");
                    setShowModal(true);
                } else if (patientData.patient_email && !isValidEmail(patientData.patient_email)) {
                    setModalMessage("Please enter a valid email address (e.g., user@example.com).");
                    setModalHeader("Invalid Email");
                    setShowModal(true);
                } else {
                    setCurrentStep((prevStep) => prevStep + 1);
                    setShowModal(false);
                }
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
        } else  if (currentStep === 4) {
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
            if (!validateAccountInfoData(accountInfoData)) {
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
            }

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
                consent_checked: consentChecked
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
                    .upsert([userData])
                    .select()
                    .single();
                    

                if (userInsertError) {
                    throw userInsertError;
                }

                console.log("User data inserted:", userInsertData);
                setUsername(userInsertData.username);

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

                
                // Set patient ID after successful insertion
                setPatientId(patientInsertData.patient_id);

                const { data: dentalAndMedInsertData, error: dentalAndMedInsertError } = await supabase
                    .from('patient_DentalAndMed')
                    .insert([{ ...dentalAndMedDataToInsert, patientId }])
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


            setCurrentStep(prevStep => prevStep + 1);
            setShowModal(false); // Close modal on successful submission
            console.log("Submitting form data:");
            console.log("Personal Info:", patientData);
            console.log("Dental and Med Info:", dentalAndMedData);
            console.log("Account Info:", accountInfoData);
        }
        
    };

    const handleCapturedImagesChange = (count) => {
        setCapturedImages(count);
    };

    // Handle navigation to patient record page
    const handleGoToPatientRecord = async () => {
        if (patientId) {
            const { data, error} = await supabase
                .from('patient')
                .update({ verification_status: 'verified', patient_pendingstatus: null })
                .eq('patient_id', patientId)

                if (error) {
                    console.error("Error updating verification status:", error);
                    setModalMessage("Error updating verification status. Please try again later.");
                    setModalHeader("Error");
                    setShowModal(true);
                } else {
                    navigate(`/patientrecord/${patientId}`);
                }

        } else {
            setModalMessage("Error navigating to patient record. Please try again later.");
            setModalHeader("Error");
            setShowModal(true);
        }
    };




    return (
        <div className='addpatientform'>
            <div className='step-container-addp'>
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
                    <div className={`step-item ${currentStep === 5 ? 'active' : ''}`}>
                        <div className="step-circle">5</div>
                        <div className="step-title">STEP 5</div>
                        <div className="step-contenttitle">Scan Face</div>
                    </div>
                </div>

                <div className="step-content mt-4">
                    {currentStep === 1 && (
                        <div className='step1-addp'>
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
                        <div className='step2-addp'>
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
                        <div className='step3-addp'>

                            <DentalAndMedForm patient_gender={patientData.patient_gender} onUpdateDentalAndMedData={handleUpdateDentalAndMedData} />


                            <div className='btns'>
                                <button className="prevbtn btn btn-secondary mr-2" onClick={handlePrev}>Previous</button>
                                <button className="nextbtn btn btn-primary" onClick={handleNext}>Next</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className='step4-addp'>
                        <AccountInfoForm 
                            accountdata={accountInfoData} 
                            onUpdateAccountInfoData={handleUpdateAccountInfoData}
                        />
        
                        <div className='btns'>
                            <button className="btn btn-secondary mr-2" onClick={handlePrev}>Previous</button>
                            <button className="nextbtn btn btn-primary" onClick={handleSubmit}>Next</button>
                        </div>
                    </div>
                    )}

                    {currentStep === 5 && (
                        <div className='step5-addp'>
                            
                            <Scanface 
            patient_username={username} 
           
            onCapturedImagesChange={handleCapturedImagesChange}
        />
                            <div className='btns'>
                                <button className="btn btn-secondary mr-2" onClick={handlePrev}>Previous</button>
                                <button className="btn btn-success" onClick={handleGoToPatientRecord} disabled={capturedImages !== 5}>Submit</button>
                            </div>

                        </div>
                    )}

                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>{modalHeader}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalMessage.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    <br />
                </React.Fragment>
            ))}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        </div>
        
    );
};

export default Addpatient;
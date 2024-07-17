import React, { useState, useEffect } from "react";

import './../Patientrecord.css'
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams, useLocation} from "react-router-dom";
import supabase from "../../../settings/supabase";
import { useAuth } from "../../../settings/AuthContext";
import { Avatar } from "@files-ui/react";
import Dropdown from "react-bootstrap/Dropdown"
import emailjs from 'emailjs-com';

import userImage from '../../../img/user.png';
// const imageSrc = userImage;

const Details = () => {
    const { user } = useAuth();
    const { patient_id } = useParams();
    const navigate = useNavigate();
    const [adminDetails, setAdminDetails] = useState({});
    const [userDetails, setUserDetails] = useState({});
    const [userError, setUserError] = useState('');


    const [patient, setPatient] = useState({
        patient_fname: '' || null,
        patient_mname: '' || null,
        patient_lname: '' || null,
        patient_branch: '' || null,
        patient_age: '' || null,
        patient_gender: '' || null,
        patient_birthdate: '' || null,
        patient_contact: '' || null,
        patient_email: '' || null,
        patient_address: '' || null,
        guardian_name: '' || null,
        guardian_relationship: '' || null,
        guardian_email: '' || null,
        guardian_number: '' || null
    });
    
    const [dentalAndMedHistory, setDentalAndMedHistory] = useState({
        patient_prevdentist: '',
        patient_lastdentalvisit: '',
        patient_physicianname: '',
        patient_physicianspecialty: '',
        patient_physicianaddress:'',
        patient_physiciannumber:'',
    });

    const [isInGoodHealth, setIsInGoodHealth] = useState("");
    const [isInMedTreatment, setIsInMedTreatment] = useState("");
    const [everHadIllness, setEverHadIllness] = useState("");
    const [everBeenHospitalized, setEverBeenHospitalized] = useState("");
    const [isTakingMedication, setIsTakingMedication] = useState("");
    const [isUsingTobacco, setIsUsingTobacco] = useState("");
    const [isUsingDrugs, setIsUsingDrugs] = useState("");

    const [allergicToLocalAnesthetic, setAllergicToLocalAnesthetic] = useState("");
    const [allergicToPenicillin, setAllergicToPenicillin] = useState("");
    const [allergicToLatex, setAllergicToLatex] = useState("");
    const [allergicToSulfaDrugs, setAllergicToSulfaDrugs] = useState("");
    const [allergicToAspirin, setAllergicToAspirin] = useState("");
    const [allergicToCodeine, setAllergicToCodeine] = useState("");
    const [allergicToNovocain, setAllergicToNovocain] = useState("");

    const [illnessHeartDisease, setIllnessHeartDisease] = useState("");
    const [illnessAnemia, setIllnessAnemia] = useState("");
    const [illnessAcidReflux, setIllnessAcidReflux] = useState("");
    const [illnessHeartFailure, setIllnessHeartFailure] = useState("");
    const [illnessLeukemia, setIllnessLeukemia] = useState("");
    const [illnessStomachUlcer, setIllnessStomachUlcer] = useState("");
    const [illnessAngina, setIllnessAngina] = useState("");
    const [illnessHivAids, setIllnessHivAids] = useState("");
    const [illnessAutoimmune, setIllnessAutoimmune] = useState("");
    const [illnessMitralValve, setIllnessMitralValve] = useState("");
    const [illnessFainting, setIllnessFainting] = useState("");
    const [illnessThyroid, setIllnessThyroid] = useState("");
    const [illnessRheumatic, setIllnessRheumatic] = useState("");
    const [illnessLung, setIllnessLung] = useState("");
    const [illnessFibromyalgia, setIllnessFibromyalgia] = useState("");
    const [illnessCongenitalHeart, setIllnessCongenitalHeart] = useState("");
    const [illnessAsthma, setIllnessAsthma] = useState("");
    const [illnessArthritis, setIllnessArthritis] = useState("");
    const [illnessArtificialHeart, setIllnessArtificialHeart] = useState("");
    const [illnessEmphysema, setIllnessEmphysema] = useState("");
    const [illnessOsteoporosis, setIllnessOsteoporosis] = useState("");
    const [illnessHeartSurgery, setIllnessHeartSurgery] = useState("");
    const [illnessTuberculosis, setIllnessTuberculosis] = useState("");
    const [illnessPsychiatric, setIllnessPsychiatric] = useState("");
    const [illnessPacemaker, setIllnessPacemaker] = useState("");
    const [illnessCancer, setIllnessCancer] = useState("");
    const [illnessEpilepsy, setIllnessEpilepsy] = useState("");
    const [illnessHighblood, setIllnessHighblood] = useState("");
    const [illnessRadiation, setIllnessRadiation] = useState("");
    const [illnessCerebralPalsy, setIllnessCerebralPalsy] = useState("");
    const [illnessStroke, setIllnessStroke] = useState("");
    const [illnessChemotherapy, setIllnessChemotherapy] = useState("");
    const [illnessDiabetes, setIllnessDiabetes] = useState("");
    const [illnessKidney, setIllnessKidney] = useState("");
    const [illnessBleedingProblem, setIllnessBleedingProblem] = useState("");
    const [illnessLiver, setIllnessLiver] = useState("");
    const [illnessHemophilia, setIllnessHemophilia] = useState("");
    const [illnessHepatitisAb, setIllnessHepatitisAb] = useState("");
    const [illnessHepatitisC, setIllnessHepatitisC] = useState("");

    const [isPregnant, setIsPregnant] = useState("");
    const [isNursing, setIsNursing] = useState("");
    const [isTakingPills, setIsTakingPills] = useState("");


    const [showGuardianForm, setShowGuardianForm] = useState(false);
    const [showWomanForm, setShowWomanForm] = useState(false);

    const [imageSource, setImageSource] = useState(userImage);

    const [showTransferPatientModal, setShowTransferPatientModal] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [transferReason, setTransferReason] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);


    useEffect(() => {
        const fetchProfileDetails = async () => {
            try {
                if (!user || !user.user_id) {
                    throw new Error('User is not logged in or user ID is undefined');
                }

                const userId = user.user_id;
                console.log('User ID:', userId);

                const { data: userData, error: userError } = await supabase
                    .from('user')
                    .select('role')
                    .eq('user_id', userId)
                    .single();

                if (userError) {
                    throw userError;
                }

                setUserDetails(userData);
                console.log(userDetails);

                let tableName;
                if (userData.role === 'dentist') {
                    tableName = 'dentist';
                } else if (userData.role === 'assistant') {
                    tableName = 'assistant';
                } else {
                    throw new Error('Unsupported role');
                }

                const { data: adminData, error: adminError } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (adminError) {
                    throw adminError;
                }

                setAdminDetails(adminData);

            } catch (error) {
                console.error('Error fetching profile details:', error.message);
                setUserError('Failed to fetch profile details');
            }
        };
        const fetchPatientDetails = async () => {
            try {
                console.log(patient_id);
                if (!patient_id) {
                    throw new Error('Patient ID is undefined');
                }
    
                // Fetch patient data from Supabase
                const { data, error } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('patient_id', parseInt(patient_id))
                    .single();
    
                if (error) {
                    throw error;
                }
    
                setPatient(data);
    
                if (data.patient_gender === 'Female') {
                    setShowWomanForm(true);
                } else {
                    setShowWomanForm(false);
                }
    
                if (data.patient_age < 18) {
                    setShowGuardianForm(true);
                } else {
                    setShowGuardianForm(false);
                }
    
            } catch (error) {
                console.error('Error fetching patient details:', error.message);
                // Handle error state if needed
            }
        };
    
        const fetchDentalandMedicalDetails = async () => {
            try {
                if (!patient_id) {
                    throw new Error('Patient ID is undefined');
                }
    
                // Fetch dental and medical data from Supabase
                const { data, error } = await supabase
                    .from('patient_DentalAndMed')
                    .select('*')
                    .eq('patient_id', parseInt(patient_id))
                    .single();
    
                if (error) {
                    throw error;
                }
    
                setDentalAndMedHistory(data || {}); // Update state with fetched data

                /// Set class based on value
                setIsInGoodHealth(data.isInGoodHealth || "");
                setIsInMedTreatment(data.isInMedTreatment || "");
                setEverHadIllness(data.everHadIllness || "");
                setEverBeenHospitalized(data.everBeenHospitalized || "");
                setIsTakingMedication(data.isTakingMedication || "");
                setIsUsingTobacco(data.isUsingTobacco || "");
                setIsUsingDrugs(data.isUsingDrugs || "");
                

                setAllergicToLocalAnesthetic(data.allergicToLocalAnesthetic || "");
                setAllergicToPenicillin(data.allergicToPenicillin || "");
                setAllergicToLatex(data.allergicToLatex || "");
                setAllergicToSulfaDrugs(data.allergicToSulfaDrugs || "");
                setAllergicToAspirin(data.allergicToAspirin || "");
                setAllergicToCodeine(data.allergicToCodeine || "");
                setAllergicToNovocain(data.allergicToNovocain || "");

                setIllnessHeartDisease(data.illnessHeartDisease || "");
                setIllnessAnemia(data.illnessAnemia || "");
                setIllnessAcidReflux(data.illnessAcidReflux || "");
                setIllnessHeartFailure(data.illnessHeartFailure || "");
                setIllnessLeukemia(data.illnessLeukemia || "");
                setIllnessStomachUlcer(data.illnessStomachUlcer || "");
                setIllnessStomachUlcer(data.illnessAngina || "");
                setIllnessHivAids(data.illnessHivAids || "");
                setIllnessAutoimmune(data.illnessAutoimmune || "");
                setIllnessMitralValve(data.illnessMitralValve || "");
                setIllnessFainting(data.illnessFainting || "");
                setIllnessThyroid(data.illnessThyroid || "");
                setIllnessRheumatic(data.illnessRheumatic || "");
                setIllnessLung(data.illnessLung || "");
                setIllnessFibromyalgia(data.illnessFibromyalgia || "");
                setIllnessCongenitalHeart(data.illnessCongenitalHeart || "");
                setIllnessAsthma(data.illnessAsthma || "");
                setIllnessArthritis(data.illnessArthritis || "");
                setIllnessArtificialHeart(data.illnessArtificialHeart || "");
                setIllnessEmphysema(data.illnessEmphysema || "");
                setIllnessOsteoporosis(data.illnessOsteoporosis || "");
                setIllnessHeartSurgery(data.illnessHeartSurgery || "");
                setIllnessTuberculosis(data.illnessTuberculosis || "");
                setIllnessPsychiatric(data.illnessPsychiatric || "");
                setIllnessPacemaker(data.illnessPacemaker || "");
                setIllnessCancer(data.illnessCancer || "");
                setIllnessEpilepsy(data.illnessEpilepsy || "");
                setIllnessHighblood(data.illnessHighblood || "");
                setIllnessRadiation(data.illnessRadiation || "");
                setIllnessCerebralPalsy(data.illnessCerebralPalsy || "");
                setIllnessStroke(data.illnessStroke || "");
                setIllnessChemotherapy(data.illnessChemotherapy || "");
                setIllnessDiabetes(data.illnessDiabetes || "");
                setIllnessKidney(data.illnessKidney || "");
                setIllnessBleedingProblem(data.illnessBleedingProblem || "");
                setIllnessLiver(data.illnessLiver || "");
                setIllnessHemophilia(data.illnessHemophilia || "");
                setIllnessHepatitisAb(data.illnessHepatitisAb || "");
                setIllnessHepatitisC(data.illnessHepatitisC || "");

                setIsPregnant(data.isPregnant || "");
                setIsNursing(data.isNursing || "");
                setIsTakingPills(data.isTakingPills || "");
    
            } catch (error) {
                console.error('Error fetching dental and medical details:', error.message);
            }
    
        };
    
        fetchProfileDetails();
        fetchPatientDetails();
        fetchDentalandMedicalDetails();

    
    }, [patient_id]);


    //if data is null, then the placeholder will display n/a instead of blank
    const getPlaceholder = (value) => value ? value : "N/A";

    // Function to capitalize first letter of a string
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Function to capitalize all letters of a string
    const capitalizeAllLetters = (string) => {
        return string.toUpperCase();
    };

    const patient_fname = patient.patient_fname ? capitalizeFirstLetter(patient.patient_fname) : '';
    const patient_mname = patient.patient_mname ? capitalizeFirstLetter(patient.patient_mname) : '';
    const patient_lname = patient.patient_lname ? capitalizeFirstLetter(patient.patient_lname) : '';

    const patient_branch = patient.patient_branch ? capitalizeAllLetters(patient.patient_branch) : 'Branch not provided';

    if (!patient || !dentalAndMedHistory) {
        return <div>Loading...</div>; // Add loading state while fetching data
    }

    const handleEditDetails = () => {
        navigate(`/patientrecord/${patient_id}/editdetails`);
    };

    const handleChangeSource = (selectedFile) => {
        setImageSource(selectedFile);
    };

    const handleTransferPatient = () => {
        setShowTransferPatientModal(true);
    };

    const handleBranchChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedBranches(selectedValue);
    };

    // Format first name with first letter capitalized, or default text if not provided
    const firstName = adminDetails.fname ? capitalizeFirstLetter(adminDetails.fname) : 'First name not provided';
    console.log(firstName)

    // Format last name with first letter capitalized, or default text if not provided
    const lastName = adminDetails.lname ? capitalizeFirstLetter(adminDetails.lname) : 'Last name not provided';

    // Construct full name from first name and last name
    let fullName = `${firstName} ${lastName}`;

    // Prefix "Dr." to full name if user role is "dentist"
    if (userDetails && userDetails.role === 'dentist') {
        fullName = `Dr. ${fullName}`;
    }

//EMAILJS
    const emailjs = require('emailjs-com');


    const handleTransferPatientSubmit = async () => {
        setShowConfirmModal(false);

        // Customize template parameters
        const templateParams = {
            from_name: 'dentalsolutionsample@gmail.com',
            send_to: patient.patient_email,
            to_name: patient.patient_fname,
            message: transferReason 
        };

        // Send email using EmailJS
        const emailResult = await emailjs.send(
            'service_41jqk43', // Your EmailJS service ID
            'template_uyupudb', // Your EmailJS template ID
            templateParams, // Parameters for the email template
            'b7q1Mru-GSMKmpTr7' // Your EmailJS user ID
        );

        console.log('Email sent:', emailResult);


        const transferPatient = {
            patient_id,
            from_branch: patient.patient_branch,
            to_branch: selectedBranches,
            transfer_status: 'Pending',
            patient_fname: patient.patient_fname,
            patient_lname: patient.patient_lname,
            transferred_by: fullName,
            transfer_date: new Date().toISOString(),
            transfer_reason: transferReason
        }

        try{
            const { data, error } = await supabase
                .from('patient_Transfer')
                .insert(transferPatient)
                .single();

            const {updatePatient, error: updateError} = await supabase
                .from('patient')
                .update({transfer_status: 'pending'})
                .eq('patient_id', patient_id)
                .single();


            if (error) {
                throw error;
            }

            console.log('Patient transferred:', data);

            setShowSuccessMessage(true);
            setTimeout(() => {
                navigate('/patientlist');
            }, 3000);

        } catch (error) {
            console.error('Error transferring patient:', error.message);
        }


    };

    const handleConfirm = (event) => {
        event.preventDefault();
        setShowConfirmModal(true);
    };


    return (
        <>  
            <div className="edit-transfer col-lg-4 col-md-4 col-sm-4 mb-2">
                <button class="editbtn btn" type="button" onClick={handleEditDetails}>Edit</button>
                <button class="transferbtn btn" type="button" onClick={handleTransferPatient}>Transfer</button>
            </div>
            
            <div className="personalinfo-container row">

                <div className="avatar-col col-10 col-md-2 col-sm-12 order-md-1 d-flex justify-content-center">
                    <Avatar
                        src={imageSource}
                        alt="uploadpic"
                        changeLabel={"Upload Picture"}
                        onChange={handleChangeSource}
                    />
                </div>
                
                <div className="personalinfo-col col-12 col-md-8 order-md-2 order-2 ">
                    <div className="name-branch row">
                        <div className="fullname col-lg-8">
                            <h4>{patient_fname} {patient_mname} {patient_lname}</h4>
                        </div>
                        <div className="branch-label col-lg-4">
                            <p>{patient_branch}</p>
                        </div>
                    </div>  

                    <div className="otherdetails row">
                        <div className="agegenderbday col-lg-6">
                            <p><span className="bold">Age:</span> {patient.patient_age}</p>
                            <p><span className="bold">Gender:</span> {patient.patient_gender}</p>
                            <p><span className="bold">Birthdate:</span> {patient.patient_birthdate}</p>
                        </div>
                        <div className="numemailadd col-lg-6">
                            <p><span className="bold">Contact Number:</span> {patient.patient_contact}</p>
                            <p><span className="bold">Email:</span> {patient.patient_email}</p>
                            <p><span className="bold">Address:</span> {patient.patient_address}</p>
                        </div>
                    </div>

                    {showGuardianForm && (
                        <>
                            <div className="otherdetails row">
                                <div className="numemailadd col-lg-6">
                                    <p><span className="bold">Guardian Name:</span> {patient.guardian_name}</p>
                                    <p><span className="bold">Relationship with Patient:</span> {patient.guardian_relationship}</p>
                                </div>
                                <div className="numemailadd col-lg-6">
                                    <p><span className="bold">Guardian Name:</span> {patient.guardian_email}</p>
                                    <p><span className="bold">Relationship with Patient:</span> {patient.guardian_number}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>

            <div className="dentalhistoryinfo">
                <h2>DENTAL HISTORY</h2>
                    <div className='dentistdetailinfo row'>
                        <Form.Group className="form-custom col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Previous Dentist</Form.Label>
                            <Form.Control className="form-input-custom" type="text" placeholder={getPlaceholder(dentalAndMedHistory.patient_prevdentist)} disabled/>
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Last Dental Visit</Form.Label>
                            <Form.Control className="form-input-custom" type="text" placeholder={getPlaceholder(dentalAndMedHistory.patient_lastdentalvisit)} disabled/>
                        </Form.Group>
                    </div>
            </div>

                <div className="medhistoryinfo">
                    <h2>MEDICAL HISTORY</h2>
                    <div className='medicaldetailinfo row'>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Name of Physician</Form.Label>
                            <Form.Control className="form-input-custom" type="text" placeholder={getPlaceholder(dentalAndMedHistory.patient_physicianname)} disabled/>
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Specialty, if applicable</Form.Label>
                            <Form.Control className="form-input-custom" type="text" placeholder={getPlaceholder(dentalAndMedHistory.patient_physicianspecialty)} disabled/>
                        </Form.Group>
                    </div>

                    <div className='physiciandetail row mb-3'>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Office Address</Form.Label>
                            <Form.Control className="form-input-custom" type="text" placeholder={getPlaceholder(dentalAndMedHistory.patient_physicianaddress)} disabled/>
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Office Number</Form.Label>
                            <Form.Control className="form-input-custom" type="text" placeholder={getPlaceholder(dentalAndMedHistory.patient_physiciannumber)} disabled/>
                        </Form.Group>
                    </div>

                    <div className='divider mt-2'></div>

                    <div className='health-status row mb-1'>
                        <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                            <Form.Label className=" form-label-custom">Are you in good health?</Form.Label>
                        </Form.Group>
                        <Form.Group className="yes-no col-lg-4" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`radio ${isInGoodHealth === "yes" ? "green-radio" : "radio"}`}></div>
                                    <p>Yes</p>

                                    <div className={`radio ${isInGoodHealth === "no" ? "red-radio" : "radio"}`}></div>
                                    <p>No</p>
                            </div>
                        </Form.Group>
                    </div>
                    
                    <div className='health-status row mb-1'>
                        <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Are you under medical treatment now?</Form.Label>
                        </Form.Group>
                        <Form.Group className="yes-no col-lg-4" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`radio ${isInMedTreatment === "yes" ? "green-radio" : "radio"}`}></div>
                                    <p>Yes</p>

                                    <div className={`radio ${isInMedTreatment === "no" ? "red-radio" : "radio"}`}></div>
                                    <p>No</p>
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row mb-1'>
                        <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Have you ever had serious illness or surgical operation?</Form.Label>
                        </Form.Group>
                        <Form.Group className="yes-no col-lg-4" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`radio ${everHadIllness === "yes" ? "green-radio" : "radio"}`}></div>
                                    <p>Yes</p>

                                    <div className={`radio ${everHadIllness === "no" ? "red-radio" : "radio"}`}></div>
                                    <p>No</p>
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row mb-1'>
                        <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Have you ever been hospitalized?</Form.Label>
                        </Form.Group>
                        <Form.Group className="yes-no col-lg-4" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`radio ${everBeenHospitalized === "yes" ? "green-radio" : "radio"}`}></div>
                                    <p>Yes</p>

                                    <div className={`radio ${everBeenHospitalized === "no" ? "red-radio" : "radio"}`}></div>
                                    <p>No</p>
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row mb-1'>
                        <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Are you taking any prescription/non-prescription medication?</Form.Label>
                        </Form.Group>
                        <Form.Group className="yes-no col-lg-4" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`radio ${isTakingMedication === "yes" ? "green-radio" : "radio"}`}></div>
                                    <p>Yes</p>

                                    <div className={`radio ${isTakingMedication === "no" ? "red-radio" : "radio"}`}></div>
                                    <p>No</p>
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row mb-1'>
                        <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Do you use tobacco products?</Form.Label>
                        </Form.Group>
                        <Form.Group className="yes-no col-lg-4" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`radio ${isUsingTobacco === "yes" ? "green-radio" : "radio"}`}></div>
                                    <p>Yes</p>

                                    <div className={`radio ${isUsingTobacco === "no" ? "red-radio" : "radio"}`}></div>
                                    <p>No</p>
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row mb-1'>
                        <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Do you use alcohol, cocaine or other dangerous drugs?</Form.Label>
                        </Form.Group>
                        <Form.Group className="yes-no col-lg-4" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`radio ${isUsingDrugs === "yes" ? "green-radio" : "radio"}`}></div>
                                    <p>Yes</p>

                                    <div className={`radio ${isUsingDrugs === "no" ? "red-radio" : "radio"}`}></div>
                                    <p>No</p>
                            </div>
                        </Form.Group>
                    </div>

                    <div className='divider mt-2'></div>

                    <div className='allergy row'>
                        <Form.Group className="row-lg-12" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Are you allergic to any of the following below? Select all that applies:</Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex align-items-start'}>
                                    <div className={`checkbox ${allergicToLocalAnesthetic === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p className="d-flex align-items-start">Local Anesthetic</p>
                            </div>
                        </Form.Group>

                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex align-items-start'}>
                                    <div className={`checkbox ${allergicToPenicillin === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Penicillin, Antibiotics</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex align-items-start'}>
                                    <div className={`checkbox ${allergicToLatex === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Latex</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex align-items-start'}>
                                    <div className={`checkbox ${allergicToSulfaDrugs === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Sulfa Drugs</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex align-items-start'}>
                                    <div className={`checkbox ${allergicToAspirin === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Aspirin</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex align-items-start'}>
                                    <div className={`checkbox ${allergicToCodeine === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Codeine</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex align-items-start'}>
                                    <div className={`checkbox ${allergicToNovocain === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Novocain</p>
                            </div>
                        </Form.Group>
                    </div>

                    <div className='divider mt-4 mb-4'></div>

                    <div className='illness row'>
                        <Form.Group className="row-lg-12" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Do you have or have you ever had any of the following below? Select all that applies.</Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHeartDisease === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Heart Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessAnemia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Anemia / Sickle Cell</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessAcidReflux === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Acid Reflux / GERD</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHeartFailure === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Heart Failure</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessLeukemia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Leukemia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessStomachUlcer === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Stomach Ulcer</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessAngina === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Angina</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHivAids === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>HIV+ / AIDS</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessAutoimmune === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Autoimmune Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessMitralValve === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Mitral Valve Prolapse</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessFainting === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Fainting / Dizzy Spells</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessThyroid === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Thyroid Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessRheumatic === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Rheumatic Fever</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessLung === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Lung Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessFibromyalgia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Fibromyalgia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessCongenitalHeart === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Congenital Heart Lesion</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessAsthma === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Asthma</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessArthritis === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Arthritis</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessArtificialHeart === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Artificial Heart Valve</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessEmphysema === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Emphysema / Bronchitis</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessOsteoporosis === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Osteoporosis / Penia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHeartSurgery === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Heart Surgery</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessTuberculosis === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Tuberculosis / PPD+</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessPsychiatric === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Psychiatric Disorder</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessPacemaker === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Pacemaker</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessCancer === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Cancer</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessEpilepsy === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Epilepsy / Seizures</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHighblood === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Highblood Pressure</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessRadiation === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Radiation Therapy</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessCerebralPalsy === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Cerebral Palsy</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessStroke === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Stroke</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessChemotherapy === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Chemotherapy</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessDiabetes === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Diabetes</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessKidney === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Kidney Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessBleedingProblem === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Bleeding Problem/ Bruises</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessLiver === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Liver Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHemophilia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Hemophilia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHepatitisAb === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Hepatitis A, B</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline align-items-start'>
                                <div className={`checkbox ${illnessHepatitisC === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Hepatitis C</p>
                            </div>
                        </Form.Group>
                    </div>

                    {showWomanForm && (
                        <>
                        <div className="isFemale">
                            <div className='divider mt-3' ></div>

                            <div className="womanForm row">
                                <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                                    <Form.Label className=" form-label-custom">Are you pregnant?</Form.Label>
                                </Form.Group>
                                <Form.Group className="yes-no col-lg-4" controlId="formWomanStatus">
                                    <div className={'healthstatusline d-flex'}>
                                            <div className={`radio ${isPregnant === "yes" ? "green-radio" : "radio"}`}></div>
                                            <p>Yes</p>

                                            <div className={`radio ${isPregnant === "no" ? "red-radio" : "radio"}`}></div>
                                            <p>No</p>
                                    </div>
                                </Form.Group>
                            </div>

                            <div className="womanForm row">
                                <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                                    <Form.Label className="form-label-custom">Are you nursing?</Form.Label>
                                </Form.Group>
                                <Form.Group className="yes-no col-lg-4" controlId="formWomanStatus">
                                    <div className={'healthstatusline d-flex'}>
                                            <div className={`radio ${isNursing === "yes" ? "green-radio" : "radio"}`}></div>
                                            <p>Yes</p>

                                            <div className={`radio ${isNursing === "no" ? "red-radio" : "radio"}`}></div>
                                            <p>No</p>
                                    </div>
                                </Form.Group>
                            </div>

                            <div className="womanForm row">
                                <Form.Group className="question col-lg-8" controlId="formHealthStatus">
                                    <Form.Label className="form-label-custom">Are you taking birth control pills?</Form.Label>
                                </Form.Group>
                                <Form.Group className="yes-no col-lg-4" controlId="formWomanStatus">
                                    <div className={'healthstatusline d-flex'}>
                                            <div className={`radio ${isTakingPills === "yes" ? "green-radio" : "radio"}`}></div>
                                            <p>Yes</p>

                                            <div className={`radio ${isTakingPills === "no" ? "red-radio" : "radio"}`}></div>
                                            <p>No</p>
                                    </div>
                                </Form.Group>
                            </div>
                        </div>
                            
                        </>
                    )}

                </div>

            <Modal show={showTransferPatientModal} onHide={() => setShowTransferPatientModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Transfer Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-6 col-md-12 mb-3">
                        <label className="txtbox-lbl mb-2">Transfer to Branch:<span className="required">*</span></label>
                        <Dropdown className="dropdown-custom">
                            <Dropdown.Toggle className="dropdown-custom" variant="dropdown-custom">
                                {selectedBranches ? selectedBranches : 'Select Branch'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-custom">
                                <Dropdown.Item onClick={() => handleBranchChange({ target: { value: 'Alabang' } })}>
                                    Alabang
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleBranchChange({ target: { value: 'Cubao' } })}>
                                    Cubao
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleBranchChange({ target: { value: 'Leon Guinto' } })}>
                                    Leon Guinto
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleBranchChange({ target: { value: 'Mabini' } })}>
                                    Mabini
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleBranchChange({ target: { value: 'Makati' } })}>
                                    Makati
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    <Form.Group controlId="transferReason">
                        <Form.Label> Reason for transferring this patient.</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter reason"
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary">
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Transfer
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Transfer Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to transfer this patient?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleTransferPatientSubmit}>
                        Transfer
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showSuccessMessage} onHide={() => setShowSuccessMessage(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Transfer Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body text-center">
                    The patient has been successfully transferred.<br/>
                    Redirecting to Patient List page...
                </Modal.Body>
            </Modal>
        </>
    );
}           


export default Details;
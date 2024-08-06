import React, { useState, useEffect } from "react";
import './History.css'


import { Tab, Tabs, Button} from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams, useLocation} from "react-router-dom";
import { useAuth } from "../../settings/AuthContext";
import supabase from '../../settings/supabase.js';
import { Avatar } from "@files-ui/react";
import Dropdown from "react-bootstrap/Dropdown"
import emailjs from 'emailjs-com';

import userImage from '../../img/user.png';

import TreatmentPatient from "./Treatment.js";
import OrthodonticsPatient from "./Orthodontics.js";


//other files


const History = () => {
    const { user } = useAuth();
    const [adminDetails, setAdminDetails] = useState({});
    const [userDetails, setUserDetails] = useState({});
    const [userError, setUserError] = useState('');
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('treatments');
    const navigate = useNavigate();

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
                if (userData.role === 'patient') {
                    tableName = 'patient';
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

                const userId = user.user_id;
                // Fetch patient data from Supabase
                const { data, error } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('user_id', userId)
                    .single();
    
                if (error) {
                    throw error;
                }
    
                setPatient(data);
                console.log('Patient data:', patient);
    
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
                if (!patient.patient_id) {
                    throw new Error('Patient ID is undefined');
                }
    
                // Fetch dental and medical data from Supabase
                const { data, error } = await supabase
                    .from('patient_DentalAndMed')
                    .select('*')
                    .eq('patient_id', patient.patient_id)
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

                console.log('Dental and medical data:', dentalAndMedHistory);
    
            } catch (error) {
                console.error('Error fetching dental and medical details:', error.message);
            }
    
        };

        fetchProfileDetails();
        fetchPatientDetails();
        fetchDentalandMedicalDetails();
    }, []);

    const handleChangeSource = (selectedFile) => {
        setImageSource(selectedFile);
    };

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

    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);
    

    const handleTabSelect = (tabKey) => {
        setActiveTab(tabKey);
    };



    return (
        <>
            <div className="patientrecord-patient-content container-fluid">
                <div className="record-header mb-2">
                    <h2>HISTORY</h2>
                </div>

                <div className="personalinfo-patient-container row">
                    <div className="avatar-col col-12 col-md-2 order-md-1 order-1 d-flex justify-content-center">
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
                                <p><span className="bold">Contact Number:</span> +63{patient.patient_contact}</p>
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

                <div className="patienthistory-content container-fluid">
                    <Tabs id="patient-record-tabs" activeKey={activeTab} onSelect={handleTabSelect} className="mb-3 historytabs-custom">
                        <Tab eventKey="treatments" title="Treatments" className="tab-custom">
                            <TreatmentPatient/>
                        </Tab>
                        <Tab eventKey="orthodontics"title="Orthodontics" className="tab-custom">
                            <OrthodonticsPatient />
                        </Tab>
                    </Tabs>

                </div>

            </div>
        </>
    )
}

export default History;
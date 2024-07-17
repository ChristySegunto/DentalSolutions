import React, { useState, useEffect } from "react";
import './ReviewPatient.css'
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from "../../settings/AuthContext";
import supabase from "../../settings/supabase";
import { useNavigate, useParams, useLocation} from "react-router-dom";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


    

const ReviewPatient = () => {
    const { user } = useAuth();
    const { patient_id } = useParams();
    const [activeTab, setActiveTab] = useState('details');
    const location = useLocation();



    const [userDetails, setUserDetails] = useState(null);
    const [adminDetails, setAdminDetails] = useState(null);
    const [userError, setUserError] = useState('');
    const [adminError, setAdminError] = useState('');

    const [patient, setPatient] = useState(null); // State to hold patient data
    const [dentalAndMedHistory, setDentalAndMedHistory] = useState(null);
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


    const [showWomanForm, setShowWomanForm] = useState(false);

    const [showTransferModal, setShowTransferModal] = useState(false);

    const [showGuardianForm, setShowGuardianForm] = useState(false);

    const [showEditTransferBtn, setShowEditTransferBtn] = useState(false);




    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/patientlist');
    };

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

                    setUserDetails(userData);

                // Determine which table to query based on user role
                let tableName;
                if (userData.role === 'dentist') {
                    tableName = 'dentist';
                } else if (userData.role === 'assistant') {
                    tableName = 'assistant';
                } else {
                    throw new Error('Unsupported role');
                }

                // Fetch profile details based on the determined table name
                const { data: adminData, error: adminError } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                    setAdminDetails(adminData);
                    console.log(adminDetails);
                    
            } catch ({userError, adminError}) {
                console.error('Error fetching profile details:', userError.message);
                setUserError('Failed to fetch profile details');
            }
        };

        fetchProfileDetails();

        const fetchPatientDetails = async () => {
          try {
            if (!patient_id) {
                throw new Error('Patient ID is undefined');
            }

            // Fetch patient data from Supabase
            const { data, patientinfoerror } = await supabase
              .from('patient')
              .select('*')
              .eq('patient_id',parseInt(patient_id))
              .single();
    
            if (patientinfoerror) {
              throw patientinfoerror;
            }

            setPatient(data)

            if(data.patient_gender == 'Female'){
                setShowWomanForm(true);
            } else {
                setShowWomanForm(false);
            }

            if(data.patient_age < 18){
                setShowGuardianForm(true);
            } else {
                setShowGuardianForm(false);
            }

          } catch ({patientinfoerror, dentalandmederror}) {
            console.error('Error fetching patient details:', patientinfoerror.message);
            // Handle error state if needed
          }
        };
    
        fetchPatientDetails();

        const fetchDentalandMedicalDetails = async () => {
            try {
              if (!patient_id) {
                  throw new Error('Patient ID is undefined');
              }

              // Fetch dental and medical data from Supabase
              const { data, error } = await supabase
                .from('patient_DentalAndMed')
                .select('*')
                .eq('patient_id',parseInt(patient_id))
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
              // Handle error state if needed
            }
          };
      
          fetchDentalandMedicalDetails();

      }, [patient_id]);

      useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
        }, [location]);

        const handleTabClick = (tabName) => {
            setActiveTab(tabName);
        };


      if (!patient || !dentalAndMedHistory) {
        return <div>Loading...</div>; // Add loading state while fetching data
      }
      const getPlaceholder = (value) => value ? value : "N/A";



    return (

            <div className="reviewpatient-content container-fluid">
            <Col>        
         <h1> PATIENT LIST </h1>   
         </Col>
         <div className="reviewpatient-header">
            <Button className="backbtn" variant="light" onClick={handleBack}>
                <FaArrowLeft className="me-2" /> 
                </Button>
                <h3>Review</h3>
                <button class="scanfacebtn btn" type="button" > Scan Face </button>
                </div>
                <div className="personalinfo-container">
                    <div className="name-branch row">
                        <div className="fullname col-lg-8">
                            <h4>{patient.patient_fname.toUpperCase()} {patient.patient_mname.toUpperCase()} {patient.patient_lname.toUpperCase()}</h4>
                        </div>
                        <div className="branch-label col-lg-4">
                            <p>{patient.patient_branch.toUpperCase()}</p>
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
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`checkbox ${allergicToLocalAnesthetic === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Local Anesthetic</p>
                            </div>
                        </Form.Group>

                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`checkbox ${allergicToPenicillin === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Penicillin, Antibiotics</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`checkbox ${allergicToLatex === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Latex</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`checkbox ${allergicToSulfaDrugs === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Sulfa Drugs</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`checkbox ${allergicToAspirin === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Aspirin</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
                                    <div className={`checkbox ${allergicToCodeine === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                    <p>Codeine</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3" controlId="formHealthStatus">
                            <div className={'healthstatusline d-flex'}>
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
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessHeartDisease === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Heart Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessAnemia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Anemia / Sickle Cell</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessAcidReflux === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Acid Reflux / GERD</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessHeartFailure === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Heart Failure</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessLeukemia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Leukemia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessStomachUlcer === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Stomach Ulcer</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessAngina === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Angina</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessHivAids === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>HIV+ / AIDS</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessAutoimmune === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Autoimmune Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessMitralValve === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Mitral Valve Prolapse</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessFainting === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Fainting / Dizzy Spells</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessThyroid === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Thyroid Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessRheumatic === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Rheumatic Fever</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessLung === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Lung Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessFibromyalgia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Fibromyalgia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessCongenitalHeart === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Congenital Heart Lesion</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessAsthma === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Asthma</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessArthritis === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Arthritis</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessArtificialHeart === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Artificial Heart Valve</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessEmphysema === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Emphysema / Bronchitis</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessOsteoporosis === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Osteoporosis / Penia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessHeartSurgery === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Heart Surgery</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessTuberculosis === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Tuberculosis / PPD+</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessPsychiatric === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Psychiatric Disorder</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessPacemaker === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Pacemaker</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessCancer === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Cancer</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessEpilepsy === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Epilepsy / Seizures</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessHighblood === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Highblood Pressure</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessRadiation === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Radiation Therapy</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessCerebralPalsy === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Cerebral Palsy</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessStroke === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Stroke</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessChemotherapy === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Chemotherapy</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessDiabetes === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Diabetes</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessKidney === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Kidney Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessBleedingProblem === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Bleeding Problem/ Bruises</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessLiver === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Liver Disease</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessHemophilia === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Hemophilia</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
                                <div className={`checkbox ${illnessHepatitisAb === "true" ? "green-checkbox" : "checkbox"}`}></div>
                                <p>Hepatitis A, B</p>
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-3">
                            <div className='d-flex healthstatusline'>
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
        </div>
        
    )
}

export default ReviewPatient;
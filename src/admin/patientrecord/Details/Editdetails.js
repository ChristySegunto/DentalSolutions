import React, { useState, useEffect } from "react";
import './Editdetails.css';
import { Button, Form } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import DatePicker from 'react-datepicker';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../settings/AuthContext";
import supabase from "../../../settings/supabase";

const Editdetails = () => {
    const navigate = useNavigate();
    const { patient_id } = useParams();
    const [showGuardianForm, setShowGuardianForm] = useState(false);
    const [checked, setChecked] = useState(true);
    const [originalValue, setOriginalValue] = useState(true);


    const [patient, setPatient] = useState({
        patient_fname: '',
        patient_mname: '',
        patient_lname: '',
        patient_age: '',
        patient_gender: '',
        patient_birthdate: '',
        patient_address: '',
        patient_email: '',
        patient_contact: '',
        guardian_name: '',
        guardian_relationship: '',
        guardian_email: '',
        guardian_number: ''
    });

    const [dentalAndMed, setDentalAndMed] = useState({
        patient_prevdentist: '',
        patient_lastdentalvisit: '',
        patient_physicianname: '',
        patient_physicianspecialty: '',
        patient_physicianaddress: '',
        patient_physiciannumber:'',
        isInGoodHealth: false,
        isInMedTreatment: false,
        everHadIllness: false,
        everBeenHospitalized: false,
        isTakingMedication: false,
        isUsingTobacco: false,
        isUsingDrugs: false,
        allergicToLocalAnesthetic: false,
        allergicToPenicillin: false,
        allergicToLatex: false,
        allergicToSulfaDrugs: false,
        allergicToAspirin: false,
        allergicToCodeine: false,
        allergicToNovocain: false,
        illnessHeartDisease: false,
        illnessAnemia: false,
        illnessAcidReflux: false,
        illnessHeartFailure: false,
        illnessLeukemia: false,
        illnessStomachUlcer: false,
        illnessAngina: false,
        illnessHivAids: false,
        illnessAutoimmune: false,
        illnessMitralValve: false,
        illnessFainting: false,
        illnessThyroid: false,
        illnessRheumatic: false,
        illnessLung: false,
        illnessFibromyalgia: false,
        illnessCongenitalHeart: false,
        illnessAsthma: false,
        illnessArthritis: false,
        illnessArtificialHeart: false,
        illnessEmphysema: false,
        illnessOsteoporosis: false,
        illnessHeartSurgery: false,
        illnessTuberculosis: false,
        illnessPsychiatric: false,
        illnessPacemaker: false,
        illnessCancer: false,
        illnessEpilepsy: false,
        illnessHighblood: false,
        illnessRadiation: false,
        illnessCerebralPalsy: false,
        illnessStroke: false,
        illnessChemotherapy: false,
        illnessDiabetes: false,
        illnessKidney: false,
        illnessBleedingProblem: false,
        illnessLiver: false,
        illnessHemophilia: false,
        illnessHepatitisAb: false,
        illnessHepatitisC: false,
        isPregnant: false,
        isNursing: false,
        isTakingPills: false
    });

    useEffect(() => {
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
                
            } catch ({patientinfoerror}) {
                console.error('Error fetching patient details:', patientinfoerror.message);
            }
        };

        const fetchDentalAndMedDetails = async () => {
            try{
                const { data, dataandmederror } = await supabase
                    .from('patient_DentalAndMed')
                    .select('*')
                    .eq('patient_id',parseInt(patient_id))
                    .single();
                
                    if (dataandmederror) {
                        throw dataandmederror;
                    }

                    setDentalAndMed({                    
                        patient_prevdentist: dentalAndMed.patient_prevdentist,
                        patient_lastdentalvisit: dentalAndMed.patient_lastdentalvisit,
                        patient_physicianname: dentalAndMed.patient_physicianname,
                        patient_physicianspecialty: dentalAndMed.patient_physicianspecialty,
                        patient_physicianaddress: dentalAndMed.patient_physicianaddress,
                        patient_physiciannumber: dentalAndMed.patient_physiciannumber,
                        isInGoodHealth: dentalAndMed.isInGoodHealth || false,
                        isInMedTreatment: dentalAndMed.isInMedTreatment || false,
                        everHadIllness: dentalAndMed.everHadIllness || false,
                        everBeenHospitalized: dentalAndMed.everBeenHospitalized || false,
                        isTakingMedication: dentalAndMed.isTakingMedication || false,
                        isUsingTobacco: dentalAndMed.isUsingTobacco || false,
                        isUsingDrugs: dentalAndMed.isUsingDrugs || false,
                        allergicToLocalAnesthetic: dentalAndMed.allergicToLocalAnesthetic || false,
                        allergicToPenicillin: dentalAndMed.allergicToPenicillin || false,
                        allergicToLatex: dentalAndMed.allergicToLatex ,
                        allergicToSulfaDrugs: dentalAndMed.allergicToSulfaDrugs,
                        allergicToAspirin: dentalAndMed.allergicToAspirin,
                        allergicToCodeine: dentalAndMed.allergicToCodeine,
                        allergicToNovocain: dentalAndMed.allergicToNovocain,
                        illnessHeartDisease: dentalAndMed.illnessHeartDisease || false,
                        illnessAnemia: dentalAndMed.illnessAnemia || false,
                        illnessAcidReflux: dentalAndMed.illnessAcidReflux || false,
                        illnessHeartFailure: dentalAndMed.illnessHeartFailure || false,
                        illnessLeukemia: dentalAndMed.illnessLeukemia || false,
                        illnessStomachUlcer: dentalAndMed.illnessStomachUlcer || false,
                        illnessAngina: dentalAndMed.illnessAngina || false,
                        illnessHivAids: dentalAndMed.illnessHivAids || false,
                        illnessAutoimmune: dentalAndMed.illnessAutoimmune || false,
                        illnessMitralValve: dentalAndMed.illnessMitralValve || false,
                        illnessFainting: dentalAndMed.illnessFainting || false,
                        illnessThyroid: dentalAndMed.illnessThyroid || false,
                        illnessRheumatic: dentalAndMed.illnessRheumatic || false,
                        illnessLung: dentalAndMed.illnessLung || false,
                        illnessFibromyalgia: dentalAndMed.illnessFibromyalgia || false,
                        illnessCongenitalHeart: dentalAndMed.illnessCongenitalHeart || false,
                        illnessAsthma: dentalAndMed.illnessAsthma || false,
                        illnessArthritis: dentalAndMed.illnessArthritis || false,
                        illnessArtificialHeart: dentalAndMed.illnessArtificialHeart || false,
                        illnessEmphysema: dentalAndMed.illnessEmphysema || false,
                        illnessOsteoporosis: dentalAndMed.illnessOsteoporosis || false,
                        illnessHeartSurgery: dentalAndMed.illnessHeartSurgery || false,
                        illnessTuberculosis: dentalAndMed.illnessTuberculosis || false,
                        illnessPsychiatric: dentalAndMed.illnessPsychiatric || false,
                        illnessPacemaker: dentalAndMed.illnessPacemaker || false,
                        illnessCancer: dentalAndMed.illnessCancer || false,
                        illnessEpilepsy: dentalAndMed.illnessEpilepsy || false,
                        illnessHighblood: dentalAndMed.illnessHighblood || false,
                        illnessRadiation: dentalAndMed.illnessRadiation || false,
                        illnessCerebralPalsy: dentalAndMed.illnessCerebralPalsy || false,
                        illnessStroke: dentalAndMed.illnessStroke || false,
                        illnessChemotherapy: dentalAndMed.illnessChemotherapy || false,
                        illnessDiabetes: dentalAndMed.illnessDiabetes || false,
                        illnessKidney: dentalAndMed.illnessKidney || false,
                        illnessBleedingProblem: dentalAndMed.illnessBleedingProblem || false,
                        illnessLiver: dentalAndMed.illnessLiver || false,
                        illnessHemophilia: dentalAndMed.illnessHemophilia || false,
                        illnessHepatitisAb: dentalAndMed.illnessHepatitisAb || false,
                        illnessHepatitisC: dentalAndMed.illnessHepatitisC || false,
                        isPregnant: dentalAndMed.isPregnant || false,
                        isNursing: dentalAndMed.isNursing || false,
                        isTakingPills: dentalAndMed.isTakingPills || false
                    })
                    console.log('value of local anesthetic: ', dentalAndMed.allergicToLocalAnesthetic)
                

            } catch (dataandmederror) {
                console.error('Error fetching patient details:', dataandmederror.message);
            }

        };

        fetchPatientDetails();
        fetchDentalAndMedDetails();
    }, [patient_id]);

    useEffect(() => {
        if (patient.patient_birthdate) {
            const age = calculateAge(patient.patient_birthdate);
            setPatient(prevInfo => ({
                ...prevInfo,
                patient_age: age
            }));
            setShowGuardianForm(age < 18);
        }
    }, [patient.patient_birthdate]);

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleDateChange = (date, age) => {
        setPatient(prevInfo => ({
            ...prevInfo,
            patient_birthdate: date,
            patient_age: age
        }));
    };


    const handleBack = () => {
        navigate(`/patientrecord/${patient_id}`, { state: { activeTab: 'details' } });
    };

    const handlePatientChange = (event) => {
        const { name, value } = event.target;
        setPatient((prevPatient) => ({
            ...prevPatient,
            [name]: value
        }));
    };
    const handleDentalAndMedChange = (event) => {
        const { name, value } = event.target;
        setDentalAndMed((prevDentalAndMed) => ({
            ...prevDentalAndMed,
            [name]: value
        }));
    };

    

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
          const { error } = await supabase
            .from('patient')
            .update({
                patient_fname: patient.patient_fname,
                patient_mname: patient.patient_mname,
                patient_lname: patient.patient_lname,
                patient_age: patient.patient_age,
                patient_gender: patient.patient_gender,
                patient_birthdate: patient.patient_birthdate,
                patient_address: patient.patient_address,
                patient_email: patient.patient_email,
                patient_contact: patient.patient_contact,
                guardian_name: patient.guardian_name,
                guardian_relationship: patient.guardian_relationship,
                guardian_email: patient.guardian_email,
                guardian_number: patient.guardian_number
            })
            .eq('patient_id', patient_id);
    
            if (error) {
                throw error;
            }
    

        } catch (error) {
          console.error('Error updating patient details:', error.message);
          // Handle error state if needed
        }

        try {
            const { error } = await supabase
                .from('patient_DentalAndMed')
                .update({
                    patient_prevdentist: dentalAndMed.patient_prevdentist,
                    patient_lastdentalvisit: dentalAndMed.patient_lastdentalvisit,
                    patient_physicianname: dentalAndMed.patient_physicianname,
                    patient_physicianspecialty: dentalAndMed.patient_physicianspecialty,
                    patient_physicianaddress: dentalAndMed.patient_physicianaddress,
                    patient_physiciannumber: dentalAndMed.patient_physiciannumber,
                    isInGoodHealth: dentalAndMed.isInGoodHealth || false,
                    isInMedTreatment: dentalAndMed.isInMedTreatment || false,
                    everHadIllness: dentalAndMed.everHadIllness || false,
                    everBeenHospitalized: dentalAndMed.everBeenHospitalized || false,
                    isTakingMedication: dentalAndMed.isTakingMedication || false,
                    isUsingTobacco: dentalAndMed.isUsingTobacco || false,
                    isUsingDrugs: dentalAndMed.isUsingDrugs || false,
                    allergicToLocalAnesthetic: dentalAndMed.allergicToLocalAnesthetic,
                    allergicToPenicillin: dentalAndMed.allergicToPenicillin,
                    allergicToLatex: dentalAndMed.allergicToLatex ,
                    allergicToSulfaDrugs: dentalAndMed.allergicToSulfaDrugs,
                    allergicToAspirin: dentalAndMed.allergicToAspirin,
                    allergicToCodeine: dentalAndMed.allergicToCodeine,
                    allergicToNovocain: dentalAndMed.allergicToNovocain,
                    illnessHeartDisease: dentalAndMed.illnessHeartDisease || false,
                    illnessAnemia: dentalAndMed.illnessAnemia || false,
                    illnessAcidReflux: dentalAndMed.illnessAcidReflux || false,
                    illnessHeartFailure: dentalAndMed.illnessHeartFailure || false,
                    illnessLeukemia: dentalAndMed.illnessLeukemia || false,
                    illnessStomachUlcer: dentalAndMed.illnessStomachUlcer || false,
                    illnessAngina: dentalAndMed.illnessAngina || false,
                    illnessHivAids: dentalAndMed.illnessHivAids || false,
                    illnessAutoimmune: dentalAndMed.illnessAutoimmune || false,
                    illnessMitralValve: dentalAndMed.illnessMitralValve || false,
                    illnessFainting: dentalAndMed.illnessFainting || false,
                    illnessThyroid: dentalAndMed.illnessThyroid || false,
                    illnessRheumatic: dentalAndMed.illnessRheumatic || false,
                    illnessLung: dentalAndMed.illnessLung || false,
                    illnessFibromyalgia: dentalAndMed.illnessFibromyalgia || false,
                    illnessCongenitalHeart: dentalAndMed.illnessCongenitalHeart || false,
                    illnessAsthma: dentalAndMed.illnessAsthma || false,
                    illnessArthritis: dentalAndMed.illnessArthritis || false,
                    illnessArtificialHeart: dentalAndMed.illnessArtificialHeart || false,
                    illnessEmphysema: dentalAndMed.illnessEmphysema || false,
                    illnessOsteoporosis: dentalAndMed.illnessOsteoporosis || false,
                    illnessHeartSurgery: dentalAndMed.illnessHeartSurgery || false,
                    illnessTuberculosis: dentalAndMed.illnessTuberculosis || false,
                    illnessPsychiatric: dentalAndMed.illnessPsychiatric || false,
                    illnessPacemaker: dentalAndMed.illnessPacemaker || false,
                    illnessCancer: dentalAndMed.illnessCancer || false,
                    illnessEpilepsy: dentalAndMed.illnessEpilepsy || false,
                    illnessHighblood: dentalAndMed.illnessHighblood || false,
                    illnessRadiation: dentalAndMed.illnessRadiation || false,
                    illnessCerebralPalsy: dentalAndMed.illnessCerebralPalsy || false,
                    illnessStroke: dentalAndMed.illnessStroke || false,
                    illnessChemotherapy: dentalAndMed.illnessChemotherapy || false,
                    illnessDiabetes: dentalAndMed.illnessDiabetes || false,
                    illnessKidney: dentalAndMed.illnessKidney || false,
                    illnessBleedingProblem: dentalAndMed.illnessBleedingProblem || false,
                    illnessLiver: dentalAndMed.illnessLiver || false,
                    illnessHemophilia: dentalAndMed.illnessHemophilia || false,
                    illnessHepatitisAb: dentalAndMed.illnessHepatitisAb || false,
                    illnessHepatitisC: dentalAndMed.illnessHepatitisC || false,
                    isPregnant: dentalAndMed.isPregnant || false,
                    isNursing: dentalAndMed.isNursing || false,
                    isTakingPills: dentalAndMed.isTakingPills || false
                })
                .eq('patient_id', patient_id);

                console.log('updated: ', dentalAndMed)

            if (error) {
                throw error;
            }

            navigate(`/patientrecord/${patient_id}`);
        } catch (error) {
            console.error('Error updating patient details:', error.message);
            // Handle error state if needed
        }
    };

    const handleCheckbox = (e) => {
        const { id, value } = e.target;
        setDentalAndMed((prevDentalAndMed) => ({
            ...prevDentalAndMed,
            [id]: value
        }));
    };

    useEffect(() => {
        const fetchedData = { allergicToLocalAnesthetic: dentalAndMed.allergicToLocalAnesthetic, allergicToPenicillin: false }; // Replace with actual fetched data

        console.log('Updated value of local anesthetic', dentalAndMed.allergicToLocalAnesthetic);
    }, []);

    const handleAllergyChange = async (event) => {
        const { id, checked } = event.target;
        console.log('Value of checked', checked)
        setDentalAndMed((prevState) => ({
            ...prevState,
            [id]: checked,
        }));
    }



    return (
        <>
        <div className="editdetails-content container-fluid">
            <div className="editdetails-header">
                <Button className="backbtn" variant="light" onClick={handleBack}>
                    <FaArrowLeft className="me-2" />
                </Button>
                <h2>
                    EDIT DETAILS
                </h2>
            </div>

            <div className="personalinfo-box">
                <h2>PERSONAL INFORMATION</h2>
                <div className='fullName row'>
                    <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                        <Form.Label className="form-label-custom">First Name<span className="required">*</span></Form.Label>
                        <Form.Control type="text" name="patient_fname" placeholder={patient.patient_fname} value={patient.patient_fname} onChange={handlePatientChange} required />
                    </Form.Group>
                    <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                        <Form.Label className="form-label-custom">Middle Name</Form.Label>
                        <Form.Control type="text" name="patient_mname" placeholder={patient.patient_mname} value={patient.patient_mname} onChange={handlePatientChange} />
                    </Form.Group>
                    <Form.Group className="col-lg-4 col-md-6 mb-3" controlId="formBasicName">
                        <Form.Label className="form-label-custom">Last Name<span className="required">*</span></Form.Label>
                        <Form.Control type="text" name="patient_lname" placeholder={patient.patient_lname} value={patient.patient_lname} onChange={handlePatientChange} required />
                    </Form.Group>
                </div>

                <div className='ageGenderBday row'>
                    <Form.Group className="col-lg-5 col-md-4 mb-3" controlId="formBasicEmail">
                        <Form.Label className="form-label-custom">Birthdate<span className="required">*</span></Form.Label>
                        <DatePicker
                            selected={patient.patient_birthdate}
                            onChange={handleDateChange}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            placeholderText={patient.patient_birthdate}
                            className="form-control"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="col-lg-2 col-md-6 mb-3" controlId="formBasicEmail">
                        <Form.Label className="form-label-custom">Age<span className="required">*</span></Form.Label>
                        <Form.Control type="number" name="patient_age" placeholder={patient.patient_age} value={patient.patient_age} disabled />
                    </Form.Group>
                    <Form.Group className="col-lg-5 col-md-6 mb-3" controlId="formBasicGender">
                        <Form.Label className="form-label-custom">Gender<span className="required">*</span></Form.Label>
                        <Form.Select className="genderform" name="patient_gender" value={patient.patient_gender} onChange={handlePatientChange} aria-label="Select gender" required>
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
                        <Form.Control type="text" name="patient_address" placeholder={patient.patient_address} value={patient.patient_address} onChange={handlePatientChange} required />
                    </Form.Group>
                </div>

                <div className='contactEmail row'>
                    <Form.Group className="col-lg-6 col-md-6 mb-5" controlId="formBasicEmail">
                        <Form.Label className="form-label-custom">Email Address</Form.Label>
                        <Form.Control type="email" name="patient_email" placeholder={patient.patient_email} value={patient.patient_email} onChange={handlePatientChange} required />
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-6 mb-5" controlId="formBasicEmail">
                        <Form.Label className="form-label-custom">Contact Number<span className="required">*</span></Form.Label>
                        <Form.Control type="text" name="patient_contact" placeholder={patient.patient_contact} value={patient.patient_contact} onChange={handlePatientChange} required />
                    </Form.Group>
                </div>

                {showGuardianForm && (
                    <>
                        <div className='guardianInfo row'>
                            <div className="divider"></div>
                            <h3 className="editguardiantitle">FOR MINORS</h3>
                            {/* Render additional form fields for guardian information */}
                            <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                                <Form.Label className="form-label-custom">Parent/Guardian Name<span className="required">*</span></Form.Label>
                                <Form.Control type="text" name="guardian_name" placeholder={patient.guardian_name} value={patient.guardian_name} onChange={handlePatientChange} required />
                            </Form.Group>
                            <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                                <Form.Label className="form-label-custom">Relationship with the patient<span className="required">*</span></Form.Label>
                                <Form.Control type="text" name="guardian_relationship" placeholder={patient.guardian_relationship} value={patient.guardian_relationship} onChange={handlePatientChange} required />
                            </Form.Group>
                        </div>

                        <div className='guardianContact row mb-4'>
                            <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                                <Form.Label className="form-label-custom">Parent/Guardian Email</Form.Label>
                                <Form.Control type="email" name="guardian_email" placeholder={patient.guardian_email} value={patient.guardian_email} onChange={handlePatientChange} required />
                            </Form.Group>
                            <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicEmail">
                                <Form.Label className="form-label-custom">Parent/Guardian Contact Number<span className="required">*</span></Form.Label>
                                <Form.Control type="text" name="guardian_number" placeholder={patient.guardian_number} value={patient.guardian_number} onChange={handlePatientChange} required />
                            </Form.Group>
                        </div>
                    </>
                )}
            </div>

            <div className="dentalhistory-box">
                <h2>DENTAL HISTORY</h2>
                <div className='dentistdetail row'>
                    <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                        <Form.Label className="form-label-custom">Previous Dentist</Form.Label>
                        <Form.Control type="text" placeholder={dentalAndMed.patient_prevdentist} name="patient_prevdentist" value={dentalAndMed.patient_prevdentist || ''} onChange={handleDentalAndMedChange}/>
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                        <Form.Label className="form-label-custom">Last Dental Visit</Form.Label>
                        <Form.Control type="text" placeholder={dentalAndMed.patient_lastdentalvisit} name="patient_lastdentalvisit" value={dentalAndMed.patient_lastdentalvisit || ''} onChange={handleDentalAndMedChange}/>
                    </Form.Group>
                </div>
            </div>

            <div className="medhistory-box">
                <h2>MEDICAL HISTORY</h2>
                    <div className='physiciandetail row'>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Name of Physician</Form.Label>
                            <Form.Control type="text" placeholder={dentalAndMed.patient_physicianname} name="patient_physicianname" value={dentalAndMed.patient_physicianname} onChange={handleDentalAndMedChange}/>
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Specialty, if applicable</Form.Label>
                            <Form.Control type="text" placeholder={dentalAndMed.patient_physicianspecialty} name="patient_physicianspecialty" value={dentalAndMed.patient_physicianspecialty} onChange={handleDentalAndMedChange}/>
                        </Form.Group>
                    </div>
                    <div className='physiciandetail row mb-3'>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Office Address</Form.Label>
                            <Form.Control type="text" placeholder="Enter name of physician" name="patient_physicianaddress" value={dentalAndMed.patient_physicianaddress} onChange={handleDentalAndMedChange}/>
                        </Form.Group>
                        <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                            <Form.Label className="form-label-custom">Office Number</Form.Label>
                            <Form.Control type="text" placeholder="Enter specialty" name="patient_physiciannumber" value={dentalAndMed.patient_physiciannumber} onChange={handleDentalAndMedChange}/>
                        </Form.Group>
                    </div>

                    <div className='divider'></div>

                    <div className='health-status row'>
                        <Form.Group className="col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Are you in good health?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formHealthStatus">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isInGoodHealth"
                                    id="isInGoodHealthYes"
                                    value="yes"
                                    checked={dentalAndMed.isInGoodHealth === 'yes'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isInGoodHealth"
                                    id="isInGoodHealthNo"
                                    value="no"
                                    checked={dentalAndMed.isInGoodHealth === 'no'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row'>
                        <Form.Group className="col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Are you under medical treatment now?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formHealthStatus">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isInMedTreatment"
                                    id="isInMedTreatmentYes"
                                    value="yes"
                                    checked={dentalAndMed.isInMedTreatment === 'yes'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isInMedTreatment"
                                    id="isInMedTreatmentNo"
                                    value="no"
                                    checked={dentalAndMed.isInMedTreatment === 'no'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row'>
                        <Form.Group className="col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Have you ever had serious illness or surgical operation?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formHealthStatus">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="everHadIllness"
                                    id="everHadIllnessYes"
                                    value="yes"
                                    checked={dentalAndMed.everHadIllness === 'yes'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="everHadIllness"
                                    id="everHadIllnessNo"
                                    value="no"
                                    checked={dentalAndMed.everHadIllness === 'no'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row'>
                        <Form.Group className="col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Have you ever been hospitalized?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formHealthStatus">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="everBeenHospitalized"
                                    id="everBeenHospitalizedYes"
                                    value="yes"
                                    checked={dentalAndMed.everBeenHospitalized === 'yes'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="everBeenHospitalized"
                                    id="everBeenHospitalizedNo"
                                    value="no"
                                    checked={dentalAndMed.everBeenHospitalized === 'no'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row'>
                        <Form.Group className="col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Are you taking any prescription/non-prescription medication?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formHealthStatus">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isTakingMedication"
                                    id="isTakingMedicationYes"
                                    value="yes"
                                    checked={dentalAndMed.isTakingMedication === 'yes'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isTakingMedication"
                                    id="isTakingMedicationNo"
                                    value="no"
                                    checked={dentalAndMed.isTakingMedication === 'no'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row'>
                        <Form.Group className="col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Do you use tobacco products?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formHealthStatus">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isUsingTobacco"
                                    id="isUsingTobaccoYes"
                                    value="yes"
                                    checked={dentalAndMed.isUsingTobacco === 'yes'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isUsingTobacco"
                                    id="isUsingTobaccoNo"
                                    value="no"
                                    checked={dentalAndMed.isUsingTobacco === 'no'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>

                    <div className='health-status row'>
                        <Form.Group className="col-lg-8" controlId="formHealthStatus">
                            <Form.Label className="form-label-custom">Do you use alcohol, cocaine or other dangerous drugs?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formHealthStatus">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isUsingDrugs"
                                    id="isUsingDrugsYes"
                                    value="yes"
                                    checked={dentalAndMed.isUsingDrugs === 'yes'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isUsingDrugs"
                                    id="isUsingDrugsNo"
                                    value="no"
                                    checked={dentalAndMed.isUsingDrugs === 'no'}
                                    onChange={handleDentalAndMedChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>

                    <div className='divider mt-3 mb-3'></div>

                    <div className='allergy row'>
                        <Form.Group className="row-lg-12">
                            <Form.Label className="form-label-custom">Are you allergic to any of the following below? Select all that applies:</Form.Label>
                        </Form.Group>

                        <Form.Group className="col-lg-3">
                            <div className='d-flex custom-checkbox-spacing'>
                                <Form.Check
                                    type="checkbox"
                                    label="Local Anesthetic"
                                    id="allergicToLocalAnesthetic"
                                    checked={dentalAndMed.allergicToLocalAnesthetic}
                                    onChange={handleAllergyChange}
                                    className="custom-checkbox"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="col-lg-3">
                            <div className='d-flex custom-checkbox-spacing'>
                                <Form.Check
                                    type="checkbox"
                                    label="Penicillin, Antibiotics"
                                    id="allergicToPenicillin"
                                    checked={dentalAndMed.allergicToPenicillin}
                                    onChange={handleAllergyChange}
                                    className="custom-checkbox"
                                />
                            </div>
                        </Form.Group>
                    </div>


            </div>

            <div className="d-flex justify-content-center mb-5">
                <Button className="savechangesbtn" type="submit" onClick={handleSubmit}>Save Changes</Button>
            </div>

        </div>
        </>
    )
}


export default Editdetails;
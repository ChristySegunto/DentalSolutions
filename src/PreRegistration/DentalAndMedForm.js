import React, {useState, useEffect} from "react";
import './PreRegistration.css'

import { Form } from 'react-bootstrap';

const DentalAndMedForm = ({ patient_gender, dentalAndMedData = {}, onUpdateDentalAndMedData }) => {
    const [showWomanForm, setShowWomanForm] = useState(false);


    const [formData, setFormData] = useState({
        patient_prevdentist: dentalAndMedData.patient_prevdentist || '',
        patient_lastdentalvisit: dentalAndMedData.patient_lastdentalvisit || '',
        patient_physicianname: dentalAndMedData.patient_physicianname || '',
        patient_physicianspecialty: dentalAndMedData.patient_physicianspecialty || '',
        patient_physicianaddress: dentalAndMedData.patient_physicianaddress || '',
        patient_physiciannumber: dentalAndMedData.patient_physiciannumber || '',
        isInGoodHealth: dentalAndMedData.isInGoodHealth || false,
        isInMedTreatment: dentalAndMedData.isInMedTreatment || false,
        everHadIllness: dentalAndMedData.everHadIllness || false,
        everBeenHospitalized: dentalAndMedData.everBeenHospitalized || false,
        isTakingMedication: dentalAndMedData.isTakingMedication || false,
        isUsingTobacco: dentalAndMedData.isUsingTobacco || false,
        isUsingDrugs: dentalAndMedData.isUsingDrugs || false,
        allergicToLocalAnesthetic: dentalAndMedData.allergicToLocalAnesthetic || false,
        allergicToPenicillin: dentalAndMedData.allergicToPenicillin || false,
        allergicToLatex: dentalAndMedData.allergicToLatex || false,
        allergicToSulfaDrugs: dentalAndMedData.allergicToSulfaDrugs || false,
        allergicToAspirin: dentalAndMedData.allergicToAspirin || false,
        allergicToCodeine: dentalAndMedData.allergicToCodeine || false,
        allergicToNovocain: dentalAndMedData.allergicToNovocain || false,
        illnessHeartDisease: dentalAndMedData.illnessHeartDisease || false,
        illnessAnemia: dentalAndMedData.illnessAnemia || false,
        illnessAcidReflux: dentalAndMedData.illnessAcidReflux || false,
        illnessHeartFailure: dentalAndMedData.illnessHeartFailure || false,
        illnessLeukemia: dentalAndMedData.illnessLeukemia || false,
        illnessStomachUlcer: dentalAndMedData.illnessStomachUlcer || false,
        illnessAngina: dentalAndMedData.illnessAngina || false,
        illnessHivAids: dentalAndMedData.illnessHivAids || false,
        illnessAutoimmune: dentalAndMedData.illnessAutoimmune || false,
        illnessMitralValve: dentalAndMedData.illnessMitralValve || false,
        illnessFainting: dentalAndMedData.illnessFainting || false,
        illnessThyroid: dentalAndMedData.illnessThyroid || false,
        illnessRheumatic: dentalAndMedData.illnessRheumatic || false,
        illnessLung: dentalAndMedData.illnessLung || false,
        illnessFibromyalgia: dentalAndMedData.illnessFibromyalgia || false,
        illnessCongenitalHeart: dentalAndMedData.illnessCongenitalHeart || false,
        illnessAsthma: dentalAndMedData.illnessAsthma || false,
        illnessArthritis: dentalAndMedData.illnessArthritis || false,
        illnessArtificialHeart: dentalAndMedData.illnessArtificialHeart || false,
        illnessEmphysema: dentalAndMedData.illnessEmphysema || false,
        illnessOsteoporosis: dentalAndMedData.illnessOsteoporosis || false,
        illnessHeartSurgery: dentalAndMedData.illnessHeartSurgery || false,
        illnessTuberculosis: dentalAndMedData.illnessTuberculosis || false,
        illnessPsychiatric: dentalAndMedData.illnessPsychiatric || false,
        illnessPacemaker: dentalAndMedData.illnessPacemaker || false,
        illnessCancer: dentalAndMedData.illnessCancer || false,
        illnessEpilepsy: dentalAndMedData.illnessEpilepsy || false,
        illnessHighblood: dentalAndMedData.illnessHighblood || false,
        illnessRadiation: dentalAndMedData.illnessRadiation || false,
        illnessCerebralPalsy: dentalAndMedData.illnessCerebralPalsy || false,
        illnessStroke: dentalAndMedData.illnessStroke || false,
        illnessChemotherapy: dentalAndMedData.illnessChemotherapy || false,
        illnessDiabetes: dentalAndMedData.illnessDiabetes || false,
        illnessKidney: dentalAndMedData.illnessKidney || false,
        illnessBleedingProblem: dentalAndMedData.illnessBleedingProblem || false,
        illnessLiver: dentalAndMedData.illnessLiver || false,
        illnessHemophilia: dentalAndMedData.illnessHemophilia || false,
        illnessHepatitisAb: dentalAndMedData.illnessHepatitisAb || false,
        illnessHepatitisC: dentalAndMedData.illnessHepatitisC || false,
        isPregnant: dentalAndMedData.isPregnant || false,
        isNursing: dentalAndMedData.isNursing || false,
        isTakingPills: dentalAndMedData.isTakingPills || false
    });

    const [prevdentistError, setPrevdentistError] = useState('');
    const [physicianNameError, setPhysicianNameError] = useState('');
    const [physicianSpecialtyError, setPhysicianSpecialtyError] = useState('');

    useEffect(() => {
        if(patient_gender === 'Female'){
            setShowWomanForm(true);
        } else {
            setShowWomanForm(false);
        }
    }, [patient_gender]);


    useEffect(() => {
        // Update parent component when formData changes
        onUpdateDentalAndMedData(formData);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if(name === 'patient_prevdentist'){
            const lettersRegex = /^[A-Za-z\s]*$/;

            if (lettersRegex.test(value)) {
                setPrevdentistError('');
            } else {
                setPrevdentistError('Please enter a valid name.');
            }

            setFormData(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));

        } else if(name === 'patient_physicianname'){
            const lettersRegex = /^[A-Za-z\s]*$/;

            if (lettersRegex.test(value)) {
                setPhysicianNameError('');
            } else {
                setPhysicianNameError('Please enter a valid name.');
            }

            setFormData(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));
        } else if(name === 'patient_physicianspecialty'){
            const lettersRegex = /^[A-Za-z\s]*$/;

            if (lettersRegex.test(value)) {
                setPhysicianSpecialtyError('');
            } else {
                setPhysicianSpecialtyError('Please enter a valid name.');
            }

            setFormData(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));

        } else {
            setFormData(prevInfo => ({
                ...prevInfo,
                [name]: value
            }));
        }
        
    };


    

    const handleAllergyChange = (e) => {
        const { id, checked } = e.target;
        switch (id) {
            case 'localAnesthetic':
                setFormData(prevInfo => ({ ...prevInfo, allergicToLocalAnesthetic: checked }));
                break;
            case 'penicillin':
                setFormData(prevInfo => ({ ...prevInfo, allergicToPenicillin: checked }));
                break;
            case 'latex':
                setFormData(prevInfo => ({ ...prevInfo, allergicToLatex: checked }));
                break;
            case 'sulfaDrugs':
                setFormData(prevInfo => ({ ...prevInfo, allergicToSulfaDrugs: checked }));
                break;
            case 'aspirin':
                setFormData(prevInfo => ({ ...prevInfo, allergicToAspirin: checked }));
                break;
            case 'codeine':
                setFormData(prevInfo => ({ ...prevInfo, allergicToCodeine: checked }));
                break;
            case 'novocain':
                setFormData(prevInfo => ({ ...prevInfo, allergicToNovocain: checked }));
                break;
            default:
                break;
        }
    };

    const handleIllnessChange = (e) => {
        const { id, checked } = e.target;
        switch (id) {
            case 'heartDisease':
                setFormData(prevInfo => ({ ...prevInfo, illnessHeartDisease: checked }));
                break;
            case 'anemia':
                setFormData(prevInfo => ({ ...prevInfo, illnessAnemia: checked }));
                break;
            case 'acidReflux':
                setFormData(prevInfo => ({ ...prevInfo, illnessAcidReflux: checked }));
                break;
            case 'heartFailure':
                setFormData(prevInfo => ({ ...prevInfo, illnessHeartFailure: checked }));
                break;
            case 'leukemia':
                setFormData(prevInfo => ({ ...prevInfo, illnessLeukemia: checked }));
                break;
            case 'stomachUlcer':
                setFormData(prevInfo => ({ ...prevInfo, illnessStomachUlcer: checked }));
                break;
            case 'angina':
                setFormData(prevInfo => ({ ...prevInfo, illnessAngina: checked }));
                break;
            case 'hivAids':
                setFormData(prevInfo => ({ ...prevInfo, illnessHivAids: checked }));
                break;
            case 'autoimmune':
                setFormData(prevInfo => ({ ...prevInfo, illnessAutoimmune: checked }));
                break;
            case 'mitralValve':
                setFormData(prevInfo => ({ ...prevInfo, illnessMitralValve: checked }));
                break;
            case 'fainting':
                setFormData(prevInfo => ({ ...prevInfo, illnessFainting: checked }));
                break;
            case 'thyroid':
                setFormData(prevInfo => ({ ...prevInfo, illnessThyroid: checked }));
                break;
            case 'rheumatic':
                setFormData(prevInfo => ({ ...prevInfo, illnessRheumatic: checked }));
                break;
            case 'lung':
                setFormData(prevInfo => ({ ...prevInfo, illnessLung: checked }));
                break;
            case 'fibromyalgia':
                setFormData(prevInfo => ({ ...prevInfo, illnessFibromyalgia: checked }));
                break;
            case 'congenitalHeart':
                setFormData(prevInfo => ({ ...prevInfo, illnessCongenitalHeart: checked }));
                break;
            case 'asthma':
                setFormData(prevInfo => ({ ...prevInfo, illnessAsthma: checked }));
                break;
            case 'arthritis':
                setFormData(prevInfo => ({ ...prevInfo, illnessArthritis: checked }));
                break;
            case 'artificialHeart':
                setFormData(prevInfo => ({ ...prevInfo, illnessArtificialHeart: checked }));
                break;
            case 'emphysema':
                setFormData(prevInfo => ({ ...prevInfo, illnessEmphysema: checked }));
                break;
            case 'osteoporosis':
                setFormData(prevInfo => ({ ...prevInfo, illnessOsteoporosis: checked }));
                break;
            case 'heartSurgery':
                setFormData(prevInfo => ({ ...prevInfo, illnessHeartSurgery: checked }));
                break;
            case 'tuberculosis':
                setFormData(prevInfo => ({ ...prevInfo, illnessTuberculosis: checked }));
                break;
            case 'psychiatric':
                setFormData(prevInfo => ({ ...prevInfo, illnessPsychiatric: checked }));
                break;
            case 'pacemaker':
                setFormData(prevInfo => ({ ...prevInfo, illnessPacemaker: checked }));
                break;
            case 'cancer':
                setFormData(prevInfo => ({ ...prevInfo, illnessCancer: checked }));
                break;
            case 'epilepsy':
                setFormData(prevInfo => ({ ...prevInfo, illnessEpilepsy: checked }));
                break;
            case 'highblood':
                setFormData(prevInfo => ({ ...prevInfo, illnessHighblood: checked }));
                break;
            case 'radiation':
                setFormData(prevInfo => ({ ...prevInfo, illnessRadiation: checked }));
                break;
            case 'cerebralPalsy':
                setFormData(prevInfo => ({ ...prevInfo, illnessCerebralPalsy: checked }));
                break;
            case 'stroke':
                setFormData(prevInfo => ({ ...prevInfo, illnessStroke: checked }));
                break;
            case 'chemotherapy':
                setFormData(prevInfo => ({ ...prevInfo, illnessChemotherapy: checked }));
                break;
            case 'diabetes':
                setFormData(prevInfo => ({ ...prevInfo, illnessDiabetes: checked }));
                break;
            case 'kidney':
                setFormData(prevInfo => ({ ...prevInfo, illnessKidney: checked }));
                break;
            case 'bleedingProblem':
                setFormData(prevInfo => ({ ...prevInfo, illnessBleedingProblem: checked }));
                break;
            case 'liver':
                setFormData(prevInfo => ({ ...prevInfo, illnessLiver: checked }));
                break;
            case 'hemophilia':
                setFormData(prevInfo => ({ ...prevInfo, illnessHemophilia: checked }));
                break;
            case 'hepatitisAb':
                setFormData(prevInfo => ({ ...prevInfo, illnessHepatitisAb: checked }));
                break;
            case 'hepatitisC':
                setFormData(prevInfo => ({ ...prevInfo, illnessHepatitisC: checked }));
                break;
            default:
                break;
        }
    };


    return (
        <>
        <div className="dentalhistoryform">
            <h2>DENTAL HISTORY</h2>
            <div className='dentistdetail row'>
                <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Previous Dentist</Form.Label>
                    <Form.Control type="text" placeholder="Enter previous dentist" isInvalid={!!prevdentistError} name="patient_prevdentist" value={formData.patient_prevdentist} onChange={handleChange}/>
                    <Form.Control.Feedback type="invalid">{prevdentistError}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Last Dental Visit</Form.Label>
                    <Form.Control type="text" placeholder="Enter last dental visit" name="patient_lastdentalvisit" value={formData.patient_lastdentalvisit} onChange={handleChange}/>
                </Form.Group>
            </div>
        </div>

        <div className="medhistoryform">
            <h2>MEDICAL HISTORY</h2>
            <div className='physiciandetail row'>
                <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Name of Physician</Form.Label>
                    <Form.Control type="text" placeholder="Enter name of physician" isInvalid={!!physicianNameError} name="patient_physicianname" value={formData.patient_physicianname} onChange={handleChange}/>
                    <Form.Control.Feedback type="invalid">{physicianNameError}</Form.Control.Feedback>

                </Form.Group>
                <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Specialty, if applicable</Form.Label>
                    <Form.Control type="text" placeholder="Enter specialty" name="patient_physicianspecialty" isInvalid={!!physicianSpecialtyError} value={formData.patient_physicianspecialty} onChange={handleChange}/>
                    <Form.Control.Feedback type="invalid">{physicianSpecialtyError}</Form.Control.Feedback>

                </Form.Group>
            </div>
            <div className='physiciandetail row mb-3'>
                <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Office Address</Form.Label>
                    <Form.Control type="text" placeholder="Enter name of physician" name="patient_physicianaddress" value={formData.patient_physicianaddress} onChange={handleChange}/>
                </Form.Group>
                <Form.Group className="col-lg-6 col-md-6 mb-3" controlId="formBasicName">
                    <Form.Label className="form-label-custom">Office Number</Form.Label>
                    <Form.Control type="text" placeholder="Enter specialty" name="patient_physiciannumber" value={formData.patient_physiciannumber} onChange={handleChange}/>
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
                            checked={formData.isInGoodHealth === 'yes'}
                            onChange={handleChange}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="No"
                            name="isInGoodHealth"
                            id="isInGoodHealthNo"
                            value="no"
                            checked={formData.isInGoodHealth === 'no'}
                            onChange={handleChange}
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
                            checked={formData.isInMedTreatment === 'yes'}
                            onChange={handleChange}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="No"
                            name="isInMedTreatment"
                            id="isInMedTreatmentNo"
                            value="no"
                            checked={formData.isInMedTreatment === 'no'}
                            onChange={handleChange}
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
                            checked={formData.everHadIllness === 'yes'}
                            onChange={handleChange}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="No"
                            name="everHadIllness"
                            id="everHadIllnessNo"
                            value="no"
                            checked={formData.everHadIllness === 'no'}
                            onChange={handleChange}
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
                            checked={formData.everBeenHospitalized === 'yes'}
                            onChange={handleChange}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="No"
                            name="everBeenHospitalized"
                            id="everBeenHospitalizedNo"
                            value="no"
                            checked={formData.everBeenHospitalized === 'no'}
                            onChange={handleChange}
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
                            checked={formData.isTakingMedication === 'yes'}
                            onChange={handleChange}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="No"
                            name="isTakingMedication"
                            id="isTakingMedicationNo"
                            value="no"
                            checked={formData.isTakingMedication === 'no'}
                            onChange={handleChange}
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
                            checked={formData.isUsingTobacco === 'yes'}
                            onChange={handleChange}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="No"
                            name="isUsingTobacco"
                            id="isUsingTobaccoNo"
                            value="no"
                            checked={formData.isUsingTobacco === 'no'}
                            onChange={handleChange}
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
                            checked={formData.isUsingDrugs === 'yes'}
                            onChange={handleChange}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="No"
                            name="isUsingDrugs"
                            id="isUsingDrugsNo"
                            value="no"
                            checked={formData.isUsingDrugs === 'no'}
                            onChange={handleChange}
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
                            id="localAnesthetic"
                            checked={formData.allergicToLocalAnesthetic}
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
                            id="penicillin"
                            checked={formData.allergicToPenicillin}
                            onChange={handleAllergyChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Latex"
                            id="latex"
                            checked={formData.allergicToLatex}
                            onChange={handleAllergyChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Sulfa Drugs"
                            id="sulfaDrugs"
                            checked={formData.allergicToSulfaDrugs}
                            onChange={handleAllergyChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Aspirin"
                            id="aspirin"
                            checked={formData.allergicToAspirin}
                            onChange={handleAllergyChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Codeine"
                            id="codeine"
                            checked={formData.allergicToCodeine}
                            onChange={handleAllergyChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Novocain"
                            id="novocain"
                            checked={formData.allergicToNovocain}
                            onChange={handleAllergyChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

            </div>
                    
            <div className='divider mt-3 mb-3'></div>

            <div className='illness row'>
                <Form.Group className="row-lg-10">
                        <Form.Label className="form-label-custom">Do you have or have you ever had any of the following below? Select all that applies.</Form.Label>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Heart Disease"
                            id="heartDisease"
                            checked={formData.illnessHeartDisease}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Anemia / Sickle Cell"
                            id="anemia"
                            checked={formData.illnessAnemia}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Acid Reflux / GERD"
                            id="acidReflux"
                            checked={formData.illnessAcidReflux}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Heart Failure"
                            id="heartFailure"
                            checked={formData.illnessHeartFailure}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Leukemia"
                            id="leukemia"
                            checked={formData.illnessLeukemia}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Stomach Ulcer"
                            id="stomachUlcer"
                            checked={formData.illnessStomachUlcer}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Angina"
                            id="angina"
                            checked={formData.illnessAngina}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="HIV+ / AIDS"
                            id="hivAids"
                            checked={formData.illnessHivAids}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Autoimmune Disease"
                            id="autoimmune"
                            checked={formData.illnessAutoimmune}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Mitral Valve Prolapse"
                            id="mitralValve"
                            checked={formData.illnessMitralValve}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>
                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Fainting / Dizzy Spells"
                            id="fainting"
                            checked={formData.illnessFainting}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>
                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Thyroid Disease"
                            id="thyroid"
                            checked={formData.illnessThyroid}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>
                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Rheumatic Fever"
                            id="rheumatic"
                            checked={formData.illnessRheumatic}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>
                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Lung Disease"
                            id="lung"
                            checked={formData.illnessLung}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Fibromyalgia"
                            id="fibromyalgia"
                            checked={formData.illnessFibromyalgia}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Congenital Heart Lesion"
                            id="congenitalHeart"
                            checked={formData.illnessCongenitalHeart}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Asthma"
                            id="asthma"
                            checked={formData.illnessAsthma}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Arthritis"
                            id="arthritis"
                            checked={formData.illnessArthritis}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Artificial Heart Valve"
                            id="artificialHeart"
                            checked={formData.illnessArtificialHeart}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Emphysema / Bronchitis"
                            id="emphysema"
                            checked={formData.illnessEmphysema}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>
                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Osteoporosis / Penia"
                            id="osteoporosis"
                            checked={formData.illnessOsteoporosis}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Heart Surgery"
                            id="heartSurgery"
                            checked={formData.illnessHeartSurgery}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Tuberculosis / PPD+"
                            id="tuberculosis"
                            checked={formData.illnessTuberculosis}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>
                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Psychiatric Disorder"
                            id="psychiatric"
                            checked={formData.illnessPsychiatric}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Pacemaker"
                            id="pacemaker"
                            checked={formData.illnessPacemaker}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Cancer"
                            id="cancer"
                            checked={formData.illnessCancer}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Epilepsy / Seizures"
                            id="epilepsy"
                            checked={formData.illnessEpilepsy}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Highblood Pressure"
                            id="highblood"
                            checked={formData.illnessHighblood}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Radiation Therapy"
                            id="radiation"
                            checked={formData.illnessRadiation}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Cerebral Palsy"
                            id="cerebralPalsy"
                            checked={formData.illnessCerebralPalsy}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Stroke"
                            id="stroke"
                            checked={formData.illnessStroke}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Chemotherapy"
                            id="chemotherapy"
                            checked={formData.illnessChemotherapy}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Diabetes"
                            id="diabetes"
                            checked={formData.illnessDiabetes}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Kidney Disease"
                            id="kidney"
                            checked={formData.illnessKidney}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Bleeding Problem/ Bruises"
                            id="bleedingProblem"
                            checked={formData.illnessBleedingProblem}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Liver Disease"
                            id="liver"
                            checked={formData.illnessLiver}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Hemophilia"
                            id="hemophilia"
                            checked={formData.illnessHemophilia}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Hepatitis A, B"
                            id="hepatitisAb"
                            checked={formData.illnessHepatitisAb}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>

                <Form.Group className="col-lg-3">
                    <div className='d-flex custom-checkbox-spacing'>
                        <Form.Check
                            type="checkbox"
                            label="Hepatitis C"
                            id="hepatitisC"
                            checked={formData.illnessHepatitisC}
                            onChange={handleIllnessChange}
                            className="custom-checkbox"
                        />
                    </div>
                </Form.Group>
            </div>
            
            {showWomanForm && (
                <>
                <div className="isFemale">
                    <div className='divider mt-3' ></div>

                    <div className="womanForm row">
                        <Form.Group className="col-lg-8" controlId="formIsPregnant">
                            <Form.Label className="form-label-custom">Are you pregnant?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formIsPregnant">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isPregnant"
                                    id="isPregnantYes"
                                    value="yes"
                                    checked={formData.isPregnant === 'yes'}
                                    onChange={handleChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isPregnant"
                                    id="isPregnantNo"
                                    value="no"
                                    checked={formData.isPregnant === 'no'}
                                    onChange={handleChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="col-lg-8" controlId="formIsNursing">
                            <Form.Label className="form-label-custom">Are you nursing?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formIsNursing">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isNursing"
                                    id="isNursingYes"
                                    value="yes"
                                    checked={formData.isNursing === 'yes'}
                                    onChange={handleChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isNursing"
                                    id="isNursingNo"
                                    value="no"
                                    checked={formData.isNursing === 'no'}
                                    onChange={handleChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className="col-lg-8" controlId="formIsTakingPills">
                            <Form.Label className="form-label-custom">Are you taking birth control pills?<span className="required">*</span></Form.Label>
                        </Form.Group>
                        <Form.Group className="col-lg-2" controlId="formIsTakingPills">
                            <div className='d-flex custom-radio-spacing'>
                                <Form.Check
                                    type="radio"
                                    label="Yes"
                                    name="isTakingPills"
                                    id="isTakingPillsYes"
                                    value="yes"
                                    checked={formData.isTakingPills === 'yes'}
                                    onChange={handleChange}
                                    className="custom-radio"
                                />
                                <Form.Check
                                    type="radio"
                                    label="No"
                                    name="isTakingPills"
                                    id="isTakingPillsNo"
                                    value="no"
                                    checked={formData.isTakingPills === 'no'}
                                    onChange={handleChange}
                                    className="custom-radio"
                                />
                            </div>
                        </Form.Group>
                    </div>
                </div>
                    
                </>
            )}

        </div>

        </>
    )
}

export default DentalAndMedForm;
import React, { useState, useEffect } from "react";

import './History'
import { Tab, Tabs, Button, Table, Modal} from 'react-bootstrap';
import { FaEye } from "react-icons/fa";
import { useNavigate, useParams, useLocation} from "react-router-dom";
import supabase from "../../settings/supabase";
import { useAuth } from "../../settings/AuthContext";


const TreatmentPatient = () => {
    const { user } = useAuth();
    const { patient_id } = useParams();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('details');
    const navigate = useNavigate();
    const [patient, setPatient] = useState({
        patient_fname: '',
        patient_mname: '',
        patient_lname: '',
        patient_branch: '',
        patient_age: '',
        patient_gender: '',
        patient_birthdate: '',
        patient_contact: '',
        patient_email: '',
        patient_address: '',
        guardian_name: '',
        guardian_relationship: '',
        guardian_email: '',
        guardian_number: ''
    });

    const [treatments, setTreatments] = useState([]);
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [showViewTreatment, setShowViewTreatment] = useState(false);


    useEffect(() => {

        const fetchPatientDetails = async () => {
            try {
                const user_id = user.user_id;

                console.log('User ID:', user_id);
    
                // Fetch patient data from Supabase
                const { data, error } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('user_id', user_id)
                    .single();
    
                if (error) {
                    throw error;
                }
    
                setPatient(data);
                console.log('Patient:', patient.patient_id);


            } catch (error) {
                console.error('Error fetching patient details:', error.message);
            }
        };


        const fetchTreatmentDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('patient_Treatments')
                    .select('*')
                    .eq('patient_id', parseInt(patient.patient_id));

                if (error) {
                    throw error;
                }

                const sortedData = (data || []).sort((a, b) => new Date(a.treatment_date) - new Date(b.treatment_date));

                setTreatments(sortedData || []);

            } catch (error) {
                console.error('Error fetching treatment details:', error.message);
            }
        }

    
        fetchPatientDetails();
        fetchTreatmentDetails();
        
    }, [treatments.treatment_id, patient.patient_id]);

    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);
    

    //if data is null, then the placeholder will display n/a instead of blank
    const getPlaceholder = (value) => value ? value : "N/A";

    // Function to capitalize all letters of a string
    const capitalizeAllLetters = (string) => {
        return string.toUpperCase();
    };

    // Function to capitalize first letter of a string
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const patient_fname = patient.patient_fname ? capitalizeFirstLetter(patient.patient_fname) : '';
    const patient_mname = patient.patient_mname ? capitalizeFirstLetter(patient.patient_mname) : '';
    const patient_lname = patient.patient_lname ? capitalizeFirstLetter(patient.patient_lname) : '';

    const patient_branch = patient.patient_branch ? capitalizeAllLetters(patient.patient_branch) : 'Branch not provided';

    const handleViewTreatment = (treatment) => {
        setSelectedTreatment(treatment);
        setShowViewTreatment(true);
    }


    return(
        <>
            <div className="patientrecord-content container-fluid">
                <div className="patienttreatment-table">
                    <Table>
                        <thead className="custom-treatmenttable-head">
                            <tr className="custom-treatmenttable-tr">
                                <th>Date</th>
                                <th>Treatment</th>
                                <th>Type</th>
                                <th>Dentist/Assistant</th>
                                <th>Next Visit</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {treatments.length > 0 ? (
                                treatments.map((t) => (
                                    <tr className="custom-treatmenttable-tr" key={t.treatment_id}>
                                        <td className="custom-treatmenttable-contents align-content-center">{t.treatment_date}</td>
                                        <td className="custom-treatmenttable-contents align-content-center">{t.treatment}</td>
                                        <td className="custom-treatmenttable-contents align-content-center">{t.treatment_type}</td>
                                        <td className="custom-treatmenttable-contents align-content-center">{t.treatment_dentist}</td>
                                        <td className="custom-treatmenttable-contents align-content-center">{t.treatment_nextvisit}</td>
                                        <td className="custom-td text-center align-content-center">
                                            <Button className="custom-actions" onClick={() => handleViewTreatment(t)}>
                                                <FaEye />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-records-message-container text-center">
                                        <div className="no-records-message">
                                            No treatment records available
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                <Modal show={showViewTreatment} onHide={() => setShowViewTreatment(false)} centered size="lg">
                    <Modal.Header closeButton className="border-0">
                    </Modal.Header>
                    <Modal.Body >
                        {selectedTreatment && (
                            <div>
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

                                <div className="patient-divider mt-4 mb-4"></div>
                                
                                <div className="proceduredetails-custom row">
                                    <div className="col">
                                        <p>Date:</p>
                                    </div>
                                    <div className="col">
                                        <p>{getPlaceholder(selectedTreatment.treatment_date)}</p>
                                    </div>
                                </div>

                                <div className="patient-divider mt-2 mb-4"></div>

                                <div className="proceduredetails-custom row">
                                    <div className="col">
                                        <p>Tooth No./s:</p>
                                    </div>
                                    <div className="col">
                                        <p>{getPlaceholder(selectedTreatment.treatment_toothnum)}</p>
                                    </div>
                                </div>

                                <div className="patient-divider mt-2 mb-4"></div>

                                <div className="proceduredetails-custom row">
                                    <div className="col">
                                        <p>Treatment:</p>
                                    </div>
                                    <div className="col">
                                        <p>{getPlaceholder(selectedTreatment.treatment)}</p>
                                    </div>
                                </div>

                                <div className="patient-divider mt-2 mb-4"></div>

                                <div className="proceduredetails-custom row">
                                    <div className="col">
                                        <p>Treatment Type:</p>
                                    </div>
                                    <div className="col">
                                        <p>{getPlaceholder(selectedTreatment.treatment_type)}</p>
                                    </div>
                                </div>

                                <div className="patient-divider mt-2 mb-4"></div>

                                <div className="proceduredetails-custom row">
                                    <div className="col">
                                        <p>Dentist/Assistant:</p>
                                    </div>
                                    <div className="col">
                                        <p>{getPlaceholder(selectedTreatment.treatment_dentist)}</p>
                                    </div>
                                </div>

                                <div className="patient-divider mt-2 mb-4"></div>

                                <div className="proceduredetails-custom row">
                                    <div className="col">
                                        <p>Next Visit:</p>
                                    </div>
                                    <div className="col">
                                        <p>{getPlaceholder(selectedTreatment.treatment_nextvisit)}</p>
                                    </div>
                                </div>

                                <div className="patient-divider mt-2 mb-4"></div>

                                <div className="proceduredetails-custom row">
                                    <div className="col">
                                        <p>Remarks:</p>
                                    </div>
                                    <div className="col">
                                        <p>{getPlaceholder(selectedTreatment.treatment_description)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                </Modal>


            </div>
        </>
    )
}

export default TreatmentPatient;
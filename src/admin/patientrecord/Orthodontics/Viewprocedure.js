import React, { useState, useEffect } from "react";
import './Viewprocedure.css'
import { Button, Form, Table } from 'react-bootstrap';
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from "../../../settings/AuthContext";
import supabase from "../../../settings/supabase";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Viewprocedure = () => {
    const { patient_id, orthodontics_id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [adminDetails, setAdminDetails] = useState({});
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
    
    const [orthodontic, setOrthodontic] = useState({
        ortho_date: '',
        ortho_procedure: '',
        ortho_nextvisit: '',
        ortho_dentist: '',
        ortho_notes: ''
    });
    
    
    const [prescription, setPrescription] = useState([]);
    const [file, setFile] = useState([]);
    const [showGuardianForm, setShowGuardianForm] = useState(false);
    const [userError, setUserError] = useState('');
    const [loading, setLoading] = useState(true);

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
                    console.log(adminDetails);
    
                } catch (error) {
                    console.error('Error fetching profile details:', error.message);
                    setUserError('Failed to fetch profile details');
                }
            };

        const fetchPatientDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('patient_id', parseInt(patient_id))
                    .single();

                if (error) throw error;

                

                setPatient(data);

                if (data.patient_age < 18) {
                    setShowGuardianForm(true);
                } else {
                    setShowGuardianForm(false);
                }
                
            } catch (error) {
                console.error('Error fetching patient details:', error.message);
                setUserError('Failed to fetch patient details');
            }
        };

        const fetchOrthoDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('patient_Orthodontics')
                    .select('*')
                    .eq('orthodontics_id', parseInt(orthodontics_id))
                    .single();

                if (error) throw error;

                setOrthodontic(data);
            } catch (error) {
                console.error('Error fetching orthodontic details:', error.message);
                setUserError('Failed to fetch orthodontic details');
            }
        };

        const fetchOrthoPrescription = async () => {
            try {
                const { data, error } = await supabase
                    .from('ortho_Prescription')
                    .select('*')
                    .eq('orthodontics_id', parseInt(orthodontics_id));

                if (error) throw error;

                setPrescription(data || []); // Ensure data is an array or set to empty array if null
            } catch (error) {
                console.error('Error fetching orthodontic prescription:', error.message);
                setUserError('Failed to fetch orthodontic prescription');
            }
        };

        const fetchOrthoFile = async () => {
            try {
                const { data, error } = await supabase
                    .from('ortho_files')
                    .select('*')
                    .eq('orthodontics_id', parseInt(orthodontics_id));

                if (error) throw error;

                setFile(data || []); // Ensure data is an array or set to empty array if null
                console.log(file)
            } catch (error) {
                console.error('Error fetching orthodontic file:', error.message);
                setUserError('Failed to fetch orthodontic file');
            }
        };

        fetchProfileDetails();
        fetchPatientDetails();
        fetchOrthoDetails();
        fetchOrthoPrescription();
        fetchOrthoFile();
        setLoading(false);
    }, [patient_id, orthodontics_id, user]);

    const handleBack = () => {
        navigate(`/patientrecord/${patient_id}`, { state: { activeTab: 'orthodontics' } });
    };

    // HANDLE EXPORT
    const handleExport =  () => {
        const doc = new jsPDF();

        const imgUrl = 'https://static.vecteezy.com/system/resources/thumbnails/009/012/556/small_2x/medical-symbol-rx-signage-template-free-vector.jpg';

        const img = new Image();
        img.onload = function() {
            const imgWidth = 40; 
            const imgHeight = img.height * imgWidth / img.width;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text('Dental Solutions', 84, 20);
            
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.text("Medical Prescription", 87, 26);
      
        
        doc.setFontSize(12);
        doc.text(`Patient's Name: ${patient.patient_fname} ${patient.patient_lname}`, 14, 40);
        doc.text(`Age: ${patient.patient_age}`, 160, 40);
        doc.text(`Sex: ${patient.patient_gender}`, 176, 40);
        doc.text(`Address: ${patient.patient_address}`, 14, 46);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 46);
        
        const tableColumns = ['', '', ''];
   

       
        const drawHeaderTopBorder = (data) => {
            if (data.row.index === 0) { 
                doc.setLineWidth(1.0); 
                doc.setDrawColor(0); 
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y); // Draw top border
            }
        };

        doc.autoTable({
            startY: 55,
            head: [tableColumns],
            didDrawCell: drawHeaderTopBorder,
            headStyles: {
                fillColor: false, 
            }, 
        });


        
        doc.addImage(imgUrl, 'JPEG', 15, 60, imgWidth, imgHeight);

        let yPos = 68;
        prescription.forEach((p, index) => {
            doc.setFontSize(14);
            doc.text(`#${index + 1}`, 64, yPos);
            doc.setFontSize(12);
            doc.text(`Medicine: ${p.ortho_medicine}`, 70, yPos + 6);
            doc.text(`Reason: ${p.ortho_reason}`, 70, yPos + 11);
            doc.text(`Duration: ${p.ortho_duration}`, 70, yPos + 16);
            doc.text(`Taken: ${p.ortho_taken}`, 70, yPos + 21);

            yPos += 30; 
        });

        // Footer
        doc.setFontSize(14);
        doc.text(`${adminDetails.fname} ${adminDetails.lname} M.D.`, 130, 200);

        doc.setFontSize(12);
        doc.text(`LIC NO: ${lic_no}`,  130, 205);
        doc.text(`PTR NO:${ptr_no}`, 130, 210);

        
        doc.save("Prescriptions.pdf");
    };
        img.src = imgUrl;
    };

    const handleFileDownload = async (fileName) =>{ 
        try {
            const { data, error } = await supabase
                .storage
                .from('ortho_fileupload')
                .createSignedUrl(`public/${patient_id}/${orthodontics_id}/${fileName}`, 60);
    
                if (error) {
                    console.error('Error creating signed URL:', error.message);
                    throw error;
                }
        
                // Open the signed URL in a new tab
                window.open(data.signedUrl, '_blank');
            } catch (error) {
                console.error('Error opening file:', error.message);
                setUserError('Failed to open file');
            }
        };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (userError) {
        return <div>{userError}</div>;
    }

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

    const firstName = adminDetails.fname ? capitalizeFirstLetter(adminDetails.fname) : 'First name not provided';
    const lastName = adminDetails.lname ? capitalizeFirstLetter(adminDetails.lname) : 'Last name not provided';
    const branch = adminDetails.branch ? capitalizeAllLetters(adminDetails.branch) : 'Branch not provided';

    let fullName = `${firstName} ${lastName}`;

    if (userDetails && userDetails.role === 'dentist') {
        fullName = `Dr. ${fullName}`;
    }

    const lic_no = adminDetails.lic_no
    const ptr_no = adminDetails.ptr_no

    const patient_fname = capitalizeFirstLetter(patient.patient_fname || '');
    const patient_mname = capitalizeFirstLetter(patient.patient_mname || '');
    const patient_lname = capitalizeFirstLetter(patient.patient_lname || '');

    const patient_branch = capitalizeAllLetters(patient.patient_branch || 'Branch not provided');

    return (
        <>
        <div className="viewprocedure-box container-fluid">
            <div className="patientrecord-header">
                <h2>PATIENT RECORD</h2>
            </div>
            <div className="d-flex align-content-center mb-3">
                <Button className="backbtn" variant="light" onClick={handleBack}>
                    <FaArrowLeft className="me-2" />
                </Button>
                <h2 className="customize-viewproceduretitle m-0">VIEW PROCEDURE</h2>
            </div>
            


            {patient && (
                <div className="personalinfo-container">
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
                        <div className="otherdetails row">
                            <div className="numemailadd col-lg-6">
                                <p><span className="bold">Guardian Name:</span> {patient.guardian_name}</p>
                                <p><span className="bold">Relationship with Patient:</span> {patient.guardian_relationship}</p>
                            </div>
                            <div className="numemailadd col-lg-6">
                                <p><span className="bold">Guardian Email:</span> {patient.guardian_email}</p>
                                <p><span className="bold">Guardian Number:</span> {patient.guardian_number}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <h2 className="viewproceduretitle-lbl">PROCEDURE</h2>

            {orthodontic && (
                <>
                
                
                <div className="vieworthodonticsform">
                    <div className='proceduredetail row'>
                        <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicProcedure">
                            <Form.Label className="txtbox-lbl">Procedure</Form.Label>
                            <Form.Control className="custom-text-form" type="text" placeholder={getPlaceholder(orthodontic.ortho_procedure)} disabled/>
                        </Form.Group>

                        <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicDate">
                            <Form.Label className="txtbox-lbl">Date</Form.Label>
                            <Form.Control className="custom-text-form" type="text" placeholder={getPlaceholder(orthodontic.ortho_date)} disabled/>
                        </Form.Group>

                        <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicDentist">
                            <Form.Label className="txtbox-lbl">Dentist</Form.Label>
                            <Form.Control className="custom-text-form" type="text" placeholder={getPlaceholder(orthodontic.ortho_dentist)} disabled/>
                        </Form.Group>

                        <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicDentist">
                            <Form.Label className="txtbox-lbl">Next Visit</Form.Label>
                            <Form.Control className="custom-text-form" type="text" placeholder={getPlaceholder(orthodontic.ortho_nextvisit)} disabled/>
                        </Form.Group>

                        <Form.Group className="col-lg-12 col-md-12 mb-3" controlId="formBasicName">
                            <Form.Label className="txtbox-lbl">Notes</Form.Label>
                            <Form.Control className="custom-text-form" as="textarea" rows={3} placeholder={getPlaceholder(orthodontic.ortho_notes)} disabled/>
                        </Form.Group>
                    </div>
                </div>

                <div className="addform-table">
                    <div className="addform-tableheader">
                        <h2 className="mb-2">PRESCRIPTION</h2>
                        <div className="ms-auto exportadd-buttons">
                    <button class="exportprescriptionbtn btn" type="button" onClick={handleExport}>Export Prescription</button>
                </div>
                    </div>

                    <div className="display-table">
                        <Table bordered hover responsive>
                            <thead className="custom-table-head">
                                <tr>
                                    <th>#</th>
                                    <th>Medicine</th>
                                    <th>Reason</th>
                                    <th>Duration</th>
                                    <th>Taken</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescription.length > 0 ? (
                                    prescription.map((p, index) => (
                                        <tr key={index}>
                                            <td className="align-content-center">{index + 1}</td>
                                            <td className="col-lg-3 custom-td align-content-center">{p.ortho_medicine}</td>
                                            <td className="col-lg-3 custom-td align-content-center">{p.ortho_reason}</td>
                                            <td className="col-lg-2 custom-td align-content-center">{p.ortho_duration}</td>
                                            <td className="col-lg-2 custom-td align-content-center">{p.ortho_taken}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            <div className="no-prescriptions-message">
                                                No prescriptions available
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>

                <div className="addform-table">
                    <div className="addform-tableheader">
                        <h2 className="mb-2">FILES</h2>
                    </div>

                    <div className="display-table">
                        <Table bordered hover responsive>
                            <thead className="custom-table-head">
                                <tr>
                                    <th>#</th>
                                    <th>File Name</th>
                                    <th>Description</th>
                                    <th className="text-center">File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {file.length > 0 ? (
                                    file.map((p, index) => (
                                            <tr key={index}>
                                                <td className="col-lg-1 align-content-center">{index + 1}</td>
                                                <td className="col-lg-5 custom-td align-content-center">{p.ortho_filename}</td>
                                                <td className="col-lg-5 custom-td align-content-center">{p.ortho_filedescription}</td>
                                                <td className="align-content-center">
                                                    <button
                                                        className="downloadbtn btn"
                                                        onClick={() => handleFileDownload(p.ortho_filename)}
                                                    >
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            <div className="no-files-message">
                                                No files available
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
                </>
            )}
        </div>
        </>
    );
};

export default Viewprocedure;
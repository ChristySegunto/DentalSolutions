import React, { useState, useEffect } from "react";
import './Addprocedure.css';
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Table, Modal } from "react-bootstrap";
import { useAuth } from "../../../settings/AuthContext";
import supabase from "../../../settings/supabase";

import { Avatar } from "@files-ui/react";
import userImage from '../../../img/user.png';

import jsPDF from "jspdf";
import "jspdf-autotable";

const Addprocedure = () => {
    const navigate = useNavigate();
    const { patient_id } = useParams();
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [adminDetails, setAdminDetails] = useState({});
    const [userError, setUserError] = useState('');
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);  // 9dd a loading state
    const [showGuardianForm, setShowGuardianForm] = useState(false);

    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false); // Modal visibility state

    const [prescriptions, setPrescriptions] = useState([]); // State to store prescription data
    const [currentPrescription, setCurrentPrescription] = useState({
        medicine: '',
        reason: '',
        duration: '',
        taken: ''
    });

    const [showFileForm, setShowFileForm] = useState(false); // Modal visibility state
    const [files, setFiles] = useState([]); // State to store file data
    const [currentFile, setCurrentFile] = useState({
        filename: '',
        description: '',
        file: null
    });
    

    const getCurrentDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [procedureDate, setProcedureDate] = useState(getCurrentDate());
    const [selectedProcedure, setSelectedProcedure] = useState('');
    const [nextVisitDate, setNextVisitDate] = useState('');
    const [ortho_notes, setOrthoNotes] = useState('');
    const [imageSource, setImageSource] = useState(userImage);
    const [imageUrl, setImageUrl] = useState(null);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalHeader, setModalHeader] = useState("");



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
                if (!patient_id) {
                    throw new Error('Patient ID is undefined');
                }

                const { data, error } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('patient_id', parseInt(patient_id))
                    .single();

                if (error) {
                    throw error;
                }

                setPatient(data);
                console.log(data);


                if (data.patient_age < 18) {
                    setShowGuardianForm(true);
                } else {
                    setShowGuardianForm(false);
                }

            } catch (error) {
                console.error('Error fetching patient details:', error.message);
                setUserError('Failed to fetch patient details');
            } finally {
                setLoading(false);  // Set loading to false once data is fetched or an error occurs
            }
        };



        fetchProfileDetails();
        fetchPatientDetails();

    }, [patient_id, user]);

    const handleBack = () => {
        navigate(`/patientrecord/${patient_id}`, { state: { activeTab: 'orthodontics' } });
    };

    const handleProcedureChange = (event) => {
        setSelectedProcedure(event.target.value);
        setNextVisitDate(calculateNextVisitDate(event.target.value));
    };

    const calculateNextVisitDate = (procedure) => {
        switch (procedure) {
            case 'Brace Installation':
                return addDays(procedureDate, 30);
            case 'Invisalign':
                return addDays(procedureDate, 30);
            case 'Retainer':
                return addDays(procedureDate, 90);
            case 'Orthodontic Adjustments':
                return addDays(procedureDate, 28);
            case 'Orthodontic Exam Consultation':
                return addDays(procedureDate, 180);
            case 'Headgear':
                return addDays(procedureDate, 30);
            case 'Dental Implants':
                return addDays(procedureDate, 90);
            case 'Orthognathic Surgery':
                return addDays(procedureDate, 14);
            case 'Tooth Extraction':
                return addDays(procedureDate, 7);
            case 'Bonding':
                return addDays(procedureDate, 28);
            case 'Orthodontic Appliances':
                return addDays(procedureDate, 30);
            default:
                return '';
        }
    };

    const addDays = (dateStr, days) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleChangeSource = (selectedFile) => {
        setImageSource(selectedFile);
    };

    const validateOrthodonticsData = (orthodonticsData) => {
        return(
            orthodonticsData.ortho_procedure !== '' &&
            orthodonticsData.ortho_date !== '' &&
            orthodonticsData.nextvisit !== ''
        )
    }

    const validatePrescriptionData = (currentPrescription) => {
        return(
            currentPrescription.medicine !== '' &&
            currentPrescription.reason !== '' &&
            currentPrescription.duration !== '' &&
            currentPrescription.taken !== ''
        );
    }


    const handleSubmit = async (event) => {
        event.preventDefault();

        // Data for inserting into patient_Orthodontics table
        const orthodonticsData = {
            patient_id,
            ortho_procedure: selectedProcedure,
            ortho_date: procedureDate,
            ortho_dentist: fullName,
            ortho_nextvisit: nextVisitDate,
            ortho_notes: ortho_notes
        };

        if (!validateOrthodonticsData(orthodonticsData)){
            setModalMessage("Please fill out the required information to proceed. All fields marked with an asterisk (*) are required.");
            setModalHeader("Complete Required Information");
            setShowModal(true);
            return;
        } 
    
        try {
    
            // Insert data into patient_Orthodontics table and retrieve the inserted orthodontics_id
            const { data: orthodonticsResult, error: orthodonticsError } = await supabase
                .from('patient_Orthodontics')
                .insert([orthodonticsData])
                .select('orthodontics_id'); // Adjust the return to include orthodontics_id
    
                
            if (orthodonticsError) {
                throw orthodonticsError;
            }
    
            if (!orthodonticsResult || orthodonticsResult.length === 0) {
                throw new Error('Failed to insert orthodontics data or retrieve orthodontics_id');
            }
    
            const ortho_id = orthodonticsResult[0].orthodontics_id; // Make sure the result is as expected
    
            // Data for inserting into ortho_Prescription table
            const prescriptionData = prescriptions.map(p => ({
                patient_id,
                orthodontics_id: ortho_id,
                ortho_medicine: p.medicine,
                ortho_reason: p.reason,
                ortho_duration: p.duration,
                ortho_taken: p.taken
            }));
    
            // Insert data into ortho_Prescription table
            const { error: prescriptionError } = await supabase
                .from('ortho_Prescription')
                .insert(prescriptionData);
    
            if (prescriptionError) {
                // Rollback the orthodontics data insertion if the prescription insertion fails
                await supabase
                    .from('patient_Orthodontics')
                    .delete()
                    .eq('orthodontics_id', ortho_id);

                throw prescriptionError;
            }

            try {
                // Ensure files array is not empty
                if (files.length === 0) {
                    throw new Error('No files to upload');
                }
        
                // Iterate over each file and upload it to Supabase storage
                for (let file of files) {
                    const { data, error } = await supabase.storage
                        .from('ortho_fileupload')
                        .upload(`public/${patient_id}/${ortho_id}/${file.filename}`, file.file);
        
                    if (error) {
                        throw error;
                    }
        
                    // Assuming you want to store the file URL in the database, you can save it here
                    const fileUrl = data.Key; // This gives you the URL of the uploaded file in storage
        
                    // Now you can proceed to save `fileUrl` or any other details to your database
                    const { data: savedData, error: saveError } = await supabase
                        .from('ortho_files') // Adjust to your database table
                        .insert({
                            patient_id,
                            orthodontics_id: ortho_id,
                            ortho_filename: file.filename,
                            ortho_uploadedfile: fileUrl,
                            ortho_filedescription: file.description,
                            uploaded_by: user.user_id, // Assuming you have user ID available
                        });
        
                    if (saveError) {
                        throw saveError;
                    }
        
                    console.log('File uploaded successfully:', file.filename);
                }
        
                // Optionally, you can reset state after successful upload
                setFiles([]);
                setCurrentFile({
                    filename: '',
                    description: '',
                    file: null
                });
        

            } catch (error) {
                console.error('Error uploading file:', error.message);
                // Handle error state or display error message to user
            }

            // Navigate to another page after successful submission
            setShowSuccessMessage(true);

            setTimeout(() => {
                navigate(`/patientrecord/${patient_id}`, { state: { activeTab: 'orthodontics' } });
            }, 2000);    
        } catch (error) {
            console.error('Error adding procedure or prescription:', error.message);
            // Handle error appropriately, e.g., show error message to the user
        }
    };

    if (loading) {
        return <p>Loading...</p>;  // Display a loading message while data is being fetched
    }

    if (!patient) {
        return <p>Failed to load patient details. Please try again later.</p>;  // Display an error message if patient data is not available
    }


    // Function to capitalize first letter of a string
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Function to capitalize all letters of a string
    const capitalizeAllLetters = (string) => {
        return string.toUpperCase();
    };

    // Format first name with first letter capitalized, or default text if not provided
    const firstName = adminDetails.fname ? capitalizeFirstLetter(adminDetails.fname) : 'First name not provided';

    // Format last name with first letter capitalized, or default text if not provided
    const lastName = adminDetails.lname ? capitalizeFirstLetter(adminDetails.lname) : 'Last name not provided';

    // Format branch name with all letters capitalized, or default text if not provided
    const branch = adminDetails.branch ? capitalizeAllLetters(adminDetails.branch) : 'Branch not provided';

    // Construct full name from first name and last name
    let fullName = `${firstName} ${lastName}`;

    // Prefix "Dr." to full name if user role is "dentist"
    if (userDetails && userDetails.role === 'dentist') {
        fullName = `Dr. ${fullName}`;
    }

    const lic_no = adminDetails.lic_no
    const ptr_no = adminDetails.ptr_no
    
    const handleClosePrescriptionForm = () => {
        setShowPrescriptionForm(false);
    }

    const handlePrescriptionForm = () => {
        setShowPrescriptionForm(true);
    }

    const handleFileForm = () => {
        setShowFileForm(true);
    }

    const handleCloseFileForm = () => {
        setShowFileForm(false);
    }

    const handleAddPrescription = () => {
        if (!validatePrescriptionData(currentPrescription)){
            setModalMessage("Please fill out the required information to proceed. All fields marked with an asterisk (*) are required.");
            setModalHeader("Complete Required Information");
            setShowModal(true);
            return;
        } 

        setPrescriptions([...prescriptions, currentPrescription]);
        setCurrentPrescription({ medicine: '', reason: '', duration: '', taken: '' });
        setShowPrescriptionForm(false);
    }

    const handlePrescriptionChange = (e) => {
        const { name, value } = e.target;
        setCurrentPrescription(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        const { name, value, files: fileList } = event.target;
        const file = fileList ? fileList[0] : null;
        setCurrentFile(prevState => ({
            ...prevState,
            [name]: file || value
        }));
    };

    const handleAddFile = () => {
        if (currentFile.filename && currentFile.file) {
            // Check if the file with the same name already exists in the files array
            const existingFile = files.find(file => file.filename === currentFile.filename);
    
            if (existingFile) {
                const confirmed = window.confirm('A file with this name already exists. Do you want to replace it?');
                if (!confirmed) {
                    return; // Stop further execution if user cancels
                }
            }
    
            // Filter out the existing file (if any) and add the current file
            const updatedFiles = files.filter(file => file.filename !== currentFile.filename);
            setFiles([...updatedFiles, currentFile]);
    
            setCurrentFile({
                filename: '',
                description: '',
                file: null
            });
            setShowFileForm(false);
        } else {
            setModalMessage("Please enter a filename and select a file. All fields marked with an asterisk (*) are required.");
            setModalHeader("Complete Required Information");
            setShowModal(true);
        }
    };
    
    const handleFileUploadChange = (event) => {
        const file = event.target.files[0];
        setCurrentFile({ ...currentFile, file });
    };

    const handleDelete = (index) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleDeleteFile = (index) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
    };

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
                doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y); 
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
        prescriptions.forEach((prescription, index) => {
            doc.setFontSize(14);
            doc.text(`#${index + 1}`, 64, yPos);
            doc.setFontSize(12);
            doc.text(`Medicine: ${prescription.medicine}`, 70, yPos + 6);
            doc.text(`Reason: ${prescription.reason}`, 70, yPos + 11);
            doc.text(`Duration: ${prescription.duration}`, 70, yPos + 16);
            doc.text(`Taken: ${prescription.taken}`, 70, yPos + 21);

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

    //if data is null, then the placeholder will display n/a instead of blank
    const getPlaceholder = (value) => value ? value : "N/A";


    const patient_fname = patient.patient_fname ? capitalizeFirstLetter(patient.patient_fname) : '';
    const patient_mname = patient.patient_mname ? capitalizeFirstLetter(patient.patient_mname) : '';
    const patient_lname = patient.patient_lname ? capitalizeFirstLetter(patient.patient_lname) : '';

    const patient_branch = patient.patient_branch ? capitalizeAllLetters(patient.patient_branch) : 'Branch not provided';

    return (
        <div className="addprocedure-box container-fluid">
            <h2>PATIENT RECORD</h2>
            <div className="pagetitle">
                <Button className="backbtn-addprocedure" variant="light" onClick={handleBack}>
                    <FaArrowLeft className="me-2" />
                </Button>
                <h2 className="pagetitle-lbl">ADD PROCEDURE</h2>
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

            <h2 className="addproceduretitle-lbl">ADD PROCEDURE</h2>
            
            <div className="addorthodonticsform">
                <div className='dentistdetail row'>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Procedure<span className="required">*</span></Form.Label>
                        <Form.Select className="dropdown-custom" name="patient_procedure" aria-label="Select Procedure" required onChange={handleProcedureChange}>
                            <option value="">Select Procedure</option>
                            <option value="Brace Installation">Braces Installation</option>
                            <option value="Invisalign">Invisalign</option>
                            <option value="Retainer">Retainer</option>
                            <option value="Orthodontic Adjustments">Orthodontic Adjustments</option>
                            <option value="Orthodontic Exam Consultation">Orthodontic Exam and Consultation</option>
                            <option value="Headgear">Headgear</option>
                            <option value="Dental Implants">Dental Implants</option>
                            <option value="Orthognathic Surgery">Orthognathic Surgery</option>
                            <option value="Tooth Extraction">Tooth Extraction</option>
                            <option value="Bonding">Bonding</option>
                            <option value="Orthodontic Appliances">Orthodontic Appliances</option>
                        </Form.Select>                    
                    </Form.Group>

                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Date</Form.Label>
                        <Form.Control type="date" value={procedureDate} onChange={(e) => setProcedureDate(e.target.value)} name="ortho_date" disabled/>
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Dentist</Form.Label>
                        <Form.Control type="text" placeholder={fullName} value={fullName} name="ortho_dentist" disabled/>
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Next Visit</Form.Label>
                        <Form.Control type="date" value={nextVisitDate} onChange={(e) => setNextVisitDate(e.target.value)} name="ortho_nextvisit" />
                    </Form.Group>
                    <Form.Group className="col-lg-12 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Notes</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Enter notes" value={ortho_notes} onChange={(e) => setOrthoNotes(e.target.value)}/>
                    </Form.Group>
                </div>
            </div>

            <div className="addform-table">
                <div className="addform-tableheader">
                    <h2>PRESCRIPTION</h2>
                    <div className="ms-auto exportadd-buttons">
                    <button class="exportprescriptionbtn btn" type="button" onClick={handleExport}>Export Prescription</button>
                    <button class="addprescriptionbtn btn" type="button" onClick={handlePrescriptionForm}>Add Prescription</button> 
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
                                <th className="col-lg-1 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map((prescription, index) => (
                                <tr key={index}>
                                    <td className="align-content-center">{index + 1}</td>
                                    <td className="col-lg-3 custom-td align-content-center">{prescription.medicine}</td>
                                    <td className="col-lg-3 custom-td align-content-center">{prescription.reason}</td>
                                    <td className="col-lg-2 custom-td align-content-center">{prescription.duration}</td>
                                    <td className="col-lg-2 custom-td align-content-center">{prescription.taken}</td>
                                    <td className="col-lg-1 custom-td text-center align-content-center">
                                        <Button variant="custom-actionbtn" onClick={() => handleDelete(index)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <div className="addform-table">
                <div className="addform-tableheader">
                    <h2>FILES</h2>
                    <button class="addfilesbtn btn" type="button" onClick={handleFileForm}>Add File</button>
                </div>

                <div className="display-table">
                    <Table bordered hover responsive>
                        <thead className="custom-table-head">
                            <tr>
                                <th>#</th>
                                <th>File Name</th>
                                <th>Description</th>
                                <th className="col-lg-1 text-center">Actions</th>
                            </tr>
                        </thead>
                            <tbody>
                                {files.map((file, index) => (
                                <tr key={index}>
                                    <td className="align-content-center">{index + 1}</td>
                                    <td className="align-content-center">{file.filename}</td>
                                    <td className="align-content-center">{file.description}</td>
                                    <td className="col-lg-1 custom-td text-center align-content-center">
                                        <Button variant="custom-actionbtn" onClick={() => handleDeleteFile(index)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                    </Table>
                </div>
            </div>

            <div className="submitsection d-flex justify-content-center">
                <Button className="submitbtn" variant="primary" type="submit" onClick={handleSubmit}>
                    Submit
                </Button>
            </div>

            <Modal show={showPrescriptionForm} onHide={handleClosePrescriptionForm} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="prescriptionformtitle">PRESCRIPTION</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3 prescriptionformbody" controlId="formBasicMedicine">
                        <Form.Label>Medicine<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-prescription-custom" 
                            type="text" 
                            placeholder="Enter a medicine" 
                            name="medicine"
                            value={currentPrescription.medicine}
                            onChange={handlePrescriptionChange}
                        />                   
                    </Form.Group>
                    <Form.Group className="mb-3 prescriptionformbody" controlId="formBasicReason">
                        <Form.Label>Reason<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-prescription-custom" 
                            type="text" 
                            placeholder="Enter a reason" 
                            name="reason"
                            value={currentPrescription.reason}
                            onChange={handlePrescriptionChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 prescriptionformbody" controlId="formBasicDuration">
                        <Form.Label>Duration<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-prescription-custom" 
                            type="text" 
                            placeholder="How long to take" 
                            name="duration"
                            value={currentPrescription.duration}
                            onChange={handlePrescriptionChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 prescriptionformbody" controlId="formBasicDuration">
                        <Form.Label>Taken<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-prescription-custom" 
                            type="text" 
                            placeholder="How many times a day" 
                            name="taken"
                            value={currentPrescription.taken}
                            onChange={handlePrescriptionChange}
                        />
                    </Form.Group>

                    <div className="submitprescriptionsection d-flex justify-content-center">
                        <Button className="submitprescription" variant="primary" type="submit" onClick={handleAddPrescription}>
                            Submit Prescription
                        </Button>
                    </div>
                    

                </Modal.Body>
            </Modal>

            <Modal show={showFileForm} onHide={handleCloseFileForm} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fileformtitle">ADD FILE</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3 fileformbody" controlId="formBasicFileName">
                        <Form.Label>File Name<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-file-custom" 
                            type="text" 
                            placeholder="Enter file name" 
                            name="filename"
                            value={currentFile.filename}
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 fileformbody" controlId="formBasicFileDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control 
                            className="form-file-custom" 
                            as="textarea"
                            rows={2}
                            placeholder="Enter description" 
                            name="description"
                            value={currentFile.description}
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 fileformbody" controlId="formBasicFileDescription">
                        <Form.Label>Upload File<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-file-custom" 
                            type="file"
                            name="file"
                            onChange={handleFileUploadChange}
                        />
                    </Form.Group>

                    <div className="submitfilesection d-flex justify-content-center mt-4 mb-2">
                        <Button className="submitfile" variant="primary" type="submit" onClick={handleAddFile}>
                            Submit File
                        </Button>
                    </div>

                </Modal.Body>
            </Modal>

            <Modal show={showSuccessMessage} onHide={() => setShowSuccessMessage(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Added Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    The procedure has been successfully added.
                </Modal.Body>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalHeader}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
}

export default Addprocedure;
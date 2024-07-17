import React, { useState, useEffect } from "react";
import './Editprocedure.css'
import { Button, Form, Table, Modal } from "react-bootstrap";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../settings/AuthContext";
import supabase from "../../../settings/supabase";

import { Avatar } from "@files-ui/react";
import userImage from '../../../img/user.png';

import jsPDF from "jspdf";
import "jspdf-autotable";

const Editprocedure = () => {
    const navigate = useNavigate();
    const { patient_id, orthodontics_id } = useParams();
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [adminDetails, setAdminDetails] = useState({});
    const [imageSource, setImageSource] = useState(userImage);
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

    const [orthodontic, setOrthodontic] = useState({
        ortho_procedure: '',
        ortho_date: '',
        ortho_dentist: '',
        ortho_nextvisit: '',
        ortho_notes: '',
    })

    const [prescriptions, setPrescriptions] = useState([]); // State to store prescription data
    const [currentPrescription, setCurrentPrescription] = useState({
        medicine: '',
        reason: '',
        duration: '',
        taken: ''
    });

    const [showGuardianForm, setShowGuardianForm] = useState(false);
    const [prescription, setPrescription] = useState([]);
    const [file, setFile] = useState([]);
    const [userError, setUserError] = useState('');
    const [loading, setLoading] = useState(true);

    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false); // Modal visibility state
    const [deleteIndex, setDeleteIndex] = useState(null); // Track the index of item to delete
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal visibility state
    const [showDeleteFileModal, setShowDeleteFileModal] = useState(false); // Modal visibility state


    const [showFileForm, setShowFileForm] = useState(false); 
    const [files, setFiles] = useState([]); // State to store file data
    const [currentFile, setCurrentFile] = useState({ ortho_filename: '', ortho_filedescription: '' });
    const [deleteFileIndex, setDeleteFileIndex] = useState(null); // Track the index of item to delete


    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [modalDeleteTitle, setModalDeleteTitle] = useState('');
    const [modalDeleteBody, setModalDeleteBody] = useState('');

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
                console.log(orthodontic)
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

                setPrescriptions(data || []); // Ensure data is an array or set to empty array if null
                console.log(prescriptions)
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

                if (error) {
                    console.error('Error fetching files:', error.message);
                } else {
                    // setFiles(data);
                    setFiles(data || []);
                    console.log('Fetched Files: ', files)
                }

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

//HANDLE ORTHODONTICS
    const handleOrthoChange = (event) => {
        const { name, value } = event.target;
        setOrthodontic((prevOrthodontic) => ({
            ...prevOrthodontic,
            [name]: value
        }));
    };

//HANDLE PRESCRIPTION
    const handlePrescriptionChange = (event) => {
        const { name, value } = event.target;
        setCurrentPrescription((prevPrescription) => ({
            ...prevPrescription,
            [name]: value
        }));
    };

    const handlePrescriptionForm = () => setShowPrescriptionForm(true);
    const handleClosePrescriptionForm = () => {
        setShowPrescriptionForm(false)
        setCurrentPrescription({
            ortho_medicine: '',
            ortho_reason: '',
            ortho_duration: '',
            ortho_taken: ''
        });
    };

    const validatePrescriptionData = (currentPrescription) => {
        return(
            currentPrescription.ortho_medicine !== '' &&
            currentPrescription.ortho_reason !== '' &&
            currentPrescription.ortho_duration !== '' &&
            currentPrescription.ortho_taken !== ''
        );
    }

    const handleAddPrescription = () => {
        if (!validatePrescriptionData(currentPrescription)){
            setModalBody("Please fill out the required information to proceed. All fields marked with an asterisk (*) are required.");
            setModalTitle("Complete Required Information");
            setShowModal(true);
            return;
        } 

        setPrescriptions((prevPrescriptions) => [...prevPrescriptions, currentPrescription]);
        setCurrentPrescription({
            ortho_medicine: '',
            ortho_reason: '',
            ortho_duration: '',
            ortho_taken: ''
        });

        handleClosePrescriptionForm();
    };

    const handleChangeSource = (selectedFile) => {
        setImageSource(selectedFile);
    };

// HANDLE EXPORT
    const handleExport =  () => {
        const doc = new jsPDF();

        const imgUrl = 'https://static.vecteezy.com/system/resources/thumbnails/009/012/556/small_2x/medical-symbol-rx-signage-template-free-vector.jpg';

        const img = new Image();
        img.onload = function() {
            const imgWidth = 40; 
            const imgHeight = img.height * imgWidth / img.width;
        
        doc.setFont('helvetica');
        doc.setFontSize(20);
        doc.text('Dental Solutions', 83.9, 19.9);
        doc.text('Dental Solutions', 84, 20);
        doc.text('Dental Solutions', 84.1, 20.1);
        doc.text('Dental Solutions', 84.2, 20.2);

 
        
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
        prescriptions.forEach((p, index) => {
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

    const handleDelete = async () => {
        const prescriptionToDelete = prescriptions[deleteIndex];

        try {
            setPrescriptions((prevPrescriptions) => prevPrescriptions.filter((_, index) => index !== deleteIndex));
            setShowDeleteModal(false);

            // Check if the prescription exists in the database
            const { data: existingPrescription, error: fetchError } = await supabase
                .from('ortho_Prescription')
                .select('*')
                .eq('prescription_id', prescriptionToDelete.prescription_id)
                .single();

            if (fetchError) {
                throw fetchError;
            }


            if (prescriptionToDelete.prescription_id) {
                // Delete prescription from the database
                const { error: deleteError } = await supabase
                    .from('ortho_Prescription')
                    .delete()
                    .eq('prescription_id', prescriptionToDelete.prescription_id); // Assuming 'id' is the primary key

                if (deleteError) {
                    throw deleteError;
                }

                setDeleteIndex(null);
                console.log('Prescription deleted successfully');
            } else {
                console.log('Prescription does not exist in the database');
                setDeleteIndex(null);
                setShowDeleteModal(false);
            }

        } catch (error) {
            console.error('Error deleting prescription:', error.message);
        }
    };


    const showDeleteConfirmation = (index) => {
        setDeleteIndex(index);
        setShowDeleteModal(true);
        setModalDeleteTitle('Delete Confirmation');
        setModalDeleteBody('Are you sure you want to delete this prescription?');
    };

    const hideDeleteConfirmation = () => {
        setDeleteIndex(null);
        setShowDeleteModal(false);
    };



//HANDLE FILE
    const handleFileChange = (event) => {
        const { name, value } = event.target;

        setCurrentFile(prevState => ({
            ...prevState,
            [name === 'filename' ? 'ortho_filename' : 'ortho_filedescription']: value
        }));
    };

    const handleFileUploadChange = (event) => {
        const file = event.target.files[0];
        setCurrentFile({ ...currentFile, file });
    };

    const handleFileForm = () => setShowFileForm(true);
    const handleCloseFileForm = () => setShowFileForm(false);

    const handleAddFile = () => {
        if (currentFile.ortho_filename && currentFile.file) {
            const existingFile = files.find(file => file.ortho_filename === currentFile.ortho_filename);

            if (existingFile) {
                const confirmed = window.confirm('A file with this name already exists. Do you want to replace it?');
                if (!confirmed) {
                    return; // Stop further execution if user cancels
                }
            }

            setFiles((prevFiles) => [...prevFiles, currentFile]);
            setCurrentFile({
                ortho_filename: '',
                ortho_filedescription: '',
                file: null
            });

            handleCloseFileForm();
        } else {
            setModalBody("Please enter a filename and select a file. All fields marked with an asterisk (*) are required.");
            setModalTitle("Complete Required Information");
            setShowModal(true);
        }

        
    }

    const handleDeleteFile = async () => {
        const fileToDelete = files[deleteFileIndex];

        try{
            setFiles((prevFiles) => prevFiles.filter((_, i) => i !== deleteFileIndex));
            setShowDeleteFileModal(false);


            const { data: existingFile, error: fetchError } = await supabase
                .from('ortho_files')
                .select('*')
                .eq('ortho_filename', fileToDelete.ortho_filename)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            if (existingFile) {
                // Delete file from the database
                const { error: deleteError } = await supabase
                    .from('ortho_files')
                    .delete()
                    .eq('ortho_filename', fileToDelete.ortho_filename);
                
                // Delete file from storage
                const { error: deleteStorageError } = await supabase
                    .storage
                    .from('ortho_fileupload')
                    .remove([`public/${patient_id}/${orthodontics_id}/${fileToDelete.ortho_filename}`]);

                if (deleteError) {
                    throw deleteError;
                }

                // Update state
                setDeleteIndex(null);
                console.log('File deleted successfully');

            } else {
                console.log('File does not exist in the database');
                // Update state
                // setFiles((prevFiles) => prevFiles.filter((_, i) => i !== deleteFileIndex));
                // setDeleteIndex(null);
                // setShowDeleteFileModal(false);
            }
        } catch (error) {

        }

    };

    const showDeleteFileConfirmation = (index) => {
        setDeleteFileIndex(index);
        setShowDeleteFileModal(true);
    }

    const hideDeleteFileConfirmation = () => {
        setDeleteFileIndex(null);
        setShowDeleteFileModal(false);
    }

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }; 

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


    const patient_fname = patient.patient_fname ? capitalizeFirstLetter(patient.patient_fname) : '';
    const patient_mname = patient.patient_mname ? capitalizeFirstLetter(patient.patient_mname) : '';
    const patient_lname = patient.patient_lname ? capitalizeFirstLetter(patient.patient_lname) : '';
    
    const patient_branch = patient.patient_branch ? capitalizeAllLetters(patient.patient_branch) : 'Branch not provided';

    const handleBack = () => {
        navigate(`/patientrecord/${patient_id}`, { state: { activeTab: 'orthodontics' } });
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        
    //UPDATING ORTHODONTICS
        try {
            console.log('Submitting with orthodontics_id:', orthodontics_id);

    
            const { data: orthodonticsResult, error: orthodonticsError } = await supabase
                .from('patient_Orthodontics')
                .update({
                    ortho_procedure: orthodontic.ortho_procedure,
                    ortho_nextvisit: orthodontic.ortho_nextvisit,
                    ortho_notes: orthodontic.ortho_notes
                })
                .eq('orthodontics_id', parseInt(orthodontics_id));

            if (orthodonticsError) {
                throw orthodonticsError;
            }


            // Optionally, you can navigate to another page or show a success message
            console.log('Procedure updated successfully!', orthodonticsResult);

    //UPDATING PRESCRIPTION
            try{
                // Fetch existing prescriptions
                const { data: existingPrescriptions, error: fetchError } = await supabase
                .from('ortho_Prescription')
                .select('*')
                .eq('orthodontics_id', parseInt(orthodontics_id));

                if (fetchError) {
                    throw fetchError;
                }

                console.log('Existing prescriptions:', existingPrescriptions);

                // Filter new prescriptions to be upserted (excluding existing ones)
                const newPrescriptions = prescriptions.filter(p => {
                    const exists = existingPrescriptions.some(ep => (
                        ep.ortho_medicine === p.ortho_medicine &&
                        ep.ortho_reason === p.ortho_reason &&
                        ep.ortho_duration === p.ortho_duration &&
                        ep.ortho_taken === p.ortho_taken
                    ));
                    return !exists;
                });

                console.log('New prescriptions to upsert:', newPrescriptions);

                // Prepare new prescriptions to upsert
                const prescriptionsToUpsert = newPrescriptions.map(p => ({
                    patient_id,
                    orthodontics_id: orthodontics_id,
                    ortho_medicine: p.ortho_medicine,
                    ortho_reason: p.ortho_reason,
                    ortho_duration: p.ortho_duration,
                    ortho_taken: p.ortho_taken
                }));

                if (prescriptionsToUpsert.length > 0) {
                    const { error: upsertError } = await supabase
                        .from('ortho_Prescription')
                        .upsert(prescriptionsToUpsert);

                    if (upsertError) {
                        throw upsertError;
                    }

                    console.log('Prescriptions upserted successfully!');
                }

    //UPDATING FILES
                try {
                    const { data: existingFiles, error: fetchError } = await supabase
                        .from('ortho_files')
                        .select('*')
                        .eq('orthodontics_id', parseInt(orthodontics_id));

                    if (fetchError) {
                        throw fetchError;
                    }

                    console.log('Existing files:', existingFiles);

                    // Filter new files to be upserted (excluding existing ones)
                    const newFiles = files.filter(f => {
                        const exists = existingFiles.some(ef => (
                            ef.ortho_filename === f.ortho_filename &&
                            ef.ortho_filedescription === f.ortho_filedescription
                        ));
                        return !exists;
                    });

                    console.log('New files to upsert:', newFiles);

                    // Prepare new files to upsert

                    const filesToUpsert = newFiles.map(f => ({
                        patient_id,
                        orthodontics_id: orthodontics_id,
                        ortho_filename: f.ortho_filename,
                        ortho_filedescription: f.ortho_filedescription,
                        uploaded_by: user.user_id
                    }));

                    if (filesToUpsert.length > 0) {
                        const { error: upsertError } = await supabase
                            .from('ortho_files')
                            .upsert(filesToUpsert);

                        if (upsertError) {
                            throw upsertError;
                        }

                        for (let file of files) {
                            const { data, error: uploadError } = await supabase.storage
                                .from('ortho_fileupload')
                                .upload(`public/${patient_id}/${orthodontics_id}/${file.ortho_filename}`, file.file);
                        }

                        console.log('Files upserted successfully!');
                    }


                } catch (error) {
                    console.error('Error updating files:', error.message);
                    setUserError('Failed to update files');
                }

                setShowSuccessMessage(true);
                setTimeout(() => {
                    navigate(`/patientrecord/${patient_id}/viewprocedure/${orthodontics_id}`);
                }, 2000);

            } catch (error) {
                console.error('Error updating prescription:', error.message);
                setUserError('Failed to update prescription');
            }


        } catch (error) {
            console.error('Error updating procedure:', error.message);
            setUserError('Failed to update procedure');
        }
    };

    const handleConfirm = (event) => {
        event.preventDefault();
        setShowConfirmModal(true);
    };


    return (
        <>
        <div className="editprocedure-content container-fluid">
            <div className="editdetails-header">
                <Button className="backbtn" variant="light" onClick={handleBack}>
                    <FaArrowLeft className="me-2" />
                </Button>
                <h2>
                    EDIT PROCEDURE
                </h2>
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

            <div className="addorthodonticsform">
                <div className='dentistdetail row'>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Procedure</Form.Label>
                        <Form.Select className="dropdown-custom" name="ortho_procedure" value={orthodontic.ortho_procedure} onChange={handleOrthoChange} aria-label="Select Procedure">
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
                        <Form.Control type="date" value={orthodontic.ortho_date} disabled/>
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Dentist</Form.Label>
                        <Form.Control type="text" placeholder={orthodontic.ortho_dentist} value={orthodontic.ortho_dentist} name="ortho_dentist" disabled/>
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Next Visit</Form.Label>
                        <Form.Control type="date" value={orthodontic.ortho_nextvisit} onChange={handleOrthoChange} name="ortho_nextvisit" />
                    </Form.Group>
                    <Form.Group className="col-lg-12 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Notes</Form.Label>
                        <Form.Control as="textarea" rows={3} name="ortho_notes" value={orthodontic.ortho_notes} onChange={handleOrthoChange}/>
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
                            {prescriptions.map((p, index) => (
                                <tr key={index}>
                                    <td className="align-content-center">{index + 1}</td>
                                    <td className="col-lg-3 custom-td align-content-center">{p.ortho_medicine}</td>
                                    <td className="col-lg-3 custom-td align-content-center">{p.ortho_reason}</td>
                                    <td className="col-lg-2 custom-td align-content-center">{p.ortho_duration}</td>
                                    <td className="col-lg-2 custom-td align-content-center">{p.ortho_taken}</td>
                                    <td className="col-lg-1 custom-td text-center align-content-center">
                                        <Button variant="custom-actionbtn" onClick={() => showDeleteConfirmation(index)}>
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
                                    <td className="align-content-center">{file.ortho_filename}</td>
                                    <td className="align-content-center">{file.ortho_filedescription}</td>
                                    <td className="col-lg-1 custom-td text-center align-content-center">
                                        <Button variant="custom-actionbtn" onClick={() => showDeleteFileConfirmation(index)}>
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
                <Button className="submitbtn" variant="primary" type="submit" onClick={handleConfirm}>
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
                            name="ortho_medicine"
                            value={currentPrescription.ortho_medicine}
                            onChange={handlePrescriptionChange}
                        />                   
                    </Form.Group>
                    <Form.Group className="mb-3 prescriptionformbody" controlId="formBasicReason">
                        <Form.Label>Reason<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-prescription-custom" 
                            type="text" 
                            placeholder="Enter a reason" 
                            name="ortho_reason"
                            value={currentPrescription.ortho_reason}
                            onChange={handlePrescriptionChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 prescriptionformbody" controlId="formBasicDuration">
                        <Form.Label>Duration<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-prescription-custom" 
                            type="text" 
                            placeholder="How long to take" 
                            name="ortho_duration"
                            value={currentPrescription.ortho_duration}
                            onChange={handlePrescriptionChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 prescriptionformbody" controlId="formBasicDuration">
                        <Form.Label>Taken<span className="required">*</span></Form.Label>
                        <Form.Control 
                            className="form-prescription-custom" 
                            type="text" 
                            placeholder="How many times a day" 
                            name="ortho_taken"
                            value={currentPrescription.ortho_taken}
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
                            value={currentFile.ortho_filename || ''}
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
                            value={currentFile.ortho_filedescription}
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

            
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    {modalBody}
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteModal} onHide={hideDeleteConfirmation} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalDeleteTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{modalDeleteBody}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideDeleteConfirmation}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteFileModal} onHide={hideDeleteFileConfirmation} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this file?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteFileModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteFile}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to update this treatment?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showSuccessMessage} onHide={() => setShowSuccessMessage(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Added Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body text-center">
                    The procedure has been successfully updated.<br/>
                    Redirecting to View Procedure page...
                </Modal.Body>
            </Modal>

        </div>

        
        
        </>
    )
}


export default Editprocedure;
import React, { useState, useEffect } from "react";
import './Addtreatment.css'
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { Button, Form, Table, Modal } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown"
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../settings/AuthContext";
import supabase from "../../../settings/supabase";

import { Avatar } from "@files-ui/react";
import userImage from '../../../img/user.png';
import { type } from "@testing-library/user-event/dist/type";

import jsPDF from "jspdf";
import "jspdf-autotable";

const Addtreatment = () => {
    const navigate = useNavigate();
    const { patient_id } = useParams();
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [adminDetails, setAdminDetails] = useState({});
    const [userError, setUserError] = useState('');
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
    const [loading, setLoading] = useState(true);
    const [showGuardianForm, setShowGuardianForm] = useState(false);

    const [imageSource, setImageSource] = useState(userImage);

    const [activeToothButton, setActiveToothButton] = useState('');
    const [selectedTreatment, setSelectedTreatment] = useState('');
    const [treatmentTypes, setTreatmentTypes] = useState([]);
    const [selectedTreatmentType, setSelectedTreatmentType] = useState('');
    const [nextVisitDate, setNextVisitDate] = useState('');
    const [treatmentDescription, setTreatmentDescription] = useState('');

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

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalHeader, setModalHeader] = useState("");

    const [extractedTeeth, setExtractedTeeth] = useState([]);

useEffect(() => {
    const fetchExtractedTeeth = async () => {
        const { data, error } = await supabase
            .from('patient_Treatments')
            .select('treatment_toothnum')
            .eq('patient_id', patient_id)
            .in('treatment_type', ['Tooth Extraction', 'Complicated Extraction']);

        if (error) {
            console.error('Error fetching extracted teeth:', error);
        } else {
            const extractedToothNumbers = data.map(item => item.treatment_toothnum);
            setExtractedTeeth(extractedToothNumbers);
        }
    };

    fetchExtractedTeeth();
}, [patient_id]);

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
        navigate(`/patientrecord/${patient_id}`, { state: { activeTab: 'treatments' } });
    };

    const handleChangeSource = (selectedFile) => {
        setImageSource(selectedFile);
    };

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


    if (userDetails && userDetails.role === 'dentist') {
        fullName = `Dr. ${fullName}`;
    }

    const lic_no = adminDetails.lic_no
    const ptr_no = adminDetails.ptr_no


    const patient_fname = patient.patient_fname ? capitalizeFirstLetter(patient.patient_fname) : '';
    const patient_mname = patient.patient_mname ? capitalizeFirstLetter(patient.patient_mname) : '';
    const patient_lname = patient.patient_lname ? capitalizeFirstLetter(patient.patient_lname) : '';

    const patient_branch = patient.patient_branch ? capitalizeAllLetters(patient.patient_branch) : 'Branch not provided';

    const [selectedTeeth, setSelectedTeeth] = useState([]);

    const handleToothNumber = (value) => {
      
    
        setActiveToothButton(value);
        
        // Toggle the selected state of the tooth
        if (selectedTeeth.includes(value)) {
            setSelectedTeeth(selectedTeeth.filter(tooth => tooth !== value));
        } else {
            setSelectedTeeth([...selectedTeeth, value]);
        }
    };

    const handleTreatmentChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedTreatment(selectedValue);

        // Fetch treatment types based on selected treatment
        fetchTreatmentTypes(selectedValue);
    };

    const handleTreatmentTypeChange = (type) => {
        setSelectedTreatmentType(type);
        setNextVisitDate(calculateNextVisitDate(type));
    };

    const calculateNextVisitDate = (type) => {
        switch (type) {
            case 'Tooth Extraction':
                return addDays(treatmentDate, 7);
            case 'Complicated Extraction':
                return addDays(treatmentDate, 14);
            case 'Odontectomy (Wisdom Tooth Removal)':
                return addDays(treatmentDate, 14);
            case 'Frenectomy':
                return addDays(treatmentDate, 14);
            case 'Gingivoplasty (Gum Reshaping)':
                return addDays(treatmentDate, 14);
            case 'Laser Bleaching (Whitening)':
                return addDays(treatmentDate, 14);
            case 'Root Canal Treatment':
                return addDays(treatmentDate, 14);
            case 'Pulpotomy':
                return addDays(treatmentDate, 14);
            case 'Apicoectomy':
                return addDays(treatmentDate, 14);
            case 'Pulp Regeneration':
                return addDays(treatmentDate, 14);

            case 'Oral Prophylaxis (Cleaning)':
                return addDays(treatmentDate, 180);
            case 'Deep Scaling & Polishing':
                return addDays(treatmentDate, 180);

            case 'Pit and Fissure Sealant':
                return addDays(treatmentDate, 7);
            case 'Restoration':
                return addDays(treatmentDate, 7);
            case 'Temporary Filling':
                return addDays(treatmentDate, 7);

            case 'Porcelain Fused to Metal Crowns & Bridges':
                return addDays(treatmentDate, 7);
            case 'Hybrid Porcelain Crowns, Bridges and Veeners':
                return addDays(treatmentDate, 7);
            case 'Pure Porcelain Crowns':
                return addDays(treatmentDate, 7);
            case 'Composite Veeners':
                return addDays(treatmentDate, 7);
            case 'Temporary Crown':
                return addDays(treatmentDate, 7);
            case 'Flexible Dentures':
                return addDays(treatmentDate, 7);
            case 'Removable Dentures':
                return addDays(treatmentDate, 7);

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

    const fetchTreatmentTypes = (treatment) => {
        // Simulated data fetching based on treatment selection
        let types = [];

        switch (treatment) {
            case 'Oral Surgery':
                types = ['Tooth Extraction', 'Complicated Extraction', 'Odontectomy (Wisdom Tooth Removal)', 'Frenectomy', 'Gingivoplasty (Gum Reshaping)', 'Laser Bleaching (Whitening)', 'Root Canal Treatment', 'Pulpotomy', 'Apicoectomy', 'Pulp Regeneration'];
                break;
            case 'Periodontics':
                types = ['Oral Prophylaxis (Cleaning)', 'Deep Scaling & Polishing'];
                break;
            case 'Restorative Dentistry':
                types = ['Pit and Fissure Sealant', 'Restoration', 'Temporary Filling'];
                break;
            case 'Prosthodontics':
                types = ['Porcelain Fused to Metal Crowns & Bridges', 'Hybrid Porcelain Crowns, Bridges and Veeners', 'Pure Porcelain Crowns', 'Composite Veeners', 'Temporary Crown', 'Flexible Dentures', 'Removable Dentures'];
                break;
            case 'Others':
                types = ['Panoramic Xray', 'Periapical Xray'];
                break;
            default:
                types = [];
                break;
        }

        setTreatmentTypes(types);
        setSelectedTreatmentType('');

    };

    const getCurrentDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    
    const [treatmentDate, setTreatmentDate] = useState(getCurrentDate());

    const validateTreatmentData = (treatmentData) => {
        return(
            treatmentData.treatment_toothnum !== '' &&
            treatmentData.treatment !== '' &&
            treatmentData.treatment_type !== '' &&
            treatmentData.treatment_date !== '' &&
            treatmentData.treatment_nextvisit !== ''
        );
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

        const treatmentData = {
            patient_id,
            treatment: selectedTreatment,
            treatment_type: selectedTreatmentType,
            treatment_description: treatmentDescription,
            treatment_date: treatmentDate,
            treatment_nextvisit: nextVisitDate,
            treatment_dentist: fullName,
            treatment_toothnum: activeToothButton,
        }

        if (!validateTreatmentData(treatmentData)){
            setModalMessage("Please fill out the required information to proceed. All fields marked with an asterisk (*) are required.");
            setModalHeader("Complete Required Information");
            setShowModal(true);
            return;
        } 

        try{
        
            const { data: treatmentResult, error: treatmentError } = await supabase
                .from('patient_Treatments')
                .insert([treatmentData])
                .select('treatment_id')

            if (treatmentError){
                throw treatmentError;
            }

            if (!treatmentResult || treatmentResult.length === 0){
                throw new Error('Failed to insert treatments data');
            }

            console.log(treatmentResult)

            const treatment_id = treatmentResult[0].treatment_id;

            // Data for inserting into ortho_Prescription table
            const prescriptionData = prescriptions.map(p => ({
                patient_id,
                treatment_id: treatment_id,
                treatment_medicine: p.medicine,
                treatment_reason: p.reason,
                treatment_duration: p.duration,
                treatment_taken: p.taken
            }));


            // Insert data into ortho_Prescription table
            const { error: prescriptionError } = await supabase
                .from('treatment_prescription')
                .insert(prescriptionData);

            if (prescriptionError) {
                // Rollback the orthodontics data insertion if the prescription insertion fails
                await supabase
                    .from('patient_Treatments')
                    .delete()
                    .eq('treatment_id', treatment_id);

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
                        .from('treatment_fileupload')
                        .upload(`public/${patient_id}/${treatment_id}/${file.filename}`, file.file);
        
                    if (error) {
                        throw error;
                    }
        
                    // Assuming you want to store the file URL in the database, you can save it here
                    const fileUrl = data.Key; // This gives you the URL of the uploaded file in storage
        
                    // Now you can proceed to save `fileUrl` or any other details to your database
                    const { data: savedData, error: saveError } = await supabase
                        .from('treatment_files') // Adjust to your database table
                        .insert({
                            patient_id,
                            treatment_id: treatment_id,
                            treatment_filename: file.filename,
                            treatment_uploadedfile: fileUrl,
                            treatment_filedescription: file.description,
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

            setShowSuccessMessage(true);

            setTimeout(() => {
                navigate(`/patientrecord/${patient_id}`, { state: { activeTab: 'treatments' } });
            }, 2000);
            
        } catch (error) {
            console.error('Error adding treatment: ', error.message);
        }
        

    }

    const handlePrescriptionForm = () => {
        setShowPrescriptionForm(true);
    }

    const handleClosePrescriptionForm = () => {
        setShowPrescriptionForm(false);
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

    const handleDelete = (index) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleFileForm = () => {
        setShowFileForm(true);
    }

    const handleCloseFileForm = () => {
        setShowFileForm(false);
    }

    const handleFileChange = (event) => {
        const { name, value, files: fileList } = event.target;
        const file = fileList ? fileList[0] : null;
        setCurrentFile(prevState => ({
            ...prevState,
            [name]: file || value
        }));
    };

    const handleDeleteFile = (index) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
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
 

    return (
        <>
        <div className="addtreatment-box container-fluid">
            <h2>PATIENT RECORD</h2>
            <div className="pagetitle">
                <Button className="backbtn-addtreatment" variant="light" onClick={handleBack}>
                    <FaArrowLeft className="me-2" />
                </Button>
                <h2 className="pagetitle-lbl">ADD TREATMENT</h2>
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

            <h2 className="addtreatmenttitle-lbl">ADD TREATMENT</h2>

            <div className="addtreatmentform">
            <h2>TOOTH NUMBER<span className="required">*</span></h2>
            <div className="divider"></div>
            <div className="container toothform">
                <div className="row justify-content-md-center">
                    <div className="col col-lg-auto col-md-auto col-sm-auto col-auto g-0">
                    <Button className={`toothbtn ${activeToothButton === '18' ? 'active' : ''} ${selectedTeeth.includes('46') ? 'selected' : ''} ${extractedTeeth.includes('18') ? 'extracted' : ''}`} onClick={() => handleToothNumber('18')} enabled={extractedTeeth.includes('18')}>
                            {selectedTeeth.includes('18') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('18') && <span className="tooth-x">X</span>}18</label>
                            <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="35" height="108" viewBox="0 0 35 108" fill="none">
                                    <path d="M9.87322 82.3263C11.5167 81.4516 14.337 80.6523 14.337 80.6523H16.9595L23.2646 82.3263L29.4023 86.79L33.3081 92.3698C33.3081 92.3698 34.3386 95.0387 34.424 96.8336C34.5297 99.0532 34.3654 100.459 33.3081 102.413C32.2817 104.311 31.3767 105.45 29.4023 106.319C27.2083 107.284 25.5104 107.157 23.2646 106.319C21.7923 105.77 21.2965 104.839 19.9167 104.087C18.4596 103.293 17.6633 102.26 16.0109 102.413C14.0106 102.599 14.0272 105.177 12.1051 105.761C10.2172 106.335 8.89545 105.984 7.08335 105.203C5.2384 104.408 3.17754 101.855 3.17754 101.855C3.17754 101.855 1.96586 99.8942 1.50362 98.5075C0.470019 95.4067 1.06782 91.0095 1.50362 90.1379L2.61957 87.906L5.96741 85.1161C5.96741 85.1161 8.21849 83.2069 9.87322 82.3263Z" fill="white"/>
                                    <path d="M17.1269 80.6523C17.082 80.6523 17.0255 80.6523 16.9595 80.6523M16.9595 80.6523C16.3678 80.6523 15.0062 80.6523 14.337 80.6523C14.337 80.6523 11.5167 81.4516 9.87322 82.3263C8.21849 83.2069 5.96741 85.1161 5.96741 85.1161L2.61957 87.906C2.18376 88.7776 1.93942 89.2663 1.50362 90.1379C1.06782 91.0095 0.470019 95.4067 1.50362 98.5075C1.96586 99.8942 3.17754 101.855 3.17754 101.855C3.17754 101.855 5.2384 104.408 7.08335 105.203C8.89545 105.984 10.2172 106.335 12.1051 105.761C14.0272 105.177 14.0106 102.599 16.0109 102.413C17.6633 102.26 18.4596 103.293 19.9167 104.087C21.2965 104.839 21.7923 105.77 23.2646 106.319C25.5104 107.157 27.2083 107.284 29.4023 106.319C31.3767 105.45 32.2817 104.311 33.3081 102.413C34.3654 100.459 34.5297 99.0532 34.424 96.8336C34.3386 95.0387 33.3081 92.3698 33.3081 92.3698L29.4023 86.79L23.2646 82.3263C23.2646 82.3263 19.4218 81.3061 16.9595 80.6523Z" stroke="black"/>
                                    <path d="M5.40945 71.8662C5.40945 67.2612 5.62735 64.3846 5.40945 59.5908L4.78956 55.127L3.73553 50.6632C3.73553 50.6632 2.61958 46.1994 2.61958 45.6414C2.61958 45.0835 2.06161 43.9678 3.73553 43.9675C4.38718 43.9674 5.20796 44.3902 5.96742 44.9066C5.96742 44.9066 5.47473 41.2561 7.08337 40.6197C8.36486 40.1127 9.31526 41.0853 10.4312 41.7356C11.5472 42.3859 17.4059 49.8262 17.4059 49.8262L17.1269 47.8733C17.1269 47.8733 17.1617 46.6478 17.6849 46.1994C18.6495 45.3725 20.4747 47.8733 20.4747 47.8733L24.9385 54.011L27.1704 57.9168L28.8443 62.3806L31.0762 71.8662L31.6342 89.5802L28.8443 86.2323L24.9385 82.8845L19.9167 80.6526H14.337L9.87322 82.3265L4.29348 86.2323L5.40945 71.8662Z" fill="#FFE5E5"/>
                                    <path d="M5.96742 44.9066C5.20796 44.3902 4.38718 43.9674 3.73553 43.9675C2.06161 43.9678 2.61958 45.0835 2.61958 45.6414C2.61958 46.1994 3.73553 50.6632 3.73553 50.6632L4.78956 55.127L5.40945 59.5908C5.62735 64.3846 5.40945 67.2612 5.40945 71.8662L4.29348 86.2323L9.87322 82.3265L14.337 80.6526H19.9167L24.9385 82.8845L28.8443 86.2323L31.6342 89.5802L31.0762 71.8662L28.8443 62.3806L27.1704 57.9168L24.9385 54.011L20.4747 47.8733C20.4747 47.8733 18.6495 45.3725 17.6849 46.1994C17.1617 46.6478 17.1269 47.8733 17.1269 47.8733L17.4059 49.8262M5.96742 44.9066C7.15881 45.7168 8.19931 46.7574 8.19931 46.7574L10.4312 49.5472L12.6631 52.3371C12.6631 52.3371 13.779 54.569 15.453 57.9168C17.1269 61.2647 17.6849 65.7285 17.6849 65.7285L18.8008 71.8662L19.3588 62.9386V57.9168L17.6849 51.7791L17.4059 49.8262M5.96742 44.9066C5.96742 44.9066 5.47473 41.2561 7.08337 40.6197C8.36486 40.1127 9.31526 41.0853 10.4312 41.7356C11.5472 42.3859 17.4059 49.8262 17.4059 49.8262" stroke="black"/>
                                </svg>
                                
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '17' ? 'active' : ''} ${selectedTeeth.includes('17') ? 'selected' : ''} ${extractedTeeth.includes('17') ? 'extracted' : ''}`} onClick={() => handleToothNumber('17')} enabled={extractedTeeth.includes('17')}>
                            {selectedTeeth.includes('17') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('17') && <span className="tooth-x">X</span>}17</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="38" height="108" viewBox="0 0 38 108" fill="none">
                                    <path d="M5.38771 82.885V70.6096L4.27176 62.798V48.2907V44.3849L9.29352 36.5733H9.85149L10.4095 32.6674L12.6414 30.4355L15.9892 33.2254L17.6631 37.1312V35.4573H19.895L26.0327 43.2689L32.1704 55.5443L33.2864 73.3995L34.9603 86.2329L27.1487 81.2111H21.011L14.8732 79.5372L10.4095 80.0952L5.38771 82.885Z" fill="#FFE5E5"/>
                                    <path d="M9.85149 36.5733H9.29352L4.27176 44.3849V48.2907V62.798L5.38771 70.6096V82.885L10.4095 80.0952L14.8732 79.5372L21.011 81.2111H27.1487L34.9603 86.2329L33.2864 73.3995L32.1704 55.5443L26.0327 43.2689L19.895 35.4573H17.6631V37.1312M9.85149 36.5733H12.0834L13.7573 39.3631V50.5226L14.8732 58.3342L19.895 68.9357L21.011 53.3124L19.895 46.6168L17.6631 40.4791V37.1312M9.85149 36.5733L10.4095 32.6674L12.6414 30.4355L15.9892 33.2254L17.6631 37.1312" stroke="black"/>
                                    <path d="M14.3153 79.5366C16.5733 79.5887 17.6622 80.7181 19.895 81.0584C22.826 81.5051 24.6756 80.1166 27.4869 81.0584C29.2513 81.6495 30.1369 82.3088 31.6124 83.4425C33.0786 84.5689 34.9603 86.7903 34.9603 86.7903C34.9603 86.7903 36.1747 89.1015 36.6342 90.6961C37.6598 94.2556 36.6342 100.182 36.6342 100.182C36.6342 100.182 35.6445 102.845 34.4023 104.087C33.1601 105.33 30.4965 106.319 30.4965 106.319C30.4965 106.319 26.2393 107.263 23.8008 106.319C22.3354 105.752 21.719 105.018 20.453 104.087C19.3288 103.261 17.6631 101.856 17.6631 101.856L16.5472 102.414C16.5472 102.414 15.3179 103.661 14.3153 104.087C12.2999 104.944 8.73553 103.529 8.73553 103.529C8.73553 103.529 6.18562 102.034 4.82972 100.74C3.25351 99.2351 2.206 98.331 1.48188 96.2758C0.386079 93.1658 1.33145 90.9508 2.59783 87.9062C3.73606 85.1697 7.06161 81.7685 7.06161 81.7685C7.06161 81.7685 11.3523 79.4684 14.3153 79.5366Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '16' ? 'active' : ''} ${selectedTeeth.includes('16') ? 'selected' : ''} ${extractedTeeth.includes('16') ? 'extracted' : ''}`} onClick={() => handleToothNumber('16')} enabled={extractedTeeth.includes('16')}>
                            {selectedTeeth.includes('16') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('16') && <span className="tooth-x">X</span>}16</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="40" height="108" viewBox="0 0 40 108" fill="none">
                                    <path d="M5.53149 84.0011L4.41554 68.3778L3.2996 58.8923L1.0677 51.0806V36.5733L3.2996 33.7835L7.20541 36.5733L9.3815 43.827V33.7835L10.5532 30.4356L12.2272 28.7617L16.691 32.1096L20.0388 38.8052L22.5497 43.548L21.7127 39.9212V36.5733L23.3866 34.3415L28.4084 37.6893L32.8722 43.827L36.22 53.3125V84.0011L31.7562 80.6532L27.2924 79.5373L21.7127 81.2112L13.9011 80.6532L8.87933 81.2112L5.53149 84.0011Z" fill="#FFE5E5"/>
                                    <path d="M9.3815 43.827L7.20541 36.5733L3.2996 33.7835L1.0677 36.5733V51.0806L3.2996 58.8923L4.41554 68.3778L5.53149 84.0011L8.87933 81.2112L13.9011 80.6532L21.7127 81.2112L27.2924 79.5373L31.7562 80.6532L36.22 84.0011V53.3125L32.8722 43.827L28.4084 37.6893L23.3866 34.3415L21.7127 36.5733V39.9212L22.5497 43.548M9.3815 43.827L10.5532 47.7328L16.691 61.6821L20.0388 67.2619L22.8287 60.0082L23.3866 47.1748L22.5497 43.548M9.3815 43.827V33.7835L10.5532 30.4356L12.2272 28.7617L16.691 32.1096L20.0388 38.8052L22.5497 43.548" stroke="black"/>
                                    <path d="M15.575 80.6536C17.2489 80.6536 20.7084 80.7652 21.1547 81.2116C21.1547 81.2116 24.8092 79.4599 27.2924 79.5377C29.0884 79.5939 30.1323 79.8844 31.7562 80.6536C34.5412 81.9728 35.8676 83.5241 37.336 86.2334C38.6203 88.603 38.7106 90.2504 39.0099 92.929C39.3977 96.4007 40.0832 98.7677 38.4519 101.857C37.0829 104.449 35.672 106.009 32.8722 106.878C30.3662 107.656 28.6712 107.134 26.1765 106.32C23.4753 105.44 21.7127 102.973 20.0388 102.415C18.3648 101.857 16.9273 105.43 14.4591 106.32C12.2043 107.134 10.6103 107.032 8.32135 106.32C6.35826 105.71 6.01653 105.378 4.41554 104.088C2.97555 102.929 1.62568 100.74 1.62568 100.74C1.62568 100.74 0.755254 96.9794 1.0677 94.6029C1.39155 92.1397 1.70275 90.7221 2.74162 88.4652C3.72717 86.3242 6.08946 83.4435 6.08946 83.4435C6.08946 83.4435 8.59212 80.6536 10.5532 80.6536H15.575Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '15' ? 'active' : ''} ${selectedTeeth.includes('15') ? 'selected' : ''} ${extractedTeeth.includes('15') ? 'extracted' : ''}`} onClick={() => handleToothNumber('15')} enabled={extractedTeeth.includes('15')}>
                            {selectedTeeth.includes('15') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('15') && <span className="tooth-x">X</span>}15</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="27" height="107" viewBox="0 0 27 107" fill="none">
                                    <path d="M6.02449 73.9566L4.90854 80.6523C4.90854 80.6523 7.17635 77.3089 9.37232 76.1885C10.9729 75.3719 12.0471 74.905 13.8361 75.0725C15.4884 75.2272 16.4131 75.7524 17.7419 76.7464C19.6292 78.1583 21.0898 81.7682 21.0898 81.7682V71.7247L18.8579 54.9855L15.51 37.6883L11.0462 25.9709L7.6984 22.623L6.58246 24.8549V57.2174L6.02449 73.9566Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M10.4883 75.6304C10.4883 75.6304 12.1671 75.0627 13.2781 75.0724C15.1398 75.0886 17.7419 76.7463 17.7419 76.7463L22.7637 84C22.7637 84 25.6981 89.227 26.1115 92.9275C26.427 95.7511 26.7198 97.5905 25.5535 100.181C23.961 103.719 17.7419 106.319 17.7419 106.319C17.7419 106.319 14.6342 106.746 12.7202 106.319C11.1005 105.957 8.25638 105.203 8.25638 105.203C8.25638 105.203 5.31834 103.922 3.79258 102.413C2.40697 101.042 2.12411 99.8151 1.56069 97.9493C0.425077 94.1887 1.22245 91.7305 2.11866 87.9058C2.59028 85.8931 3.79258 82.884 3.79258 82.884C3.79258 82.884 5.40851 79.4609 7.14042 77.8623C8.29503 76.7965 10.4883 75.6304 10.4883 75.6304Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '14' ? 'active' : ''} ${selectedTeeth.includes('14') ? 'selected' : ''} ${extractedTeeth.includes('14') ? 'extracted' : ''}`} onClick={() => handleToothNumber('14')} enabled={extractedTeeth.includes('14')}>
                            {selectedTeeth.includes('14') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('14') && <span className="tooth-x">X</span>}14</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="28" height="108" viewBox="0 0 28 108" fill="none">
                                    <path d="M3.78987 75.6302L3.23189 82.8839L5.46379 79.536L9.92757 76.1882L13.2754 75.0723L16.0653 75.6302L19.4131 78.4201L22.761 82.3259C22.761 82.3259 23.0662 74.1553 22.761 68.9345C22.518 64.7786 22.1075 62.4703 21.645 58.3331C21.2306 54.6263 20.5291 48.8475 20.5291 48.8475C20.5291 48.8475 19.925 42.9682 18.8551 39.362C17.6344 35.247 14.3914 29.3185 14.3914 29.3185C14.3914 29.3185 12.8173 26.4923 11.0435 25.9706C9.99828 25.6632 8.25365 25.9706 8.25365 25.9706C8.25365 25.9706 6.34589 26.7301 5.46379 27.6445C4.44897 28.6966 3.78987 30.9924 3.78987 30.9924V75.6302Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M9.95877 76.3144C9.95877 76.3144 11.5905 75.3875 12.7486 75.1985C13.6089 75.058 14.1297 75.0094 14.9805 75.1985C16.2209 75.4741 16.7445 76.1227 17.7704 76.8724C20.5185 78.8806 23.3501 83.5681 23.3501 83.5681C23.3501 83.5681 26.1794 88.1014 26.698 91.3797C27.1758 94.4005 26.14 99.1913 26.14 99.1913C26.14 99.1913 24.0601 102.23 22.2342 103.655C20.3137 105.154 19.039 105.946 16.6545 106.445C14.7349 106.847 11.6327 106.445 11.6327 106.445L7.72688 104.771C6.20157 104.117 4.23759 103.372 3.26309 101.423C2.14714 99.1913 2.182 99.1711 1.58915 97.5174C0.263504 93.8195 1.58918 87.4739 1.58918 87.4739L3.26309 83.0101C3.26309 83.0101 4.72751 80.4297 6.05296 79.1043C7.37841 77.7788 9.95877 76.3144 9.95877 76.3144Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '13' ? 'active' : ''} ${selectedTeeth.includes('13') ? 'selected' : ''} ${extractedTeeth.includes('13') ? 'extracted' : ''}`} onClick={() => handleToothNumber('13')} enabled={extractedTeeth.includes('13')}>
                            {selectedTeeth.includes('13') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('13') && <span className="tooth-x">X</span>}13</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="29" height="107" viewBox="0 0 29 107" fill="none">
                                    <path d="M5.17687 55.5443C4.96953 63.1712 4.6189 75.0734 4.6189 75.0734L7.40876 71.1676L10.1986 68.9357L14.1044 68.3777H16.8943L18.5682 69.4936L20.2421 71.1676L24.148 76.1893C24.148 76.1893 23.5305 69.0414 23.032 64.4719C22.4605 59.2326 22.0261 56.3084 21.3581 51.0805C20.7175 46.0671 19.6842 38.2471 19.6842 38.2471L18.5682 30.9935L16.8943 23.7398C16.2406 20.9071 15.0195 18.0305 12.9885 14.8123C11.6625 12.7112 9.08268 9.79051 9.08268 9.79051C9.08268 9.79051 7.68805 7.55055 6.29282 7.55862C5.60376 7.5626 5.15447 7.68303 4.6189 8.11659C3.43335 9.07631 4.06091 9.23254 4.6189 12.0224C5.17688 14.8123 5.45585 16.7651 5.73484 19.834C6.22804 25.2592 5.78938 28.3361 5.73484 33.7834C5.64973 42.2839 5.40788 47.0465 5.17687 55.5443Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M10.1987 68.9364C11.6129 68.3248 12.5664 68.4689 14.1045 68.3784C15.1921 68.3144 15.8517 68.0624 16.8944 68.3784C18.2297 68.783 19.6842 70.6103 19.6842 70.6103C19.6842 70.6103 22.7233 73.7906 24.148 76.19C25.5943 78.6258 26.9379 82.8857 26.9379 82.8857L28.0538 87.9075C28.4896 89.8686 28.6118 93.4862 28.0538 96.835C27.6665 99.16 26.3033 100.124 24.706 101.857C23.0223 103.684 22.0271 104.936 19.6842 105.763C17.2185 106.633 15.479 106.56 12.9885 105.763C10.7437 105.044 9.36997 104.279 7.40885 102.972C5.44774 101.664 4.49304 100.844 2.94503 99.0669C1.79121 97.7422 1.74677 96.8513 1.27113 95.1601C0.740161 93.2722 1.12798 92.0943 1.2711 90.1384C1.51434 86.814 2.38706 81.7698 2.38706 81.7698C2.38706 81.7698 2.92494 79.3412 3.503 77.864C4.32051 75.7748 6.29287 72.8422 6.29287 72.8422C6.29287 72.8422 8.21875 69.7926 10.1987 68.9364Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '12' ? 'active' : ''} ${selectedTeeth.includes('12') ? 'selected' : ''} ${extractedTeeth.includes('12') ? 'extracted' : ''}`} onClick={() => handleToothNumber('12')} enabled={extractedTeeth.includes('12')}>
                            {selectedTeeth.includes('12') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('12') && <span className="tooth-x">X</span>}12</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="25" height="107" viewBox="0 0 25 107" fill="none">
                                    <path d="M8.03367 73.9573C9.24258 73.4139 10.0589 73.4861 11.3815 73.3994C12.2512 73.3423 12.7833 73.1337 13.6134 73.3994C14.3617 73.6388 15.2873 74.5153 15.2873 74.5153C15.2873 74.5153 17.5019 76.4022 18.6352 77.8632C20.0102 79.6358 21.425 82.8849 21.425 82.8849L22.541 86.2328L23.0989 89.5806C23.0989 89.5806 23.5299 92.9741 23.6569 95.1603C23.8338 98.2058 24.2149 101.857 23.6569 102.972C23.0989 104.087 20.3091 105.762 20.3091 105.762C15.0794 105.762 9.14961 106.321 6.91772 105.762C4.68583 105.203 4.32164 104.701 3.01191 103.53C1.97171 102.6 1.89595 101.856 1.33799 100.739C0.780034 99.6221 1.00895 94.611 1.33799 90.6965C1.52142 88.5143 1.58938 87.2851 1.89596 85.1168C2.08153 83.8044 2.0803 83.0407 2.45394 81.769C3.00335 79.899 3.5395 78.8814 4.68583 77.3052C5.77333 75.8099 6.34727 74.7154 8.03367 73.9573Z" fill="white" stroke="black"/>
                                    <path d="M4.12802 67.8187L3.57005 78.9781L6.91789 74.5144L9.14978 73.3984H12.4976L14.7295 73.9564L16.4034 75.6303L19.7513 79.5361V73.9564L18.6353 63.3549L16.9614 53.3114L15.2875 43.2679L13.0556 35.4562C13.0556 35.4562 11.9384 31.0467 10.2657 28.7606C9.17397 27.2683 8.2253 26.7201 6.91789 25.4127L4.12802 22.6229C4.12802 22.6229 2.57674 22.0784 1.89613 22.6229C1.04537 23.3035 1.33824 24.8547 1.89609 26.5286C2.45394 28.2025 2.69421 28.2677 3.01196 30.4344C3.46465 33.5213 4.12802 39.5899 4.12802 42.7098V55.5433V67.8187Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '11' ? 'active' : ''} ${selectedTeeth.includes('11') ? 'selected' : ''} ${extractedTeeth.includes('11') ? 'extracted' : ''}`} onClick={() => handleToothNumber('11')} enabled={extractedTeeth.includes('11')}>
                            {selectedTeeth.includes('11') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('11') && <span className="tooth-x">X</span>}11</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="30" height="106" viewBox="0 0 30 106" fill="none">
                                    <path d="M5.21136 63.3553L4.09541 73.9568L6.32731 71.1669L8.5592 69.493L10.7911 67.8191L13.581 67.2611L17.4868 68.377L19.7187 69.493L21.3926 71.7249L24.1824 75.0727V68.935L22.5085 53.3118L20.8346 41.5943L16.9288 29.3189L13.581 22.6232L10.2331 19.2754H7.44325L5.76933 22.6232V29.3189V47.174L5.21136 63.3553Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M10.7911 67.8197L14.1389 67.2617L19.1607 68.9356L24.1824 75.0733L26.9723 82.885L28.6462 90.6966L29.2042 102.414L26.9723 104.646H6.32728L2.97944 102.972L1.30552 98.5082C1.30552 98.5082 0.618101 90.3011 1.30552 85.1169C1.47974 83.8029 1.86349 81.769 1.86349 81.769L3.53741 75.0733L6.88525 70.6096L10.7911 67.8197Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>
                        </div>                   

                        <div className="col col-lg-auto col-md-auto col-sm-auto col-auto g-0">
                        <Button className={`toothbtn ${activeToothButton === '21' ? 'active' : ''} ${selectedTeeth.includes('21') ? 'selected' : ''} ${extractedTeeth.includes('21') ? 'extracted' : ''}`} onClick={() => handleToothNumber('21')} enabled={extractedTeeth.includes('21')}>
                            {selectedTeeth.includes('21') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('21') && <span className="tooth-x">X</span>}21</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="30" height="106" viewBox="0 0 30 106" fill="none">
                                    <path d="M6.02175 59.4495L4.90581 75.0727L9.36959 70.0509L12.7174 67.8191L16.0653 67.2611L19.4131 68.377L22.203 70.6089L24.4349 73.3988L25.5508 75.0727L24.4349 62.7973L23.8769 49.4059V35.4566L24.4349 30.9928V23.1812L22.203 19.2754H19.9711L16.0653 23.1812L13.2754 27.645L10.4855 34.3407L7.69567 47.732L6.02175 59.4495Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M12.1595 68.3777L15.5073 67.2617L18.8551 67.8197L22.761 71.1675L26.1088 75.6313L28.8987 83.4429V99.0662L26.1088 102.972L22.761 104.646H3.23189L1 102.414L1.55797 92.9285L2.11595 87.3488L3.23189 80.6531L4.90581 75.0733L8.81162 70.6096L12.1595 68.3777Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '22' ? 'active' : ''} ${selectedTeeth.includes('22') ? 'selected' : ''} ${extractedTeeth.includes('22') ? 'extracted' : ''}`} onClick={() => handleToothNumber('22')} enabled={extractedTeeth.includes('22')}>
                            {selectedTeeth.includes('22') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('22') && <span className="tooth-x">X</span>}22</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="25" height="107" viewBox="0 0 25 107" fill="none">
                                    <path d="M6.02177 63.9124L4.90582 79.5357L6.57974 77.8618L8.81163 75.0719L11.0435 73.398H16.0653L17.1812 74.5139L19.4131 77.3038L21.087 79.5357V69.4922L20.5291 56.6588V46.0573V38.8036L22.203 32.6659L23.3189 25.9703L22.761 22.0645H21.087L17.7392 24.8543L13.8334 29.8761L11.6015 36.0138L8.25366 48.8472L6.02177 63.9124Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M11.0435 73.3984H13.2754H16.0653L17.7392 75.0724L21.087 79.5361L22.761 83.9999L23.8769 90.6956V100.739L21.087 104.087L17.1812 105.761H3.78987L2.11595 104.087L1 101.855L1.55797 89.5797L2.11595 86.7898L3.23189 83.442L5.46379 78.9782L8.25365 75.6303L11.0435 73.3984Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '23' ? 'active' : ''} ${selectedTeeth.includes('23') ? 'selected' : ''} ${extractedTeeth.includes('23') ? 'extracted' : ''}`} onClick={() => handleToothNumber('23')} enabled={extractedTeeth.includes('23')}>
                            {selectedTeeth.includes('23') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('23') && <span className="tooth-x">X</span>}23</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="29" height="107" viewBox="0 0 29 107" fill="none">
                                    <path d="M11.0435 68.9349L14.9493 68.377H18.2972L21.645 71.1668L24.9928 76.7466L26.6668 81.2103L27.7827 86.2321V96.8336L25.5508 99.6235L19.9711 103.529L16.6233 105.761H8.81163L4.90581 102.971L2.67392 100.181L1 96.2756V87.348L2.67392 81.7683L4.90581 75.6306L7.69568 71.7248L11.0435 68.9349Z" fill="white" stroke="black"/>
                                    <path d="M5.4638 65.0292L4.90582 75.0727L6.57974 73.3988L8.81163 70.6089L11.0435 68.935L14.9493 68.377H18.2972L20.5291 70.051L22.761 72.8408L24.4349 75.6307L23.8769 67.8191L23.3189 56.1016V46.6161V36.0146V29.3189L24.4349 19.2754L24.9929 14.2537L24.4349 8.67392L22.761 7L19.9711 9.23189L16.0653 14.2537L13.2754 20.3914L9.92758 31.5508L7.69569 46.6161L5.4638 65.0292Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '24' ? 'active' : ''} ${selectedTeeth.includes('24') ? 'selected' : ''} ${extractedTeeth.includes('24') ? 'extracted' : ''}`} onClick={() => handleToothNumber('24')} enabled={extractedTeeth.includes('24')}>
                            {selectedTeeth.includes('24') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('24') && <span className="tooth-x">X</span>}24</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="27" height="108" viewBox="0 0 27 108" fill="none">
                                    <path d="M4.90582 67.2607V82.326L6.57974 80.0941L8.25366 77.8622L9.92758 76.7463L12.7174 75.6303H15.5073L18.2972 76.1883L21.645 78.4202L22.761 80.0941L23.8769 82.326L23.3189 73.9564V62.239V50.5215L23.8769 39.3621L23.3189 29.3185L21.087 26.5287L17.7392 25.9707L14.3914 27.6446L10.4856 33.7823L7.69569 45.4998L6.02177 56.6592L4.90582 67.2607Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M12.1595 75.6289H14.9493L18.2972 76.1869L21.645 78.4188L24.4349 82.8826L26.1088 87.3463V98.5058L22.761 102.412L19.4131 105.201L16.0653 106.875H11.6015L7.13771 104.644L3.23189 101.854L1 98.5058V91.2522L3.23189 85.1145L6.02176 80.6507L8.81163 77.3028L12.1595 75.6289Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '25' ? 'active' : ''} ${selectedTeeth.includes('25') ? 'selected' : ''} ${extractedTeeth.includes('25') ? 'extracted' : ''}`} onClick={() => handleToothNumber('25')} enabled={extractedTeeth.includes('25')}>
                            {selectedTeeth.includes('25') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('25') && <span className="tooth-x">X</span>}25</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="26" height="107" viewBox="0 0 26 107" fill="none">
                                    <path d="M6.02175 69.4934L5.46378 80.6529L8.25364 78.421L11.0435 76.1891L13.2754 75.0732H14.9493L16.6232 75.6311L19.9711 78.421L21.645 80.6529L19.9711 66.7036V56.1021V43.8266V33.2252V25.9715L18.8551 23.1816H16.6232L13.8334 27.6454L9.92756 42.1527L7.69567 56.66L6.02175 69.4934Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M9.92757 76.7462L13.8334 75.0723H16.0653L21.087 79.5361L23.8769 85.1158L24.9928 91.2535V97.3912L23.3189 101.297L18.8551 104.645L13.8334 106.319H9.3696L4.34784 103.529L1 100.739V92.9274L2.67392 86.7897L5.46379 81.21L9.92757 76.7462Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '26' ? 'active' : ''} ${selectedTeeth.includes('26') ? 'selected' : ''} ${extractedTeeth.includes('26') ? 'extracted' : ''}`} onClick={() => handleToothNumber('26')} enabled={extractedTeeth.includes('26')}>
                            {selectedTeeth.includes('26') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('26') && <span className="tooth-x">X</span>}26</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="40" height="108" viewBox="0 0 40 108" fill="none">
                                    <path d="M3.78986 85.6737V70.0504V54.4272L4.9058 48.2894L8.81161 40.4778L13.2754 36.572L16.6232 34.8981L18.2972 36.572V40.4778L17.9252 41.5938C18.2228 41.5938 19.7851 39.3619 20.5291 38.2459L22.7609 33.7821L25.5508 30.4343L27.7827 29.3184L29.4566 30.4343L30.5726 32.6662V37.13L30.4204 43.8257L32.2465 38.8039L33.9204 34.8981L36.1523 33.7821L38.3842 36.572L39.5001 40.4778V52.1953L38.3842 56.659L36.1523 62.2388L35.0364 67.2605V76.7461V84.5577L32.2465 82.3258L28.8987 80.6519H18.8551L16.0653 80.0939H9.92756L6.57972 82.3258L3.78986 85.6737Z" fill="#FFE5E5"/>
                                    <path d="M17.9252 41.5938L18.2972 40.4778V36.572L16.6232 34.8981L13.2754 36.572L8.81161 40.4778L4.9058 48.2894L3.78986 54.4272V70.0504V85.6737L6.57972 82.3258L9.92756 80.0939H16.0653L18.8551 80.6519H28.8987L32.2465 82.3258L35.0364 84.5577V76.7461V67.2605L36.1523 62.2388L38.3842 56.659L39.5001 52.1953V40.4778L38.3842 36.572L36.1523 33.7821L33.9204 34.8981L32.2465 38.8039L30.4204 43.8257M17.9252 41.5938L16.6232 45.4996V60.0069L18.2972 64.4707L19.9711 67.2605L22.7609 61.6808L26.6668 54.4272L30.0146 44.9416L30.4204 43.8257M17.9252 41.5938C18.2228 41.5938 19.7851 39.3619 20.5291 38.2459L22.7609 33.7821L25.5508 30.4343L27.7827 29.3184L29.4566 30.4343L30.5726 32.6662V37.13L30.4204 43.8257" stroke="black"/>
                                    <path d="M16.0653 80.0938L18.8551 80.6517H28.8987L33.3624 82.8836L36.1523 86.2315L37.8262 90.6952L38.9422 95.159L38.3842 101.297L35.0364 104.645L31.1306 106.876H25.5508L23.8769 105.761L22.203 104.087L19.9711 102.413L17.1812 104.087L13.2754 106.876H7.69568L5.46379 105.761L2.67392 103.529L1 101.297V94.0431L2.11595 89.0213L4.34784 85.1155L7.13771 81.7677L9.92757 80.0938H16.0653Z" fill="white" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '27' ? 'active' : ''} ${selectedTeeth.includes('27') ? 'selected' : ''} ${extractedTeeth.includes('27') ? 'extracted' : ''}`} onClick={() => handleToothNumber('27')} enabled={extractedTeeth.includes('27')}>
                            {selectedTeeth.includes('27') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('27') && <span className="tooth-x">X</span>}27</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="37" height="108" viewBox="0 0 37 108" fill="none">
                                    <path d="M9.3696 81.2097H17.1812L22.203 80.0938L25.5508 80.6517L28.3407 81.2097L31.1306 82.3256L33.9204 85.6735L35.5943 89.5793V96.275L32.8045 100.181L28.8987 104.087H24.4349L22.761 102.971L19.9711 101.855L17.1812 104.087L13.2754 106.876H7.69568L4.34784 104.645L1 100.739V90.6952L2.11595 88.4633L5.46379 83.9996L9.3696 81.2097Z" fill="white" stroke="black"/>
                                    <path d="M3.23187 86.7895L3.78985 77.304L4.90579 65.0285L5.46377 56.659L7.13768 51.0792L9.92755 45.4995L12.7174 41.5937L14.9493 38.2458L17.1812 35.456L18.8551 34.898L19.9711 36.5719V35.456L21.645 33.2241L23.8769 30.9922H26.1088L26.6667 33.2241L26.1088 36.0139L28.8986 37.6879L31.1305 39.9198L32.8044 44.9415L33.9204 49.4053L33.3624 63.3546L32.8044 72.8402V83.9996L31.1305 82.3257L28.3407 81.2098L24.9928 80.6518L22.203 80.0938L17.7392 81.2098H9.36958L7.13768 82.8837L4.90579 84.5576L3.23187 86.7895Z" fill="#FFE5E5"/>
                                    <path d="M26.1088 36.0139L23.8769 38.2458L23.3189 45.4995V54.4271L21.645 60.5648L19.9711 65.5865L17.1812 68.9344L16.6232 65.5865V54.4271L17.1812 51.0792L18.8551 45.4995L19.9711 41.0357V38.8038M26.1088 36.0139L28.8986 37.6879L31.1305 39.9198L32.8044 44.9415L33.9204 49.4053L33.3624 63.3546L32.8044 72.8402V83.9996L31.1305 82.3257L28.3407 81.2098L24.9928 80.6518L22.203 80.0938L17.7392 81.2098H9.36958L7.13768 82.8837L4.90579 84.5576L3.23187 86.7895L3.78985 77.304L4.90579 65.0285L5.46377 56.659L7.13768 51.0792L9.92755 45.4995L12.7174 41.5937L14.9493 38.2458L17.1812 35.456L18.8551 34.898L19.9711 36.5719V38.8038M26.1088 36.0139L26.6667 33.2241L26.1088 30.9922H23.8769L21.645 33.2241L19.9711 35.456V38.8038" stroke="black"/>
                                </svg>
                            </Button>

                            <Button className={`toothbtn ${activeToothButton === '28' ? 'active' : ''} ${selectedTeeth.includes('28') ? 'selected' : ''} ${extractedTeeth.includes('28') ? 'extracted' : ''}`} onClick={() => handleToothNumber('28')} enabled={extractedTeeth.includes('28')}>
                            {selectedTeeth.includes('28') && <span className="tooth-x">X</span>}
                            <label className="row d-flex justify-content-center">{extractedTeeth.includes('28') && <span className="tooth-x">X</span>}28</label>
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="35" height="106" viewBox="0 0 35 106" fill="none">
                                    <path d="M16.0653 78.6152H20.5291L27.2247 80.8471L31.6885 84.7529L33.9204 88.1008V97.0283L32.2465 99.2602L30.0146 102.05L27.7827 103.724H23.8769L21.645 102.05L20.5291 100.376H18.2972L17.1812 101.492L14.9493 103.166L11.6015 104.84H6.57973L4.90581 103.724L2.11595 101.492L1 98.1443V93.6805L1.55797 90.8906L3.23189 88.1008L5.46379 84.7529L8.81163 81.9631L12.7174 79.7312L16.0653 78.6152Z" fill="white" stroke="black"/>
                                    <path d="M3.78986 86.4277L4.34783 75.8262L5.46378 66.8987L6.57972 60.203L9.92756 52.9493L13.8334 47.9276L17.7392 44.5797L19.4131 45.1377V46.8116V47.9276L21.087 45.1377L23.8769 41.7899L26.1088 39.558L28.3407 39L29.4566 39.558V40.6739L28.7127 44.0218L30.0146 42.9058L32.8045 42.3478L33.9204 44.0218V46.8116L32.8045 50.1595L31.1305 54.0653L30.5726 58.5291V66.8987V74.7103L31.6885 84.7538L28.3407 81.9639L23.8769 79.732L20.5291 78.6161H16.0653L11.6015 80.29L7.1377 83.6379L3.78986 86.4277Z" fill="#FFE5E5"/>
                                    <path d="M19.4131 47.9276V46.8116V45.1377L17.7392 44.5797L13.8334 47.9276L9.92756 52.9493L6.57972 60.203L5.46378 66.8987L4.34783 75.8262L3.78986 86.4277L7.1377 83.6379L11.6015 80.29L16.0653 78.6161H20.5291L23.8769 79.732L28.3407 81.9639L31.6885 84.7538L30.5726 74.7103V66.8987V58.5291L31.1305 54.0653L32.8045 50.1595L33.9204 46.8116V44.0218L32.8045 42.3478L30.0146 42.9058L28.7127 44.0218M19.4131 47.9276V49.0435L17.7392 52.3914L17.1812 55.1812L16.6232 59.087V65.7827L17.7392 70.8045L18.2972 62.9928L19.4131 57.4131L21.087 52.9493L23.3189 49.0435L26.1088 46.2537L28.7127 44.0218M19.4131 47.9276L21.087 45.1377L23.8769 41.7899L26.1088 39.558L28.3407 39L29.4566 39.558V40.6739L28.7127 44.0218" stroke="black"/>
                                </svg>
                            </Button>
                        </div>
                    </div>

                    <div className="row justify-content-md-center mt-2">
                        <div className="col col-lg-auto col-md-auto col-sm-auto col-auto g-0">
                        <Button className={`toothbtn ${activeToothButton === '48' ? 'active' : ''} ${selectedTeeth.includes('48') ? 'selected' : ''} ${extractedTeeth.includes('48') ? 'extracted' : ''}`} onClick={() => handleToothNumber('48')} enabled={extractedTeeth.includes('48')}>
                        {selectedTeeth.includes('48') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="52" height="108" viewBox="0 0 52 108" fill="none">
                                    <path d="M29.0908 2.13695C29.0908 2.13695 30.7344 3.00214 31.8807 3.2529C33.3708 3.57885 34.283 3.5096 35.7865 3.2529C37.145 3.02096 37.8269 2.57276 39.1343 2.13695C40.4418 1.70115 41.115 1.19431 42.4822 1.02101C44.225 0.800084 45.3417 0.862961 46.946 1.57898C48.9158 2.45817 50.0657 3.47599 50.8518 5.48479C51.5664 7.31107 51.0814 8.55892 50.8518 10.5066C50.5609 12.9739 50.2992 14.4272 49.1779 16.6443C48.3318 18.3169 47.8484 19.375 46.388 20.5501C42.9926 23.282 35.2285 20.5501 35.2285 20.5501L33.5546 21.108C33.5546 21.108 32.9966 22.782 29.6488 23.3399C26.301 23.8979 23.0058 24.553 19.0473 23.3399C17.9254 22.9961 17.2657 22.8244 16.2575 22.224C14.6688 21.278 13.9621 20.3963 12.9096 18.8761C12.0776 17.6743 11.2357 15.5283 11.2357 15.5283C11.2357 15.5283 10.3654 11.2984 11.2357 8.83263C11.56 7.9137 11.797 7.40196 12.3516 6.60074C13.0533 5.58727 13.6134 5.12924 14.5835 4.36885C15.2019 3.88419 15.4995 3.45962 16.2575 3.2529C17.587 2.89029 18.2285 4.43049 19.6053 4.36885C21.3603 4.29026 21.8267 2.63604 23.5111 2.13695C25.6003 1.51792 29.0908 2.13695 29.0908 2.13695Z" fill="white" stroke="black"/>
                                    <path d="M14.0256 25.5733L13.4676 19.4355L16.2575 22.2254L19.0473 23.3414H29.6488L35.2286 20.5515H46.946C46.946 20.5515 47.2016 24.984 46.946 27.8051C46.5835 31.8067 45.7199 33.9587 44.7141 37.8487C43.7475 41.5869 43.505 43.8114 41.9242 47.3342C40.6849 50.0961 39.6941 51.5087 38.0184 54.0299C36.0402 57.0063 35.0354 58.828 32.4387 61.2835C29.9354 63.6508 25.743 66.8633 25.743 66.8633C25.743 66.8633 23.647 68.1966 22.3952 67.9792C21.6211 67.8448 21.1504 67.5213 20.7213 66.8633C20.1261 65.9507 20.3767 65.107 20.7213 64.0734C21.0658 63.0398 22.3952 61.8415 22.3952 61.8415L24.6271 57.3777C24.6271 57.3777 26.0021 54.3236 26.859 52.356C27.5215 50.8345 28.5329 49.5661 28.5329 48.4502V42.8704V40.0806C28.5329 38.4066 26.301 44.5443 26.301 44.5443L22.3952 51.24L16.8154 58.4937L11.2357 62.9575C11.2357 62.9575 7.52841 65.0209 5.09802 65.1894C3.57636 65.2948 1.94896 65.3977 1.1922 64.0734C0.759756 63.3166 1.1922 61.8415 1.1922 61.8415L2.86611 60.1676L6.21395 57.3777L9.56179 52.9139L12.3517 47.3342L14.0256 41.7545V33.3849V25.5733Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('48') && <span className="tooth-y">X</span>}48</label>
                        </Button>
                        
                        <Button className={`toothbtn ${activeToothButton === '47' ? 'active' : ''} ${selectedTeeth.includes('47') ? 'selected' : ''} ${extractedTeeth.includes('47') ? 'extracted' : ''}`} onClick={() => handleToothNumber('47')} enabled={extractedTeeth.includes('47')}>
                        {selectedTeeth.includes('47') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="44" height="110" viewBox="0 0 44 110" fill="none">
                                    <path d="M22.9921 6.36955C24.0347 6.68552 24.7392 6.68552 25.7819 6.36955C27.1172 5.96492 27.4547 4.97369 28.5718 4.13766C30.4588 2.72538 31.2982 1.3254 33.5935 0.789823C35.079 0.443226 36.0401 0.34571 37.4994 0.789823C38.7149 1.15977 39.3733 1.58318 40.2892 2.46374C41.8363 3.95106 41.9578 5.41465 42.5211 7.4855C43.4934 11.06 43.0791 14.7401 42.5211 16.971C41.9631 19.202 40.2892 21.4348 40.2892 21.4348C40.2892 21.4348 38.1196 23.5181 36.3834 24.2247C33.5578 25.3746 28.5718 24.2247 28.5718 24.2247C28.5718 24.2247 27.9843 23.4258 27.4558 23.1088C26.3347 22.4361 25.3097 22.5937 24.108 23.1088C22.975 23.5943 21.8761 25.3406 21.8761 25.3406C21.8761 25.3406 16.1758 26.6598 12.9485 25.3406C10.6488 24.4006 9.65247 23.2222 7.92677 21.4348C6.41324 19.8672 5.3303 19.0164 4.57894 16.971C3.6773 14.5166 3.77715 12.7642 4.57894 10.2754C5.11762 8.60321 5.76369 7.78016 6.81083 6.36955C8.09658 4.6375 8.75806 3.3677 10.7166 2.46374C13.0908 1.36798 17.4123 2.46374 17.4123 2.46374L20.2022 4.13766C20.2022 4.13766 21.6568 5.96492 22.9921 6.36955Z" fill="white" stroke="black"/>
                                    <path d="M7.36881 27.5727L5.69489 19.2031C5.69489 19.2031 7.33315 20.9693 8.48476 21.993C10.1134 23.4407 10.9403 24.4952 12.9485 25.3408C16.1618 26.6938 18.9752 27.2748 21.8761 25.3408C22.9017 24.6571 22.975 23.5945 24.108 23.1089C25.3097 22.5939 26.3347 22.4363 27.4558 23.1089C27.9843 23.426 28.0853 23.8465 28.5718 24.2249C30.9798 26.0978 33.5437 25.3395 36.3834 24.2249C39.1123 23.1537 41.9631 19.2031 41.9631 19.2031L39.7313 31.4785L36.3834 48.7757C36.3834 48.7757 34.1515 58.2612 30.8037 65.5149C29.5059 68.3268 27.4558 71.0946 26.8979 71.6526C26.3399 72.2106 25.1326 74.3744 23.55 75.0004C22.3343 75.4814 21.2632 75.7644 20.2022 75.0004C19.5646 74.5414 19.3981 74.0476 19.0862 73.3265C18.3943 71.7265 18.7744 70.5778 19.0862 68.8627C19.3328 67.5068 20.2022 65.5149 20.2022 65.5149L22.4341 60.4931L25.2239 52.6815V48.7757C25.2239 48.7757 24.5456 46.9863 23.55 46.5438C21.5588 45.6588 20.2022 51.0076 20.2022 51.0076L16.2964 58.8192C16.2964 58.8192 13.3953 63.6889 11.2746 66.6308C9.82182 68.6463 9.41085 70.2374 7.36881 71.6526C6.00483 72.5978 4.57894 73.3265 3.463 73.3265C2.34705 73.3265 1.57562 72.6862 1.2311 71.6526C0.673165 69.9787 1.23111 68.8627 1.7891 67.1888C2.03864 66.4402 2.70297 64.6583 3.463 63.283C4.59815 61.2289 5.69489 57.7033 5.69489 57.7033C5.69489 57.7033 7.41764 53.7942 7.92682 51.0076C8.35766 48.6497 8.48476 44.8699 8.48476 44.8699V39.2902C8.48476 39.2902 8.62231 36.2247 8.48476 34.2684C8.29882 31.624 7.36881 27.5727 7.36881 27.5727Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('47') && <span className="tooth-y">X</span>}47</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '46' ? 'active' : ''} ${selectedTeeth.includes('46') ? 'selected' : ''} ${extractedTeeth.includes('46') ? 'extracted' : ''}`} onClick={() => handleToothNumber('46')} enabled={extractedTeeth.includes('46')}>
                            {selectedTeeth.includes('46') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="50" height="111" viewBox="0 0 50 111" fill="none">
                                    <path d="M19.5727 2.90503C21.2744 2.52687 22.3383 2.51125 24.0365 2.90503C25.1796 3.17009 25.751 3.55135 26.8263 4.02097C28.6124 4.80097 29.4412 6.86918 31.2901 6.25286C32.4595 5.86307 32.549 4.77774 33.522 4.02097C35.0604 2.82442 36.0832 2.21187 37.9858 1.78908C39.6875 1.41092 40.7776 1.29595 42.4496 1.78908C44.9663 2.53133 46.115 4.00671 47.4713 6.25286C49.8367 10.1701 48.862 13.6108 47.4713 17.9703C46.0934 22.2901 44.9048 25.5825 40.7757 27.4558C37.4023 28.9863 31.2901 27.4558 31.2901 27.4558L29.6162 26.3399H26.8263L22.3625 29.1298C22.3625 29.1298 14.0896 31.7681 10.0871 29.1298C8.15317 27.8549 7.19009 26.7511 6.18132 24.666C5.30641 22.8575 5.36522 21.6307 5.06537 19.6442C4.41492 15.335 3.94943 11.8326 5.06537 8.48476C5.50659 7.1611 6.5682 6.79163 7.85524 6.25286C9.66426 5.4956 11.01 6.85299 12.877 6.25286C13.8047 5.95466 14.2373 5.57272 15.1089 5.13692C16.8521 4.26531 17.6701 3.32782 19.5727 2.90503Z" fill="white" stroke="black"/>
                                    <path d="M8.41321 38.0574C8.22722 34.3376 7.74364 26.7863 7.29726 26.3399C7.29726 26.3399 10.1923 28.4156 12.319 29.1298C16.0372 30.3784 22.3625 29.1298 22.3625 29.1298C22.3625 29.1298 24.8082 26.731 26.8263 26.3399C27.8959 26.1326 28.5901 25.9735 29.6162 26.3399C30.3561 26.6042 30.5963 27.0873 31.2901 27.4559C33.522 28.6416 36.8698 28.5718 40.7757 27.4559C41.9609 27.1172 43.5655 24.666 43.5655 24.666V44.1951L43.0075 57.5864L40.7757 65.3981L37.4278 71.5358L33.522 77.6735C33.522 77.6735 30.845 79.8704 29.0582 79.3474C28.0126 79.0413 27.4465 78.5693 26.8263 77.6735C25.71 76.0611 26.5256 74.5896 26.8263 72.6517C27.0696 71.0841 27.9423 68.7459 27.9423 68.7459L30.1742 63.7241V57.5864L29.0582 52.5647C29.0582 52.5647 28.6244 51.2806 27.9423 50.8908C27.1855 50.4583 26.1939 50.1655 25.7104 50.8908C24.5944 52.5647 23.4785 55.9125 23.4785 55.9125L19.0147 63.7241L12.319 75.9995L7.29726 81.0213C7.29726 81.0213 4.52836 83.4656 2.83348 82.6952C1.99186 82.3127 1.15956 81.0213 1.15956 81.0213C1.15956 81.0213 0.800554 77.9275 1.15956 75.9995C1.50037 74.1693 2.83348 71.5358 2.83348 71.5358L5.62334 63.7241L7.29726 55.9125L8.41321 47.5429V38.0574Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('46') && <span className="tooth-y">X</span>}46</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '45' ? 'active' : ''} ${selectedTeeth.includes('45') ? 'selected' : ''} ${extractedTeeth.includes('45') ? 'extracted' : ''}`} onClick={() => handleToothNumber('45')} enabled={extractedTeeth.includes('45')}>
                            {selectedTeeth.includes('45') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="27" height="107" viewBox="0 0 27 107" fill="none">
                                    <path d="M11.6015 1H15.5073L19.4131 3.23189L26.1088 9.3696V19.9711L21.645 26.6668L15.5073 31.6885H9.3696L2.67392 24.9928L1 17.7392V9.3696L4.90581 4.90581L11.6015 1Z" fill="white" stroke="black"/>
                                    <path d="M2.67392 31.1306V24.9929C2.67392 24.9929 5.99386 30.0411 9.3696 31.1306C11.858 31.9337 13.5557 31.8651 16.0653 31.1306C20.0607 29.9612 23.8769 23.877 23.8769 23.877L21.645 47.8698L19.9711 65.167L16.0653 76.3264L12.7174 83.5801H9.3696L7.13771 80.7902V72.4206V57.3553L4.34784 42.2901L2.67392 31.1306Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('45') && <span className="tooth-y">X</span>}45</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '44' ? 'active' : ''} ${selectedTeeth.includes('44') ? 'selected' : ''} ${extractedTeeth.includes('44') ? 'extracted' : ''}`} onClick={() => handleToothNumber('44')} enabled={extractedTeeth.includes('44')}>
                            {selectedTeeth.includes('44') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="26" height="108" viewBox="0 0 26 108" fill="none">
                                    <path d="M11.6015 1H14.3914L19.4131 4.90581L24.9928 11.0435V18.2972L21.645 26.1088L15.5073 30.5726H10.4855L7.13771 29.4566L2.11595 23.8769L1 17.1812V11.0435L4.90581 6.57973L11.6015 1Z" fill="white" stroke="black"/>
                                    <path d="M3.7899 33.9191L2.67395 24.4336C2.67395 24.4336 4.83498 28.1975 7.13774 29.4554C8.3472 30.116 9.1342 30.301 10.4856 30.5713C12.6223 30.9986 14.0421 31.3806 16.0653 30.5713C18.8552 29.4554 22.761 24.4336 22.761 24.4336L21.645 37.825L18.8552 52.3323L16.0653 65.1656L12.7175 75.7671L9.36963 81.9048C9.36963 81.9048 7.56259 84.4449 6.02179 84.1367C4.81309 83.895 3.7899 83.5788 3.7899 81.9048V76.8831L4.90584 69.6294V56.2381V43.9627L3.7899 33.9191Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('44') && <span className="tooth-y">X</span>}44</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '43' ? 'active' : ''} ${selectedTeeth.includes('43') ? 'selected' : ''} ${extractedTeeth.includes('43') ? 'extracted' : ''}`} onClick={() => handleToothNumber('43')} enabled={extractedTeeth.includes('43')}>
                            {selectedTeeth.includes('43') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="27" height="108" viewBox="0 0 27 108" fill="none">
                                    <path d="M13.2754 1H16.0653L21.645 5.46379L26.1088 12.1595V20.5291L24.4349 26.6668C24.4349 26.6668 22.8624 31.7054 20.5291 33.9204C19.0382 35.3357 18.0365 36.1271 16.0653 36.7103C13.9758 37.3285 12.575 37.3285 10.4855 36.7103C8.51432 36.1271 7.48594 35.3633 6.02176 33.9204C4.07707 32.004 2.67392 27.7827 2.67392 27.7827L1 21.645V13.2754L6.02176 7.13771L10.4855 2.67392L13.2754 1Z" fill="white" stroke="black"/>
                                    <path d="M4.34788 42.2904L3.23193 29.457L5.46383 33.3628C5.46383 33.3628 7.86041 36.0216 9.92761 36.7107C11.9948 37.3997 13.3955 37.2476 15.5073 36.7107C17.9701 36.0845 19.3979 35.2613 21.0871 33.3628C22.2548 32.0503 23.319 29.457 23.319 29.457C23.319 29.457 23.4312 35.2399 23.319 38.9426C23.1469 44.6222 22.6957 47.7891 22.203 53.4499C21.8044 58.0292 21.7902 60.6248 21.0871 65.1673C20.4399 69.3484 18.8552 75.7688 18.8552 75.7688C18.8552 75.7688 17.1813 83.5804 15.5073 86.9283C13.8334 90.2761 11.6015 93.066 11.6015 93.066L8.25369 95.2979C8.25369 95.2979 4.34788 97.5298 5.46383 95.2979C6.57977 93.066 6.57977 88.0442 6.57977 88.0442V81.3485V65.1673L5.46383 50.102L4.34788 42.2904Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('43') && <span className="tooth-y">X</span>}43</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '42' ? 'active' : ''} ${selectedTeeth.includes('42') ? 'selected' : ''} ${extractedTeeth.includes('42') ? 'extracted' : ''}`} onClick={() => handleToothNumber('42')} enabled={extractedTeeth.includes('42')}>
                            {selectedTeeth.includes('42') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="19" height="108" viewBox="0 0 19 108" fill="none">
                                    <path d="M2.67392 1H17.1812L18.2972 2.11595V17.1812L17.1812 25.5508L13.2754 32.2465H7.69568L3.78987 27.7827L2.11595 23.8769L1 16.0653V3.78987L2.67392 1Z" fill="white" stroke="black"/>
                                    <path d="M4.90585 42.8467L3.23193 26.6655C3.23193 26.6655 5.43579 31.4368 8.25369 32.2452C9.71986 32.6658 10.7026 32.697 12.1595 32.2452C15.5154 31.2045 16.6233 24.4336 16.6233 24.4336L16.0653 32.2452L15.5073 52.3323L14.9494 66.8396L13.2755 76.3251L11.0436 84.6947C11.0436 84.6947 9.41132 86.8923 8.25369 86.3686C7.36583 85.967 7.13775 84.1367 7.13775 84.1367L6.57977 62.3758L6.0218 52.8902L4.90585 42.8467Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('42') && <span className="tooth-y">X</span>}42</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '41' ? 'active' : ''} ${selectedTeeth.includes('41') ? 'selected' : ''} ${extractedTeeth.includes('41') ? 'extracted' : ''}`} onClick={() => handleToothNumber('41')} enabled={extractedTeeth.includes('41')}>
                            {selectedTeeth.includes('41') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="19" height="108" viewBox="0 0 19 108" fill="none">
                                    <path d="M3.78987 1H17.1812L18.2972 3.23189V19.9711L15.5073 27.2247L12.1595 30.5726H7.13771L4.90581 28.3407L2.67392 22.203L1 10.4855V3.23189L3.78987 1Z" fill="white" stroke="black"/>
                                    <path d="M4.90582 38.3842L3.78987 25.5508L4.90582 28.3406C4.90582 28.3406 6.06019 29.9739 7.13771 30.5725C9.04252 31.6308 10.7303 31.4667 12.7174 30.5725C14.9831 29.553 16.6233 25.5508 16.6233 25.5508L16.0653 54.5654L13.8334 70.7466L11.0435 77.4423C11.0435 77.4423 9.30259 80.7927 7.69568 80.2322C6.496 79.8137 6.02176 77.4423 6.02176 77.4423V65.1669V52.8915L4.90582 38.3842Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('41') && <span className="tooth-y">X</span>}41</label>
                            </Button>
                        </div>
                        <div className="col col-lg-auto col-md-auto col-sm-auto col-auto g-0">
                        <Button className={`toothbtn ${activeToothButton === '31' ? 'active' : ''} ${selectedTeeth.includes('31') ? 'selected' : ''} ${extractedTeeth.includes('31') ? 'extracted' : ''}`} onClick={() => handleToothNumber('31')} enabled={extractedTeeth.includes('31')}>
                        {selectedTeeth.includes('31') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="19" height="108" viewBox="0 0 19 108" fill="none">
                                    <path d="M2.67392 1H16.0653L18.2972 2.67392V14.9493L17.1812 20.5291L15.5073 27.2247L12.1595 30.0146H7.69568L4.90581 27.7827L2.67392 24.4349L1.55797 20.5291L1 9.92757V2.67392L2.67392 1Z" fill="white" stroke="black"/>
                                    <path d="M3.23189 43.4059V25.5508L4.90581 27.7827C4.90581 27.7827 6.39801 29.5019 7.69567 30.0146C9.31696 30.6551 10.5409 30.662 12.1595 30.0146C13.8762 29.3279 15.5073 26.6667 15.5073 26.6667V30.0146L14.3914 45.0798L13.2754 56.2393V64.6089V76.3263C13.2754 76.3263 13.1474 78.4829 12.1595 79.1162C11.2422 79.7042 10.3401 79.6114 9.36959 79.1162C8.23781 78.5388 7.69567 76.3263 7.69567 76.3263L5.46378 69.6307L3.78986 57.9132L3.23189 43.4059Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('31') && <span className="tooth-y">X</span>}31</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '32' ? 'active' : ''} ${selectedTeeth.includes('32') ? 'selected' : ''} ${extractedTeeth.includes('32') ? 'extracted' : ''}`} onClick={() => handleToothNumber('32')} enabled={extractedTeeth.includes('32')}>
                            {selectedTeeth.includes('32') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="19" height="108" viewBox="0 0 19 108" fill="none">
                                    <path d="M2.67392 1H15.5073L18.2972 4.34784V16.6232L17.7392 22.203L16.0653 26.6668L13.2754 30.0146L11.0435 32.2465H7.69568L3.78987 27.7827L2.11595 22.203L1 17.1812V2.11595L2.67392 1Z" fill="white" stroke="black"/>
                                    <path d="M3.23193 41.7314V24.9922C3.23193 24.9922 3.71305 27.1168 4.34788 28.34C5.2733 30.1231 5.79784 31.5871 7.69572 32.2458C8.93084 32.6746 9.87417 32.8305 11.0436 32.2458C11.8704 31.8324 12.0938 31.2544 12.7175 30.5719C14.5118 28.6085 16.6233 24.9922 16.6233 24.9922V30.5719L14.3914 46.7531L13.2755 60.1445L12.1595 72.9779V84.1373C12.1595 84.1373 11.9284 85.9609 11.0436 86.3692C9.77672 86.9539 8.25369 84.1373 8.25369 84.1373L6.0218 77.9996L4.34788 69.0721L3.23193 54.5648V41.7314Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('32') && <span className="tooth-y">X</span>}32</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '33' ? 'active' : ''} ${selectedTeeth.includes('33') ? 'selected' : ''} ${extractedTeeth.includes('33') ? 'extracted' : ''}`} onClick={() => handleToothNumber('33')} enabled={extractedTeeth.includes('33')}>
                            {selectedTeeth.includes('33') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="27" height="108" viewBox="0 0 27 108" fill="none">
                                    <path d="M11.0435 1H13.8334L17.1812 2.67392L20.5291 6.57973L26.1088 13.2754V23.3189L22.203 32.2465L17.1812 37.2683H11.0435L7.69568 34.4784L3.23189 27.2247L1 20.5291V12.1595L3.23189 7.69568L7.69568 3.78987L11.0435 1Z" fill="white" stroke="black"/>
                                    <path d="M4.34784 45.6376V28.8984L7.69568 34.4782C7.69568 34.4782 9.48181 36.5917 11.0435 37.268C13.243 38.2206 14.9401 38.1181 17.1812 37.268C19.7744 36.2844 22.203 32.2463 22.203 32.2463L23.8769 28.8984L22.761 39.4999L21.087 54.0072V73.5363V83.5798C21.087 83.5798 22.203 93.6233 22.761 95.2972C23.1744 96.5376 19.4131 95.2972 19.4131 95.2972L14.9493 91.9494L11.0435 84.6958L8.25365 73.5363L6.02176 59.587L4.34784 45.6376Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('33') && <span className="tooth-y">X</span>}33</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '34' ? 'active' : ''} ${selectedTeeth.includes('34') ? 'selected' : ''} ${extractedTeeth.includes('34') ? 'extracted' : ''}`} onClick={() => handleToothNumber('34')} enabled={extractedTeeth.includes('34')}>
                            {selectedTeeth.includes('34') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="26" height="109" viewBox="0 0 26 109" fill="none">
                                    <path d="M11.0435 1H14.3914L19.4131 4.90581L24.9928 10.4855L24.4349 19.9711L21.087 26.1088L17.1812 29.4566H9.92757L6.02176 26.1088L2.67392 21.087L1 16.6233L1.55797 9.92757L6.02176 4.90581L11.0435 1Z" fill="white" stroke="black"/>
                                    <path d="M4.34785 35.0365L3.2319 22.2031C3.2319 22.2031 4.762 24.7209 6.02177 26.1089C7.37193 27.5965 8.09091 28.6428 9.92758 29.4568C12.5174 30.6045 14.5689 30.5523 17.1812 29.4568C19.3173 28.561 20.3117 27.4451 21.645 25.551C22.4864 24.3557 23.3189 22.2031 23.3189 22.2031L21.645 32.8046L20.5291 45.638V60.1453L21.645 70.7468C21.645 70.7468 23.3189 79.1164 21.645 81.9062C20.936 83.088 19.6689 83.1549 18.2972 83.0222C16.1501 82.8144 14.3914 79.1164 14.3914 79.1164L11.6015 71.8627L8.81163 62.3772L6.02177 49.5438L4.34785 35.0365Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('34') && <span className="tooth-y">X</span>}34</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '35' ? 'active' : ''} ${selectedTeeth.includes('35') ? 'selected' : ''} ${extractedTeeth.includes('35') ? 'extracted' : ''}`} onClick={() => handleToothNumber('35')} enabled={extractedTeeth.includes('35')}>
                            {selectedTeeth.includes('35') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="28" height="109" viewBox="0 0 28 109" fill="none">
                                    <path d="M7.69568 3.78987L13.2754 1H16.0653L22.203 4.90581L27.2247 10.4855V16.0653L26.1088 22.203L22.203 28.8987L17.1812 32.2465H12.1595L7.69568 30.0146L4.34784 24.9928L1 18.2972V10.4855L3.23189 7.69568L7.69568 3.78987Z" fill="white" stroke="black"/>
                                    <path d="M4.90586 36.151L3.78992 24.4336C3.78992 24.4336 5.61551 28.3558 7.69573 30.0133C9.22 31.2279 10.263 31.796 12.1595 32.2452C14.0678 32.6972 15.2925 32.7731 17.1813 32.2452C19.1611 31.6919 21.6451 29.4554 21.6451 29.4554L23.319 27.2235L24.9929 24.9916L23.877 37.267L21.6451 50.6583C21.6451 50.6583 20.3966 56.0643 19.9711 59.5859C19.1871 66.0758 19.9711 76.3251 19.9711 76.3251V81.9048C19.9711 81.9048 19.1214 84.5042 17.7392 84.6947C16.4806 84.8682 14.9494 83.0208 14.9494 83.0208L12.1595 78.557L8.81168 69.6294C8.81168 69.6294 7.16787 64.5911 6.57978 61.2598C5.66983 56.1053 6.02181 47.8685 6.02181 47.8685L4.90586 36.151Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('35') && <span className="tooth-y">X</span>}35</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '36' ? 'active' : ''} ${selectedTeeth.includes('36') ? 'selected' : ''} ${extractedTeeth.includes('36') ? 'extracted' : ''}`} onClick={() => handleToothNumber('36')} enabled={extractedTeeth.includes('36')}>
                            {selectedTeeth.includes('36') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="50" height="108" viewBox="0 0 50 108" fill="none">
                                    <path d="M21.087 2.67392L24.4349 1.55797H30.0146L31.6885 2.67392L35.5943 4.90581L38.3842 4.34784L41.732 4.90581L44.5219 8.25365V18.2972L42.29 23.8769L39.5002 27.7827H26.6668L22.203 24.9928H19.4131L18.2972 25.5508H8.81163L4.90581 22.761L2.11595 18.2972L1 14.3914V9.92757L2.11595 6.02176L4.34784 2.67392L7.13771 1H11.6015L14.9493 2.67392L18.2972 4.34784L21.087 2.67392Z" fill="white" stroke="black"/>
                                    <path d="M6.57969 29.458L5.46375 23.3203L8.81158 25.5522H17.7392L19.4131 24.9942H22.2029L26.6667 27.7841H35.0363H39.5001L41.174 24.9942L40.6161 41.1755L41.174 52.3349L42.29 60.1465L45.0798 67.4002L47.8697 74.0959C47.8697 74.0959 49.5446 77.491 48.4277 79.1176C47.6003 80.3226 46.5346 80.6487 45.0798 80.7915C42.4327 81.0515 41.5019 78.6372 39.5001 76.8857C37.2938 74.9553 34.4784 71.306 34.4784 71.306L31.6885 65.7263L27.7827 58.4726L24.4348 52.3349C24.4348 52.3349 23.3189 49.545 22.2029 48.4291C21.7407 47.9669 20.529 48.4291 20.529 48.4291C19.4131 50.103 18.2971 54.5668 18.2971 54.5668V62.3784C18.2971 62.3784 19.632 66.1641 21.087 69.0741L23.3189 73.5379C23.3189 73.5379 23.6322 76.9127 22.2029 78.0017C20.8163 79.0581 17.7392 78.0017 17.7392 78.0017C17.7392 78.0017 14.038 74.8647 12.1594 72.422C10.314 70.0223 8.25361 65.7263 8.25361 65.7263L6.57969 55.6828V41.7334V29.458Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('36') && <span className="tooth-y">X</span>}36</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '37' ? 'active' : ''} ${selectedTeeth.includes('37') ? 'selected' : ''} ${extractedTeeth.includes('37') ? 'extracted' : ''}`} onClick={() => handleToothNumber('37')} enabled={extractedTeeth.includes('37')}>
                            {selectedTeeth.includes('37') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="44" height="108" viewBox="0 0 44 108" fill="none">
                                    <path d="M14.3914 3.23189C15.6933 4.16185 18.4088 6.13335 18.8551 6.57973H20.5291L22.203 4.90581L26.6668 2.67392H32.2465L35.5943 4.90581L38.3842 9.3696V18.2972L35.0364 22.761L31.1306 25.5508H24.4349L21.645 24.9928L18.2972 23.8769L16.0653 24.9928H9.92757L6.02176 23.8769L2.67392 19.9711L1 16.0653V9.3696L1.55797 6.02176L3.78987 3.23189L6.02176 1H11.0435L14.3914 3.23189Z" fill="white" stroke="black"/>
                                    <path d="M3.78992 27.2251V21.0874L6.02181 23.8772L9.92762 24.9932H16.0653L18.2972 23.8772L24.4349 25.5511H31.1306L35.0364 22.7613L38.3843 18.8555L36.7103 30.0149L35.5944 36.1526L36.1524 49.544L37.2683 54.0078L39.5002 59.5875L42.2901 66.2832L42.848 71.8629L41.7321 73.5368H38.9422L36.7103 71.8629L32.2465 65.7252L28.3407 59.0295L24.9929 53.4498L22.761 50.102L21.6451 47.3121L19.9711 46.1962V50.6599L21.0871 57.9136L23.319 64.6093L25.5509 69.631V74.0948L22.761 75.2108L18.8552 72.4209L14.9494 67.9571L12.1595 61.8194L9.92762 55.6817L7.69573 47.3121L5.46384 38.3845L4.34789 32.2468L3.78992 27.2251Z" fill="#FFE5E5" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('37') && <span className="tooth-y">X</span>}37</label>
                            </Button>
                            <Button className={`toothbtn ${activeToothButton === '38' ? 'active' : ''} ${selectedTeeth.includes('38') ? 'selected' : ''} ${extractedTeeth.includes('38') ? 'extracted' : ''}`} onClick={() => handleToothNumber('38')} enabled={extractedTeeth.includes('38')}>
                            {selectedTeeth.includes('38') && <span className="tooth-y">X</span>}
                                <svg className="row d-flex justify-content-center" xmlns="http://www.w3.org/2000/svg" width="51" height="110" viewBox="0 0 51 110" fill="none">
                                    <path d="M9.36954 19.9707H15.5072L18.2971 21.0866L21.6449 22.7606H30.0145L33.9204 22.2026L37.2682 19.9707V24.9925V35.036V42.2896L39.5001 47.8694L41.732 52.8911L45.6378 56.7969L48.9856 60.1448L50.1016 61.8187L49.5436 63.4926L43.4059 64.0506L40.0581 62.3767L33.9204 57.3549L29.4566 51.7752L25.5508 46.1954L22.2029 40.0577V44.5215L23.8768 50.6592L26.6667 57.3549L30.0145 61.8187L31.1305 65.7245L29.4566 66.8405L26.6667 66.2825L20.529 62.3767L15.5072 57.3549L11.0435 50.6592L7.13764 42.2896L4.90575 33.92L4.34778 27.2244V19.9707H9.36954Z" fill="#FFE5E5" stroke="black"/>
                                    <path d="M2.67392 16.0653L4.34784 19.9711H15.5073L21.645 22.761H30.5726L33.9204 22.203L36.7103 20.5291L38.3842 18.2972L39.5001 14.9493V8.25365L38.9422 6.02176L37.2683 3.78987L35.5943 3.23189L32.8045 3.78987L30.5726 3.23189L27.7827 1.55797H22.203L19.9711 2.67392L17.1812 3.23189L14.3914 2.11595L11.0435 1H4.90581L2.67392 2.67392L1 4.90581V11.6015L2.67392 16.0653Z" fill="white" stroke="black"/>
                                </svg>
                                <label className="row d-flex justify-content-center">{extractedTeeth.includes('38') && <span className="tooth-y">X</span>}38</label>
                            </Button>
                        </div>
                    </div>



                </div>

            </div>


            <div className="addtreatmentform">
                <div className='treatmentdetails row'>
                    <div className="col-lg-6 col-md-12 mb-3">
                        <label className="txtbox-lbl mb-2">Treatment<span className="required">*</span></label>
                        <Dropdown>
                            <Dropdown.Toggle className="dropdown-custom" variant="dropdown-custom">
                                {selectedTreatment ? selectedTreatment : 'Select Treatment'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-custom">
                                <Dropdown.Item onClick={() => handleTreatmentChange({ target: { value: 'Oral Surgery' } })}>
                                    Oral Surgery
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleTreatmentChange({ target: { value: 'Periodontics' } })}>
                                    Periodontics
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleTreatmentChange({ target: { value: 'Restorative Dentistry' } })}>
                                    Restorative Dentistry
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleTreatmentChange({ target: { value: 'Prosthodontics' } })}>
                                    Prosthodontics
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleTreatmentChange({ target: { value: 'Others' } })}>
                                    Others
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className="col-lg-6 col-md-12 mb-3">
                        <label className="txtbox-lbl mb-2">Treatment Type<span className="required">*</span></label>
                        <Dropdown>
                            <Dropdown.Toggle className="dropdown-custom" variant="dropdown-custom">
                                {selectedTreatmentType ? `${selectedTreatmentType}` : 'Select Type'}
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="dropdown-custom">
                                {treatmentTypes.map((type, index) => (
                                    <Dropdown.Item key={index} onClick={() => handleTreatmentTypeChange(type)}>
                                        {type}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Date</Form.Label>
                        <Form.Control type="date" value={treatmentDate} onChange={(e) => setTreatmentDate(e.target.value)} name="treatment_date" disabled/>
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Next Visit</Form.Label>
                        <Form.Control type="date" value={nextVisitDate} onChange={(e) => setNextVisitDate(e.target.value)} name="treatment_nextvisit" />
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Dentist</Form.Label>
                        <Form.Control type="text" placeholder={fullName} value={fullName} name="treatment_dentist" disabled/>
                    </Form.Group>
                    <Form.Group className="col-lg-6 col-md-12 mb-3" controlId="formBasicName">
                        <Form.Label className="txtbox-lbl">Description</Form.Label>
                        <Form.Control type="text" placeholder="Enter notes" value={treatmentDescription} name="treatment_description" onChange={(e) => setTreatmentDescription(e.target.value)}/>
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
                    The treatment has been successfully added.
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
        </>
    )
}


export default Addtreatment;

import React, { useEffect, useState } from "react";

import { useAuth } from "../../../settings/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../../settings/supabase";
import { Button, Form, Table, Modal, Alert} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown"
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";
import Pagination from 'react-bootstrap/Pagination';

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { Avatar } from "@files-ui/react";
import userImage from '../../../img/user.png';





const Treatments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { patient_id } = useParams();
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
    const [imageSource, setImageSource] = useState(userImage);
    const [showGuardianForm, setShowGuardianForm] = useState(false);
    const [treatments, setTreatments] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
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
    
                if (data.patient_age < 18) {
                    setShowGuardianForm(true);
                } else {
                    setShowGuardianForm(false);
                }
    
            } catch (error) {
                console.error('Error fetching patient details:', error.message);
            }
        };
        
        const checkAndSendEmails = async () => {
            await sendEmailsForNextVisit();
        };

        const fetchTreatmentDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('patient_Treatments')
                    .select('*')
                    .eq('patient_id', parseInt(patient_id));

                if (error) {
                    throw error;
                }

                const sortedData = (data || []).sort((a, b) => new Date(b.treatment_date) - new Date(a.treatment_date));

                setTreatments(sortedData || []);

            } catch (error) {
                console.error('Error fetching treatment details:', error.message);
            }
        }

    
        fetchPatientDetails();
        fetchTreatmentDetails();
        checkAndSendEmails();

       
        // Schedule automatic email sending
        const intervalId = setInterval(checkAndSendEmails, 24 * 60 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [patient_id]);

    const emailjs = require('emailjs-com');


    const sendEmailsForNextVisit = async () => {
        try {
            const { data: patientData, error: patientError } = await supabase
                .from('patient')
                .select('patient_fname, patient_email')
                .eq('patient_id', parseInt(patient_id))
                .single();

            if (patientError) throw patientError;

            const { data: treatmentsData, error } = await supabase
                .from('patient_Treatments')
                .select('*')
                .eq('patient_id', parseInt(patient_id));

            if (error) throw error;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

            const dueTreatments = treatmentsData.filter(treatment => 
                treatment.treatment_nextvisit === tomorrowFormatted
            );

            for (const treatment of dueTreatments) {
                const templateParams = {
                    from_name: 'dentalsolutionsample@gmail.com',
                    send_to: patientData.patient_email,
                    to_name: patientData.patient_fname,
                    nextVisit: treatment.treatment_nextvisit,
                    pastTreatment: treatment.treatment,
                    pastTreatmentType: treatment.treatment_type,
                    pastDentist: treatment.treatment_dentist
                };

                const result = await emailjs.send(
                    'service_a3rqcog', 
                    'template_2nqf2rb', 
                    templateParams, 
                    'b3gcupxddmxFGzL4v'
                );
                console.log('Email sent successfully:', result);
            }

        } catch (error) {
            console.error('Error sending emails for next visit:', error);
        }
    };

    const handleExport = (eventKey) => {
        if (eventKey === 'pdf') {
            exportToPDF();
        } else if (eventKey === 'excel') {
            exportToExcel();
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const companyName = "Dental Solutions, Inc."; // Replace with your actual company name
        
        // Set font size, style, and color for the company name
        doc.setFontSize(16); // Larger font size for the company name
        doc.setFont("helvetica", "bold"); // Set font to Helvetica and style to bold
        doc.setTextColor(51, 153, 255); // Blue color for the company name
        
        // Add the company name with enhanced styling
        const companyNameWidth = doc.getStringUnitWidth(companyName) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const pageWidth = doc.internal.pageSize.width;
        const startX = (pageWidth - companyNameWidth) / 2;
        doc.text(companyName, startX, 20); // Adjust the Y coordinate (20) and alignment as needed
        
        // Reset font settings for the table
        doc.setFontSize(12); // Reset font size for the table content
        doc.setFont("helvetica", "normal"); // Reset font style to normal
        doc.setTextColor(0); // Reset text color to black
        
        // Move cursor down for the table
        doc.autoTable({
            head: [['Date', 'Procedure', 'Next Visit', 'Dental/Assistant']],
            body: treatments.map(t => [
                t.treatment_date,
                t.treatment_toothnum,
                t.treatment,
                t.treatment_type,
                t.treatment_nextvisit,
                t.treatment_dentist
            ]),
            startY: 30 // Adjust startY to leave space after the company name
        });
    
        // Save the PDF with the specified title
        doc.save('treatment-list.pdf');
    };
    

    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
    
        // Add company name as the first row
        const companyName = "Dental Solutions, Inc.";
        const companyRow = [["", companyName]];
    
        // Create the data for the worksheet, including the company name
        const wsData = [
            ...companyRow,
            ["Date", "Tooth No.", "Treatment", "Type", "Next Visit", "Dental/Assistant"],
            ...treatments.map(t => [
                t.treatment_date,
                t.treatment_toothnum,
                t.treatment,
                t.treatment_type,
                t.treatment_nextvisit,
                t.treatment_dentist
            ])
        ];
    
        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
        // Set column widths
        const columnWidths = [
            {wch: 15},  // Date
            {wch: 10},  // Tooth No.
            {wch: 30},  // Treatment
            {wch: 15},  // Type
            {wch: 15},  // Next Visit
            {wch: 25}   // Dental/Assistant
        ];
        worksheet['!cols'] = columnWidths;
    
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Treatments');
    
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        
        // Save the file
        saveAs(data, 'treatment-list.xlsx');
    };

    const handleAddProcedure = () => {
        navigate(`/patientrecord/${patient_id}/addtreatment`);
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


    const patient_fname = capitalizeFirstLetter(patient.patient_fname || '');
    const patient_mname = capitalizeFirstLetter(patient.patient_mname || '');
    const patient_lname = capitalizeFirstLetter(patient.patient_lname || '');

    const patient_branch = capitalizeAllLetters(patient.patient_branch || 'Branch not provided');

    const handleView = (patient_id, treatment_id) => {
        navigate(`/patientrecord/${patient_id}/viewtreatment/${treatment_id}`);
    };

    const handleEdit = (patient_id, treatment_id) => {
        navigate(`/patientrecord/${patient_id}/edittreatment/${treatment_id}`);
    };

    const handleDelete = async (treatment_id) => {
        try {
            // Get the filenames from the database
            const { data: treatmentData, error: treatmentError } = await supabase
                .from('treatment_files')
                .select('treatment_filename')
                .eq('treatment_id', treatment_id);

            if (treatmentError) {
                console.error('Error getting treatment data:', treatmentError);
                return;
            }

            // List all files in the folder
            const { data: filesdata, error: filesdataerror } = await supabase
                .storage
                .from('treatment_fileupload')
                .list(`public/${patient_id}/${treatment_id}`);

            if (filesdataerror) {
                console.error('Error listing files:', error);
                return;
            }

            const fileNames = treatmentData.map(treatment => treatment.treatment_filename);
            const filePaths = fileNames.map(fileName => `public/${patient_id}/${treatment_id}/${fileName}`);


            // Delete each file
            const { error: deleteError } = await supabase
                .storage
                .from('treatment_fileupload')
                .remove(filePaths);

            if (deleteError) {
                console.error('Error deleting files:', deleteError);
            } else {
                console.log('Files deleted successfully');
            }


            const { data, error } = await supabase
                .from('patient_Treatments')
                .delete()
                .eq('treatment_id', treatment_id);

            if (error) {
                throw error;
            }

            // Show success message
            setTreatments(treatments.filter(item => item.treatment_id !== treatment_id));
            setShowModal(false);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        } catch (error) {
            console.error('Error deleting treatment:', error.message);
        }
    }

    const handleDeleteClick = (treatment_id) => {
        setDeleteId(treatment_id);
        setShowModal(true);
    };

    {/*PAGINATION */}
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTreatments = treatments.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(Math.ceil(treatments.length / itemsPerPage));

    return (
        <>
            <div className="personalinfo-container row">
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

            <div className="treatmentsection">
                <div className="treatment-header row">
                    <div className="col-lg-8">
                        <h3 className="col">TREATMENTS</h3>
                    </div>
                        <div className="col-lg-4 d-flex justify-content-end">
                            <Dropdown className="dropdown-btn-blue" onSelect={handleExport}>
                                <Dropdown.Toggle className="exportbtn border-0" id="dropdown-basic">
                                    Export
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey="pdf">Export to PDF</Dropdown.Item>
                                    <Dropdown.Item eventKey="excel">Export to Excel</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <button className="addprocedurebtn btn" type="button" onClick={handleAddProcedure}>Add Treatments</button>
                        </div>
                    
                </div>


                <div className="ortho-table">
                    <Table>
                        <thead className="custom-table-head">
                            <tr className="custom-table-tr">
                                <th>Date</th>
                                <th className="text-center">Tooth No.</th>
                                <th>Treatment</th>
                                <th>Type</th>
                                <th>Next Visit</th>
                                <th>Dentist/Assistant</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="custom-table-body">
                        {currentTreatments.length > 0 ? (
                        currentTreatments.map((t) => (
                                <tr className="ortho-table-tr" key={t.treatment_id}>
                                    <td className="custom-table-contents align-content-center">{t.treatment_date}</td>
                                    <td className="custom-table-contents align-content-center text-center">{t.treatment_toothnum}</td>
                                    <td className="custom-table-contents align-content-center">{t.treatment}</td>
                                    <td className="custom-table-contents align-content-center">{t.treatment_type}</td>
                                    <td className="custom-table-contents align-content-center">{t.treatment_nextvisit}</td>
                                    <td className="custom-table-contents align-content-center">{t.treatment_dentist}</td>
                                    <td className="custom-td text-center align-content-center">
                                        <Button className="custom-actions" onClick={() => handleView(patient_id, t.treatment_id)}>
                                            <FaEye />
                                        </Button>
                                        <Button className="custom-actions" onClick={() => handleEdit(patient_id, t.treatment_id)}>
                                            <FaEdit />
                                        </Button>
                                        <Button className="custom-actions" onClick={() => handleDeleteClick(t.treatment_id)}>
                                            <FaTrash />
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
                    <Pagination className="pagination">
                        <Pagination.First onClick={goToFirstPage} disabled={currentPage === 1} className="pagination-item"/>
                {/* <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} /> */}
                    {Array.from({ length: Math.ceil(treatments.length / itemsPerPage) }).map((_, index) => (
                    <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </Pagination.Item>
                ))}
                {/* <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={indexOfLastItem >= treatments.length} /> */}
                <Pagination.Last onClick={goToLastPage} disabled={currentPage === Math.ceil(treatments.length / itemsPerPage)} />
            </Pagination>
                </div>
            </div>

            <Modal show={showSuccessMessage} onHide={() => setShowSuccessMessage(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Deleted Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    The treatment has been successfully deleted.
                </Modal.Body>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    Are you sure you want to delete this treatment? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="custom-footer-center">
                    <Button className="custom-modal-cancelbtn" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button className="custom-modal-deletebtn" onClick={() => handleDelete(deleteId)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}


export default Treatments;
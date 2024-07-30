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



const Orthodontics = () => {
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
        guardian_number: '',
        ortho_status:''
    });

    const [orthodontics, setOrthodontics] = useState([]);

    const [showWomanForm, setShowWomanForm] = useState(false);
    const [showGuardianForm, setShowGuardianForm] = useState(false);

    const [imageSource, setImageSource] = useState(userImage);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);


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
            }
        };

        const fetchOrthoDetails = async () => {
            try {
                // Fetch orthodontics data from Supabase
                const { data, error } = await supabase
                    .from('patient_Orthodontics')
                    .select('*')
                    .eq('patient_id', parseInt(patient_id));
    
                if (error) {
                    throw error;
                }
    
                // Sort data by date in descending order
                const sortedData = (data || []).sort((a, b) => new Date(a.ortho_date) - new Date(b.ortho_date));
                setOrthodontics(sortedData);

                // setOrthodontics(data || []); // Ensure data is an array or set to empty array if null
            } catch (error) {
                console.error('Error fetching orthodontics details:', error.message);
            }
        }
    
        fetchPatientDetails();
        fetchOrthoDetails();
    
    }, [patient_id, orthodontics.orthodontics_id]);

    const handleDelete = async (orthodontics_id) => {
        try {
            // Get the filenames from the database
            const { data: orthoData, error: orthoError } = await supabase
                .from('ortho_files')
                .select('ortho_filename')
                .eq('orthodontics_id', orthodontics_id);
            
            if (orthoError) {
                console.error('Error getting orthodontics data:', orthoError);
                return;
            }

            // List all files in the folder
            const { data: filesdata, error: filesdataerror } = await supabase
                .storage
                .from('ortho_fileupload')
                .list(`public/${patient_id}/${orthodontics_id}`);

            if (filesdataerror) {
                console.error('Error listing files:', error);
                return;
            }

            const fileNames = orthoData.map(orthodontics => orthodontics.ortho_filename);
            const filePaths = fileNames.map(fileName => `public/${patient_id}/${orthodontics_id}/${fileName}`);

            // Delete each file
            const { error: deleteError } = await supabase
                .storage
                .from('ortho_fileupload')
                .remove(filePaths);

            if (deleteError) {
                console.error('Error deleting files:', deleteError);
            } else {
                console.log('Files deleted successfully');
            }

            const { data, error } = await supabase
                .from('patient_Orthodontics')
                .delete()
                .eq('orthodontics_id', orthodontics_id);
            

            if (error) {
                throw error;
            }

            // Update the state to remove the deleted entry
            setOrthodontics(orthodontics.filter(item => item.orthodontics_id !== orthodontics_id));
            setShowModal(false);
            setShowSuccessMessage(true); // Show success message
            setTimeout(() => setShowSuccessMessage(false), 3000);
        } catch (error) {
            console.error('Error deleting orthodontics entry:', error.message);
        }
    };

    const handleDeleteClick = (orthodontics_id) => {
        setDeleteId(orthodontics_id);
        setShowModal(true);
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

    const handleAddProcedure = () => {
        navigate(`/patientrecord/${patient_id}/addprocedure`);
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
            body: orthodontics.map(ortho => [
                ortho.ortho_date,
                ortho.ortho_procedure,
                ortho.ortho_nextvisit,
                ortho.ortho_dentist
            ]),
            startY: 30 // Adjust startY to leave space after the company name
        });
    
        // Save the PDF with the specified title
        doc.save('orthodontics-list.pdf');
    };

    const exportToExcel = () => {
        const companyName = "Dental Solutions, Inc."; // Replace with your actual company name
        
        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
    
        // Add company name as the first row
        XLSX.utils.sheet_add_aoa(worksheet, [[companyName]], { origin: "A1" });
    
        // Prepare data without orthodontics_id and patient_id
        const exportData = orthodontics.map(({ ortho_date, ortho_procedure, ortho_nextvisit, ortho_dentist }) => ({
            Date: ortho_date,
            Procedure: ortho_procedure,
            "Next Visit": ortho_nextvisit,
            "Dental/Assistant": ortho_dentist
        }));
    
        // Add data starting from the second row
        XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A2", skipHeader: false });
    
        // Adjust column widths
        const columnWidths = [
            { wch: 15 },  // Date
            { wch: 30 },  // Procedure
            { wch: 15 },  // Next Visit
            { wch: 20 }   // Dental/Assistant
        ];
        worksheet["!cols"] = columnWidths;
    
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orthodontics');
    
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, 'orthodontics.xlsx');
    };

    const handleView = (patient_id, orthodontics_id) => {
        navigate(`/patientrecord/${patient_id}/viewprocedure/${orthodontics_id}`);
    };

    const handleEdit = (patient_id, orthodontics_id) => {
        navigate(`/patientrecord/${patient_id}/editprocedure/${orthodontics_id}`);
    };

    const handleChangeSource = (selectedFile) => {
        setImageSource(selectedFile);
    };

    const getStatusClassName = () => {
        if (!patient.ortho_status || patient.ortho_status.trim() === '') {
            return 'no-history';
        } else if (patient.ortho_status === 'ON GOING') {
            return 'on-going';
        } else if (patient.ortho_status === 'COMPLETED') {
            return 'completed';
        } else {
            return ''; // Default class
        }
    };

    const handleUpdateOrthoStatus = () => {
        if (patient.ortho_status === 'ON GOING') {
            setSelectedStatus('COMPLETED');
            setShowStatusModal(true);
        } else {
            setSelectedStatus('ON GOING');
            updatePatientStatus('ON GOING');
        }
    };

    const handleConfirmUpdate = async () => {
        try {
            await updatePatientStatus(selectedStatus);
            setShowStatusModal(false);
            setIsConfirmed(false);
        } catch (error) {
            console.error('Error updating patient status:', error);
        }
    };

    const handleCloseModal = () => setShowStatusModal(false);

    const updatePatientStatus = async (newStatus) => {
        setPatient((prevPatient) => ({
            ...prevPatient,
            ortho_status: newStatus,
        }));

        try {
            const { data, error } = await supabase
                .from('patient') 
                .update({
                    ortho_status: newStatus,
                  })
                .eq('patient_id', patient.patient_id); 

            if (error) {
                throw error;
            }

            console.log('Status updated successfully:', data);
            return { ok: true, data };
        } catch (error) {
            console.error('Error updating status:', error);
            return { ok: false, error };
        }
    };


    
{/*PAGINATION */}
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrthodontics = orthodontics.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(Math.ceil(orthodontics.length / itemsPerPage));

    useEffect(() => {
        if (currentOrthodontics.length > 0 && patient.ortho_status !== 'COMPLETED') {
            if (patient.ortho_status !== 'ON GOING') {
                setSelectedStatus('ON GOING');
                updatePatientStatus('ON GOING');
            }
        }
    }, [currentOrthodontics, patient.ortho_status]);

    return (
        <>
            <div className="personalinfo-container">

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
                    <div className="col-lg-8 d-flex justify-content-start align-items-center ">
                        <h3>ORTHODONTICS</h3> 
                        {!(!patient.ortho_status || patient.ortho_status.trim() === '') && (
                <Button 
                    onClick={handleUpdateOrthoStatus} 
                    className={`custom-button ${getStatusClassName()}`}
                    disabled={patient.ortho_status === 'COMPLETED'}
                >
                    {patient.ortho_status}
                </Button>
            )}

             {/* Confirmation Modal */}
             <Modal show={showStatusModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Confirm Status Update</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">Are you sure you want to mark these Orthodontics Procedures as completed?</Modal.Body>
                <Modal.Footer>
                    <Button className="custom-modal-cancelbtn" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button className="custom-modal-confirmbtn" onClick={handleConfirmUpdate}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal> 
                            </div>
                        <div className="col-lg-4 d-flex justify-content-end">
                            <Dropdown onSelect={handleExport}>
                                <Dropdown.Toggle className="exportbtn border-0" id="dropdown-basic">
                                    Export
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey="pdf">Export to PDF</Dropdown.Item>
                                    <Dropdown.Item eventKey="excel">Export to Excel</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <button className="addprocedurebtn btn" type="button" onClick={handleAddProcedure}>Add Procedure</button>
                        </div>
                    
                </div>

                <div className="ortho-table">
                    <Table>
                        <thead className="custom-table-head">
                            <tr className="custom-table-tr">
                                <th>Date</th>
                                <th>Procedure</th>
                                <th>Next Visit</th>
                                <th>Dental/Assistant</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="custom-table-body">
                        {currentOrthodontics.length > 0 ? (
                        currentOrthodontics.map((ortho) => (
                                <tr className="ortho-table-tr" key={ortho.orthodontics_id}>
                                    <td className="custom-table-contents align-content-center">{ortho.ortho_date}</td>
                                    <td className="custom-table-contents align-content-center">{ortho.ortho_procedure}</td>
                                    <td className="custom-table-contents align-content-center">{ortho.ortho_nextvisit}</td>
                                    <td className="custom-table-contents align-content-center">{ortho.ortho_dentist}</td>
                                    <td className="custom-td text-center align-content-center">
                                        <Button className="custom-actions" onClick={() => handleView(patient_id, ortho.orthodontics_id)}>
                                            <FaEye />
                                        </Button>
                                        <Button className="custom-actions" onClick={() => handleEdit(patient_id, ortho.orthodontics_id)}>
                                            <FaEdit />
                                        </Button>
                                        <Button className="custom-actions" onClick={() => handleDeleteClick(ortho.orthodontics_id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                                ))
                        ) :  (
                            <tr>
                                <td colSpan="6" className="no-records-message-container text-center">
                                    <div className="no-records-message">
                                        No orthodontic records available
                                    </div>
                                </td>
                            </tr>
                        )}
                            
                        </tbody>
                    </Table>
                    <Pagination className="pagination">
                        <Pagination.First onClick={goToFirstPage} disabled={currentPage === 1} className="pagination-item"/>
                {/* <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} /> */}
                    {Array.from({ length: Math.ceil(orthodontics.length / itemsPerPage) }).map((_, index) => (
                    <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </Pagination.Item>
                ))}
                {/* <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={indexOfLastItem >= treatments.length} /> */}
                <Pagination.Last onClick={goToLastPage} disabled={currentPage === Math.ceil(orthodontics.length / itemsPerPage)} />
            </Pagination>
                </div>
            </div>


            <Modal show={showSuccessMessage} onHide={() => setShowSuccessMessage(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Deleted Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    The procedure has been successfully deleted.
                </Modal.Body>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="custom-modal-title">Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    Are you sure you want to delete this procedure? This action cannot be undone.
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
    );
};

export default Orthodontics;
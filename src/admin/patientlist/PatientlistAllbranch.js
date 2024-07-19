import React, { useState, useEffect } from "react";
import './PatientlistAllbranch.css'
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useAuth } from './../../settings/AuthContext';
import supabase from "../../settings/supabase";
import { useNavigate } from "react-router-dom";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Bootstrap components
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';


const PatientlistAllbranch = () => {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('allPatients');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAllPatients, setFilteredAllPatients] = useState([]);

    const [profileDetails, setProfileDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dentistBranch, setDentistBranch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage] = useState(7);


    const handleTabClick = (tab) => {
        setActiveTab(tab);
      };
    
      const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;

    const currentAllPatients = filteredAllPatients.slice(indexOfFirstPatient, indexOfLastPatient);
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(filteredAllPatients.length / patientsPerPage);

    useEffect(() => {
        const fetchProfileDetails = async () => {
            try {
                setLoading(true);
                setError('');

                if (!user || !user.user_id) {
                    throw new Error('User is not logged in or user ID is undefined');
                }

                const userId = user.user_id;

                // Fetch user details
                const { data: userData, error: userError } = await supabase
                    .from('user')
                    .select('role')
                    .eq('user_id', userId)
                    .single();

                if (userError) {
                    throw userError;
                }

                if (!userData) {
                    throw new Error('User data not found');
                }

                setUserDetails(userData);
                
                const tableName = userData.role === 'dentist' ? 'dentist' : 'assistant';

                const { data: profileData, error: profileError } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (profileError) {
                    throw profileError;
                }

                if (!profileData) {
                    throw new Error('Profile data not found');
                }

                setProfileDetails(profileData);

                // Fetch branch if user is a dentist
                if (userData.role === 'dentist' && profileData.branch) {
                    setDentistBranch(profileData.branch.toUpperCase());
                } else {
                    setDentistBranch('Branch not provided');
                }
                
            } catch (error) {
                console.error('Error fetching profile details:', error.message);
                setError('Failed to fetch profile details');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileDetails();
    }, [user]);

    const capitalizeAllLetters = (string) => {
        return string.toUpperCase();
    };
    const branch = profileDetails?.branch ? capitalizeAllLetters(profileDetails.branch) : 'Branch not provided';

    console.log('Profile Details:', profileDetails);
    console.log('User Details:', userDetails);
    
    useEffect(() => {
        async function fetchPatients() {
          const { data, error } = await supabase
            .from('patient')
            .select('*');
    
          if (error) {
            console.error('Error fetching patients:', error);
          } else {
            setPatients(data);
            setFilteredAllPatients(data);
          }
        }
    
        fetchPatients();
    }, []);

    const handleSelect = (eventKey) => {
        console.log('Navigating to:', eventKey);
        navigate(eventKey);
    };
    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value.trim() === '') {
            setFilteredAllPatients(patients);
        }
      };

    const handleSearch = (event) => {
        event.preventDefault();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = patients.filter(patient =>
            `${patient.patient_fname} ${patient.patient_lname}`.toLowerCase().includes(searchTerm.toLowerCase()) 
        );
        setFilteredAllPatients(filtered);
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
        let tableData = [];
        let title = '';
    
        switch (activeTab) {
            case 'allPatients':
                tableData = filteredAllPatients; 
                title = 'All Patients - All BRANCH';
                break;
            default:
                tableData = [];
                title = 'Patients';
        }
    
        if (tableData.length === 0) {
            console.error("No data to export.");
            return;
        }
    
        const companyName = "Dental Solutions, Inc."; // Replace with your actual company name
        
        // Set font size, style, and color for the company name in the header
        doc.setFontSize(16); // Larger font size for the company name
        doc.setFont("helvetica", "bold"); // Set font to Helvetica and style to bold
        doc.setTextColor(51, 153, 255); // Blue color for the company name
        
        // Calculate positioning for centering the company name
        const companyNameWidth = doc.getStringUnitWidth(companyName) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const pageWidth = doc.internal.pageSize.width;
        const startX = (pageWidth - companyNameWidth) / 2;
        
        // Add the company name in the header
        doc.text(companyName, startX, 10); // Adjust the Y coordinate (10) and alignment as needed
    
        // Reset font settings for the table
        doc.setFontSize(12); // Reset font size for the table content
        doc.setFont("helvetica", "normal"); // Reset font style to normal
        doc.setTextColor(0); // Reset text color to black
    
        // Generate the table
        doc.autoTable({
            head: [['Name', 'Age', 'Gender', 'Contact', 'Email', 'Branch']],
            body: tableData.map(patient => [
                `${patient.patient_fname} ${patient.patient_lname}`,
                patient.patient_age,
                patient.patient_gender,
                patient.patient_contact,
                patient.patient_email,
                patient.patient_branch,
            ]),
            startY: 20 // Adjust startY to leave space after the company name
        });
    
        // Save the PDF with the specified title
        doc.save(`${title}.pdf`);
    };
    

    const exportToExcel = () => {
        let tableData = [];
        let sheetName = '';
    
        switch (activeTab) {
            case 'allPatients':
                tableData = filteredAllPatients;
                sheetName = 'All Patients - All BRANCH';
                break;
            default:
                console.error("Invalid active tab.");
                return;
        }
    
        if (tableData.length === 0) {
            console.error("No data to export.");
            return;
        }
    
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet([]);
    
        // Add company name to cell A1
        const companyName = "Dental Solutions, Inc."; // Replace with your actual company name
        const companyNameCell = { v: companyName, t: 's' }; // 's' means string type
        const companyNameCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 }); // A1 cell position
        worksheet[companyNameCellRef] = companyNameCell;
    
        // Shift data down starting from A3
        const dataRows = tableData.map(patient => ({
            'Name': `${patient.patient_fname} ${patient.patient_lname}`,
            'Age': patient.patient_age,
            'Gender': patient.patient_gender,
            'Contact Number': patient.patient_contact,
            'Email': patient.patient_email,
            'Branch': patient.patient_branch,
        }));
        XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: "A3", skipHeader: false });
    
        // Create workbook and append worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
        // Convert workbook to Excel buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
        // Convert Excel buffer to Blob
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
        // Save Blob as Excel file
        saveAs(data, `${sheetName}.xlsx`);
    };
    
    return (
            <div className="patientlist-allbranch-box container-fluid">
            <Col>
         <div className="patientlist-header d-flex align-items-center">
         <h1> PATIENT LIST </h1>  
         <Dropdown onSelect={handleSelect}>
                        <Dropdown.Toggle className="dropdownbranch">
                            ALL BRANCH                    
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdownbutton-menu">
                            <Dropdown.Item eventKey="/patientlist" className="dropdownbutton-item">
                            {dentistBranch} BRANCH
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                             </div> 
            </Col>
            <div className="patientlist-container">  
     <Nav variant="tabs" className="navbar-patientlist-tabs mb-3">
        <Nav.Item>
          <Nav.Link
            eventKey="allPatients"
            onClick={() => handleTabClick('allPatients')}
            className={activeTab === 'allPatients' ? 'active nav-link-custom' : 'nav-link-custom'}
          >
            All Patients
          </Nav.Link>
        </Nav.Item>
        <div className="ms-auto title-buttons">
        <Dropdown onSelect={handleExport}>
                                <Dropdown.Toggle className="exportbutton" id="dropdown-basic">
                                    Export
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey="pdf">Export to PDF</Dropdown.Item>
                                    <Dropdown.Item eventKey="excel">Export to Excel</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
            </div>
      </Nav>
      <Form className="d-flex" onSubmit={handleSearch}>
                    <Form.Control
                        type="search"
                        placeholder="Search"
                        className="me-2 search-input"
                        aria-label="Search"
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                    <Button className="searchbutton" type="submit">Search</Button>
                </Form>
      <div className="allbranch-allpatients-container">
      <Table hover className="all-patients-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th><center>Contact Number</center></th>
                                    <th>Email</th>
                                    <th><center>Branch</center></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAllPatients.map(patient => (
                                    <tr key={patient.patient_id}>
                                        <td>{patient.patient_fname} {patient.patient_lname}</td>
                                        <td><center>{patient.patient_contact}</center></td>
                                        <td>{patient.patient_email}</td>
                                        <td><center>{patient.patient_branch}</center></td>
                                            </tr>
                                ))}
                            </tbody>
                            </Table>
                            <Pagination className="pagination-container">
                            <Pagination.Prev onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} />
                            {[...Array(totalPages)].map((_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={index + 1 === currentPage}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} />
                        </Pagination>
                    </div>
                </div>
            </div>
            
        );
    };

export default PatientlistAllbranch;
import React, { useState, useEffect } from "react";
import './Patientlist.css'
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useAuth } from './../../settings/AuthContext';
import supabase from "../../settings/supabase";
import { useNavigate } from "react-router-dom";
// import moment from 'moment-timezone';




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



const Patientlist = () => {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    

    const [activeTab, setActiveTab] = useState('allPatients');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [filteredTransfereePatients, setFilteredTransfereePatients] = useState([]);
    const [filteredPendingPatients, setFilteredPendingPatients] = useState([]);
    const [patientsByBranch, setPatientsByBranch] = useState([]);
    const [patientsByVerification, setPatientsByVerification] = useState([]);


    const [profileDetails, setProfileDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dentistBranch, setDentistBranch] = useState('');
    
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [showReason, setShowReason] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);


    const [patientToAcceptTransferee, setPatientToAcceptTransferee] = useState(null);
    const [showAccept, setShowAccept] = useState(false);
    const [showTransferSuccess, setShowTransferSuccess] = useState(false);

    const [showDecline, setshowDecline] = useState(false);
    const [showDeclineReason, setShowDeclineReason] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [showDeclineSuccess, setShowDeclineSuccess] = useState(false);
    const [patientToDeclineTransferee, setPatientToDeclineTransferee] = useState(null);
    
    const [patientToDeclinePending, setPatientToDeclinePending] = useState(null)
    const [showPendingDecline, setShowPendingDecline] = useState(false);
    const [showPendingDeclineReason, setShowPendingDeclineReason] = useState(false);
    const [showPendingDeclineSuccess, setShowPendingDeclineSuccess] = useState(false);
    const [pendingDeclineReason, setPendingDeclineReason] = useState('');
    
    
    const [currentPageAllPatients, setCurrentPageAllPatients] = useState(1);
    const [currentPageTransferees, setCurrentPageTransferees] = useState(1);
    const [currentPagePending, setCurrentPagePending] = useState(1);
    const patientsPerPage = 8;
    const patientsPendingPerPage = 6;

    const [transfereePatients, setTransfereePatients] = useState([]);

    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
      };

      const handlePageChange = (tab, pageNumber) => {
        switch(tab) {
          case 'allPatients':
            setCurrentPageAllPatients(pageNumber);
            break;
          case 'transferees':
            setCurrentPageTransferees(pageNumber);
            break;
          case 'pending':
            setCurrentPagePending(pageNumber);
            break;
          default:
            break;
        }
      };

     

{/*MODALS*/}
      {/*ALL PATIENT MODALS*/}
      const handleDeleteClose = () => setShowDelete(false);
      const handleDeleteShow = (patient_id) => {
        setPatientToDelete(patient_id);
        setShowDelete(true);
    };

      const handleReasonClose = () => setShowReason(false);
      const handleReasonShow = (patient_id) => {
            setPatientToDelete(patient_id);
            handleDeleteClose();
            setShowReason(true);
    };

    const handleSuccessClose = () => setShowSuccess(false);
    
    const handleSuccessShow = () => {
        setShowSuccess(true);
        setShowDelete(false);
        handleDeleteClose();
    };

{/*TRANSFEREE MODALS*/}
    const handleAcceptClose = () => setShowAccept(false);

      const handleAcceptShow = (patientId) => {
        setPatientToAcceptTransferee(patientId);
        setShowAccept(true);
    };

    const handleTransferSuccessClose = () => setShowTransferSuccess(false);
    const handleTransferSuccessShow = () => setShowTransferSuccess(true);

    const handleDeclineClose = () => setshowDecline(false);
    
    const handleDeclineShow = (patientId) => {
        setPatientToDeclineTransferee(patientId);
        setshowDecline(true);
      };

    const handleDecline = () => {
            setshowDecline(true);
            handleAcceptClose();
    };

    const handleDeclineReasonClose = () => setShowDeclineReason(false);
    
    const handleDeclineReasonShow = () => {
        handleDeclineClose();
        setshowDecline(false);
        setShowDeclineReason(true);
};

    const handleDeclineSuccessClose = () => setShowDeclineSuccess(false);
   

    {/*PENDING MODALS*/}
    const handlePendingDeclineShow = (patientId) => {
        setPatientToDeclinePending(patientId);
        setShowPendingDecline(true);
      };
    
      const handlePendingDeclineClose = () => setShowPendingDecline(false);
    
      const handlePendingDeclineReasonShow = () => {
        setShowPendingDecline(false);
        setShowPendingDeclineReason(true);
      };
    
      const handlePendingDeclineReasonClose = () => setShowPendingDeclineReason(false);
    
      const handlePendingDeclineSuccessClose = () => {
        setShowPendingDeclineSuccess(false);
      };

    
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

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const capitalizeAllLetters = (string) => {
        return string.toUpperCase();
    };
    const branch = profileDetails?.branch ? capitalizeAllLetters(profileDetails.branch) : 'Branch not provided';
    const firstName = profileDetails?.fname ? capitalizeFirstLetter(profileDetails.fname) : 'First name not provided';
    const lastName = profileDetails?.lname ? capitalizeFirstLetter(profileDetails.lname) : 'Last name not provided';
    let fullName = `${firstName} ${lastName}`;

    if (userDetails && userDetails.role === 'dentist') {
        fullName = `Dr. ${fullName}`;
    }

    const userRole = userDetails?.role ? capitalizeFirstLetter(userDetails.role) : 'Role not provided';

    console.log('Profile Details:', profileDetails);
    console.log('User Details:', userDetails);
    
{/*All Patient List  */}
useEffect(() => {
    async function fetchPatientsAndTransferees() {
        if (profileDetails && profileDetails.branch) {
            const { data: allPatients, error: allError } = await supabase
                .from('patient')
                .select('*')
                .eq('patient_branch', profileDetails.branch);

                if (allError) throw allError;

            const { data: pendingPatients, error: pendingError } = await supabase
                .from('patient')
                .select('*')
                .eq('patient_branch', profileDetails.branch)
                .eq('verification_status', 'not verified')
                .neq('patient_pendingstatus', 'declined');

                if (pendingError) throw pendingError;

            const { data: transfereePatients, error: transfereeError } = await supabase
                .from('patient_Transfer')
                .select('*')
                .eq('to_branch', profileDetails.branch)
                .eq('transfer_status', 'Pending');
                
                if (transfereeError) throw transfereeError;

                if (allError || pendingError || transfereeError) {
                    console.error('Error fetching patients:', allError || pendingError || transfereeError);
                } else {
                    // Filter out patients with verification_status 'not verified' and declined status for allPatients tab
                    const filteredAllPatients = allPatients.filter(patient =>
                        patient.verification_status !== 'not verified' &&
                        patient.patient_pendingstatus !== 'declined'
                        
                    );
    
                    const transfereePatientIds = transfereePatients.map(transfer => transfer.patient_id);
                    const { data: detailedTransfereePatients, error: detailedTransfereeError } = await supabase
                        .from('patient')
                        .select('*')
                        .in('patient_id', transfereePatientIds);
    
                        if (detailedTransfereeError) {
                            console.error('Error fetching detailed transferee patient information:', detailedTransfereeError);
                        } else {
                            // Combine detailed information with transfereePatients data
                            const transfereePatientsWithDetails = transfereePatients.map(transfer => {
                                const detailedInfo = detailedTransfereePatients.find(detailed => detailed.patient_id === transfer.patient_id);
                                return {
                                    ...transfer,
                                    ...detailedInfo
                                };
                            });
                

                setPatients(filteredAllPatients);
                setPatientsByBranch(allPatients.filter(patient => patient.patient_branch === profileDetails.branch));
                setPatientsByVerification(pendingPatients || []);
                setFilteredPatients(filteredAllPatients);
                setFilteredPendingPatients(pendingPatients || []);

                setTransfereePatients(transfereePatientsWithDetails);
                setFilteredTransfereePatients(transfereePatientsWithDetails);
            }
        }
    }
}
    fetchPatientsAndTransferees();
}, [profileDetails]);



    const handleView = (patient_id) => {
        navigate(`/patientrecord/${patient_id}`);
        console.log('View patient with id:', patient_id);
    };

    const handleEdit = (patient_id) => {
        navigate(`/editdetails/${patient_id}`);
        console.log('Edit patient with id:', patient_id);
    };
 
    const handleDelete = async () => {
        if (!patientToDelete) return;
    
        try {
            console.log('Attempting to delete patient with id:', patientToDelete);
            console.log('Delete reason:', deleteReason);
    
            const { data: patientDetails, error: fetchError } = await supabase
                .from('patient')
                .select('patient_id, user_id, patient_fname, patient_lname')
                .eq('patient_id', patientToDelete)
                .single();
    
            if (fetchError) {
                console.error('Error fetching patient details:', fetchError);
                throw fetchError;
            }
    
            if (!patientDetails) {
                console.error('Patient not found.');
                throw new Error('Patient not found.');
            }
    
            const { user_id } = patientDetails;            

            const { error: reasonError } = await supabase
                .from('patient_DeletedRecords')
                .insert({
                    patient_id: patientDetails.patient_id,
                    user_id: user_id,
                    patient_fname: patientDetails.patient_fname,
                    patient_lname: patientDetails.patient_lname,
                    delete_reason: deleteReason,
                });
    
            if (reasonError) {
                console.error('Error inserting delete reason:', reasonError);
                throw reasonError;
            }
    
            const { error: deleteError } = await supabase
                .from('patient')
                .delete()
                .eq('patient_id', patientToDelete);
    
            if (deleteError) {
                console.error('Error deleting patient:', deleteError);
                throw deleteError;
            }
    
            setPatients(patients.filter(patient => patient.patient_id !== patientToDelete));
            console.log('Successfully deleted patient with id:', patientToDelete);
            
        // Show success modal

    } catch (error) {
        console.error('Error deleting patient:', error);
    } finally {
        handleReasonClose();
    }

    setDeleteReason('');
        setPatientToDelete(null);
        handleSuccessShow(true);
};
    
{/*Pending List  */}
    const handlePendingDeclineSuccessShow = async () => {
        try {
            const getCurrentDate = () => {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                const dd = String(today.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            };

          if (!patientToDeclinePending) return;
      

          const { data: patientDetails, error: fetchError } = await supabase
            .from('patient')
            .select('patient_id, patient_fname, patient_lname, patient_branch')
            .eq('patient_id', patientToDeclinePending)
            .single();
      
          if (fetchError) {
            throw fetchError;
          }
      
          if (!patientDetails) {
            throw new Error('Patient not found.');
          }
      
          const { data: insertData, error: insertError } = await supabase
            .from('patient_DeclinePending')
            .insert([
              {
                patient_id: patientDetails.patient_id,
                patient_fname: patientDetails.patient_fname,
                patient_lname: patientDetails.patient_lname,
                declinepending_date: getCurrentDate(),
                declinepending_from: patientDetails.patient_branch,
                declinepending_reason: pendingDeclineReason
              }
            ]);
      
            if (insertError) {
                throw insertError;
            }

            console.log('Patient decline data stored successfully:', insertData);

            const { data: updateData, error: updateError } = await supabase
                .from('patient')
                .update({ patient_pendingstatus: 'declined' })
                .eq('patient_id', patientToDeclinePending);
        
            if (updateError) {
                throw updateError;
            }
        
            console.log('Patient status updated to declined:', updateData);

            // Remove the declined patient from the state to reflect the UI change
            const updatedPatientsByVerification = patientsByVerification.filter(
                patient => patient.patient_id !== patientToDeclinePending
            );
            const updatedFilteredPendingPatients = filteredPendingPatients.filter(
                patient => patient.patient_id !== patientToDeclinePending
            );
    
            // Update the state
            setPatientsByVerification(updatedPatientsByVerification);
            setFilteredPendingPatients(updatedFilteredPendingPatients);
     
          
    } catch (error) {
        console.error('Error storing patient decline data:', error.message);
   
    }


    setDeclineReason('');
        setShowPendingDeclineReason(false);
        setShowPendingDeclineSuccess(true);
      };
  
  
{/*Transferees List  */}
const handleAccept = async () => {
    try {
        if (!patientToAcceptTransferee) return;


        const { data: transfereeDetails, error: fetchError } = await supabase
            .from('patient_Transfer')
            .select('patient_id, to_branch')
            .eq('patient_id', patientToAcceptTransferee)
            .single();

        if (fetchError) throw fetchError;
        if (!transfereeDetails) throw new Error('Transferee not found.');

        const { data: updatePatient, error: updatePatientError } = await supabase
            .from('patient')
            .update({ patient_branch: transfereeDetails.to_branch }, { transfer_status: 'Accepted' })
            .eq('patient_id', transfereeDetails.patient_id);

        if (updatePatientError) throw updatePatientError;

        console.log('Patient branch updated successfully:', updatePatient);

        const getCurrentDate = () => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0'); 
            const dd = String(today.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const { data: updateTransfer, error: updateTransferError } = await supabase
            .from('patient_Transfer')
            .update({ 
                transfer_status: 'Accepted', 
                accepted_date: getCurrentDate() 
            })
            .eq('patient_id', transfereeDetails.patient_id);

        if (updateTransferError) throw updateTransferError;

        console.log('Transfer status updated to accepted:', updateTransfer);

     
        const updatedTransfereePatients = transfereePatients.filter(
            patient => patient.patient_id !== patientToAcceptTransferee
        );
        setFilteredTransfereePatients(updatedTransfereePatients);
        setPatientToAcceptTransferee(null); 
         
    } catch (error) {
        console.error('Error accepting transferee:', error.message);

    };
    setShowTransferSuccess(true);
    setShowAccept(false);
}

const handleDeclineSuccessShow = async () => {
    try {
        if (!patientToDeclineTransferee) return;
        const getCurrentDate = () => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const dd = String(today.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };
   
        const { data: transfereeDetails, error: fetchError } = await supabase
            .from('patient')
            .select('patient_id, patient_fname, patient_lname')
            .eq('patient_id', patientToDeclineTransferee)
            .single();

        if (fetchError) {
            console.error('Error fetching transferee details:', fetchError.message);
            return;
        }

        if (!transfereeDetails) {
            throw new Error('Transferee not found.');
        }

        if (!declineReason) {
            throw new Error('Decline reason is not provided.');
        }

        // Fetch 'to_branch' from 'patient_Transfer' table
        const { data: transferDetails, error: transferError } = await supabase
            .from('patient_Transfer')
            .select('to_branch')
            .eq('patient_id', patientToDeclineTransferee)
            .single();

        if (transferError) {
            console.error('Error fetching transfer details:', transferError.message);
            return;
        }

        const toBranch = transferDetails?.to_branch;


        // Insert decline reason into 'patient_DeclineTransferee' table
        const { data: insertTransfereeData, error: insertTransfereeError } = await supabase
            .from('patient_DeclineTransferee')
            .insert([
                {
                    patient_id: transfereeDetails.patient_id,
                    patient_fname: transfereeDetails.patient_fname,
                    patient_lname: transfereeDetails.patient_lname,
                    declinetransferee_reason: declineReason,
                    declined_date: getCurrentDate(),
                    declined_from: toBranch,
                    notified: false,
                    decline_by: fullName,
                },
            ]);

        if (insertTransfereeError) {
            throw insertTransfereeError;
        }

        console.log('Transferee decline data stored successfully:', insertTransfereeData);

        // Update transfer status in 'patient_Transfer' table
        const { data: updateTransfer, error: updateTransferError } = await supabase
            .from('patient_Transfer')
            .update({ 
                transfer_status: 'Declined', 
                declined_date: getCurrentDate() 
            })
            .eq('patient_id', patientToDeclineTransferee);

        if (updateTransferError) {
            throw updateTransferError;
        }

        console.log('Transferee status updated to declined:', updateTransfer);

        // Update transfer status in 'patient' table
        const { data: updatePatient, error: updatePatientError } = await supabase
            .from('patient')
            .update({ transfer_status: 'Declined' })
            .eq('patient_id', patientToDeclineTransferee);

        if (updatePatientError) {
            throw updatePatientError;
        }

        console.log('Transferee status updated to declined:', updatePatient);

        // Update filtered transferee patients list
        const updatedFilteredTransfereePatients = filteredTransfereePatients.filter(
            patient => patient.patient_id !== patientToDeclineTransferee
        );

        setFilteredTransfereePatients(updatedFilteredTransfereePatients);
        setDeclineReason('');
    } catch (error) {
        console.error('Error storing transferee decline data:', error.message);
    } finally {
        handleDeclineReasonClose(false);
        setShowDeclineSuccess(true);
    }
};


    const handleAddPatient = () => {
        navigate('/addpatient');
    };


    const handleReview = (patient_id) => {
        navigate(`/reviewpatient/${patient_id}`);
        console.log('Review patient with id:', patient_id);
    };


    const handleSelect = (eventKey) => {
        console.log('Navigating to:', eventKey);
        navigate(eventKey);
    };


    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredTransferees = (transfereePatients || []).filter(patient =>
            `${patient.patient_fname} ${patient.patient_lname}`.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredTransfereePatients(filteredTransferees);
    }, [searchTerm, transfereePatients]);


    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
    
        if (value.trim() === '') {
            if ( activeTab === 'pending') {
                setFilteredPendingPatients(patientsByVerification);
            } else if (activeTab === 'transferee') {
                setFilteredTransfereePatients(transfereePatients);
            } else {
                setFilteredPatients(patients);
            }
        }
    };
    
    const handleSearch = (event) => {
        event.preventDefault();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
        if (activeTab === 'transferee') {
            const filteredTransferees = (transfereePatients || []).filter(patient =>
                `${patient.patient_fname} ${patient.patient_lname}`.toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredTransfereePatients(filteredTransferees);
        } else if (activeTab === 'pending') {
            const filtered = (patientsByVerification || []).filter(patient =>
                `${patient.patient_fname} ${patient.patient_lname}`.toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredPendingPatients(filtered);
        } else {
            const filteredPatients = (patients || []).filter(patient =>
                `${patient.patient_fname} ${patient.patient_lname}`.toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredPatients(filteredPatients);
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
        const tableData = getFilteredData(activeTab);
        const title = getExportTitle(activeTab);
        const companyName = "Dental Solutions, Inc.";
        const branchInfo = branch === "ALL BRANCH" ? "All Patients List in All Branch" : `All Patients List ${branch} Branch`;
    
        if (tableData.length === 0) {
            console.error("No data to export.");
            return;
        }
    
        const doc = new jsPDF();
        
        // Set font size, style, and color for the company name
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 153, 255);
        
        // Add the company name with enhanced styling
        const companyNameWidth = doc.getStringUnitWidth(companyName) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const pageWidth = doc.internal.pageSize.width;
        const startX = (pageWidth - companyNameWidth) / 2;
        doc.text(companyName, startX, 20);
    
        // Add branch information
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 153, 255);
        const branchInfoWidth = doc.getStringUnitWidth(branchInfo) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const branchStartX = (pageWidth - branchInfoWidth) / 2;
        doc.text(branchInfo, branchStartX, 30);
    
        // Move cursor down for the table
        doc.autoTable({
            head: getPDFTableHeaders(activeTab),
            body: tableData.map(patient => getPDFTableRow(patient, activeTab)),
            startY: 40 // Adjust startY to leave space after the branch info
        });
    
        doc.save(`${title}.pdf`);
    };
    
    const exportToExcel = () => {
        const tableData = getFilteredData(activeTab);
        const sheetName = getExportTitle(activeTab);
        const companyName = "Dental Solutions, Inc.";
        const branchInfo = branch === "ALL BRANCH" ? "All Patients List in All Branch" : `All Patients List ${branch} Branch`;
    
        if (tableData.length === 0) {
            console.error("No data to export.");
            return;
        }
    
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet([]);
    
        
        const companyNameCell = { v: companyName, t: 's', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } } };
        const companyNameCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
        worksheet[companyNameCellRef] = companyNameCell;
    
        const branchInfoCell = { v: branchInfo, t: 's', s: { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } } };
        const branchInfoCellRef = XLSX.utils.encode_cell({ r: 1, c: 0 });
        worksheet[branchInfoCellRef] = branchInfoCell;
    
        const mergeCompany = { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } };
        const mergeBranch = { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } };
        if (!worksheet['!merges']) worksheet['!merges'] = [];
        worksheet['!merges'].push(mergeCompany, mergeBranch);
    
       
        const headers = getExcelHeaders(activeTab);
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A3" });
    
      
        const dataRows = tableData.map(patient => getExcelDataRow(patient, activeTab));
        XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: "A4", skipHeader: true });
    
       
        const columnsWidth = headers.map((header, index) => ({
            wch: Math.max(header.length, ...dataRows.map(row => String(Object.values(row)[index]).length))
        }));
        worksheet['!cols'] = columnsWidth;
    
       
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
       
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
        
        saveAs(data, `${sheetName}.xlsx`);
    };
    
    // Helper function to get Excel headers
    const getExcelHeaders = (tab) => {
        switch (tab) {
            case 'allPatients':
            case 'pending':
                return ['Name', 'Age', 'Gender', 'Contact', 'Email', 'Branch'];
            case 'transferees':
                return ['Name', 'From Branch', 'To Branch', 'Age', 'Gender', 'Contact', 'Email'];
            default:
                return [];
        }
    };
    
    // Helper functions
    
    const getFilteredData = (tab) => {
        switch (tab) {
            case 'allPatients':
                return filteredPatients;
            case 'transferees':
                return filteredTransfereePatients;
            case 'pending':
                return filteredPendingPatients;
            default:
                return [];
        }
    };
    
    const getExportTitle = (tab) => {
        switch (tab) {
            case 'allPatients':
                return 'All Patients';
            case 'transferees':
                return 'Transferees';
            case 'pending':
                return 'Pending Patients';
            default:
                return 'Patients';
        }
    };
    
    const getPDFTableHeaders = (tab) => {
        switch (tab) {
            case 'allPatients':
            case 'pending':
                return [['Name', 'Age', 'Gender', 'Contact', 'Email', 'Branch']];
            case 'transferees':
                return [['Name', 'From Branch', 'To Branch', 'Age', 'Gender', 'Contact', 'Email']];
            default:
                return [];
        }
    };
    
    const getPDFTableRow = (patient, tab) => {
        switch (tab) {
            case 'allPatients':
            case 'pending':
                return [
                    `${patient.patient_fname} ${patient.patient_lname}`,
                    patient.patient_age,
                    patient.patient_gender,
                    patient.patient_contact,
                    patient.patient_email,
                    patient.patient_branch
                ];
            case 'transferees':
                return [
                    `${patient.patient_fname} ${patient.patient_lname}`,
                    patient.from_branch,
                    patient.to_branch,
                    patient.patient_age,
                    patient.patient_gender,
                    patient.patient_contact,
                    patient.patient_email,
                    
                ];
            default:
                return [];
        }
    };
    
    const getExcelDataRow = (patient, tab) => {
        switch (tab) {
            case 'allPatients':
            case 'pending':
                return {
                    'Name': `${patient.patient_fname} ${patient.patient_lname}`,
                    'Age': patient.patient_age,
                    'Gender': patient.patient_gender,
                    'Contact': patient.patient_contact,
                    'Email': patient.patient_email,
                    'Branch': patient.patient_branch
                };
            case 'transferees':
                return {
                    'Name': `${patient.patient_fname} ${patient.patient_lname}`,
                    'From Branch': patient.from_branch,
                    'To Branch': patient.to_branch,
                    'Age': patient.patient_age,
                    'Gender': patient.patient_gender,
                    'Contact': patient.patient_contact,
                    'Email': patient.patient_email,
                    
                };
            default:
                return {};
        }
    };

            const paginate = (patients, currentPage) => {
                const indexOfLastPatient = currentPage * patientsPerPage;
                const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
                return patients.slice(indexOfFirstPatient, indexOfLastPatient);
              };

              const paginatepending = (patients, currentPage) => {
                const indexOfLastPatient = currentPage * patientsPendingPerPage;
                const indexOfFirstPatient = indexOfLastPatient - patientsPendingPerPage;
                return patients.slice(indexOfFirstPatient, indexOfLastPatient);
              };
              
              const paginatedAllPatients = paginate(filteredPatients, currentPageAllPatients);
              const paginatedTransferees = paginate(filteredTransfereePatients, currentPageTransferees);
              const paginatedPendingPatients = paginatepending(filteredPendingPatients, currentPagePending);

              console.log('paginatedTransferees:', paginatedTransferees);


    return (
    
        <div className="patientlist-box container-fluid">
            <div className="patientlist-header ">
                <h1> PATIENT LIST </h1>

                <Dropdown onSelect={handleSelect}>
                    <Dropdown.Toggle className="dropdownbranch">
                        {branch} BRANCH
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdownbranch-menu">
                        <Dropdown.Item eventKey="/PatientlistAllbranch" className="dropdownbranch-item">
                            ALL BRANCH
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

            </div> 

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

                <Nav.Item>
                    <Nav.Link
                        eventKey="transferees"
                        onClick={() => handleTabClick('transferees')}
                        className={activeTab === 'transferees' ? 'active nav-link-custom' : 'nav-link-custom'}
                    >
                        Transferees
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        eventKey="pending"
                        onClick={() => handleTabClick('pending')}
                        className={activeTab === 'pending' ? 'active nav-link-custom' : 'nav-link-custom'}
                    >
                        Pending
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

                    <Button className="addpatientbutton" type="button" onClick={handleAddPatient}> Add Patient </Button>
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
                <Button type="submit" className="searchbutton">Search</Button>
            </Form>


{/* ALL PATIENTS SPECIFIC BRANCH*/}
{activeTab === 'allPatients' && (
                <div className="allpatients-container" aria-labelledby="allPatients">
                    <Table hover className="all-patients-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th className="text-center">Age</th>
                                <th>Gender</th>
                                <th>Contact</th>
                                <th>Email</th>
                                <th className="actionsth">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAllPatients.map(patient => (
                                <tr key={patient.patient_id}>
                                    <td>{patient.patient_fname} {patient.patient_lname}</td>
                                    <td className="text-center">{patient.patient_age}</td>
                                    <td>{patient.patient_gender}</td>
                                    <td>+63{patient.patient_contact}</td>
                                    <td>{patient.patient_email}</td>
                                    <td className="action-buttons">
                                        <Button onClick={() => handleView(patient.patient_id)} className="allpatients-actionbuttons">
                                            <FaEye className="icon" />
                                        </Button>
                                        <Button onClick={() => handleEdit(patient.patient_id)} className="allpatients-actionbuttons">
                                            <FaEdit className="icon" />
                                        </Button>
                                        <Button onClick={() => handleDeleteShow(patient.patient_id)} className="allpatients-actionbuttons">
                                            <FaTrash className="icon"/>
                                        </Button>
                                        </td>

                                            {/* Deleting Patient Modal */}
                                            <Modal show={showDelete} onHide={handleDeleteClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="deletemodal">
                                            <Modal.Header closeButton className="plmodal-header">
                                                <Modal.Title className="plmodal-title"> <center> Confirm Deletion </center></Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body className="plmodal-body">
                                             Are you sure you want to delete this patient? <br/> This action cannot be undone.
                                            </Modal.Body>
                                            <Modal.Footer className="plmodal-footer">
                                            <Button onClick={() => handleReasonShow(patientToDelete)} className="deletebtn-modal">
                                                    Delete
                                                </Button>
                                                <Button onClick={handleDeleteClose} className="closebtn-modal">
                                                    Cancel
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>


                                    {/* Reason For Deleting Patient */}
                                    <Modal show={showReason} onHide={handleReasonClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="reasonmodal">
                                    <Modal.Header closeButton className="reasonmodal-header">
                                        <Modal.Title className="reasonmodal-title"> Reason for Deleting Patient </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className="reasonmodal-body">
                                        <Form>
                                            <Form.Group controlId="deleteReason">
                                                <Form.Label> Please provide the reason for deleting this patient.</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Enter reason"
                                                    value={deleteReason}
                                                    onChange={(e) => setDeleteReason(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer className="plmodal-footer">
                                        <Button onClick={handleDelete} className="deletebtn-modal">
                                            Submit
                                        </Button>
                                        <Button onClick={handleReasonClose} className="closebtn-modal">
                                            Cancel
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Success Modal */}
                                <Modal show={showSuccess} onHide={handleSuccessClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="successmodal">
                                    <Modal.Header closeButton className="plmodal-header">
                                        <Modal.Title className="plmodal-title"> Deletion Successful </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className="plmodal-body">
                                    The patient has been successfully deleted from the list, and has been notified.
                                    </Modal.Body>
                                    <Modal.Footer className="plmodal-footer">
                                        <Button onClick={handleSuccessClose} className="closebtn-modal">
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Pagination className="pagination-container">
                        <Pagination.Prev onClick={() => currentPageAllPatients > 1 && handlePageChange('allPatients', currentPageAllPatients - 1)} />
                        {[...Array(Math.ceil(filteredPatients.length / patientsPerPage))].map((_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPageAllPatients}
                                onClick={() => handlePageChange('allPatients', index + 1)}
                                >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => currentPageAllPatients < Math.ceil(filteredPatients.length / patientsPerPage) && handlePageChange('allPatients', currentPageAllPatients + 1)} />
                    </Pagination>
                </div>
)}

{/* TRANSFEREES SECTION*/}
{activeTab === 'transferees' && (

                <div className="transferees-container" aria-labelledby="transferees">
                    <Table hover className="transferees-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Email</th>
                                <th>From Branch</th>
                                <th className="actionsth">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTransferees.map(patient => (
                                <tr key={patient.patient_id}>
                                    <td>{patient.patient_fname} {patient.patient_lname}</td>
                                    <td>+63{patient.patient_contact}</td>
                                    <td>{patient.patient_email}</td>
                                    <td>{patient.patient_branch}</td>
                                    <td>
                                        <Button onClick={() => handleAcceptShow (patient.patient_id)} className="acceptbtn" variant="link" >Accept</Button>
                                        <br/>
                                        <Button onClick={() => handleDeclineShow (patient.patient_id)} className="declinebtn" variant="link" >Decline</Button>
                                    </td>

                                    {/* Accepting Transferee Modal */}
                                    <Modal show={showAccept} onHide={handleAcceptClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="acceptmodal">
                                        <Modal.Header closeButton className="plmodal-header">
                                            <Modal.Title className="plmodal-title">
                                                <center> Accept Transferee </center>
                                            </Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body className="plmodal-body">
                                                Are you sure you want to accept this transferee?
                                            </Modal.Body>
                                            <Modal.Footer className="plmodal-footer">
                                                <Button onClick={() => handleAccept (patient.patient_id)} className="acceptbtn-modal">
                                                    Accept
                                                </Button>
                                                <Button onClick={handleDecline} className="closebtn-modal">
                                                    Decline
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>

                                        {/* Transfer Successful Modal */}
                                        <Modal show={showTransferSuccess} onHide={handleTransferSuccessClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="successmodal">
                                            <Modal.Header closeButton className="plmodal-header">
                                                <Modal.Title className="plmodal-title">
                                                    <center> Transfer Successful </center>
                                                </Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body className="plmodal-body">
                                                The transferee has been successfully accepted.
                                            </Modal.Body>
                                            <Modal.Footer className="plmodal-footer">
                                                <Button onClick={handleTransferSuccessClose} className="closebtn-modal">
                                                    Close
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>

                                        {/* Decline Transferee Modal */}
                                        <Modal show={showDecline} onHide={handleDeclineClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="acceptmodal">
                                            <Modal.Header closeButton className="plmodal-header">
                                                <Modal.Title className="plmodal-title">
                                                    <center> Decline Transferee </center>
                                                </Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body className="plmodal-body">
                                                Are you sure you want to decline this transferee?
                                            </Modal.Body>
                                            <Modal.Footer className="plmodal-footer">
                                                <Button onClick={handleDeclineReasonShow} className="declinebtn-modal">
                                                    Decline
                                                </Button>
                                                <Button onClick={handleDeclineClose} className="closebtn-modal">
                                                    Cancel
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>

                                        {/* Reason For Declining Transferee Patient */}
                                        <Modal show={showDeclineReason} onHide={handleDeclineReasonClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="declinertransfereeeasonmodal">
                                        <Modal.Header closeButton className="reasonmodal-header">
                                            <Modal.Title className="declinereasonmodal-title"> Reason for Declining Transferee </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className="reasonmodal-body">
                                        <Form>
                                            <Form.Group controlId="declineReason">
                                                <Form.Label> Please provide the reason for declining this patient.</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Enter reason"
                                                    value={declineReason}
                                                    onChange={(e) => setDeclineReason(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer className="plmodal-footer">
                                        <Button onClick={handleDeclineSuccessShow} className="deletebtn-modal">
                                            Submit
                                        </Button>
                                        <Button onClick={handleDeclineReasonClose} className="closebtn-modal">
                                            Cancel
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Decline Success Modal */}
                                <Modal show={showDeclineSuccess} onHide={handleDeclineSuccessClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="successmodal">
                                    <Modal.Header closeButton className="plmodal-header">
                                        <Modal.Title className="plmodal-title"> Transferee Declined </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className="plmodal-body">
                                    The transferee has been successfully declined, and has been notified.
                                    </Modal.Body>
                                    <Modal.Footer className="plmodal-footer">
                                        <Button onClick={handleDeclineSuccessClose} className="deletebtn-modal">
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Change the filter of this once the patient has database*/}
                    <Pagination className="pagination-container">
                        <Pagination.Prev onClick={() => currentPageTransferees > 1 && handlePageChange('transferees', currentPageTransferees - 1)} />
                        {[...Array(Math.ceil(filteredTransfereePatients.length / patientsPerPage))].map((_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPageTransferees}
                                onClick={() => handlePageChange('transferees', index + 1)}
                                >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => currentPageTransferees < Math.ceil(filteredTransfereePatients.length / patientsPerPage) && handlePageChange('transferees', currentPageTransferees + 1)} />
                        </Pagination>
                                    </div>
                )}



{/*PENDING SECTION*/}
{activeTab === 'pending' && (
                    <div className="pending-container" aria-labelledby="pending">
                        <Table hover className="pending-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Registered Branch</th>
                                    <th className="actionsth">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPendingPatients.map(patient => (
                                    <tr key={patient.patient_id}>
                                        <td>{patient.patient_fname} {patient.patient_lname}</td>
                                        <td>+63{patient.patient_contact}</td>
                                        <td>{patient.patient_email}</td>
                                        <td>{patient.patient_branch}</td>
                                        <td>
                                            <Button onClick={() => handleReview(patient.patient_id)} className="reviewbtn" variant="link">Review</Button>
                                            <br/>
                                            <Button onClick={() => handlePendingDeclineShow(patient.patient_id)} className="declinebtn" variant="link">Decline</Button>
                                        </td>
                                        {/* Decline Pending Patient Modal */}
                                        <Modal show={showPendingDecline} onHide={handlePendingDeclineClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="acceptmodal">
                                                <Modal.Header closeButton className="plmodal-header">
                                                    <Modal.Title className="plmodal-title">
                                                        <center> Decline Patient </center>
                                                    </Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body className="plmodal-body">
                                                    Are you sure you want to decline this patient?
                                                </Modal.Body>
                                                <Modal.Footer className="plmodal-footer">
                                                    <Button onClick={handlePendingDeclineReasonShow} className="declinebtn-modal">
                                                        Decline
                                                    </Button>
                                                    <Button onClick={handlePendingDeclineClose} className="closebtn-modal">
                                                        Cancel
                                                    </Button>
                                                </Modal.Footer>
                                        </Modal>

                                        {/* Reason For Declining Pending Patient */}
                                        <Modal show={showPendingDeclineReason} onHide={handlePendingDeclineReasonClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="declinereasonmodal">
                                            <Modal.Header closeButton className="reasonmodal-header">
                                                <Modal.Title className="declinereasonmodal-title"> Reason for Declining Patient </Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body className="reasonmodal-body">
                                                <Form>
                                                    <Form.Group controlId="pendingDeclineReason">
                                                        <Form.Label> Please provide the reason for declining this patient.</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            placeholder="Enter reason"
                                                            value={pendingDeclineReason}
                                                            onChange={(e) => setPendingDeclineReason(e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Form>
                                            </Modal.Body>
                                            <Modal.Footer className="plmodal-footer">
                                                <Button onClick={handlePendingDeclineSuccessShow} className="deletebtn-modal">
                                                    Submit
                                                </Button>
                                                <Button onClick={handlePendingDeclineReasonClose} className="closebtn-modal">
                                                    Cancel
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                            {/* Pending Decline Success Modal */}
                                        <Modal show={showPendingDeclineSuccess} onHide={handlePendingDeclineSuccessClose} centered backdropClassName="custom-modal-backdrop" dialogClassName="successmodal">
                                            <Modal.Header closeButton className="plmodal-header">
                                                <Modal.Title className="plmodal-title"> Patient Declined </Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body className="plmodal-body">
                                                The patient has been successfully declined, and has been notified.
                                            </Modal.Body>
                                            <Modal.Footer className="plmodal-footer">
                                                <Button onClick={handlePendingDeclineSuccessClose} className="deletebtn-modal">
                                                    Close
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination className="pagination-container">
                            <Pagination.Prev onClick={() => currentPagePending > 1 && handlePageChange('pending', currentPagePending - 1)} />
                            {[...Array(Math.ceil(filteredPendingPatients.length / patientsPendingPerPage))].map((_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={index + 1 === currentPagePending}
                                    onClick={() => handlePageChange('pending', index + 1)}
                                    >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => currentPagePending < Math.ceil(filteredPendingPatients.length / patientsPendingPerPage) && handlePageChange('pending', currentPagePending + 1)} />
                        </Pagination>
                    </div>
                )}

        </div>
    </div> 
    
    );
};


export default Patientlist;
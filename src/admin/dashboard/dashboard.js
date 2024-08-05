import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css';
import supabase from './../../settings/supabase'; 
import { useAuth } from './../../settings/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CDBContainer } from 'cdbreact';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';


// Icons
import { FaBars } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ICON_SIZE = 25;

function getDate() {
    const today = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    const date = today.getDate();
    return `${month} ${date}, ${year}`;
}


const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(getDate());
    const [profileDetails, setProfileDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [patientTodayCount, setPatientTodayCount] = useState(0);
    const [patientMonthCount, setPatientMonthCount] = useState(0);
    const [patientTotalCount, setPatientTotalCount] = useState(0);

    const [dailyTreatmentReport, setDailyTreatmentReport] = useState({
        labels: ['Orthodontic Treatment', 'Oral Surgery', 'Prosthodontics', 'Periodontics', 'Restorative Dentistry', 'Others'],
        datasets: [
            {
                label: 'Daily Treatment Counts',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#7B43F3',
                    '#FE0000',
                    '#E65C4F',
                    '#FDD037',
                    '#68C66C',
                    '#75E2FF',
                ],
                borderWidth: 1,
            },
        ],
        loading: true,
    });
    const [showDailyPatientsModal, setShowDailyPatientsModal] = useState(false);
    const [dailyPatientsByTreatment, setDailyPatientsByTreatment] = useState({});


    
    const [monthlyTreatmentReport, setMonthlyTreatmentReport] = useState({
        labels: ['Orthodontic Treatment', 'Oral Surgery', 'Prosthodontics', 'Periodontics', 'Restorative Dentistry', 'Others'],
        datasets: [
            {
                label: 'Monthly Treatment Counts',
                data: [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#7B43F3',
                    '#FE0000',
                    '#E65C4F',
                    '#FDD037',
                    '#68C66C',
                    '#75E2FF',
                ],
                borderWidth: 1,
            },
        ],
        loading: true,
    });
    const [showPatientsModal, setShowMonthlyPatientsModal] = useState(false);
    const [monthlyPatients, setMonthlyPatients] = useState({});


    const [caseCounts, setCaseCounts] = useState({
        newCases: 0,
        unfinishedCases: 0,
        finishedCases: 0,
        totalCases: 0,
    });

    const [recentPatients, setRecentPatients] = useState([]);

    
    const [patientStatus, setPatientStatus] = useState({
        labels: ['Active', 'Inactive'], 
        datasets: [
            {
                data: [],
                label: 'Patients',
                backgroundColor: [
                    '#5FE465',
                    '#E3E3E3',
                    
                ],
                borderColor: '#ffffff',
                borderWidth: 1,
                hoverBackgroundColor: [
                    '#5FE465',
                    '#E3E3E3',
            
                ],
                
            },
        ],
    });

    const [activePatientsDetails, setActivePatientsDetails] = useState([]);
    const [inactivePatientsDetails, setInactivePatientsDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const handleShowStatusModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const [showOrthoModal, setShowOrthoModal] = useState(false);
    const handleShowOrthoModal = () => setShowOrthoModal(true);
    const handleCloseOrthoModal = () => setShowOrthoModal(false);
    const [unfinishedCases, setUnfinishedCases] = useState([]);
    const [finishedCases, setFinishedCases] = useState([]);

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

    const firstName = profileDetails?.fname ? capitalizeFirstLetter(profileDetails.fname) : 'First name not provided';
    const lastName = profileDetails?.lname ? capitalizeFirstLetter(profileDetails.lname) : 'Last name not provided';
    let fullName = `${firstName} ${lastName}`;

    if (userDetails && userDetails.role === 'dentist') {
        fullName = `Dr. ${fullName}`;
    }

    const userRole = userDetails?.role ? capitalizeFirstLetter(userDetails.role) : 'Role not provided';
    const branch = profileDetails?.branch ? capitalizeAllLetters(profileDetails.branch) : 'Branch not provided';

    console.log('Profile Details:', profileDetails);
    console.log('User Details:', userDetails);

    {/*SUMMARY CARDS */}
    const fetchPatientBranches = async (patientIds) => {
        if (patientIds.length === 0) return [];
            const { data: patientData, error: patientError } = await supabase
            .from('patient')
            .select('patient_id, patient_branch')
            .in('patient_id', patientIds)
            .eq('verification_status', 'verified');

            if (patientError) {
                throw new Error(`Error fetching patient branches: ${patientError.message}`);
            }
        
            const patientBranches = patientData.map(patient => patient.patient_branch);
            return patientBranches;
        };

useEffect(() => {
    const fetchPatientCounts = async () => {
        try {
            console.log('Fetching patient counts...');
            const start = performance.now();
            const currentDate = new Date();

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const fetchData = async (tableName) => {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('patient_id')
                    .gte('created_at', todayStart.toISOString())
                    .lt('created_at', todayEnd.toISOString());

                if (error) throw new Error(`Error fetching ${tableName}: ${error.message}`);
                return data.map(d => d.patient_id);
            };

            const fetchMonthlyData = async (tableName, startOfMonth, endOfMonth) => {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('patient_id')
                    .gte('created_at', startOfMonth)
                    .lte('created_at', endOfMonth);

                if (error) throw new Error(`Error fetching ${tableName}: ${error.message}`);
                return data.map(d => d.patient_id);
            };

            const [treatmentsToday, orthoToday] = await Promise.all([
                fetchData('patient_Treatments'),
                fetchData('patient_Orthodontics')
            ]);

            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

            const [treatmentsMonth, orthoMonth] = await Promise.all([
                fetchMonthlyData('patient_Treatments', startOfMonth, endOfMonth),
                fetchMonthlyData('patient_Orthodontics', startOfMonth, endOfMonth)
            ]);

            const { data: treatmentsTotal, error: treatmentsErrorTotal } = await supabase
                .from('patient_Treatments')
                .select('patient_id');

            const { data: orthoTotal, error: orthoErrorTotal } = await supabase
                .from('patient_Orthodontics')
                .select('patient_id');

            if (treatmentsErrorTotal || orthoErrorTotal) {
                throw new Error(`Error fetching total patient counts: ${treatmentsErrorTotal || orthoErrorTotal}`);
            }

            const allPatientIdsToday = [...new Set([...treatmentsToday, ...orthoToday])];
            const allPatientIdsMonth = [...new Set([...treatmentsMonth, ...orthoMonth])];
            const allPatientIdsTotal = [...new Set([...treatmentsTotal.map(d => d.patient_id), ...orthoTotal.map(d => d.patient_id)])];

            const [patientBranchesToday, patientBranchesMonth, patientBranchesTotal] = await Promise.all([
                fetchPatientBranches(allPatientIdsToday),
                fetchPatientBranches(allPatientIdsMonth),
                fetchPatientBranches(allPatientIdsTotal)
            ]);

            const userBranch = profileDetails.branch;

            const patientTodayCount = patientBranchesToday.filter(branch => branch === userBranch).length;
            const patientMonthCount = patientBranchesMonth.filter(branch => branch === userBranch).length;
            const patientTotalCount = patientBranchesTotal.filter(branch => branch === userBranch).length;

            setPatientTodayCount(patientTodayCount);
            setPatientMonthCount(patientMonthCount);
            setPatientTotalCount(patientTotalCount);

            const end = performance.now();
            console.log(`Fetched patient counts in ${end - start} ms`);
        } catch (error) {
            console.error('Error fetching patient counts:', error.message);
            setPatientTodayCount(0);
            setPatientMonthCount(0);
            setPatientTotalCount(0);
        }
    };

    if (userDetails?.role && profileDetails?.branch) {
        fetchPatientCounts();
    }
}, [userDetails, profileDetails]);

{/*TREATMENT REPORTS */}
    async function fetchPatientDetails(patientIds) {
        try {
            if (patientIds.length === 0) return [];

            const { data: patientDetails, error } = await supabase
                .from('patient')
                .select('patient_id, patient_fname, patient_lname, patient_contact')
                .in('patient_id', patientIds)
                .eq('verification_status', 'verified');

            if (error) {
                throw error;
            }

            return patientDetails;
        } catch (error) {
            console.error('Error fetching patient details:', error.message);
            return [];
        }
    }
    useEffect(() => {
        const fetchDailyTreatmentCounts = async () => {
            try {
                console.log('Fetching daily treatment counts...');
    
                const treatments = ['Orthodontic Treatment', 'Oral Surgery', 'Prosthodontics', 'Periodontics', 'Restorative Dentistry', 'Others'];
                const currentDate = new Date();
                const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
                const end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
    
                const fetchPatientBranches = async (patientIds) => {
                    if (patientIds.length === 0) return [];
    
                    const { data: patientData, error: patientError } = await supabase
                        .from('patient')
                        .select('patient_id, patient_branch')
                        .in('patient_id', patientIds)
                        .eq('verification_status', 'verified');
    
                    if (patientError) {
                        throw new Error(`Error fetching patient branches: ${patientError.message}`);
                    }
    
                    return patientData;
                };
    
                const fetchPromises = treatments.map(async (treatment) => {
                    let treatmentData;
                    if (treatment === 'Orthodontic Treatment') {
                        const { data, error } = await supabase
                            .from('patient_Orthodontics')
                            .select('patient_id')
                            .gte('created_at', start.toISOString())
                            .lte('created_at', end.toISOString());
    
                        if (error) {
                            throw new Error(`Error fetching orthodontic treatments: ${error.message}`);
                        }
                        treatmentData = data;
                    } else {
                        const { data, error } = await supabase
                            .from('patient_Treatments')
                            .select('patient_id')
                            .eq('treatment', treatment)
                            .gte('created_at', start.toISOString())
                            .lte('created_at', end.toISOString());
    
                        if (error) {
                            throw new Error(`Error fetching treatments for ${treatment}: ${error.message}`);
                        }
                        treatmentData = data;
                    }
    
                    const patientIds = treatmentData.map(item => item.patient_id);
                    const patientData = await fetchPatientBranches(patientIds);
                    const userBranch = profileDetails.branch;
                    const filteredPatients = patientData.filter(patient => patient.patient_branch === userBranch);
    
                    const patientDetails = await fetchPatientDetails(filteredPatients.map(p => p.patient_id));
    
                    return {
                        treatment,
                        count: filteredPatients.length,
                        patients: patientDetails
                    };
                });
    
                const counts = await Promise.all(fetchPromises);
    
                const newData = counts.map(({ treatment, count }) => count);
    
                const dailyTreatmentReportData = {
                    labels: treatments,
                    datasets: [
                        {
                            label: 'Daily Treatment Counts',
                            data: newData,
                            backgroundColor: [
                                '#7B43F3',
                                '#FE0000',
                                '#E65C4F',
                                '#FDD037',
                                '#68C66C',
                                '#75E2FF',
                            ],
                            borderWidth: 1,
                        },
                    ],
                };
    
                setDailyTreatmentReport(dailyTreatmentReportData);
    
                const treatmentPatients = counts.reduce((acc, { treatment, patients }) => {
                    acc[treatment] = patients;
                    return acc;
                }, {});
                setDailyPatientsByTreatment(treatmentPatients);
    
                console.log('Daily Treatment Report:', dailyTreatmentReportData);
            } catch (error) {
                console.error('Error fetching daily treatment counts:', error.message);
            }
        };
    
        if (profileDetails?.branch) {
            fetchDailyTreatmentCounts();
        }
    }, [profileDetails]);
    

    const DailyPatientsModal = ({ show, onHide, patientsByTreatment }) => (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="daily-patients-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title className="dmodal-title">Daily Patients</Modal.Title>
            </Modal.Header>
            <Modal.Body className="dmodal-body">
            {Object.entries(patientsByTreatment).map(([treatment, patients]) => (
                <div key={treatment}>
                    <h5>{treatment}</h5>
                    <Table bordered className='dailyreport-table'>
                        <thead>
                            <tr>
                                <th>Patient ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Contact Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient.patient_id}>
                                    <td>{patient.patient_id}</td>
                                    <td>{patient.patient_fname}</td>
                                    <td>{patient.patient_lname}</td>
                                    <td>{patient.patient_contact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ))}
        </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
   
    useEffect(() => {
        const fetchMonthlyTreatmentCounts = async () => {
            try {
                console.log('Fetching monthly treatment counts...');
    
                const treatments = ['Orthodontic Treatment', 'Oral Surgery', 'Prosthodontics', 'Periodontics', 'Restorative Dentistry', 'Others'];
                const currentDate = new Date();
                const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    
                const fetchPatientBranches = async (patientIds) => {
                    if (patientIds.length === 0) return [];
    
                    const { data: patientData, error: patientError } = await supabase
                        .from('patient')
                        .select('patient_id, patient_branch')
                        .in('patient_id', patientIds)
                        .eq('verification_status', 'verified');
    
                    if (patientError) {
                        throw new Error(`Error fetching patient branches: ${patientError.message}`);
                    }
    
                    return patientData;
                };
    
                const fetchPromises = treatments.map(async (treatment) => {
                    let treatmentData;
                    if (treatment === 'Orthodontic Treatment') {
                        const { data, error } = await supabase
                            .from('patient_Orthodontics')
                            .select('patient_id')
                            .gte('created_at', start.toISOString())
                            .lte('created_at', end.toISOString());
    
                        if (error) {
                            throw new Error(`Error fetching orthodontic treatments: ${error.message}`);
                        }
                        treatmentData = data;
                    } else {
                        const { data, error } = await supabase
                            .from('patient_Treatments')
                            .select('patient_id')
                            .eq('treatment', treatment)
                            .gte('created_at', start.toISOString())
                            .lte('created_at', end.toISOString());
    
                        if (error) {
                            throw new Error(`Error fetching treatments for ${treatment}: ${error.message}`);
                        }
                        treatmentData = data;
                    }
    
                    const patientIds = treatmentData.map(item => item.patient_id);
                    const patientData = await fetchPatientBranches(patientIds);
                    const userBranch = profileDetails.branch;
                    const filteredPatients = patientData.filter(patient => patient.patient_branch === userBranch);
    
                    const patientDetails = await fetchPatientDetails(filteredPatients.map(p => p.patient_id));
    
                    return {
                        treatment,
                        count: filteredPatients.length,
                        patients: patientDetails
                    };
                });
    
                const counts = await Promise.all(fetchPromises);
    
                const newData = counts.map(({ treatment, count }) => count);
    
                const monthlyTreatmentReportData = {
                    labels: treatments,
                    datasets: [
                        {
                            label: 'Monthly Treatment Counts',
                            data: newData,
                            backgroundColor: [
                                '#7B43F3',
                                '#FE0000',
                                '#E65C4F',
                                '#FDD037',
                                '#68C66C',
                                '#75E2FF',
                            ],
                            borderWidth: 1,
                        },
                    ],
                };
    
                setMonthlyTreatmentReport(monthlyTreatmentReportData);
                setMonthlyPatients(counts.reduce((acc, { treatment, patients }) => {
                    acc[treatment] = patients;
                    return acc;
                }, {}));
    
                console.log('Monthly Treatment Report:', monthlyTreatmentReportData);
            } catch (error) {
                console.error('Error fetching monthly treatment counts:', error.message);
            }
        };
    
        if (profileDetails?.branch) {
            fetchMonthlyTreatmentCounts();
        }
    }, [profileDetails]);

    const MonthlyPatientsModal = ({ show, onHide, treatmentPatients }) => (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="monthly-patients-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title className="dmodal-title">Monthly Patients</Modal.Title>
            </Modal.Header>
            <Modal.Body className="dmodal-body">
                {Object.entries(treatmentPatients).map(([treatment, patients]) => (
                    <div key={treatment}>
                        <h5>{treatment}</h5>
                        <Table bordered className='monthlyreport-table'>
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Contact Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.patient_id}>
                                        <td>{patient.patient_id}</td>
                                        <td>{patient.patient_fname}</td>
                                        <td>{patient.patient_lname}</td>
                                        <td>{patient.patient_contact}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
    
{/*ORTHODONTIC CASES */}
async function fetchFirstPatientIds() {
    try {
        const { data: patientIds, error: patientIdsError } = await supabase
            .from('patient')
            .select('patient_id')
            .eq('verification_status', 'verified'); // Filter by verification_status

        if (patientIdsError) {
            throw patientIdsError;
        }

        const ids = patientIds.map(item => item.patient_id);
        return ids;
    } catch (error) {
        console.error('Error fetching first patient IDs:', error.message);
        return [];
    }
}

async function fetchPatientDetailsByStatus(status) {
    try {
        const { data: patientDetails, error } = await supabase
            .from('patient')
            .select('patient_id, patient_fname, patient_lname, patient_contact, ortho_status')
            .eq('ortho_status', status)
            .eq('verification_status', 'verified');

        if (error) {
            throw error;
        }

        return patientDetails;
    } catch (error) {
        console.error(`Error fetching patient details for status ${status}:`, error.message);
        return [];
    }
}
   
async function fetchPatientBranch(patientId) {
    try {
        const { data: patientData, error } = await supabase
            .from('patient')
            .select('patient_branch')
            .eq('patient_id', patientId)
            .eq('verification_status', 'verified') 
            .single();

        if (error) {
            throw error;
        }

        return patientData.patient_branch;
    } catch (error) {
        console.error(`Error fetching patient branch for ${patientId}:`, error.message);
        return null;
    }
}

    async function countOrthodonticCasesForPatients(patientIds, profileDetails) {
        try {
            if (!profileDetails?.branch || patientIds.length === 0) {
                console.warn('Profile branch not found or no patient IDs');
                return {
                    newCases: 0,
                    unfinishedCases: 0,
                    finishedCases: 0,
                    totalCases: 0,
                };
            }

            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        
            const { data: newCases, error: newCasesError } = await supabase
                .from('patient_Orthodontics')
                .select('patient_id', { count: 'exact'})
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString())
                .in('patient_id', patientIds);

           
            const { data: unfinishedCases, error: unfinishedCasesError } = await supabase
                .from('patient')
                .select('patient_id', { count: 'exact' })
                .eq('ortho_status', 'ON GOING')
                .in('patient_id', patientIds);

            
            const { data: finishedCases, error: finishedCasesError } = await supabase
                .from('patient')
                .select('patient_id', { count: 'exact' })
                .eq('ortho_status', 'COMPLETED')
                .in('patient_id', patientIds);

            
            const { data: totalCases, error: totalCasesError } = await supabase
                .from('patient')
                .select('patient_id', { count: 'exact'})
                .or('ortho_status.eq.ON GOING,ortho_status.eq.COMPLETED')
                .in('patient_id', patientIds);

            return {
                newCases: newCases ? newCases.length : 0,
                unfinishedCases: unfinishedCases ? unfinishedCases.length : 0,
                finishedCases: finishedCases ? finishedCases.length : 0,
                totalCases: totalCases ? totalCases.length : 0,
            };
        } catch (error) {
            console.error('Error counting orthodontic cases:', error.message);
            return {
                newCases: 0,
                unfinishedCases: 0,
                finishedCases: 0,
                totalCases: 0,
            };
        }
    }

    async function fetchOrthodonticProcedures(patientIds) {
        try {
            const { data: orthoProcedures, error } = await supabase
                .from('patient_Orthodontics')
                .select('patient_id, ortho_procedure')
                .in('patient_id', patientIds);
    
            if (error) {
                throw error;
            }
    
            return orthoProcedures;
        } catch (error) {
            console.error('Error fetching orthodontic procedures:', error.message);
            return [];
        }
    }
    useEffect(() => {
        async function fetchDataAndUpdate() {
            try {
                const patientIds = await fetchFirstPatientIds();
                const filteredPatientIds = await Promise.all(patientIds.map(async (patientId) => {
                    const patientBranch = await fetchPatientBranch(patientId);
                    return patientBranch === profileDetails.branch ? patientId : null;
                })).then(ids => ids.filter(id => id !== null));
    
                const counts = await countOrthodonticCasesForPatients(filteredPatientIds, profileDetails);
    
                // Fetch unfinished and finished cases
                const unfinished = await fetchPatientDetailsByStatus('ON GOING');
                const finished = await fetchPatientDetailsByStatus('COMPLETED');
                const orthoProcedures = await fetchOrthodonticProcedures(filteredPatientIds);
    
                const mergeProcedures = (patients) => {
                    return patients.map(patient => {
                        const procedure = orthoProcedures.find(p => p.patient_id === patient.patient_id);
                        return {
                            ...patient,
                            ortho_procedure: procedure ? procedure.ortho_procedure : 'N/A'
                        };
                    });
                };

                setUnfinishedCases(mergeProcedures(unfinished.filter(patient => filteredPatientIds.includes(patient.patient_id))));
                setFinishedCases(mergeProcedures(finished.filter(patient => filteredPatientIds.includes(patient.patient_id))));

                setCaseCounts(counts);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        }
        fetchDataAndUpdate();
    }, [profileDetails]);

    const CaseDetailsModal = ({ show, onHide, caseCounts }) => (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"  
            aria-labelledby="case-details-modal"
            centered
        >
             <Modal.Header closeButton>
            <Modal.Title className="dmodal-title">Orthodontic Cases Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="dmodal-body">

            <h5>Unfinished Cases</h5>
            <Table bordered className='orthocases-table'>
                <thead>
                    <tr>
                        <th>Patient ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Contact Number</th>
                        <th>Procedure</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {unfinishedCases.map((patient) => (
                        <tr key={patient.patient_id}>
                            <td>{patient.patient_id}</td>
                            <td>{patient.patient_fname}</td>
                            <td>{patient.patient_lname}</td>
                            <td>{patient.patient_contact}</td>
                            <td>{patient.ortho_procedure}</td>
                            <td>{patient.ortho_status}</td>

                        </tr>
                    ))}
                </tbody>
            </Table>

            <h5>Finished Cases</h5>
            <Table bordered className='orthocases-table'>
                <thead>
                    <tr>
                        <th>Patient ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Contact Number</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {finishedCases.map((patient) => (
                        <tr key={patient.patient_id}>
                            <td>{patient.patient_id}</td>
                            <td>{patient.patient_fname}</td>
                            <td>{patient.patient_lname}</td>
                            <td>{patient.patient_contact}</td>
                            <td>{patient.ortho_status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
    );

    {/*PATIENT STATUS */}
    useEffect(() => {
        const fetchPatientStatus = async () => {
            try {
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                const { data: treatments, error: treatmentsError } = await supabase
                    .from('patient_Treatments')
                    .select('patient_id')
                    .gte('created_at', sixMonthsAgo.toISOString());
                
                if (treatmentsError) throw treatmentsError;


                const { data: orthodontics, error: orthodonticsError } = await supabase
                    .from('patient_Orthodontics')
                    .select('patient_id')
                    .gte('created_at', sixMonthsAgo.toISOString());
                
                if (orthodonticsError) throw orthodonticsError;


                const activePatientIds = new Set([
                    ...treatments.map(record => record.patient_id),
                    ...orthodontics.map(record => record.patient_id),
                ]);


                const { data: allPatients, error: allPatientsError } = await supabase
                    .from('patient')
                    .select('patient_id, patient_fname, patient_lname, patient_contact')
                    .eq('patient_branch', profileDetails.branch)
                    .eq('verification_status', 'verified'); 

                if (allPatientsError) throw allPatientsError;


                const activePatients = allPatients.filter(patient => activePatientIds.has(patient.patient_id));
                const inactivePatients = allPatients.filter(patient => !activePatientIds.has(patient.patient_id));

                setActivePatientsDetails(activePatients);
                setInactivePatientsDetails(inactivePatients);
                
                const activeCount = activePatients.length;
                const inactiveCount = inactivePatients.length;


                // Prepare data for patient status chart
                const patientStatusData = {
                    labels: ['Active', 'Inactive'],
                    datasets: [
                        {
                            data: [activeCount, inactiveCount],
                            label: 'Patients',
                            backgroundColor: ['#5FE465', '#E3E3E3'],
                            borderColor: '#ffffff',
                            borderWidth: 1,
                            hoverBackgroundColor: ['#5FE465', '#E3E3E3'],
                        },
                    ],
                };

                setPatientStatus(patientStatusData);
            } catch (error) {
                console.error('Error fetching patient status:', error.message);
            }
        };

        fetchPatientStatus();
    }, [profileDetails]);

    const PatientStatusModal = ({ show, onHide, activePatients, inactivePatients }) => (
        <Modal show={show} onHide={onHide} size="lg" centered className="patient-status-modal">
        <Modal.Header closeButton>
            <Modal.Title className="dmodal-title"> Patient Status </Modal.Title>
        </Modal.Header>
        <Modal.Body className="dmodal-body">
            <h5>Active Patients</h5>
            <Table bordered className='patientstatus-table'>
                <thead>
                    <tr>
                        <th>Patient ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Contact No.</th>
                    </tr>
                </thead>
                <tbody>
                    {activePatients.length > 0 ? (
                        activePatients.map(patient => (
                            <tr key={patient.patient_id}>
                                <td>{patient.patient_id}</td>
                                <td>{patient.patient_fname}</td>
                                <td>{patient.patient_lname}</td>
                                <td>{patient.patient_contact}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No active patients</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <h5>Inactive Patients</h5>
            <Table bordered className='patientstatus-table'>
                <thead>
                    <tr>
                        <th>Patient ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Contact No</th>
                    </tr>
                </thead>
                <tbody>
                    {inactivePatients.length > 0 ? (
                        inactivePatients.map(patient => (
                            <tr key={patient.patient_id}>
                                <td>{patient.patient_id}</td>
                                <td>{patient.patient_fname}</td>
                                <td>{patient.patient_lname}</td>
                                <td>{patient.patient_contact}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No inactive patients</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
    </Modal>
    );
   
    {/*RECENT PATIENTS */}
    useEffect(() => {
        const fetchRecentData = async () => {
            try {
                
                const { data: treatmentData, error: treatmentError } = await supabase
                    .from('patient_Treatments')
                    .select(`
                        treatment,
                        treatment_type,
                        created_at,
                        patient:patient_id (
                            patient_id, 
                            patient_fname,
                            patient_lname,
                            patient_branch:patient_branch
                        )`
                    )
                    .order('created_at', { ascending: false })
                    .limit(5);
    
                if (treatmentError) {
                    throw treatmentError;
                }
    
 
                const transformedTreatmentData = treatmentData.map(item => ({
                    ...item,
                    patient_id: item.patient.patient_id,  
                    patient_fname: item.patient.patient_fname,
                    patient_lname: item.patient.patient_lname,
                    patient_branch: item.patient.patient_branch
                }));
    
                
                const { data: orthoData, error: orthoError } = await supabase
                    .from('patient_Orthodontics')
                    .select(`
                        ortho_procedure, 
                        created_at,
                        patient:patient_id (
                            patient_id, 
                            patient_fname,
                            patient_lname,
                            patient_branch:patient_branch
                        )`
                    )
                    .order('created_at', { ascending: false })
                    .limit(5);
    
                if (orthoError) {
                    throw orthoError;
                }
    
               
                const transformedOrthoData = orthoData.map(item => ({
                    ...item,
                    treatment: 'Orthodontic Treatment',  
                    patient_id: item.patient.patient_id,  
                    treatment_type: item.ortho_procedure,  
                    patient_fname: item.patient.patient_fname,
                    patient_lname: item.patient.patient_lname,
                    patient_branch: item.patient.patient_branch,
                    source: 'patient_Orthodontics',  
                }));
    
                const combinedData = [...transformedTreatmentData, ...transformedOrthoData].sort((a, b) => 
                                    new Date(b.created_at) - new Date(a.created_at)
                                );
    
    
                const currentUserBranch = profileDetails.branch; 
    
                const filteredData = combinedData.filter(item => item.patient_branch === currentUserBranch);
                
                console.log('Combined Data Length:', combinedData.length);
                console.log('Filtered Data Length:', filteredData.length);

                const limitedData = filteredData.slice(0, 5);
                
                console.log('Limited Data Length:', limitedData.length);
                
                
                setRecentPatients(limitedData || []);
    
            } catch (error) {
                console.error('Error fetching recent data:', error.message);
            }
        };
    
        fetchRecentData();
    }, [profileDetails]);

    const handleView = (patient_id) => {
        navigate(`/patientrecord/${patient_id}`);
        console.log('View patient with id:', patient_id);
    };

    useEffect(() => {
        console.log('Recent Patients State:', recentPatients);
    }, [recentPatients]);
    
    const handleSelect = (eventKey) => {
        navigate(eventKey);
    };

    return (
        <div className="dashboard-container container-fluid">
            <div className="dashboard">
            <Col className='header-container '>
        <h1>Dashboard</h1>
        <Dropdown onSelect={handleSelect}>
            <Dropdown.Toggle className="dropdownbranch">
                {branch} BRANCH
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdownbutton-menu">
                <Dropdown.Item eventKey="/DashboardAllBranch" className="dropdownbutton-item">ALL BRANCH</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
        <div className='currentdate '>
            <h3>{currentDate}</h3>
        </div>
    </Col>   
    <Container fluid>
                <div className="summary-cards ">
                    <Row className='summary-cards-row'>
                        <Col >
                            <div className="cards">
                                <h2>TODAY</h2>
                                <h1>{patientTodayCount}</h1>
                                <h4>Patients</h4>
                            </div>
                        </Col>
                        <Col>
                            <div className="cards">
                                <h3>CURRENT MONTH</h3>
                                <h1>{patientMonthCount}</h1>
                                <h4>Patients</h4>
                            </div>
                        </Col>
                        <Col>
                            <div className="cards">
                                <h2>TOTAL</h2>
                                <h1>{patientTotalCount}</h1>
                                <h4>Patients</h4> 
                            </div>
                        </Col>
                        <Col className='profile-container'>
                        <div className="myprofile-card ">
                            <div className="myprofilecard-header rounded">
                            <Link to="/settings" className="myprofile-link">
                                MY PROFILE <IoMdSettings size={ICON_SIZE} className="myprofile-icon" />
                                </Link>
                            </div>
                            <div className="profile-card-body">
                                <div className="myprofile-fulln">{fullName}</div>
                                <p className="myprofile-role">{userRole}</p>
                                <p className="myprofile-branch">{branch} BRANCH</p>
                            </div>
                        </div>
                    </Col>
                        
                    </Row>
                </div>
                <Row className="treatment-report">
                        <Col>
                            <div className="daily-treatment-report">
                            <div className="monthly-treatment" onClick={setShowDailyPatientsModal} style={{ cursor: 'pointer' }}>
                                <h1>DAILY TREATMENT REPORT</h1> 
                                </div>
                                <div className="tr-container">
                                        <CDBContainer >
                                            <Doughnut 
                                                data={dailyTreatmentReport} 
                                                options={{ 
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'right',
                                                            labels: {
                                                                boxWidth: 20,
                                                                color: '#005590', 
                                                                font: {
                                                                    family: 'Poppins',
                                                                    size: 12,
                                                                    weight: 500, 
                                                                },
                                                            },
                                                        },
                                                        datalabels: {
                                                            color: '#005590',
                                                            display: true,
                                                            align: 'start',
                                                            anchor: 'end',
                                                            formatter: (value) => {
                                                                return value !== 0 ? `${value}` : '';
                                                            },
                                                            font: {
                                                                family: 'Poppins',
                                                                size: 14,
                                                                weight: 600, 
                                                            },
                                                            padding: {
                                                                bottom: 10,
                                                            },
                                                            offset: -23, 
                                                        },
                                                    },
                                              
                                                }} 
                                            />
                                        </CDBContainer> 
                                        </div>
                                        <DailyPatientsModal 
                                        show={showDailyPatientsModal} 
                                        onHide={() => setShowDailyPatientsModal(false)} 
                                        patientsByTreatment={dailyPatientsByTreatment} 
                                    />
                            </div>
                        </Col>
                        <Col>
                            <div className="monthly-treatment-report">
                                <div className="monthly-treatment" onClick={setShowMonthlyPatientsModal} style={{ cursor: 'pointer' }}>
                                <h1>MONTHLY TREATMENT REPORT</h1>
                                </div>
                                <div className="tr-container">
                                        <CDBContainer>
                                            <Doughnut 
                                                data={monthlyTreatmentReport} 
                                                options={{ 
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'right',
                                                            labels: {
                                                                boxWidth: 20,
                                                                color: '#005590', 
                                                                font: {
                                                                    family: 'Poppins',
                                                                    size: 12,
                                                                    weight: 500, 
                                                                },
                                                            },
                                                        },
                                                        datalabels: {
                                                            color: '#005590',
                                                            display: true,
                                                            align: 'start',
                                                            anchor: 'end',
                                                            formatter: (value) => {
                                                                return value !== 0 ? `${value}` : '';
                                                            },
                                                            font: {
                                                                family: 'Poppins',
                                                                size: 14,
                                                                weight: 600, 
                                                            },
                                                            padding: {
                                                                bottom: 10,
                                                            },
                                                            offset: -23, 
                                                        },
                                                    },
                                              
                                                }} 
                                            />
                                        </CDBContainer> 
                                        <MonthlyPatientsModal 
            show={showPatientsModal} 
            onHide={() => setShowMonthlyPatientsModal(false)} 
            treatmentPatients={monthlyPatients} 
        />
                                        </div>
                            </div>
                        </Col>
                
                </Row>
                <Row className="cases-status-report">
                        <Col>
                            <div className="ortho-cases">
                            <div className="orthocases" onClick={handleShowOrthoModal} style={{ cursor: 'pointer' }}>
                           <h1>ORTHODONTIC CASES</h1> 
                        </div>
                        <Row className="ortho-cases-counter">
                            <Col>
                                <h3> NEW CASES: </h3>
                                <h2 className="newcases">{caseCounts?.newCases || 0}</h2>
                            </Col>
                            <Col>
                                <h3> TOTAL CASES: </h3>
                                <h2 className="totalcases">{caseCounts?.totalCases || 0}</h2>
                            </Col>
                           
                        </Row>
                        <Row className="ortho-cases-counter">
                            <Col>
                                <h3> UNFINISHED CASES: </h3>
                                <h2 className="unfinishedcases">{caseCounts?.unfinishedCases || 0}</h2>
                            </Col>
                            <Col>
                                <h3> FINISHED CASES: </h3>
                                <h2 className="finishedcases">{caseCounts?.finishedCases || 0}</h2>
                            </Col>
                            
                        </Row>

                        <CaseDetailsModal
                show={showOrthoModal}
                onHide={() => setShowOrthoModal(false)}
                caseCounts={caseCounts}
            />
                            </div>
                        </Col>
                        <Col>
                            <div className="patient-status">
                            <div className="patientstatus" onClick={handleShowStatusModal} style={{ cursor: 'pointer' }}>
                            <h1> PATIENT STATUS</h1>
                        </div>
                                <div className="tr-container">
                                        <CDBContainer>
                                            <Doughnut 
                                                data={patientStatus} 
                                                options={{ 
                                                    responsive: true, 
                                                    maintainAspectRatio: false, 
                                                        plugins: {
                                                            legend: {
                                                                position: 'right',
                                                                labels: {
                                                                    boxWidth: 25,
                                                                    color: '#005590', 
                                                                    font: {
                                                                        family: 'Poppins',
                                                                        size: 14,
                                                                        weight: 500, 
                                                                    },
                                                                },
                                                            },
                                                            datalabels: {
                                                                color: '#005590',
                                                                display: true,
                                                                align: 'start',
                                                                anchor: 'end',
                                                                formatter: (value) => `${value}`, 
                                                                font: {
                                                                    family: 'Poppins',
                                                                    size: 14,
                                                                    weight: 600, 
                                                                },
                                                                padding: {
                                                                    bottom: 10
                                                                },
                                                                offset: -25, 
                                                            },
                                                        },
    
                                                }} 
                                            />
                                            </CDBContainer>
                                            </div>
                            </div>
                        </Col>
                        <PatientStatusModal 
                        show={showModal} 
                        onHide={handleCloseModal} 
                        activePatients={activePatientsDetails} 
                        inactivePatients={inactivePatientsDetails} 
                    />
                    
                </Row>
                <Row>
                    <Col>
                    <div className="recent-patients container-fluid">
                    <h1>RECENT PATIENTS</h1>
                    <Table responsive className="recent-patients-table ">
                    <thead>
                        <tr>
                            <th>NAME</th>
                            <th>TREATMENT</th>
                            <th>TYPE</th>
                            <th>DATE</th>
                            <th>TIME</th>
                        </tr>
                    </thead>
                    <tbody>
                    {recentPatients.map((item, index) => (
                        <tr key={index}>
                            <td><span 
                                    className="clickable-name" 
                                    onClick={() => handleView(item.patient_id)}
                                    style={{ cursor: 'pointer', color: '#005590' }}
                                >
                                    {item.patient_fname} {item.patient_lname}
                                </span></td>
                            <td>{item.treatment || '-'}</td>
                            <td>{item.treatment_type || '-'}</td>
                            <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
                            <td>{item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        </tr>
                    ))}
                </tbody>
                </Table>
                   </div>
                    </Col>
                </Row>
            </Container>
        </div>
        </div>

    );
};

export default Dashboard;
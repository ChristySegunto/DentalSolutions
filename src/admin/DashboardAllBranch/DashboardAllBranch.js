import React, { useState, useEffect } from 'react';
import './DashboardAllBranch.css';
import supabase from './../../settings/supabase'; 
import { useAuth } from './../../settings/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';

// Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';


// Icons
import { FaBars } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

ChartJS.register(ArcElement, Tooltip, Legend);

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


const DashboardAllBranch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(getDate());
  const [profileDetails, setProfileDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allBrancPatientMonthCount, setAllBranchPatientMonthCount] = useState(0);
  const [branchPatientCounts, setBranchPatientCounts] = useState({});
//   const [branchPatients, setBranchPatients] = useState({
//     Mabini: 0,
//     Alabang: 0,
//     Cubao: 0,
//     Makati: 0,
//     'Leon Guinto': 0,
// });


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


    const handleSelect = (eventKey) => {
        navigate(eventKey);
    };


{/*CURRENT MONTH CARD */}
    useEffect(() => {
        const fetchAllBranchPatientMonthCount = async () => {
            try {
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
    
                // Fetch treatment count from `patient_Treatments`
                const treatmentsAllPromise = supabase
                    .from('patient_Treatments')
                    .select('treatment_id', { count: 'exact' }) 
                    .gte('created_at', startOfMonth) 
                    .lte('created_at', endOfMonth); 
    
                // Fetch orthodontic treatment count from `patient_Orthodontics`
                const orthodonticsAllPromise = supabase
                    .from('patient_Orthodontics')
                    .select('orthodontics_id', { count: 'exact' }) 
                    .gte('created_at', startOfMonth) 
                    .lte('created_at', endOfMonth); 
    

                const [{ data: treatmentsAllData, error: treatmentsAllError }, { data: orthodonticsAllData, error: orthodonticsAllError }] = await Promise.all([treatmentsAllPromise, orthodonticsAllPromise]);
    
                if (treatmentsAllError) {
                    throw treatmentsAllError;
                }
    
                if (orthodonticsAllError) {
                    throw orthodonticsAllError;
                }
    

                const treatmentsAllCount = treatmentsAllData.length; 
                const orthodonticsAllCount = orthodonticsAllData.length; 
    
               
                const allBranchTotalMonthlyCount = treatmentsAllCount + orthodonticsAllCount;
    
               
                setAllBranchPatientMonthCount(allBranchTotalMonthlyCount);
    
            } catch (error) {
                console.error('Error fetching monthly treatment counts:', error.message);
            }
        };
    
      
        fetchAllBranchPatientMonthCount();
    }, []);

// Sample data
const graphdata = [
    {
      name: 'Mabini Branch',
      Orthodontic: 4000,
      Surgery: 2400,
      Prosthodontics: 2400,
      Periodontics: 2000,
      Restorative: 2780,
      Others: 1890,
    },
    {
      name: 'Alabang Branch',
      Orthodontic: 3000,
      Surgery: 1398,
      Prosthodontics: 2210,
      Periodontics: 2290,
      Restorative: 2000,
      Others: 2181,
    },
    {
      name: 'QC Branch',
      Orthodontic: 5000,
      Surgery: 2300,
      Prosthodontics: 2290,
      Periodontics: 2000,
      Restorative: 4000,
      Others: 2181,
    },
    {
      name: 'Leon Guinto Branch',
      Orthodontic: 2780,
      Surgery: 3908,
      Prosthodontics: 2000,
      Periodontics: 1890,
      Restorative: 2780,
      Others: 2000,
    },
    {
      name: 'Makati Branch',
      Orthodontic: 1890,
      Surgery: 4800,
      Prosthodontics: 2000,
      Periodontics: 2181,
      Restorative: 2500,
      Others: 2181,
    }
  ];

  {/* BRANCH PATIENTS */}
    
const fetchPatientTreatmentCounts = async () => {
    const { data: treatments, error: treatmentError } = await supabase
        .from('patient_Treatments')
        .select('patient_id');

    if (treatmentError) {
        console.error('Error fetching treatment patient IDs:', treatmentError);
        return {};
    }

    const treatmentCounts = treatments.reduce((acc, { patient_id }) => {
        acc[patient_id] = (acc[patient_id] || 0) + 1;
        return acc;
    }, {});

    return treatmentCounts;
};

const fetchPatientOrthodonticsCounts = async () => {
    const { data: orthodontics, error: orthodonticsError } = await supabase
        .from('patient_Orthodontics')
        .select('patient_id');

    if (orthodonticsError) {
        console.error('Error fetching orthodontics patient IDs:', orthodonticsError);
        return {};
    }

    const orthodonticsCounts = orthodontics.reduce((acc, { patient_id }) => {
        acc[patient_id] = (acc[patient_id] || 0) + 1;
        return acc;
    }, {});

    return orthodonticsCounts;
};

const fetchPatientsByIds = async (patientIds) => {
    const { data: patients, error: patientsError } = await supabase
        .from('patient')
        .select('patient_id, patient_branch')
        .in('patient_id', patientIds)
        .eq('verification_status', 'verified');

    if (patientsError) {
        console.error('Error fetching patients by IDs:', patientsError);
        return [];
    }

    return patients;
};

const categorizePatientsByBranch = (patients, treatmentCounts, orthodonticsCounts) => {
    const branchPatientCounts = {};

    patients.forEach(patient => {
        const { patient_id, patient_branch } = patient;
        const totalCount = (treatmentCounts[patient_id] || 0) + (orthodonticsCounts[patient_id] || 0);

        if (!branchPatientCounts[patient_branch]) {
            branchPatientCounts[patient_branch] = 0;
        }

        branchPatientCounts[patient_branch] += totalCount;
    });

    return branchPatientCounts;
};

const fetchAndCategorizePatients = async () => {
    const treatmentCounts = await fetchPatientTreatmentCounts();
    const orthodonticsCounts = await fetchPatientOrthodonticsCounts();
    const allPatientIds = [...new Set([...Object.keys(treatmentCounts), ...Object.keys(orthodonticsCounts)])];

    const patients = await fetchPatientsByIds(allPatientIds);
    const branchPatientCounts = categorizePatientsByBranch(patients, treatmentCounts, orthodonticsCounts);

    return branchPatientCounts;
};

useEffect(() => {
    const getPatientCounts = async () => {
        const counts = await fetchAndCategorizePatients();
        setBranchPatientCounts(counts);
    };

    getPatientCounts();
}, []);

    return (
        <div className="dashboard-container container-fluid">
            <div className="dashboard">
          <Col className='allheader-container'>
        <h1>Dashboard</h1>
        <Dropdown onSelect={handleSelect}>
            <Dropdown.Toggle className="dropdownbranch">
                ALL BRANCH
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdownbutton-menu">
                <Dropdown.Item eventKey="/Dashboard" className="dropdownbutton-item">{branch} BRANCH</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
        <div className='currentdate-allbranch'>
            <h3>{currentDate}</h3>
        </div>
    </Col>
            
                <Container fluid>
                <div className="allbranch-summary-cards">
                    <Row className="allbranch-summary-cards-row">
                        <Col>
                            <div className="allbranch-card">
                                <h2>TOTAL BRANCHES</h2>
                                <h1>5</h1>
                                <h4>Patients</h4>
                            </div>
                        </Col>
                        <Col>
                            <div className="allbranch-card">
                                <h2>CURRENT MONTH</h2>
                                <h1>{allBrancPatientMonthCount}</h1>
                                <h4>Patients</h4>
                            </div>
                        </Col>

                        <Col  className='profile-allbranch-container'>
                        <div className="myprofile-allbranch-card">
                            <div className="myprofilecard-allbranch-header rounded">
                            <Link to="/settings" className="allmyprofile-link">
                                MY PROFILE <IoMdSettings size={ICON_SIZE} className="myprofile-icon" />
                                </Link>
                            </div>
                            <div className="profile-allbranch-card-body">
                                <div className="allmyprofile-fulln">{fullName}</div>
                                <p className="allmyprofile-role">{userRole}</p>
                                <p className="allmyprofile-branch">{branch} BRANCH</p>
                            </div>
                        </div>
                    </Col>
                    </Row>
                    </div>
                    <Row className="treatment-trends">
                    <Col>
                                <h1>TREATMENT TRENDS</h1>
                                </Col>
                                <Col>
                                <Dropdown onSelect={handleSelect} >
                                <Dropdown.Toggle className="month-dropdownbutton" >
                                    MONTH - YEAR
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="month-dropdownbutton-menu">
                                    <Dropdown.Item eventKey="/" className="month-dropdownbutton-item"> September 2024 </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    
                        <Row className="treatmenttrends-graph">
              <div style={{ padding: '20px', borderRadius: '8px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={graphdata}
                    margin={{
                      top: 20, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <RechartsLegend className='legend'/>
                    <Bar dataKey="Orthodontic" name="Orthodontic Treatment" stackId="a" fill="#7B43F3" />
                    <Bar dataKey="Surgery" name="Oral Surgery" stackId="b" fill="#FE0000" />
                    <Bar dataKey="Prosthodontics" stackId="c" fill="#E65C4F" />
                    <Bar dataKey="Periodontics" stackId="d" fill="#FDD037" />
                    <Bar dataKey="Restorative" name="Restorative Dentistry" stackId="e" fill="#68C66C" />
                    <Bar dataKey="Others" stackId="f" fill="#75E2FF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Row>
                    </Row>
                    
                    <div className="totalpatients-summary-cards">
                    {/* <Row>
                    {['Mabini', 'Alabang', 'Cubao', 'Makati', 'Leon Guinto'].map(branch => (
                        <Col key={branch}>
                            <div className="totalpatients-card">
                                <h2>TOTAL PATIENTS {branch.toUpperCase()}</h2>
                                <h1>{branchPatients[branch]}</h1>
                                <h4>Patients</h4>
                            </div>
                        </Col>
                    ))}
                </Row> */}
                <Row>
                <Col>
                    <div className="totalpatients-card">
                    <h2>TOTAL PATIENTS ALABANG</h2>
                    <h1>{branchPatientCounts['Alabang'] || 0}</h1>
                    <h4>Patients</h4>
                    </div>
                </Col>

                <Col>
                    <div className="totalpatients-card">
                    <h2>TOTAL PATIENTS CUBAO</h2>
                    <h1>{branchPatientCounts['Cubao'] || 0}</h1>
                    <h4>Patients</h4>
                    </div>
                </Col>

                <Col>
                    <div className="totalpatients-card">
                    <h2>TOTAL PATIENTS MAKATI</h2>
                    <h1>{branchPatientCounts['Makati'] || 0}</h1>
                    <h4>Patients</h4>
                    </div>
                </Col>

                <Col>
                    <div className="totalpatients-card">
                    <h2>TOTAL PATIENTS LEON GUINTO</h2>
                    <h1>{branchPatientCounts['Leon Guinto'] || 0}</h1>
                    <h4>Patients</h4>
                    </div>
                </Col>

                <Col>
                    <div className="totalpatients-card">
                    <h2>TOTAL PATIENTS MABINI</h2>
                    <h1>{branchPatientCounts['Mabini'] || 0}</h1>
                    <h4>Patients</h4>
                    </div>
                </Col>
                    </Row>
                
        </div>
                    </Container>
                
                </div>
                </div>
                

            

    )
}

export default DashboardAllBranch;
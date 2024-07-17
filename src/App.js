import React from 'react';

import './App.css';
import './index.css';

import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
  } from 'react-router-dom';

import { AuthProvider } from './settings/AuthContext.js';
import ProtectedRoute from './settings/ProtectedRoute.js';
import LoginForm from './LoginForm/LoginForm.js'
import PreRegistration from './PreRegistration/PreRegistration.js'
import Dashboard from './admin/dashboard/dashboard.js'
import DashboardAllBranch from './admin/DashboardAllBranch/DashboardAllBranch.js'
// import Home from './patient/home/Home.js'

import Sidebar from './admin/components/Sidebar.js';
import Patientlist from './admin/patientlist/Patientlist.js';
import PatientlistAllbranch from './admin/patientlist/PatientlistAllbranch';
import Addpatient from './admin/addpatient/Addpatient.js';
import Verifypatient from './admin/verifypatient/Verifypatient.js';
import Settings from './admin/settings/Settings.js';
// import SidebarPatient from './patient/sidebar-patient/SidebarPatient.js';
// import Record from './patient/record/Record.js';
// import History from './patient/history/History.js';
import Patientrecord from './admin/patientrecord/Patientrecord.js';
import Editdetails from './admin/patientrecord/Details/Editdetails.js';
import Addprocedure from './admin/patientrecord/Orthodontics/Addprocedure.js';
import Editprocedure from './admin/patientrecord/Orthodontics/Editprocedure.js';
import Viewprocedure from './admin/patientrecord/Orthodontics/Viewprocedure.js';
// import Editcheckbox from './admin/patientrecord/Details/Editcheckbox.js';
import Addtreatment from './admin/patientrecord/Treatments/Addtreatment.js';
import Viewtreatment from './admin/patientrecord/Treatments/Viewtreatment.js';
import Edittreatment from './admin/patientrecord/Treatments/Edittreatment.js';
import ReviewPatient from './admin/patientlist/ReviewPatient.js';
// import Patientsettings from './patient/settings/patientsettings.js';

const router =createBrowserRouter(
  	createRoutesFromElements(
    
		<Route path = "/"  >
			<Route index element={<LoginForm />}></Route>
			<Route path = "login" element={<LoginForm />}></Route>
			<Route path = "prereg" element={<PreRegistration />}></Route>

			<Route
				path="dashboard"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Dashboard />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="dashboardAllBranch" 
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<DashboardAllBranch />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="patientlist"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Patientlist />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="PatientlistAllbranch"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<PatientlistAllbranch />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="addpatient"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Addpatient />
						</div>
					</ProtectedRoute>
				}
			/>

			

			<Route
				path="verifypatient"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Verifypatient />
						</div>
					</ProtectedRoute>
				}
			/>

			

			<Route
				path="settings"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Settings />
						</div>
					</ProtectedRoute>
				}
			/>

			
			<Route
				path="/reviewpatient/:patient_id"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<ReviewPatient />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="/patientrecord/:patient_id"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Patientrecord />
						</div>
					</ProtectedRoute>
				}
			/>
 
			<Route
				path="editdetails/:patient_id"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Editdetails />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/editdetails"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Editdetails />
						</div>
					</ProtectedRoute>
				}
			/>


			<Route
				path="/patientrecord/:patient_id/addtreatment"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Addtreatment />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/viewtreatment/:treatment_id"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Viewtreatment />
						</div>  
					</ProtectedRoute>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/edittreatment/:treatment_id"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Edittreatment />
						</div>  
					</ProtectedRoute>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/addprocedure"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Addprocedure />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/viewprocedure/:orthodontics_id"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Viewprocedure />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/editprocedure/:orthodontics_id"
				element={
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Editprocedure />
						</div>
					</ProtectedRoute>
				}
			/>

			{/* <Route
				path="home"
				element={
				<ProtectedRoute role="patient">
					<div className="dashboard-container">
					<SidebarPatient />
					<Home />
					</div>
				</ProtectedRoute>
				}
			/>

			<Route
				path="record"
				element={
					<ProtectedRoute role="patient">
						<div className="dashboard-container">
							<SidebarPatient />
							<Record />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="history"
				element={
					<ProtectedRoute role="patient">
						<div className="dashboard-container">
							<SidebarPatient />
							<History />
						</div>
					</ProtectedRoute>
				}
			/>

			<Route
				path="patientsettings"
				element={
					<ProtectedRoute role="patient">
						<div className="dashboard-container">
							<SidebarPatient />
							<Patientsettings />
						</div>
					</ProtectedRoute>
				}
			/>  */}

		</Route>
    
	)
)

function App() {
	return (

		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>

	);
}

export default App;
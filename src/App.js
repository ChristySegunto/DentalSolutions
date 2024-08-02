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
import RequireAuth from './settings/RequiredAuth.js';
import LoginForm from './LoginForm/LoginForm.js'
import PreRegistration from './PreRegistration/PreRegistration.js'
import Dashboard from './admin/dashboard/dashboard.js'
import DashboardAllBranch from './admin/DashboardAllBranch/DashboardAllBranch.js'

import Sidebar from './admin/components/Sidebar.js';
import Patientlist from './admin/patientlist/Patientlist.js';
import PatientlistAllbranch from './admin/patientlist/PatientlistAllbranch';
import Addpatient from './admin/addpatient/Addpatient.js';
import Verifypatient from './admin/verifypatient/Verifypatient.js';
import Settings from './admin/settings/Settings.js';
import Patientrecord from './admin/patientrecord/Patientrecord.js';
import Editdetails from './admin/patientrecord/Details/Editdetails.js';
import Addprocedure from './admin/patientrecord/Orthodontics/Addprocedure.js';
import Editprocedure from './admin/patientrecord/Orthodontics/Editprocedure.js';
import Viewprocedure from './admin/patientrecord/Orthodontics/Viewprocedure.js';
import Addtreatment from './admin/patientrecord/Treatments/Addtreatment.js';
import Viewtreatment from './admin/patientrecord/Treatments/Viewtreatment.js';
import Edittreatment from './admin/patientrecord/Treatments/Edittreatment.js';
import ReviewPatient from './admin/patientlist/ReviewPatient.js';
import Scanfaceforpending from './admin/patientlist/Scanfaceforpending.js';

//PATIENT SIDE
import Home from './patient/home/Home.js'
import Patientsettings from './patient/settings/patientsettings.js';
import SidebarPatient from './patient/sidebar-patient/SidebarPatient.js';
import Record from './patient/record/Record.js';
import History from './patient/history/History.js';

const router =createBrowserRouter(
  	createRoutesFromElements(
    
		<Route path = "/"  >
			<Route index element={<LoginForm />}></Route>
			<Route path = "login" element={<LoginForm />}></Route>
			<Route path = "prereg" element={<PreRegistration />}></Route>

			<Route
				path="dashboard"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Dashboard />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="dashboardAllBranch" 
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<DashboardAllBranch />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="patientlist"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Patientlist />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="PatientlistAllbranch"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<PatientlistAllbranch />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="addpatient"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Addpatient />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			

			<Route
				path="verifypatient"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Verifypatient />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			

			<Route
				path="settings"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Settings />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			
			<Route
				path="/reviewpatient/:patient_id"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<ReviewPatient />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path='/scanfaceforpending/:patient_id'
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Scanfaceforpending />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="/patientrecord/:patient_id"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Patientrecord />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>
 
			<Route
				path="editdetails/:patient_id"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Editdetails />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/editdetails"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Editdetails />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>


			<Route
				path="/patientrecord/:patient_id/addtreatment"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Addtreatment />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/viewtreatment/:treatment_id"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Viewtreatment />
						</div>  
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/edittreatment/:treatment_id"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Edittreatment />
						</div>  
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/addprocedure"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Addprocedure />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/viewprocedure/:orthodontics_id"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Viewprocedure />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="/patientrecord/:patient_id/editprocedure/:orthodontics_id"
				element={
					<RequireAuth>
					<ProtectedRoute role="dentist|assistant">
						<div className="dashboard-container">
							<Sidebar />
							<Editprocedure />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="home"
				element={
				<RequireAuth>
				<ProtectedRoute role="patient">
					<div className="dashboard-container">
					<SidebarPatient />
					<Home />
					</div>
				</ProtectedRoute>
				</RequireAuth>
				}
			/>

			<Route
				path="record"
				element={
					<RequireAuth>
					<ProtectedRoute role="patient">
						<div className="dashboard-container">
							<SidebarPatient />
							<Record />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="history"
				element={
					<RequireAuth>
					<ProtectedRoute role="patient">
						<div className="dashboard-container">
							<SidebarPatient />
							<History />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/>

			<Route
				path="patientsettings"
				element={
					<RequireAuth>
					<ProtectedRoute role="patient">
						<div className="dashboard-container">
							<SidebarPatient />
							<Patientsettings />
						</div>
					</ProtectedRoute>
					</RequireAuth>
				}
			/> 

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
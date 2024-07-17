import React from 'react';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../settings/AuthContext';

import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Logout the user
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Handle any logout error if needed
    }
  };

    return (
      <div className='sidebar'>
        <CDBSidebar className="custom-sidebar">
        
        <div className='custom-header'>
            <CDBSidebarHeader prefix={<i className="iconbar-custom fa fa-bars fa-large"></i>}>
                <a href="/" className="header-txt text-decoration-none">
					<h1>DENTAL</h1>
					<p>SOLUTIONS</p>
                </a>
            </CDBSidebarHeader>
        </div>
          
  
          <CDBSidebarContent className="sidebar-content">
            <CDBSidebarMenu>
              <NavLink exact to="/dashboard" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="chart-line">Dashboard</CDBSidebarMenuItem>
              </NavLink>
              <NavLink exact to="/patientlist" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="list">Patient List</CDBSidebarMenuItem>
              </NavLink>
              <NavLink exact to="/addpatient" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="user">Add Patient</CDBSidebarMenuItem>
              </NavLink>
              <NavLink exact to="/verifypatient" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="search">Verify Patient</CDBSidebarMenuItem>
              </NavLink>


            </CDBSidebarMenu>
          </CDBSidebarContent>
  
          <CDBSidebarFooter className='sidebar-content-footer'>
            <div className='sidebar-footer'>
              <NavLink exact to="/settings" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="cog" className='custom-footer'>Settings</CDBSidebarMenuItem>
              </NavLink>

              <div className="divider"></div> 

              <NavLink exact to="/logout" activeClassName="activeClicked">
                <CDBSidebarMenuItem icon="door-open" className='custom-footer' onClick={handleLogout}>Logout</CDBSidebarMenuItem>
              </NavLink>
            </div>
          </CDBSidebarFooter>
        </CDBSidebar>
      </div>
    );
  };
  

export default Sidebar;
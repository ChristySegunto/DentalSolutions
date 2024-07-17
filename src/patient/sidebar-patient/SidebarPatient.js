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


import './SidebarPatient.css';

const SidebarPatient = () => {
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
        <div className='sidebarpatient'>
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
                <NavLink exact to="/home" activeClassName="activeClicked">
                    <CDBSidebarMenuItem icon="home">Home</CDBSidebarMenuItem>
                </NavLink>
                <NavLink exact to="/record" activeClassName="activeClicked">
                    <CDBSidebarMenuItem icon="list">Record</CDBSidebarMenuItem>
                </NavLink>
                <NavLink exact to="/history" activeClassName="activeClicked">
                    <CDBSidebarMenuItem icon="history">History</CDBSidebarMenuItem>
                </NavLink>


                </CDBSidebarMenu>
            </CDBSidebarContent>
    
            <CDBSidebarFooter className='sidebar-content-footer'>
                <div className='sidebar-footer'>
                <NavLink exact to="/patientsettings" activeClassName="activeClicked">
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
  

export default SidebarPatient;
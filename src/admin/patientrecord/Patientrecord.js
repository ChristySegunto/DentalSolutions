import React, { useState, useEffect } from "react";

import './Patientrecord.css'
import { Tab, Tabs, Button} from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams, useLocation} from "react-router-dom";
import supabase from "../../settings/supabase";
import { useAuth } from "../../settings/AuthContext";
import Details from "./Details/Details";
import Treatments from "./Treatments/Treatments";
import Orthodontics from "./Orthodontics/Orthodontics";

const Patientrecord = () => {
    const { user } = useAuth();
    const { patient_id } = useParams();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('details');
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);
    

    const handleTabSelect = (tabKey) => {
        setActiveTab(tabKey);
    };

    const handleBack = () => {
        navigate('/patientlist');
    };

    return(
        <>
            <div className="patientrecord-content container-fluid">
                <div className="patientrecord-header">
                    <Button className="backbtn" variant="light" onClick={handleBack}>
                        <FaArrowLeft className="me-2" />
                    </Button>
                    <h2>PATIENT RECORD</h2>
                </div>


                    <Tabs id="patient-record-tabs" activeKey={activeTab} onSelect={handleTabSelect} className="mb-3 tabs-custom">
                        <Tab eventKey="details" title="Details" className="tab-custom">
                            <Details />
                        </Tab>
                        <Tab eventKey="treatments" title="Treatments" className="tab-custom">
                            <Treatments/>
                        </Tab>
                        <Tab eventKey="orthodontics"title="Orthodontics" className="tab-custom">
                            <Orthodontics />
                        </Tab>
                    </Tabs>

            </div>
        </>
    )
}

export default Patientrecord;
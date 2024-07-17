import React, { useState, useEffect } from "react";
import './Addpatient.css'


import { Modal, Button, Form, Col } from 'react-bootstrap';

const AccountInfoForm = ({ accountdata = {}, onUpdateAccountInfoData }) => {;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const [accountInfoData, setAccountInfoData] = useState({
            username: accountdata.username || '',
            password: accountdata.password || '',
            confirmPassword: accountdata.confirmPassword || ''
        });


    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        // Clear password error when user starts typing
        if (passwordError) {
            setPasswordError('');
        }
    };

    const validatePassword = (e) => {
        if (accountInfoData.password !== accountInfoData.confirmPassword) {
            setPasswordError('Passwords do not match');
        } else {
            setPasswordError('');
        }
    };

    useEffect(() => {
        // Update parent component when formData changes
        onUpdateAccountInfoData(accountInfoData);
    }, [accountInfoData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountInfoData(prevInfo => ({
            ...prevInfo,
            [name]: value
        }));
    };

    return (
        <>
        
        <div className="accountinfo">
            <h2>ACCOUNT INFORMATION</h2>
            <div className="account">
                <Form.Group className="col-lg-8 col-md-8 mb-3" controlId="formBasicUsername">
                    <Form.Label>Username<span className="required">*</span></Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter username" 
                        name="username"
                        value={accountInfoData.username} 
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="col-lg-8 col-md-8 mb-3" controlId="formBasicPassword">
                    <Form.Label>Create a password<span className="required">*</span></Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Enter password"
                        name="password"
                        value={accountInfoData.password} 
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="col-lg-8 col-md-8 mb-4" controlId="formBasicConfirmPassword">
                    <Form.Label>Confirm password<span className="required">*</span></Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Confirm password" 
                        name="confirmPassword"
                        value={accountInfoData.confirmPassword} 
                        onChange={handleChange}
                        onBlur={validatePassword} // Validate on blur
                    />
                    
                    {passwordError && <Form.Text className="text-danger">{passwordError}</Form.Text>}

                </Form.Group>
            </div>

            
        </div>

        

        </>
        
    )
}

export default AccountInfoForm;
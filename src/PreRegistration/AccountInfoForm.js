import React, { useState, useEffect } from "react";
import './PreRegistration.css'


import { Form } from 'react-bootstrap';

const AccountInfoForm = ({ accountdata = {}, onUpdateAccountInfoData }) => {
    const [accountInfoData, setAccountInfoData] = useState({
        username: accountdata.username || '',
        password: accountdata.password || '',
        confirmPassword: accountdata.confirmPassword || ''
    });

    const [errors, setErrors] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [touched, setTouched] = useState({
        username: false,
        password: false,
        confirmPassword: false
    });

    useEffect(() => {
        onUpdateAccountInfoData(accountInfoData);
    }, [accountInfoData]);

    const validateUsername = (username) => {
        if (!username) return '';
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username) ? '' : 'Username should be 3-20 characters long and can only contain letters, numbers, and underscores.';
    };

    const validatePassword = (password) => {
        if (!password) return '';
        const passwordRegex = /^[A-Z][a-zA-Z]{0,29}\d{1,10}\*$/;
        return passwordRegex.test(password) ? '' : 'Password must start with an uppercase letter, followed by up to 29 letters, then 1-10 numbers, and end with an asterisk.';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountInfoData(prevInfo => ({
            ...prevInfo,
            [name]: value
        }));

        setTouched(prevTouched => ({
            ...prevTouched,
            [name]: true
        }));

        let error = '';
        if (name === 'username') {
            error = validateUsername(value);
        } else if (name === 'password') {
            error = validatePassword(value);
        } else if (name === 'confirmPassword') {
            error = value !== accountInfoData.password ? 'Passwords do not match' : '';
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
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
                    {touched.username && accountInfoData.username && errors.username && <Form.Text className="text-danger">{errors.username}</Form.Text>}
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
                    {touched.password && accountInfoData.password && errors.password && <Form.Text className="text-danger">{errors.password}</Form.Text>}
                </Form.Group>

                <Form.Group className="col-lg-8 col-md-8 mb-4" controlId="formBasicConfirmPassword">
                    <Form.Label>Confirm password<span className="required">*</span></Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Confirm password" 
                        name="confirmPassword"
                        value={accountInfoData.confirmPassword} 
                        onChange={handleChange}
                    />
                    {touched.confirmPassword && accountInfoData.confirmPassword && errors.confirmPassword && <Form.Text className="text-danger">{errors.confirmPassword}</Form.Text>}

                </Form.Group>
            </div>

            
        </div>

        

        </>
        
    )
}

export default AccountInfoForm;
import React, { useState, useEffect } from "react";
import './Addpatient.css'
import { Form, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    useEffect(() => {
        onUpdateAccountInfoData(accountInfoData);
    }, [accountInfoData, onUpdateAccountInfoData]);

    const isValidUsername = (username) => {
        return /^[\p{L}\p{N}_-]{6,}$/u.test(username);
    };

    const isValidPassword = (password) => {
        const passwordRegex = /^[A-Z][a-zA-Z]{0,28}[0-9]{1,10}$/;
        return passwordRegex.test(password);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountInfoData(prevInfo => ({
            ...prevInfo,
            [name]: value
        }));

        if (name === 'password') {
            setShowPassword(false);
        } else if (name === 'confirmPassword') {
            setShowConfirmPassword(false);
        }

        // Clear error when input is empty
        if (value === '') {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
            return;
        }

        // Validate on change
        if (name === 'username') {
            setErrors(prevErrors => ({
                ...prevErrors,
                username: value && !isValidUsername(value) 
                    ? 'Username must be at least 6 characters long and can only contain letters (including accented characters), numbers, underscores, and hyphens.' 
                    : ''
            }));
        } else if (name === 'password') {
            setErrors(prevErrors => ({
                ...prevErrors,
                password: value && !isValidPassword(value) 
                    ? 'Password must start with an uppercase letter, followed by up to 28 letters, then 1-10 numbers.' 
                    : ''
            }));
            // Also check confirm password when password changes
            if (accountInfoData.confirmPassword) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    confirmPassword: value !== accountInfoData.confirmPassword ? 'Passwords do not match.' : ''
                }));
            }
        } else if (name === 'confirmPassword') {
            setErrors(prevErrors => ({
                ...prevErrors,
                confirmPassword: value && value !== accountInfoData.password ? 'Passwords do not match.' : ''
            }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    
    return (
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
                    {errors.username && <Form.Text className="text-danger">{errors.username}</Form.Text>}
                </Form.Group>

                <Form.Group className="col-lg-8 col-md-8 mb-3" controlId="formBasicPassword">
                    <Form.Label>Create a password<span className="required">*</span></Form.Label>
                    <InputGroup>
                        <Form.Control 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            name="password"
                            value={accountInfoData.password} 
                            onChange={handleChange}
                        />
                        {accountInfoData.password && (
                            <InputGroup.Text 
                                onClick={togglePasswordVisibility}
                                style={{ cursor: 'pointer' }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </InputGroup.Text>
                        )}
                    </InputGroup>
                    {errors.password && <Form.Text className="text-danger">{errors.password}</Form.Text>}
                </Form.Group>

                <Form.Group className="col-lg-8 col-md-8 mb-4" controlId="formBasicConfirmPassword">
                    <Form.Label>Confirm password<span className="required">*</span></Form.Label>
                    <InputGroup>
                        <Form.Control 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password" 
                            name="confirmPassword"
                            value={accountInfoData.confirmPassword} 
                            onChange={handleChange}
                        />
                        {accountInfoData.confirmPassword && (
                            <InputGroup.Text 
                                onClick={toggleConfirmPasswordVisibility}
                                style={{ cursor: 'pointer' }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </InputGroup.Text>
                        )}
                    </InputGroup>
                    {errors.confirmPassword && <Form.Text className="text-danger">{errors.confirmPassword}</Form.Text>}
                </Form.Group>
            </div>
        </div>
    )
}

export default AccountInfoForm;
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Import Redirect from React Router
import './LoginForm.css'
import { useAuth } from '../settings/AuthContext.js';

//Bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import { Modal } from 'react-bootstrap';

//Firebase
import supabase from './../settings/supabase';
import { ModalBody } from "react-bootstrap";

const LoginForm = () => {
    const [credential, setCredential] = useState(''); // This will hold username or email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0); // Initialize attempts counter
    const [lockoutTime, setLockoutTime] = useState(null);
    const maxAttempts = 5; // Maximum allowed login attempts
    const lockoutDuration = 10 * 1000; // 10 SECONDS ONLY FOR TESTING PURPOSES
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        const storedAttempts = parseInt(localStorage.getItem('loginAttempts'), 10);
        const storedLockoutTime = parseInt(localStorage.getItem('lockoutTime'), 10);

        if (!isNaN(storedAttempts)) {
            setAttempts(storedAttempts);
        }

        if (!isNaN(storedLockoutTime)) {
            setLockoutTime(storedLockoutTime);
            const currentTime = new Date().getTime();
            if (currentTime - storedLockoutTime < lockoutDuration) {
                setError("Maximum login attempts exceeded. Please wait before trying again.");
                const remainingTime = lockoutDuration - (currentTime - storedLockoutTime);
                setCountdown(Math.floor(remainingTime / 1000));
            } else {
                localStorage.removeItem('lockoutTime');
            }
        }
    }, []);

    useEffect(() => {
        if (countdown !== null) {
            const timer = setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown <= 1) {
                        clearInterval(timer);
                        localStorage.removeItem('lockoutTime');
                        setError('');
                        setAttempts(0); // Reset attempts
                        localStorage.removeItem('loginAttempts'); // Remove attempts from localStorage
                        return null;
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [countdown]);

    const handleClose = () => setShowModal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!credential || !password) { // if no email/username or password
            setError("Please insert your username/email and password");
            return;
        }

        const currentTime = new Date().getTime();
        if (lockoutTime && currentTime - lockoutTime < lockoutDuration) {
            setError("Maximum login attempts exceeded. Please wait before trying again.");
            return;
        }

        if (attempts >= maxAttempts) {
            const newLockoutTime = currentTime;
            localStorage.setItem('lockoutTime', newLockoutTime);
            setLockoutTime(newLockoutTime);
            setError("Maximum login attempts exceeded. Please wait before trying again.");
            const remainingTime = lockoutDuration;
            setCountdown(Math.floor(remainingTime / 1000));
            return;
        }

        try {
            // Query based on either email or username
            const { data: userData, error: userError } = await supabase
                .from('user')
                .select('*')
                .or(`email.eq.${credential}, username.eq.${credential}`)
                .single();

            if (userError) {
                throw userError;
            }

            // Compare the fetched password with the input password
            if (!userData || userData.password !== password) {
                setAttempts(prevAttempts => {
                    const newAttempts = prevAttempts + 1;
                    localStorage.setItem('loginAttempts', newAttempts);
                    return newAttempts;
                });
                throw new Error('Invalid login credentials');
            }

            const { role } = userData;

            setAttempts(0);
            localStorage.removeItem('loginAttempts');
            login(userData);

            if (role === 'patient') {
                const { data: patientData, error: patientError } = await supabase
                    .from('patient')
                    .select('*')
                    .eq('user_id', userData.user_id);

                if (patientError) {
                    throw patientError;
                }

                if (patientData[0].verification_status === 'not verified') {
                    setShowModal(true);
                    setModalTitle('Account not verified');
                    setModalBody('Please verify your account first before logging in.');
                    return;
                } else if (patientData[0].verification_status === 'verified') {
                    setShowModal(true);
                    setModalTitle('Login successful');
                    setModalBody('You have successfully logged in.');

                    setTimeout(() => {
                        navigate('/home');
                    }, 3000);
                }
            } else if (role === 'dentist' || role === 'assistant') {
                setShowModal(true);
                setModalTitle('Login successful');
                setModalBody('You have successfully logged in.');

                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            }
        } catch (error) {
            console.error("Supabase error: ", error);
            handleSupabaseError(error);
        }
    };

    const handleSupabaseError = (error) => {
        console.log("Error details: ", error);

        let errorMessage;
        const currentAttempts = attempts + 1;
        const attemptsLeft = maxAttempts - currentAttempts;
        
        if (error.message) {
            switch (error.message) {
                case 'Invalid login credentials':
                    if (attemptsLeft <= 0) {
                        const currentTime = new Date().getTime();
                        const newLockoutTime = currentTime;
                        localStorage.setItem('lockoutTime', newLockoutTime);
                        setLockoutTime(newLockoutTime);
                        setCountdown(Math.floor(lockoutDuration / 1000));
                        errorMessage = 'Maximum login attempts exceeded. Please wait before trying again.';
                    } else {
                        errorMessage = `Incorrect email or password. Please try again. Attempts left: ${attemptsLeft}`;
                    }
                    break;

                default:
                    errorMessage = 'An unexpected error occurred. Please try again later.';
            }
        } else {
            errorMessage = 'An unexpected error occurred. Please try again later.';
        }

        setAttempts(currentAttempts);
        localStorage.setItem('loginAttempts', currentAttempts);
        setError(errorMessage);
    };

    return (
        <>
            <div className='login'>
                <div className="box-container">
                    <div className="box">
                        <Form className="loginform" onSubmit={handleSubmit}>
                            <div className="title">
                                <h1 className="dentalsolutions">Dental Solutions</h1>
                                <h3 className="clinic">CLINIC</h3>
                            </div>
                            <Form.Group className="mb-3 form-group" controlId="formBasicCredential">
                                <Form.Label className="form-label">Username or Email</Form.Label>
                                <Form.Control className="form-control" type="text" size="lg"
                                    value={credential}
                                    onChange={(e) => setCredential(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3 form-group" controlId="formBasicPassword">
                                <Form.Label className="form-label">Password</Form.Label>
                                <Form.Control className="form-control" type="password" size="lg"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Form.Group>

                            {error && <p style={{ color: 'red', backgroundColor: '#ffffff' }}>{error}</p>}
                            {countdown !== null && <p style={{ color: 'red', backgroundColor: '#ffffff' }}>Please wait {countdown} seconds before trying again.</p>}

                            <div className="loginbtnposition">
                                <Button className="loginbtn" type="login">
                                    LOGIN
                                </Button>
                            </div>

                            <Nav.Link className="prereg" href="/prereg">
                                <div className="prereg">Patient Pre-Registration</div>
                            </Nav.Link>
                        </Form>
                    </div>

                    <Modal show={showModal} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title className="custom-modaltitle">{modalTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="custom-modalmessage text-center">
                            {modalBody}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button className="closebtn" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export default LoginForm;

import React, { useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom'; // Import Redirect from React Router
import './LoginForm.css'
import { useAuth } from '../settings/AuthContext.js';


//Bootstrap
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';

//Firebase
import supabase from './../settings/supabase';


const LoginForm = () => {
    const [credential, setCredential] = useState(''); // This will hold username or email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0); // Initialize attempts counter
    const maxAttempts = 5; // Maximum allowed login attempts
    const { login } = useAuth();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!credential || !password) { // if no email/username or password
            setError("Please insert your username/email and password");
            return;
        }

        if (attempts === maxAttempts) {
            setError("Maximum login attempts exceeded");
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
                setAttempts(prevAttempts => prevAttempts + 1);
                throw new Error('Invalid login credentials');
            }


            const { role } = userData;

            setAttempts(0);
            login(userData);

            if (role === 'patient') {
                navigate('/home');
            } else if (role === 'dentist' || role === 'assistant') {
                navigate('/dashboard');
            } else {
                navigate('/login'); // Or any default route
            }


            alert("Logged in successfully");

        } catch (error){
            console.error("Supabase error: ", error);
            handleSupabaseError(error);
        }
    };


    const handleSupabaseError = (error) =>{
        console.log("Error details: ", error);

        let errorMessage;
        if (error.message) {
            switch (error.message) {
                case 'Invalid login credentials':
                    errorMessage = 'Incorrect email or password. Please try again.';
                    // Increment attempts counter on wrong password
                    setAttempts(prevAttempts => prevAttempts + 1);
                    break;

                default:
                    errorMessage = 'An unexpected error occurred. Please try again later.';
            }
        } else {
            errorMessage = 'An unexpected error occurred. Please try again later.';
        }
        
        setError(errorMessage);

    };
    

    // Render Redirect to dashboard if redirectToDashboard is true
    // if (redirectTo) {
    //     return <Navigate to={redirectTo} />;
    // }

    return (
        <>
        <div className='login'>
            <div class="box-container">
                <div class="box">
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

                        {error && <p style={{ color: 'red', backgroundColor: '#ffffff'}}>{error}</p>}

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
            </div>
        </div>
        </>
    )
}

export default LoginForm;
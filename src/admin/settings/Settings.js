import React, { useState, useEffect } from "react";
import './Settings.css';
import supabase from './../../settings/supabase'; // Adjust the path as per your Supabase setup
import { useAuth } from './../../settings/AuthContext';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const Settings = () => {
    const { user } = useAuth();
    const [profileDetails, setProfileDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [showEmailNotifModal, setEmailNotifModal] = useState(false);
    const [EmailNotifModalMessage, setEmailNotifModalMessage] = useState('');

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordModalMessage, setPasswordModalMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    useEffect(() => {
        const fetchProfileDetails = async () => {
            try {
                if (!user || !user.user_id) {
                    throw new Error('User is not logged in or user ID is undefined');
                }
        
                const userId = user.user_id;
                console.log('User ID:', userId);

                // Fetch user details to get the role and email
                const { data: userData, error: userError } = await supabase
                    .from('user')
                    .select('role, email, password')
                    .eq('user_id', userId)
                    .single();

                setUserDetails(userData);

                if (userError) {
                    throw userError;
                }

                if (!userData) {
                    throw new Error('User data not found');
                }

                // Determine which table to query based on user role
                let tableName;
                if (userData.role === 'dentist') {
                    tableName = 'dentist';
                } else if (userData.role === 'assistant') {
                    tableName = 'assistant';
                } else {
                    throw new Error('Unsupported role');
                }

                // Fetch profile details based on the determined table name
                const { data: profileData, error: profileError } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                if (profileError) {
                    throw profileError;
                }

                if (!profileData) {
                    throw new Error('Profile data not found');
                }

                setProfileDetails(profileData);
                
            } catch (error) {
                console.error('Error fetching profile details:', error.message);
                setError('Failed to fetch profile details');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileDetails();
    }, [user]);

    // Function to handle opening the email change modal
    const handleEmailChangeClick = () => {
        setShowEmailModal(true);
    };

    // Function to handle input change in the email change modal
    const handleEmailInputChange = (e) => {
        setNewEmail(e.target.value);
    };

    // Function to handle updating the email
    const handleEmailUpdate = async () => {
        try {
            const userId = user.user_id;

            // Update the email in the user table
            const { error: updateError } = await supabase
                .from('user')
                .update({ email: newEmail })
                .eq('user_id', userId);

            if (updateError) {
                throw updateError;
            }

            // Fetch updated user details
            const { data: updatedUserData, error: fetchError } = await supabase
                .from('user')
                .select('role, email, password')
                .eq('user_id', userId)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            setUserDetails(updatedUserData);
            setShowEmailModal(false);
            setEmailNotifModal(true);
            setEmailNotifModalMessage('Your email has been successfully changed.');
            setError('');
        } catch (error) {
            console.error('Error updating email:', error.message);
            setEmailNotifModalMessage('Failed to update email');
            setEmailNotifModal(true);
            setError('Failed to update email');
        }
    };

    // Function to close the email change modal
    const handleCloseEmailModal = () => {
        setShowEmailModal(false);
    };

    // Function to close the email notification modal
    const handleCloseModal = () => {
        setEmailNotifModal(false);
    };

    // Function to handle opening the password change modal
    const handlePasswordChangeClick = () => {
        setShowPasswordModal(true);
    };

    // Function to close the password change modal
    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        // Clear password fields when modal is closed
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Reset password error state
        setPasswordError('');
        setConfirmPasswordError('');
    };

    // Function to handle input change in the password change modal for old password
    const handleOldPasswordChange = (e) => {
        setOldPassword(e.target.value);
    };

    // Function to handle input change in the password change modal for new password
    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    // Function to handle input change in the password change modal for confirm password
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    // Function to handle updating the password
    const handlePasswordUpdate = async () => {
        try {
            const userId = user.user_id;

            // Validate the new password and confirmation
            if (newPassword !== confirmPassword) {
                setConfirmPasswordError('New password and confirm password do not match');
                return;
            }

            // Check if the old password matches the current password stored in database
            const { data: userData, error: userError } = await supabase
                .from('user')
                .select('password')
                .eq('user_id', userId)
                .single();

            if (userError) {
                throw userError;
            }

            if (!userData) {
                throw new Error('User data not found');
            }

            const currentPassword = userData.password;

            if (oldPassword !== currentPassword) {
                setPasswordError('Old password does not match');
                return; // Exit function if old password doesn't match
            }

            // Update the password in the user table
            const { error: updateError } = await supabase
                .from('user')
                .update({ password: newPassword })
                .eq('user_id', userId);

            if (updateError) {
                throw updateError;
            }

            // Fetch updated user details
            const { data: updatedUserData, error: fetchError } = await supabase
                .from('user')
                .select('role, email, password')
                .eq('user_id', userId)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            setUserDetails(updatedUserData);

            // Close the modal and reset states
            setPasswordModalMessage('Password updated successfully.');
            setShowPasswordModal(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
            setConfirmPasswordError('');
            setError('');
        } catch (error) {
            console.error('Error updating password:', error.message);
            setPasswordModalMessage('Failed to update password');
            setShowPasswordModal(true);
            setError('Failed to update password');
        }
    };

    // Render loading state while fetching data
    if (loading) {
        return <p>Loading...</p>;
    }

    // Render error message if there's an error fetching data
    if (error) {
        return <p>{error}</p>;
    }

    // Render message if no profile details are found
    if (!profileDetails) {
        return <p>No profile details found for this user.</p>;
    }

    // Function to capitalize first letter of a string
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Function to capitalize all letters of a string
    const capitalizeAllLetters = (string) => {
        return string.toUpperCase();
    };

    // Format first name with first letter capitalized, or default text if not provided
    const firstName = profileDetails.fname ? capitalizeFirstLetter(profileDetails.fname) : 'First name not provided';

    // Format last name with first letter capitalized, or default text if not provided
    const lastName = profileDetails.lname ? capitalizeFirstLetter(profileDetails.lname) : 'Last name not provided';

    // Format branch name with all letters capitalized, or default text if not provided
    const branch = profileDetails.branch ? capitalizeAllLetters(profileDetails.branch) : 'Branch not provided';

    // Construct full name from first name and last name
    let fullName = `${firstName} ${lastName}`;

    // Prefix "Dr." to full name if user role is "dentist"
    if (userDetails && userDetails.role === 'dentist') {
        fullName = `Dr. ${fullName}`;
    }

    // Format user role with first letter capitalized, or default text if not provided
    const userRole = userDetails && userDetails.role ? capitalizeFirstLetter(userDetails.role) : 'Role not provided';

    // Display user email or default text if not provided
    const userEmail = userDetails && userDetails.email ? userDetails.email : 'Email not provided';

    // Display user password or default text if not provided
    const userPassword = userDetails && userDetails.password ? userDetails.password : 'Password not provided';

    console.log('Profile Details:', profileDetails);
    console.log('User Details:', userDetails);

    // Render the settings component with profile and account details, and modals for email and password changes
    return (
        <>
            <div className="settings-box">
                <h1>Account Settings</h1>

                {/* Profile Card */}
                <div className="profile card">
                    <div className="card-header rounded">
                            MY PROFILE
                    </div>
                    <div className="card-body">
                        <h3 className="fullname card-title">{fullName}</h3>
                        <p className="role card-text">{userRole}</p>
                        <br/>
                        <p className="branch card-text">{branch} BRANCH</p>
                    </div>
                </div>
                <br/>
                {/* Account Card */}
                <div className="profile card">
                    <div className="card-header rounded">
                        MY ACCOUNT
                    </div>
                    <div className="card-body">
                        {/* Form Group for Email */}
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <div className="email-container">
                                <Form.Control 
                                    className="custom-formcontrol" 
                                    placeholder={userEmail} 
                                    disabled 
                                />
                                <a 
                                    href="#" 
                                    className="email-change-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleEmailChangeClick();
                                    }}
                                >
                                    Change
                                </a>
                            </div>
                        </Form.Group>

                        {/* Form Group for Password */}
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <div className="password-container">
                                <Form.Control 
                                    type="Password"
                                    className="custom-formcontrol" 
                                    placeholder={userPassword} 
                                    disabled 
                                />
                                <a 
                                    href="#" 
                                    className="password-change-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePasswordChangeClick();
                                    }}
                                >
                                    Change
                                </a>
                            </div>
                        </Form.Group>
                    </div>

                </div>
            </div>

            {/* Modal for changing email */}
            <Modal show={showEmailModal} onHide={handleCloseEmailModal} centered>
                <Modal.Header className="custom-modalheader" closeButton>
                    <Modal.Title className="custom-modaltitle">Change Email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label className="custom-lblemail">New Email address</Form.Label>
                            <Form.Control 
                                type="Email" 
                                placeholder="Enter new email" 
                                value={newEmail} 
                                onChange={handleEmailInputChange} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="custom-modalfooter justify-content-center">
                    <Button variant="primary" onClick={handleEmailUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for email notification */}
            <Modal onClose={() => setEmailNotifModal(false)} show={showEmailNotifModal} delay={3000} autohide centered>
                <Modal.Header className="custom-modalheader" closeButton>
                    <Modal.Title className="custom-modaltitle">Email Changed!</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modalbody">{EmailNotifModalMessage}</Modal.Body>
                <Modal.Footer className="custom-modalfooter justify-content-center">
                    <Button className="custom-modalbutton" variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for changing password */}
            <Modal show={showPasswordModal} onHide={handleClosePasswordModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formBasicOldPassword">
                            <Form.Label>Old Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Enter old password" 
                                value={oldPassword} 
                                onChange={handleOldPasswordChange} 
                            />
                            {passwordError && <div className="text-danger">{passwordError}</div>}
                        </Form.Group>
                        <Form.Group controlId="formBasicNewPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Enter new password" 
                                value={newPassword} 
                                onChange={handleNewPasswordChange} 
                            />
                        </Form.Group>
                        <Form.Group controlId="formBasicConfirmPassword">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Confirm new password" 
                                value={confirmPassword} 
                                onChange={handleConfirmPasswordChange} 
                            />

                            {confirmPasswordError && <div className="text-danger">{confirmPasswordError}</div>}


                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="custom-modalfooter justify-content-center">
                    <Button variant="secondary" onClick={handleClosePasswordModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handlePasswordUpdate}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Settings;
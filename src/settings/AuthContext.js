import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not authenticated

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token (example: verify with server if needed)
      setUser({ token }); // Set user as authenticated
    }
  }, []);

    const login = (userData) => {
        localStorage.setItem('authToken', userData.token);
        setUser(userData); // Set user data upon login
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
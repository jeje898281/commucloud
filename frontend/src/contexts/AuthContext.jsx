// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [displayName, setDisplayName] = useState(localStorage.getItem('displayName'));
    const [communityName, setCommunityName] = useState(localStorage.getItem('communityName'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [communityDescription, setCommunityDescription] = useState(localStorage.getItem('communityDescription'));

    const isLoggedIn = !!token;

    const login = ({ token, username, displayName, community, role }) => {
        setToken(token);
        setUsername(username);
        setDisplayName(displayName);
        setCommunityName(community.name);
        setRole(role);
        setCommunityDescription(community.description);
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('displayName', displayName);
        localStorage.setItem('communityName', community.name);
        localStorage.setItem('communityDescription', community.description);
        localStorage.setItem('role', role);
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        setDisplayName(null);
        setCommunityName(null);
        setRole(null);
        setCommunityDescription(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ token, isLoggedIn, username, displayName, communityName, communityDescription, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// **确保导出 useAuth**
export function useAuth() {
    return useContext(AuthContext);
}

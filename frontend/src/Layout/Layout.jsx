import React from 'react';
import './Layout.css';

function Layout({ children }) {
    return (
        <div className="welcome-container">
        {children}
        </div>
    );
}

export default Layout;
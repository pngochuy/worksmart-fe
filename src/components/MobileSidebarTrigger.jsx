import React from 'react';

export const MobileSidebarTrigger = ({ isOpen, setIsOpen }) => {
    return (
        <button
            className="mobile-sidebar-trigger d-md-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Sidebar"
        >
            <i className={`la ${isOpen ? 'la-times' : 'la-bars'}`}></i>
        </button>
    );
};
// Context for managing the current date throughout the application
import React, { createContext, useState, useContext, useEffect } from 'react';

const DateContext = createContext();

// Helper function to get Monday of any week
const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

// Helper to format date to YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Provider component that will wrap the app and provide date functionality
export function DateProvider({ children }) {
    // Initialize with current date in YYYY-MM-DD format
    const [currentDate, setCurrentDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    // Get Monday of current week
    const getCurrentMonday = () => {
        return formatDate(getMonday(currentDate));
    };

    // Get Monday of any week relative to a date
    const getMondayOfWeek = (date, offset = 0) => {
        const d = new Date(date);
        d.setDate(d.getDate() + (offset * 7)); // Add/subtract weeks
        return formatDate(getMonday(d));
    };

    // Get array of dates for a week starting from a Monday
    const getWeekDates = (mondayDate) => {
        const dates = [];
        const startDate = new Date(mondayDate);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push(formatDate(date));
        }
        
        return dates;
    };

    // Update date at midnight
    useEffect(() => {
        const updateDate = () => {
            const newDate = new Date().toISOString().split('T')[0];
            if (newDate !== currentDate) {
                setCurrentDate(newDate);
            }
        };

        // Check every minute for date change
        const interval = setInterval(updateDate, 60000);
        return () => clearInterval(interval);
    }, [currentDate]);

    return (
        <DateContext.Provider value={{ 
            currentDate, 
            getCurrentMonday,
            getMondayOfWeek,
            getWeekDates,
            formatDate 
        }}>
            {children}
        </DateContext.Provider>
    );
}

// Hook to use the date context
export function useDate() {
    const context = useContext(DateContext);
    if (context === undefined) {
        throw new Error('useDate must be used within a DateProvider');
    }
    return context;
}

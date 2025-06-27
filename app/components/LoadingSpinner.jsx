// app/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div>
            <div></div>
            <span>{text}</span>
        </div>
    );
}
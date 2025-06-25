// app/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="flex items-center justify-center p-4 space-x-2">
            <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <span className="text-gray-600">{text}</span>
        </div>
    );
}
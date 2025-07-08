// app/__tests__/components/ErrorDisplay.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest'; // Corrected: Import vitest functions
import ErrorDisplay from '../../components/ErrorDisplay';

describe('ErrorDisplay', () => {
    it('displays the provided error message with "Error:" prefix by default', () => {
        render(<ErrorDisplay message="Something went wrong" />);
        expect(screen.getByText('Error:')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('displays the prefix "Warning:" when isMinor is true', () => {
        render(<ErrorDisplay message="Minor issue detected" isMinor={true} />);
        expect(screen.getByText('Warning:')).toBeInTheDocument();
        expect(screen.getByText('Minor issue detected')).toBeInTheDocument();
    });

    it('renders a "Try again" button if onRetry is provided', () => {
        render(<ErrorDisplay message="Failed to fetch" onRetry={() => { }} />);
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('does not render a "Try again" button if onRetry is not provided', () => {
        render(<ErrorDisplay message="Failed to fetch" />);
        expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('calls onRetry when the "Try again" button is clicked', () => {
        const handleRetry = vi.fn();
        render(<ErrorDisplay message="Failed" onRetry={handleRetry} />);
        fireEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(handleRetry).toHaveBeenCalledTimes(1);
    });
});
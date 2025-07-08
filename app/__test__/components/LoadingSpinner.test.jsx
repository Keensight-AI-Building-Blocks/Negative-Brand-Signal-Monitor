// app/__tests__/components/LoadingSpinner.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest'; // Corrected: Import vitest functions
import LoadingSpinner from '../../components/LoadingSpinner';
describe('LoadingSpinner', () => {
    it('renders with the default text "Loading..."', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom text when provided', () => {
        render(<LoadingSpinner text="Fetching data..." />);
        expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });
});
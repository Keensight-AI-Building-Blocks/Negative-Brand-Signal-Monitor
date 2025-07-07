// app/__tests__/page.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';

// Mock the dashboard to confirm it's being rendered
vi.mock('../components/Dashboard', () => ({
    default: () => <div data-testid="dashboard">Dashboard Component</div>,
}));

describe('HomePage', () => {
    it('renders the Dashboard component', () => {
        render(<HomePage />);
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByText('Dashboard Component')).toBeInTheDocument();
    });
});
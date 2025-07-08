// app/__tests__/components/SearchHistorySidebar.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest'; // Corrected: Import vitest functions
import SearchHistorySidebar from '../../components/SearchHistorySidebar';

describe('SearchHistorySidebar', () => {
    const history = ['Apple', 'Microsoft', 'Google'];

    it('displays a message when history is empty', () => {
        render(<SearchHistorySidebar history={[]} />);
        expect(screen.getByText(/no search history yet/i)).toBeInTheDocument();
    });

    it('renders a list of history items', () => {
        render(<SearchHistorySidebar history={history} />);
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Microsoft')).toBeInTheDocument();
        expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('calls onHistoryItemClick with the correct term when a history item is clicked', () => {
        const handleClick = vi.fn();
        render(<SearchHistorySidebar history={history} onHistoryItemClick={handleClick} />);
        fireEvent.click(screen.getByText('Microsoft'));
        expect(handleClick).toHaveBeenCalledWith('Microsoft');
    });

    it('calls onClearHistory when the "Clear" button is clicked', () => {
        const handleClear = vi.fn();
        render(<SearchHistorySidebar history={history} onClearHistory={handleClear} />);
        fireEvent.click(screen.getByText('Clear'));
        expect(handleClear).toHaveBeenCalledTimes(1);
    });
});
// app/__tests__/components/Dashboard.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest'; // Corrected: Import vitest functions
import Dashboard from '../../components/Dashboard';
import * as api from '../../lib/api';

// Mock the api functions
vi.mock('../../lib/api', () => ({
    fetchMentions: vi.fn(),
    fetchAssistance: vi.fn(),
}));

// Mock child components for isolation
vi.mock('../../components/MentionList', () => ({
    default: ({ mentions }) => <div data-testid="mention-list">{mentions.length} mentions</div>,
}));
vi.mock('../../components/ResponseAssistant', () => ({
    default: ({ mention }) => mention ? <div data-testid="response-assistant">Assistant for {mention.id}</div> : null,
}));

describe('Dashboard', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks();
        // Mock localStorage
        Storage.prototype.getItem = vi.fn(() => null);
        Storage.prototype.setItem = vi.fn();
    });

    it('renders initial state correctly with an input and disabled button', () => {
        render(<Dashboard />);
        expect(screen.getByPlaceholderText(/enter brand name/i)).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeDisabled();
        expect(screen.getByText(/enter a brand name to monitor signals/i)).toBeInTheDocument();
    });

    it('enables the search button when text is entered', () => {
        render(<Dashboard />);
        const input = screen.getByPlaceholderText(/enter brand name/i);
        fireEvent.change(input, { target: { value: 'Nike' } });
        expect(screen.getByText('Search')).not.toBeDisabled();
    });

    it('performs a search, shows loading, and displays results', async () => {
        const mockMentions = [{ id: '1', text: 'Test mention', riskScore: 80 }];
        api.fetchMentions.mockResolvedValue(mockMentions);

        render(<Dashboard />);

        fireEvent.change(screen.getByPlaceholderText(/enter brand name/i), { target: { value: 'Apple' } });
        fireEvent.click(screen.getByText('Search'));

        // Shows loading state
        expect(screen.getByText('Searching for "Apple"...')).toBeInTheDocument();
        expect(api.fetchMentions).toHaveBeenCalledWith('Apple');

        // Waits for the results to appear
        await waitFor(() => {
            expect(screen.getByTestId('mention-list')).toHaveTextContent('1 mentions');
        });
    });

    it('shows an error message if the search API call fails', async () => {
        api.fetchMentions.mockRejectedValue(new Error('API Failed'));
        render(<Dashboard />);

        fireEvent.change(screen.getByPlaceholderText(/enter brand name/i), { target: { value: 'Tesla' } });
        fireEvent.click(screen.getByText('Search'));

        await waitFor(() => {
            expect(screen.getByText('Error:')).toBeInTheDocument();
            expect(screen.getByText('API Failed')).toBeInTheDocument();
        });
    });

    it('displays a message when no mentions are found', async () => {
        api.fetchMentions.mockResolvedValue([]);
        render(<Dashboard />);

        fireEvent.change(screen.getByPlaceholderText(/enter brand name/i), { target: { value: 'Microsoft' } });
        fireEvent.click(screen.getByText('Search'));

        await waitFor(() => {
            expect(screen.getByText('No mentions found for "Microsoft".')).toBeInTheDocument();
        });
    });
    it('updates search history after a successful search', async () => {
        api.fetchMentions.mockResolvedValue([{ id: '1', text: 'mention', riskScore: 50 }]);
        render(<Dashboard />);

        fireEvent.change(screen.getByPlaceholderText(/enter brand name/i), { target: { value: 'Google' } });
        fireEvent.click(screen.getByText('Search'));

        await waitFor(() => {
            // The setItem call for localStorage proves the history was updated
            expect(localStorage.setItem).toHaveBeenCalledWith('brandSearchHistory', JSON.stringify(['Google']));
        });
    });
});
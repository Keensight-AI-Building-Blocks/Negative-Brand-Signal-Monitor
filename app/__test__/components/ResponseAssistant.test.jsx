// app/__tests__/components/ResponseAssistant.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest'; // Corrected: Import vitest functions
import ResponseAssistant from '../../components/ResponseAssistant';
const mockMention = {
    id: 't3_123',
    text: 'This product is amazing!',
    source: 'Reddit',
    sentiment: 'Positive',
    tone: 'Joyful',
    url: 'http://reddit.com/r/all/comments/123',
};
describe('ResponseAssistant', () => {
    it('renders nothing if no mention is provided', () => {
        const { container } = render(<ResponseAssistant mention={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('displays the original mention context correctly', () => {
        render(<ResponseAssistant mention={mockMention} onClose={() => { }} />);
        expect(screen.getByText('Original Mention:')).toBeInTheDocument();
        expect(screen.getByText(/"This product is amazing!"/)).toBeInTheDocument();
        expect(screen.getByText(/Source: Reddit/)).toBeInTheDocument();
        expect(screen.getByText(/Sentiment: Positive/)).toBeInTheDocument();
        expect(screen.getByText(/Tone: Joyful/)).toBeInTheDocument();
        expect(screen.getByText('View Source')).toHaveAttribute('href', mockMention.url);
    });

    it('shows a loading spinner when isLoading is true', () => {
        render(<ResponseAssistant mention={mockMention} isLoading={true} onClose={() => { }} />);
        expect(screen.getByText('Generating suggestions...')).toBeInTheDocument();
    });

    it('displays an error message when an error is provided', () => {
        render(<ResponseAssistant mention={mockMention} error="Failed to generate" onClose={() => { }} />);
        expect(screen.getByText('Warning:')).toBeInTheDocument();
        expect(screen.getByText('Failed to generate')).toBeInTheDocument();
    });
    it('displays the suggestion and strategy when the response is successful', () => {
        const mockResponse = {
            suggestion: 'Thank you so much!',
            strategy: 'Acknowledge and appreciate.',
        };
        render(<ResponseAssistant mention={mockMention} response={mockResponse} onClose={() => { }} />);
        expect(screen.getByText('Suggested Text:')).toBeInTheDocument();
        expect(screen.getByText(mockResponse.suggestion)).toBeInTheDocument();
        expect(screen.getByText('Engagement Strategy:')).toBeInTheDocument();
        expect(screen.getByText(mockResponse.strategy)).toBeInTheDocument();
    });
    it('calls the onClose function when the close button is clicked', () => {
        const handleClose = vi.fn();
        render(<ResponseAssistant mention={mockMention} onClose={handleClose} />);
        // There are two close buttons, we can click the one with the aria-label
        fireEvent.click(screen.getByLabelText('Close assistant'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
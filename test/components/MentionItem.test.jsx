// app/__tests__/components/MentionItem.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import MentionItem from '../../components/MentionItem';

// Mock date-fns to return a consistent date
vi.mock('date-fns', () => ({
    formatDistanceToNow: () => 'about 1 hour ago',
}));

const mockMention = {
    id: 'm1',
    text: 'The new feature is confusing.',
    author: { name: 'testuser' },
    metadata: { redditSubreddit: 'r/feedback' },
    sentiment: 'Negative',
    tone: 'Confused',
    intent: 'Complaint',
    riskScore: 75,
    url: 'http://example.com/mention1',
};

describe('MentionItem', () => {
    it('renders mention details correctly', () => {
        render(<MentionItem mention={mockMention} onAssistClick={() => { }} />);
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('r/feedback')).toBeInTheDocument();
        expect(screen.getByText(/Risk: 75/)).toBeInTheDocument();
        expect(screen.getByText('The new feature is confusing.')).toBeInTheDocument();
        expect(screen.getByText('Negative')).toBeInTheDocument();
        expect(screen.getByText('Confused')).toBeInTheDocument();
        expect(screen.getByText('Complaint')).toBeInTheDocument();
    });

    it('renders "View Source" link with correct href', () => {
        render(<MentionItem mention={mockMention} onAssistClick={() => { }} />);
        const link = screen.getByText('View Source').closest('a');
        expect(link).toHaveAttribute('href', mockMention.url);
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('calls onAssistClick with the mention data when "Suggest Response" is clicked', () => {
        const handleAssistClick = vi.fn();
        render(<MentionItem mention={mockMention} onAssistClick={handleAssistClick} />);
        fireEvent.click(screen.getByText('Suggest Response'));
        expect(handleAssistClick).toHaveBeenCalledTimes(1);
        expect(handleAssistClick).toHaveBeenCalledWith(mockMention);
    });

    it('handles missing author and subreddit gracefully', () => {
        const mentionWithoutAuthor = { ...mockMention, author: null, metadata: {} };
        render(<MentionItem mention={mentionWithoutAuthor} onAssistClick={() => { }} />);
        expect(screen.getByText('Unknown Author')).toBeInTheDocument();
    });
});
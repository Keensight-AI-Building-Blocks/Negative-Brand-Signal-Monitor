// app/__tests__/components/MentionList.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import MentionList from '../../components/MentionList';

const mockMentions = [
    { id: '1', text: 'First mention' },
    { id: '2', text: 'Second mention' },
];

// Mock the MentionItem to simplify the test
vi.mock('../../components/MentionItem', () => ({
    default: ({ mention }) => <div data-testid="mention-item">{mention.text}</div>,
}));

describe('MentionList', () => {
    it('renders the table header', () => {
        render(<MentionList mentions={mockMentions} />);
        expect(screen.getByText('Author')).toBeInTheDocument();
        expect(screen.getByText('Mention Details')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders a list of MentionItem components for each mention', () => {
        render(<MentionList mentions={mockMentions} />);
        const items = screen.getAllByTestId('mention-item');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('First mention');
        expect(items[1]).toHaveTextContent('Second mention');
    });

    it('returns null if the mentions array is empty', () => {
        const { container } = render(<MentionList mentions={[]} />);
        // The component should render nothing, so the container should be empty.
        expect(container.firstChild).toBeNull();
    });

    it('renders a message if mentions prop is null or undefined', () => {
        render(<MentionList mentions={null} />);
        expect(screen.getByText(/loading mentions or an unexpected error occurred/i)).toBeInTheDocument();
    });
});
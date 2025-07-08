// app/__tests__/components/SentimentBadge.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest'; // Corrected: Import vitest functions
import SentimentBadge from '../../components/SentimentBadge';

describe('SentimentBadge', () => {
    it('renders the value with the first letter capitalized', () => {
        render(<SentimentBadge value="negative" />);
        expect(screen.getByText('Negative')).toBeInTheDocument();
    });

    it('handles already capitalized values', () => {
        render(<SentimentBadge value="Positive" />);
        expect(screen.getByText('Positive')).toBeInTheDocument();
    });

    it('handles mixed-case values', () => {
        render(<SentimentBadge value="cOnFuSeD" />);
        expect(screen.getByText('Confused')).toBeInTheDocument();
    });

    it('returns null and renders nothing if the value is null, undefined, or empty', () => {
        const { container: nullContainer } = render(<SentimentBadge value={null} />);
        expect(nullContainer.firstChild).toBeNull();

        const { container: undefinedContainer } = render(<SentimentBadge value={undefined} />);
        expect(undefinedContainer.firstChild).toBeNull();

        const { container: emptyContainer } = render(<SentimentBadge value="" />);
        expect(emptyContainer.firstChild).toBeNull();
    });
});
// app/__tests__/layout.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RootLayout from '../layout';

describe('RootLayout', () => {
    it('renders children passed to it', () => {
        render(
            <RootLayout>
                <main>
                    <h1>Test Child</h1>
                </main>
            </RootLayout>
        );
        expect(screen.getByRole('heading', { name: /test child/i })).toBeInTheDocument();
    });
});
// ThemeProvider.jsx
import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');

    // 1 — pick starting theme: localStorage → system preference → light
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const sysPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = stored ?? (sysPrefersDark ? 'dark' : 'light');
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);
    }, []);

    // 2 — flip + persist
    const toggleTheme = () =>
        setTheme((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', next);
            document.documentElement.setAttribute('data-theme', next);
            return next;
        });

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
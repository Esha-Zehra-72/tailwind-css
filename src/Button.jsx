import React, { useContext } from 'react'
import { ThemeContext } from './ThemeContext';

const Button = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return (
        <>
            <div data-theme={theme}>
                <button onClick={toggleTheme}>Toggle Theme</button>
            </div>
        </>
    )
}

export default Button;
import { useEffect, useState } from 'react';

/**
 * ThemeToggleButton component:
 *
 * This component renders a toggle button to switch between light and dark
 * themes. It uses the `dark` class to toggle the theme and stores the preference
 * in local storage.
 *
 * @returns {JSX.Element} The ThemeToggleButton component.
 */
const ThemeToggleButton = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
    }, []);

    /**
     * Toggles the theme between light and dark.
     *
     * When the document has the 'dark' class, it removes it, sets the
     * local storage theme to 'light', and sets the component state to
     * false. Otherwise, it adds the 'dark' class, sets the local storage
     * theme to 'dark', and sets the component state to true.
     */
    const toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    return (
        <div className="absolute top-[25px] right-2 z-50 flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                />
                <div className="w-14 h-8 bg-yellow-400 rounded-full peer dark:bg-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600"></div>
            </label>
        </div>
    );
};

export default ThemeToggleButton;

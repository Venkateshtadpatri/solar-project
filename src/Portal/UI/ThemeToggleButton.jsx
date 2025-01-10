import { useEffect, useState } from 'react';

const ThemeToggleButton = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
    }, []);

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
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <span className="text-sm font-medium text-white">Light</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                />
                <div className="w-14 h-8 bg-yellow-400 rounded-full peer dark:bg-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600"></div>
            </label>
            <span className="text-sm font-medium text-white">Dark</span>
        </div>
    );
};

export default ThemeToggleButton;

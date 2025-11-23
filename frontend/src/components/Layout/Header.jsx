import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Search, Moon, Sun } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 transition-colors">
      <div className="py-4 flex items-center justify-between pl-16 pr-4 sm:pl-20 sm:pr-6 lg:px-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleDarkMode();
            }}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


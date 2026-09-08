import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, Search } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2 lg:px-8">
            <div className="max-w-max mx-auto text-center">
                <main className="sm:flex">
                    <p className="text-4xl font-extrabold text-blue-600 sm:text-5xl">404</p>
                    <div className="sm:ml-6">
                        <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Page not found</h1>
                            <p className="mt-1 text-base text-gray-500">Please check the URL in the address bar and try again.</p>
                        </div>
                        <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6 justify-center sm:justify-start">
                            <Link
                                to="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Go back home
                            </Link>
                            <Link
                                to="/courses"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Explore Courses
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NotFound;

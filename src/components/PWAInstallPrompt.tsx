import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-indigo-100 dark:border-gray-700 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Install Feature Desk</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Install as an app for better performance and offline access.</p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-500"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
                <button
                    onClick={handleInstallClick}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                >
                    Install
                </button>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;

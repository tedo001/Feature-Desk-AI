import React, { useState, useEffect } from 'react';
import { Tag, Maximize, Move, Sliders, X, Monitor } from 'lucide-react';

interface ScreenAdapterProps {
    children: React.ReactNode;
}

export default function ScreenAdapter({ children }: ScreenAdapterProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    
    // Position/Size state
    const [settings, setSettings] = useState({
        scale: 1,
        width: 100, // percentage (vw)
        height: 100, // percentage (vh)
        x: 0,
        y: 0,
        borderRadius: 0
    });

    // Handle saving/loading from localStorage to persist user preference
    useEffect(() => {
        const saved = localStorage.getItem('featureDeskScreenSettings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse screen settings", e);
            }
        }
    }, []);

    const updateSettings = (newSettings: typeof settings) => {
        setSettings(newSettings);
        localStorage.setItem('featureDeskScreenSettings', JSON.stringify(newSettings));
    };

    const resetToAuto = () => {
        updateSettings({
            scale: 1,
            width: 100,
            height: 100,
            x: 0,
            y: 0,
            borderRadius: 0
        });
    };

    const applyWindowedPreset = () => {
        updateSettings({
            scale: 0.9,
            width: 90,
            height: 85,
            x: 5,
            y: 5,
            borderRadius: 24
        });
    };

    const handleChange = (key: keyof typeof settings, value: number) => {
        updateSettings({ ...settings, [key]: value });
    };

    return (
        <div className="fixed inset-0 overflow-y-auto bg-[#0f172a]" style={{ zIndex: 0 }}>
            {/* Dark background underlying the screen if scaled down */}
            <div className="absolute inset-0 bg-slate-900 -z-10" />

            {/* Main Content Wrapper */}
            <div 
                className="absolute origin-top-left transition-all duration-300 ease-out shadow-2xl overflow-y-auto bg-white"
                style={{
                    width: `${settings.width}vw`,
                    height: `${settings.height}vh`,
                    transform: `translate(${settings.x}vw, ${settings.y}vh) scale(${settings.scale})`,
                    borderRadius: `${settings.borderRadius}px`,
                    zIndex: 1
                }}
            >
                {children}
            </div>

            {/* Floating Tag Icon */}
            {!isEditing && (
                <div 
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <button
                        onClick={() => setIsEditing(true)}
                        className={`flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 rounded-l-2xl ${isHovering ? 'w-16 h-14 pr-2' : 'w-10 h-14 pl-1'}`}
                        title="Adjust Screen Size & Position"
                    >
                        <Tag className={`w-5 h-5 transition-transform duration-300 ${isHovering ? 'rotate-12' : ''}`} />
                    </button>
                    
                    {/* Tooltip */}
                    {isHovering && (
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap opacity-100 transition-opacity animate-in fade-in slide-in-from-right-2 pointer-events-none shadow-xl border border-slate-700">
                            Auto Adapts to Any Screen!
                            <br />
                            <span className="text-slate-400 font-medium">Click to adjust position & size manually</span>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Panel */}
            {isEditing && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-6 z-[100000] animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <Monitor className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 leading-tight">Screen Adjustments</h2>
                                <p className="text-xs text-slate-500">Adapt app layout to your display</p>
                            </div>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                            <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Scale */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">Zoom / Scale</label>
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{Math.round(settings.scale * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="0.5" max="1.5" step="0.01" 
                                value={settings.scale}
                                onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
                                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Width & Height Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Width</label>
                                    <span className="text-xs font-mono text-slate-500">{settings.width}%</span>
                                </div>
                                <input 
                                    type="range" min="50" max="100" step="1" 
                                    value={settings.width}
                                    onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Height</label>
                                    <span className="text-xs font-mono text-slate-500">{settings.height}%</span>
                                </div>
                                <input 
                                    type="range" min="50" max="100" step="1" 
                                    value={settings.height}
                                    onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Position X & Y Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Offset X</label>
                                    <span className="text-xs font-mono text-slate-500">{settings.x}vw</span>
                                </div>
                                <input 
                                    type="range" min="-50" max="50" step="1" 
                                    value={settings.x}
                                    onChange={(e) => handleChange('x', parseFloat(e.target.value))}
                                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Offset Y</label>
                                    <span className="text-xs font-mono text-slate-500">{settings.y}vh</span>
                                </div>
                                <input 
                                    type="range" min="-50" max="50" step="1" 
                                    value={settings.y}
                                    onChange={(e) => handleChange('y', parseFloat(e.target.value))}
                                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={applyWindowedPreset}
                                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium text-sm"
                            >
                                <Move className="w-4 h-4" />
                                <span>Windowed</span>
                            </button>
                            <button 
                                onClick={resetToAuto}
                                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium text-sm shadow-md shadow-indigo-200"
                            >
                                <Maximize className="w-4 h-4" />
                                <span>Auto Adapts</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

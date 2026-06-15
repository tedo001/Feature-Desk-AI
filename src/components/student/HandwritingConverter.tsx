import React, { useState } from 'react';
import { X, FileText, Loader, Copy, Download, Wand2 } from 'lucide-react';
import { convertHandwritingToText } from '../../lib/gemini';

interface HandwritingConverterProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function HandwritingConverter({ isOpen, onClose, canvasRef }: HandwritingConverterProps) {
  const [convertedText, setConvertedText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    if (!canvasRef.current) return;

    setIsConverting(true);
    setError('');
    setConvertedText('');

    try {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/png');
      const text = await convertHandwritingToText(imageData);
      setConvertedText(text);
    } catch (err) {
      setError('Failed to convert handwriting. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(convertedText);
  };

  const downloadAsText = () => {
    const blob = new Blob([convertedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Handwriting Converter</h2>
                <p className="text-blue-100 text-sm">Powered by Gemini 2.5 Flash</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Convert Button */}
          <div className="text-center">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {isConverting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Convert Handwriting to Text</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Click to analyze your handwritten notes and convert them to digital text
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              <p className="font-medium">Conversion Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Converted Text */}
          {convertedText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Converted Text</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {convertedText}
                </pre>
              </div>

              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl">
                <p className="text-sm">
                  ✓ Conversion completed successfully! You can now copy or download your digital notes.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!convertedText && !isConverting && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Write or draw on the canvas above</li>
                <li>• Click "Convert Handwriting to Text" button</li>
                <li>• AI will analyze and convert your handwriting</li>
                <li>• Copy or download the converted text</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
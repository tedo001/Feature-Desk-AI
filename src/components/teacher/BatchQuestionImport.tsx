import { useState, useRef } from 'react';
import {
    Upload,
    FileSpreadsheet,
    Check,
    X,
    AlertCircle,
    Download,
    Loader,
    FileText
} from 'lucide-react';

interface ImportedQuestion {
    id: string;
    question: string;
    type: 'mcq' | 'short_answer' | 'long_answer';
    options?: string[];
    correct?: number | string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    marks: number;
    status: 'valid' | 'invalid' | 'warning';
    errors?: string[];
}

interface BatchQuestionImportProps {
    subjectCode: string;
    classId: number;
    onImportComplete?: (questions: ImportedQuestion[]) => void;
    onClose?: () => void;
}

export default function BatchQuestionImport({
    subjectCode: _subjectCode,
    classId: _classId,
    onImportComplete,
    onClose
}: BatchQuestionImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [importedQuestions, setImportedQuestions] = useState<ImportedQuestion[]>([]);
    const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [_isStandalone] = useState(!onClose);

    // Download sample template
    const downloadTemplate = () => {
        const csvContent = `question,type,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks
"What is 2 + 2?",mcq,"3","4","5","6","B","Basic addition",easy,1
"Explain the water cycle",long_answer,,,,,,"Describe evaporation, condensation, and precipitation",medium,5
"Capital of France?",short_answer,,,,,"Paris","Geography question",easy,2
"Which planet is closest to the Sun?",mcq,"Venus","Mercury","Earth","Mars","B","Mercury is the closest",medium,2`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'question_import_template.csv';
        link.click();
    };

    // Parse CSV file
    const parseCSV = (text: string): ImportedQuestion[] => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

        const questions: ImportedQuestion[] = [];
        const parseErrors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                // Parse CSV line handling quoted values
                const values: string[] = [];
                let current = '';
                let inQuotes = false;

                for (const char of lines[i]) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());

                const rowData: Record<string, string> = {};
                headers.forEach((header, index) => {
                    rowData[header] = values[index]?.replace(/"/g, '') || '';
                });

                // Validate and create question
                const question = validateAndCreateQuestion(rowData, i + 1);
                questions.push(question);
            } catch (error) {
                parseErrors.push(`Row ${i + 1}: ${error}`);
            }
        }

        setErrors(parseErrors);
        return questions;
    };

    // Parse Excel file
    const parseExcel = async (file: File): Promise<ImportedQuestion[]> => {
        try {
            const XLSX = await import('xlsx');
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const questions: ImportedQuestion[] = [];

            jsonData.forEach((row: any, index: number) => {
                const question = validateAndCreateQuestion(row, index + 2);
                questions.push(question);
            });

            return questions;
        } catch (error) {
            setErrors([`Failed to parse Excel file: ${error}`]);
            return [];
        }
    };

    // Validate and create question from row data
    const validateAndCreateQuestion = (row: Record<string, any>, rowNum: number): ImportedQuestion => {
        const errors: string[] = [];

        // Required fields
        if (!row.question) errors.push('Question text is required');
        if (!row.type) errors.push('Question type is required');
        if (!row.marks) errors.push('Marks are required');

        const type = (row.type?.toLowerCase() || 'mcq') as 'mcq' | 'short_answer' | 'long_answer';

        // MCQ validation
        if (type === 'mcq') {
            const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
            if (options.length < 2) errors.push('MCQ requires at least 2 options');
            if (!row.correct_answer) errors.push('Correct answer is required for MCQ');
        }

        // Determine status
        let status: 'valid' | 'invalid' | 'warning' = 'valid';
        if (errors.length > 0) {
            status = errors.some(e => e.includes('required')) ? 'invalid' : 'warning';
        }

        return {
            id: `import_${Date.now()}_${rowNum}`,
            question: row.question || '',
            type,
            options: type === 'mcq'
                ? [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean)
                : undefined,
            correct: type === 'mcq'
                ? ['A', 'B', 'C', 'D'].indexOf(row.correct_answer?.toUpperCase())
                : row.correct_answer,
            explanation: row.explanation || '',
            difficulty: (row.difficulty?.toLowerCase() || 'medium') as 'easy' | 'medium' | 'hard',
            marks: parseInt(row.marks) || 1,
            status,
            errors: errors.length > 0 ? errors : undefined
        };
    };

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setImporting(true);
        setErrors([]);

        try {
            let questions: ImportedQuestion[] = [];

            if (uploadedFile.name.endsWith('.csv')) {
                const text = await uploadedFile.text();
                questions = parseCSV(text);
            } else if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
                questions = await parseExcel(uploadedFile);
            } else {
                setErrors(['Unsupported file format. Please use CSV or Excel (.xlsx, .xls)']);
                setImporting(false);
                return;
            }

            setImportedQuestions(questions);
            setStep('preview');
        } catch (error) {
            setErrors([`Failed to process file: ${error}`]);
        } finally {
            setImporting(false);
        }
    };

    // Remove question from import list
    const removeQuestion = (id: string) => {
        setImportedQuestions(prev => prev.filter(q => q.id !== id));
    };

    // Update question
    // const updateQuestion = (id: string, field: string, value: any) => {
    //     setImportedQuestions(prev => prev.map(q =>
    //         q.id === id ? { ...q, [field]: value, status: 'valid', errors: undefined } : q
    //     ));
    // };

    // Finalize import
    const finalizeImport = () => {
        const validQuestions = importedQuestions.filter(q => q.status !== 'invalid');
        onImportComplete?.(validQuestions);
        setStep('complete');
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'valid': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'invalid': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    // Standalone mode - no modal wrapper
    const content = (
        <>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8" />
                        <div>
                            <h2 className="text-xl font-bold">Batch Question Import</h2>
                            <p className="text-blue-100 text-sm">Import questions from CSV or Excel files</p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="space-y-6">
                        {/* Template Download */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h3 className="font-medium text-blue-800 mb-2">📋 Download Template</h3>
                            <p className="text-sm text-blue-600 mb-3">
                                Use our template to format your questions correctly. The template includes examples for MCQ, short answer, and long answer questions.
                            </p>
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download CSV Template
                            </button>
                        </div>

                        {/* File Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            {importing ? (
                                <div className="flex flex-col items-center">
                                    <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-600">Processing file...</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">
                                        <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-400">CSV, XLS, or XLSX files</p>
                                </>
                            )}
                        </div>

                        {/* Format Guide */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-medium text-gray-800 mb-3">📚 File Format Guide</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Required Columns:</h4>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                                        <li><code className="bg-gray-200 px-1 rounded">question</code> - Question text</li>
                                        <li><code className="bg-gray-200 px-1 rounded">type</code> - mcq, short_answer, long_answer</li>
                                        <li><code className="bg-gray-200 px-1 rounded">marks</code> - Points for the question</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Optional Columns:</h4>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                                        <li><code className="bg-gray-200 px-1 rounded">option_a/b/c/d</code> - For MCQ</li>
                                        <li><code className="bg-gray-200 px-1 rounded">correct_answer</code> - A/B/C/D or text</li>
                                        <li><code className="bg-gray-200 px-1 rounded">difficulty</code> - easy/medium/hard</li>
                                        <li><code className="bg-gray-200 px-1 rounded">explanation</code> - Answer explanation</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Errors */}
                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Import Errors
                                </h3>
                                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 'preview' && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                <FileText className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="font-medium">{file?.name}</p>
                                    <p className="text-sm text-gray-500">{importedQuestions.length} questions found</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                    {importedQuestions.filter(q => q.status === 'valid').length} Valid
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                                    {importedQuestions.filter(q => q.status === 'warning').length} Warnings
                                </span>
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                    {importedQuestions.filter(q => q.status === 'invalid').length} Invalid
                                </span>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-3">
                            {importedQuestions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className={`border rounded-xl p-4 ${question.status === 'invalid' ? 'border-red-300 bg-red-50/50' :
                                        question.status === 'warning' ? 'border-yellow-300 bg-yellow-50/50' :
                                            'border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-gray-500">Q{index + 1}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(question.status)}`}>
                                                    {question.status}
                                                </span>
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                    {question.type.toUpperCase()}
                                                </span>
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                    {question.difficulty}
                                                </span>
                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                                    {question.marks} marks
                                                </span>
                                            </div>

                                            <p className="text-gray-800 mb-2">{question.question}</p>

                                            {question.type === 'mcq' && question.options && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {question.options.map((opt, i) => (
                                                        <span
                                                            key={i}
                                                            className={`px-3 py-1 rounded-lg text-sm ${i === question.correct
                                                                ? 'bg-green-100 text-green-700 font-medium'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {String.fromCharCode(65 + i)}. {opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {question.errors && question.errors.length > 0 && (
                                                <div className="text-sm text-red-600 mt-2">
                                                    {question.errors.join(', ')}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => removeQuestion(question.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Complete */}
                {step === 'complete' && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Import Complete!</h3>
                        <p className="text-gray-600 mb-6">
                            Successfully imported {importedQuestions.filter(q => q.status !== 'invalid').length} questions
                        </p>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        )}
                        {!onClose && (
                            <button
                                onClick={() => {
                                    setStep('upload');
                                    setFile(null);
                                    setImportedQuestions([]);
                                }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Import More
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            {step === 'preview' && (
                <div className="border-t p-4 flex justify-between items-center bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={() => {
                            setStep('upload');
                            setFile(null);
                            setImportedQuestions([]);
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Upload Different File
                    </button>
                    <button
                        onClick={finalizeImport}
                        disabled={importedQuestions.filter(q => q.status !== 'invalid').length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" />
                        Import {importedQuestions.filter(q => q.status !== 'invalid').length} Questions
                    </button>
                </div>
            )}
        </>
    );

    // Modal mode when onClose is provided
    if (onClose) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {content}
                </div>
            </div>
        );
    }

    // Standalone mode - just render the content
    return (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            {content}
        </div>
    );
}

import { useState, useRef, useEffect } from 'react';
import {
    FileText,
    Image,
    Upload,
    Folder,
    Search,
    Trash2,
    Download,
    Plus,
    X,
    BookOpen,
    Sparkles
} from 'lucide-react';
import { fileToBase64, analyzePDF } from '../../lib/pdfProcessor';

interface StudyMaterial {
    id: string;
    title: string;
    type: 'pdf' | 'image' | 'document' | 'notes';
    subject: string;
    classId: number;
    fileName: string;
    fileSize: string;
    uploadedAt: Date;
    tags: string[];
    description?: string;
    base64Data?: string;
    aiSummary?: string;
    keyTopics?: string[];
}

interface StudyMaterialsProps {
    classId: number;
    subjects: string[];
}

export default function StudyMaterialsManager({ classId, subjects }: StudyMaterialsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        title: '',
        subject: subjects[0] || 'MATH',
        targetClass: classId,
        tags: [] as string[],
        description: '',
        newTag: ''
    });
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>('');

    // Load materials from localStorage (in production, use database)
    useEffect(() => {
        const saved = localStorage.getItem(`study_materials_${classId}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMaterials(parsed.map((m: any) => ({
                    ...m,
                    uploadedAt: new Date(m.uploadedAt)
                })));
            } catch (e) {
                console.error('Failed to load materials:', e);
            }
        }
    }, [classId]);

    // Save materials to localStorage
    const saveMaterials = (newMaterials: StudyMaterial[]) => {
        localStorage.setItem(`study_materials_${classId}`, JSON.stringify(newMaterials));
        setMaterials(newMaterials);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setUploadForm(prev => ({
            ...prev,
            title: file.name.replace(/\.[^/.]+$/, '')
        }));

        // Create preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setFilePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            setFilePreview('pdf');
        } else {
            setFilePreview('document');
        }
    };

    const handleUpload = async () => {
        if (!uploadedFile || !uploadForm.title) return;

        setLoading(true);
        setUploadProgress(10);

        try {
            // Convert file to base64
            const base64 = await fileToBase64(uploadedFile);
            setUploadProgress(40);

            let aiSummary = '';
            let keyTopics: string[] = [];

            // If PDF, get AI analysis
            if (uploadedFile.type === 'application/pdf') {
                setUploadProgress(60);
                try {
                    // Get summary and topics separately
                    const summaryResult = await analyzePDF(base64, 'summary');
                    const topicsResult = await analyzePDF(base64, 'topics');

                    if (summaryResult.success && summaryResult.result) {
                        aiSummary = summaryResult.result.substring(0, 500); // Limit to 500 chars
                    }
                    if (topicsResult.success && topicsResult.result) {
                        // Parse topics from string response
                        keyTopics = topicsResult.result.split('\n').filter(t => t.trim()).slice(0, 5);
                    }
                } catch (e) {
                    console.error('AI analysis failed:', e);
                }
            }

            setUploadProgress(80);

            const newMaterial: StudyMaterial = {
                id: Date.now().toString(),
                title: uploadForm.title,
                type: uploadedFile.type.includes('pdf') ? 'pdf' :
                    uploadedFile.type.startsWith('image/') ? 'image' : 'document',
                subject: uploadForm.subject,
                classId: uploadForm.targetClass,
                fileName: uploadedFile.name,
                fileSize: formatFileSize(uploadedFile.size),
                uploadedAt: new Date(),
                tags: uploadForm.tags,
                description: uploadForm.description,
                base64Data: base64,
                aiSummary,
                keyTopics
            };

            setUploadProgress(100);
            saveMaterials([...materials, newMaterial]);

            // Reset form
            setShowUploadModal(false);
            setUploadedFile(null);
            setFilePreview('');
            setUploadForm({
                title: '',
                subject: subjects[0] || 'MATH',
                targetClass: classId,
                tags: [],
                description: '',
                newTag: ''
            });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload material. Please try again.');
        }

        setLoading(false);
        setUploadProgress(0);
    };

    const handleAddTag = () => {
        if (uploadForm.newTag && !uploadForm.tags.includes(uploadForm.newTag)) {
            setUploadForm(prev => ({
                ...prev,
                tags: [...prev.tags, prev.newTag],
                newTag: ''
            }));
        }
    };

    const handleRemoveTag = (tag: string) => {
        setUploadForm(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleDeleteMaterial = (id: string) => {
        if (confirm('Are you sure you want to delete this material?')) {
            saveMaterials(materials.filter(m => m.id !== id));
            setSelectedMaterial(null);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
            case 'image': return <Image className="w-8 h-8 text-blue-500" />;
            default: return <BookOpen className="w-8 h-8 text-purple-500" />;
        }
    };

    const filteredMaterials = materials.filter(m => {
        const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
        const matchesSearch = !searchQuery ||
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSubject && matchesSearch;
    });

    const getSubjectName = (code: string) => {
        const names: { [key: string]: string } = {
            'MATH': 'Mathematics',
            'SCIENCE': 'Science',
            'ENGLISH': 'English',
            'HINDI': 'Hindi',
            'SOCIAL': 'Social Studies',
            'COMPUTER': 'Computer Science'
        };
        return names[code] || code;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
                    <p className="text-gray-600">Upload and manage study materials for your students</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Upload Material</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                >
                    <option value="all">All Subjects</option>
                    {subjects.map(s => (
                        <option key={s} value={s}>{getSubjectName(s)}</option>
                    ))}
                </select>
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">No materials uploaded yet</h3>
                    <p className="text-gray-500 mb-4">Upload PDFs, images, or documents to get started</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Upload First Material
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMaterials.map(material => (
                        <div
                            key={material.id}
                            onClick={() => setSelectedMaterial(material)}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors">
                                    {getFileIcon(material.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
                                    <p className="text-sm text-gray-500">{getSubjectName(material.subject)} • Class {material.classId}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {material.fileSize} • {material.uploadedAt.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {material.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {material.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                    {material.tags.length > 3 && (
                                        <span className="text-xs text-gray-400">+{material.tags.length - 3} more</span>
                                    )}
                                </div>
                            )}
                            {material.aiSummary && (
                                <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                    <div className="flex items-center space-x-1 text-xs text-purple-600 mb-1">
                                        <Sparkles className="w-3 h-3" />
                                        <span>AI Summary</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">{material.aiSummary}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Upload Study Material</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* File Upload Area */}
                            {!uploadedFile ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                                >
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="font-medium text-gray-700">Click to upload or drag & drop</p>
                                    <p className="text-sm text-gray-500 mt-1">PDF, Images, or Documents (Max 50MB)</p>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                                    {filePreview === 'pdf' ? (
                                        <FileText className="w-12 h-12 text-red-500" />
                                    ) : filePreview === 'document' ? (
                                        <BookOpen className="w-12 h-12 text-purple-500" />
                                    ) : (
                                        <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                        <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setUploadedFile(null);
                                            setFilePreview('');
                                        }}
                                        className="p-2 hover:bg-gray-200 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter material title"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Subject & Class */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <select
                                        value={uploadForm.subject}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    >
                                        {subjects.map(s => (
                                            <option key={s} value={s}>{getSubjectName(s)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select
                                        value={uploadForm.targetClass}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, targetClass: Number(e.target.value) }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                                            <option key={c} value={c}>Class {c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {uploadForm.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                        >
                                            <span>{tag}</span>
                                            <button onClick={() => handleRemoveTag(tag)}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={uploadForm.newTag}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, newTag: e.target.value }))}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        placeholder="Add a tag..."
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of the material..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* AI Analysis Note */}
                            <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-purple-700">AI-Powered Analysis</p>
                                    <p className="text-xs text-purple-600">PDFs will be automatically analyzed to generate summaries and extract key topics for better student learning.</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {loading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Uploading & Analyzing...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={loading || !uploadedFile || !uploadForm.title}
                                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        <span>Upload Material</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Material Detail Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {getFileIcon(selectedMaterial.type)}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedMaterial.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {getSubjectName(selectedMaterial.subject)} • Class {selectedMaterial.classId}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMaterial(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* File Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-500">File Name</p>
                                    <p className="font-medium text-gray-900">{selectedMaterial.fileName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">File Size</p>
                                    <p className="font-medium text-gray-900">{selectedMaterial.fileSize}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Uploaded</p>
                                    <p className="font-medium text-gray-900">
                                        {selectedMaterial.uploadedAt.toLocaleDateString()} at {selectedMaterial.uploadedAt.toLocaleTimeString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Type</p>
                                    <p className="font-medium text-gray-900 capitalize">{selectedMaterial.type}</p>
                                </div>
                            </div>

                            {/* Tags */}
                            {selectedMaterial.tags.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMaterial.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {selectedMaterial.description && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                                    <p className="text-gray-600">{selectedMaterial.description}</p>
                                </div>
                            )}

                            {/* AI Summary */}
                            {selectedMaterial.aiSummary && (
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Sparkles className="w-5 h-5 text-purple-500" />
                                        <p className="font-medium text-purple-700">AI Summary</p>
                                    </div>
                                    <p className="text-gray-700">{selectedMaterial.aiSummary}</p>
                                </div>
                            )}

                            {/* Key Topics */}
                            {selectedMaterial.keyTopics && selectedMaterial.keyTopics.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Key Topics</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMaterial.keyTopics.map((topic, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-between">
                            <button
                                onClick={() => handleDeleteMaterial(selectedMaterial.id)}
                                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSelectedMaterial(null)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                {selectedMaterial.base64Data && (
                                    <a
                                        href={`data:application/octet-stream;base64,${selectedMaterial.base64Data}`}
                                        download={selectedMaterial.fileName}
                                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { supabase } from './supabase';
import { cloudinaryService } from './cloudinaryService';

// ===================================================================
// Question Database Service
// ===================================================================
// Stores and retrieves AI-generated questions organized by Class & Subject
// Questions are ONLY generated from teacher-uploaded materials
// ===================================================================
// Data Storage Strategy:
//   Supabase: Metadata, Question JSON (JSONB columns)
//   Cloudinary: Media files (PDFs, images uploaded by teachers)
//   Firebase Firestore: Chat history only (kept separate)
// ===================================================================

export interface GeneratedQuestion {
    id: string;
    type: 'mcq' | 'short_answer' | 'long_answer';
    question: string;
    options?: string[];
    correct?: number;
    expectedAnswer?: string;
    rubric?: string[];
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    bloomsLevel?: string;
    marks: number;
    sourceContentId: string;      // Reference to the source material
    sourceContentTitle: string;   // Title of the book/notes
    topic?: string;
    imageUrl?: string;
    needsImage?: boolean;
    createdAt: Date;
}

export interface QuestionBank {
    id: string;
    classId: number;
    subject: string;
    lessonTitle: string;
    sourceContentId: string;
    questions: GeneratedQuestion[];
    totalQuestions: number;
    createdAt: Date;
    updatedAt: Date;
    generatedBy: string;  // Teacher ID who approved/generated
}

export interface UploadedMaterial {
    id: string;
    teacherId: string;
    classId: number;
    subject: string;
    title: string;
    type: 'pdf' | 'notes' | 'book';
    content: string;         // Extracted text content for AI processing
    fileUrl?: string;
    hasGeneratedQuestions: boolean;
    uploadedAt: Date;
}

// ===================================================================
// UPLOADED MATERIALS MANAGEMENT
// ===================================================================

/**
 * Save uploaded teaching material (Notes/Books) for question generation
 * Large text content is stored in Supabase JSONB column.
 * If a file (PDF/image) is uploaded, it goes to Cloudinary.
 */
export const saveTeachingMaterial = async (
    teacherId: string,
    material: {
        classId: number;
        subject: string;
        title: string;
        type: 'pdf' | 'notes' | 'book';
        content: string;
        fileUrl?: string;
    }
): Promise<{ success: boolean; materialId?: string; error?: string }> => {
    try {
        const materialId = `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date();

        // If there's a file to upload (PDF/image), upload to Cloudinary
        // Note: fileUrl is already a Cloudinary URL if uploaded from ContentManager

        // Save metadata + content to Supabase
        const { error } = await supabase.from('teaching_materials_meta').insert({
            id: materialId,
            teacher_id: teacherId,
            class_id: material.classId,
            subject: material.subject,
            title: material.title,
            type: material.type,
            content_text: material.content, // Store extracted text for AI processing
            file_url: material.fileUrl || '',
            has_questions: false,
            created_at: timestamp.toISOString()
        });

        if (error) {
            console.error('❌ Supabase save failed:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Teaching material saved to Supabase:', materialId);
        return { success: true, materialId };
    } catch (error) {
        console.error('❌ Error saving teaching material:', error);
        return { success: false, error: String(error) };
    }
};

/**
 * Get uploaded materials for a specific class and subject
 */
export const getTeachingMaterials = async (
    classId: number,
    subject: string
): Promise<UploadedMaterial[]> => {
    try {
        const { data, error } = await supabase
            .from('teaching_materials_meta')
            .select('*')
            .eq('class_id', classId)
            .eq('subject', subject);

        if (error) throw error;
        if (!data || data.length === 0) return [];

        return data.map((m: any) => ({
            id: m.id,
            teacherId: m.teacher_id,
            classId: m.class_id,
            subject: m.subject,
            title: m.title,
            type: m.type,
            content: m.content_text || '',
            fileUrl: m.file_url || '',
            hasGeneratedQuestions: m.has_questions,
            uploadedAt: new Date(m.created_at)
        }));
    } catch (error) {
        console.error('Error fetching teaching materials:', error);
        return [];
    }
};

/**
 * Check if a class+subject has at least one uploaded material
 */
export const hasUploadedMaterials = async (
    classId: number,
    subject: string
): Promise<boolean> => {
    try {
        const { count, error } = await supabase
            .from('teaching_materials_meta')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classId)
            .eq('subject', subject);

        if (error) throw error;
        return (count || 0) > 0;
    } catch (error) {
        console.error('Error checking materials:', error);
        return false;
    }
};

// ===================================================================
// QUESTION BANK MANAGEMENT
// ===================================================================

/**
 * Save AI-generated questions to the question bank
 * Questions stored as JSONB in Supabase (efficient for text data)
 */
export const saveGeneratedQuestions = async (
    teacherId: string,
    data: {
        classId: number;
        subject: string;
        lessonTitle: string;
        sourceContentId: string;
        questions: GeneratedQuestion[];
    }
): Promise<{ success: boolean; questionBankId?: string; error?: string }> => {
    try {
        const questionBankId = `qb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const questionBank: QuestionBank = {
            id: questionBankId,
            classId: data.classId,
            subject: data.subject,
            lessonTitle: data.lessonTitle,
            sourceContentId: data.sourceContentId,
            questions: data.questions,
            totalQuestions: data.questions.length,
            createdAt: new Date(),
            updatedAt: new Date(),
            generatedBy: teacherId
        };

        // Save question bank as JSONB in Supabase
        const { error: qbError } = await supabase.from('question_banks').insert({
            id: questionBankId,
            class_id: data.classId,
            subject: data.subject,
            lesson_title: data.lessonTitle,
            source_content_id: data.sourceContentId,
            questions_data: questionBank, // JSONB column stores entire bank
            total_questions: data.questions.length,
            generated_by: teacherId,
            created_at: new Date().toISOString()
        });

        if (qbError) {
            console.error('❌ Failed to save question bank to Supabase:', qbError);
            // Fallback: upload as JSON to Cloudinary
            try {
                const jsonBlob = new Blob([JSON.stringify(questionBank)], { type: 'application/json' });
                const cloudUrl = await cloudinaryService.uploadFile(jsonBlob, `question_banks`);
                console.log('✅ Question Bank saved to Cloudinary (fallback):', cloudUrl);
            } catch (cloudErr) {
                console.error('❌ Cloudinary fallback also failed:', cloudErr);
            }
        } else {
            console.log('✅ Question Bank saved to Supabase:', questionBankId);
        }

        // Update metadata
        const { error: metaError } = await supabase
            .from('teaching_materials_meta')
            .update({ has_questions: true })
            .eq('id', data.sourceContentId);

        if (metaError) {
            console.error('❌ Failed to update metadata:', metaError);
        }

        return { success: true, questionBankId };
    } catch (error) {
        console.error('❌ Error saving question bank:', error);
        return { success: false, error: String(error) };
    }
};

/**
 * Get all questions for a specific class and subject
 */
export const getQuestionsForClassSubject = async (
    classId: number,
    subject: string
): Promise<{ questions: GeneratedQuestion[]; hasContent: boolean }> => {
    try {
        // 1. Check if materials exist
        const materials = await getTeachingMaterials(classId, subject);

        if (materials.length === 0) {
            console.log(`⚠️ No materials uploaded for Class ${classId}, ${subject}`);
            return { questions: [], hasContent: false };
        }

        // 2. Fetch question banks from Supabase
        const { data: banks, error } = await supabase
            .from('question_banks')
            .select('questions_data')
            .eq('class_id', classId)
            .eq('subject', subject);

        if (error) {
            console.error('Error fetching question banks:', error);
            return { questions: [], hasContent: true };
        }

        const allQuestions: GeneratedQuestion[] = [];

        if (banks && banks.length > 0) {
            banks.forEach((bank: any) => {
                if (bank.questions_data?.questions) {
                    allQuestions.push(...bank.questions_data.questions);
                }
            });
        }

        console.log(`✅ Found ${allQuestions.length} questions for Class ${classId}, ${subject}`);
        return { questions: allQuestions, hasContent: true };
    } catch (error) {
        console.error('Error fetching questions:', error);
        return { questions: [], hasContent: false };
    }
};

/**
 * Get random quiz questions from available question banks
 */
export const getRandomQuizQuestions = async (
    classId: number,
    subject: string,
    count: number = 5,
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
): Promise<{ questions: GeneratedQuestion[]; available: boolean; message: string }> => {
    try {
        const { questions, hasContent } = await getQuestionsForClassSubject(classId, subject);

        if (!hasContent) {
            return {
                questions: [],
                available: false,
                message: `No teaching materials have been uploaded for Class ${classId} ${subject}. Please ask your teacher to upload notes or books first.`
            };
        }

        if (questions.length === 0) {
            return {
                questions: [],
                available: false,
                message: `Materials are available but no questions have been generated yet. Please wait for your teacher to generate questions from the uploaded content.`
            };
        }

        // Filter by difficulty if specified
        let filteredQuestions = questions;
        if (difficulty && difficulty !== 'mixed') {
            filteredQuestions = questions.filter(q => q.difficulty === difficulty);
        }

        if (filteredQuestions.length < count) {
            filteredQuestions = questions;
        }

        // Shuffle and pick random questions
        const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        return {
            questions: selected,
            available: true,
            message: `Loaded ${selected.length} questions from your class materials.`
        };
    } catch (error) {
        console.error('Error getting random questions:', error);
        return {
            questions: [],
            available: false,
            message: 'Error loading questions. Please try again.'
        };
    }
};

/**
 * Get question statistics for a class
 */
export const getQuestionStats = async (
    classId: number,
    subject?: string
): Promise<{
    totalMaterials: number;
    totalQuestionBanks: number;
    totalQuestions: number;
    byDifficulty: { easy: number; medium: number; hard: number };
    byType: { mcq: number; short_answer: number; long_answer: number };
}> => {
    try {
        // Get materials count
        let matQuery = supabase.from('teaching_materials_meta').select('*').eq('class_id', classId);
        if (subject) matQuery = matQuery.eq('subject', subject);
        const { data: metaData } = await matQuery;

        if (!metaData) return { totalMaterials: 0, totalQuestionBanks: 0, totalQuestions: 0, byDifficulty: { easy: 0, medium: 0, hard: 0 }, byType: { mcq: 0, short_answer: 0, long_answer: 0 } };

        // Get question banks from Supabase
        let qbQuery = supabase.from('question_banks').select('questions_data').eq('class_id', classId);
        if (subject) qbQuery = qbQuery.eq('subject', subject);
        const { data: banks } = await qbQuery;

        let totalQuestions = 0;
        const byDifficulty = { easy: 0, medium: 0, hard: 0 };
        const byType = { mcq: 0, short_answer: 0, long_answer: 0 };

        if (banks) {
            banks.forEach((bank: any) => {
                if (bank.questions_data?.questions) {
                    totalQuestions += bank.questions_data.questions.length;
                    bank.questions_data.questions.forEach((q: GeneratedQuestion) => {
                        if (q.difficulty in byDifficulty) byDifficulty[q.difficulty]++;
                        if (q.type in byType) byType[q.type]++;
                    });
                }
            });
        }

        return {
            totalMaterials: metaData.length,
            totalQuestionBanks: banks?.length || 0,
            totalQuestions,
            byDifficulty,
            byType
        };
    } catch (error) {
        console.error('Error getting question stats:', error);
        return {
            totalMaterials: 0,
            totalQuestionBanks: 0,
            totalQuestions: 0,
            byDifficulty: { easy: 0, medium: 0, hard: 0 },
            byType: { mcq: 0, short_answer: 0, long_answer: 0 }
        };
    }
};

// ===================================================================
// LEARNING METHOD GENERATION
// ===================================================================

export interface LearningMethod {
    id: string;
    classId: number;
    subject: string;
    lessonTitle: string;
    sourceContentId: string;
    summary: string;
    keyPoints: string[];
    studyTips: string[];
    practiceExercises: string[];
    estimatedDuration: string;
    createdAt: Date;
    createdBy?: string;  // Teacher ID
}

/**
 * Save AI-generated learning methods based on uploaded materials
 * Stored in Supabase as JSONB (text-efficient)
 */
export const saveLearningMethod = async (
    teacherId: string,
    method: Omit<LearningMethod, 'id' | 'createdAt' | 'createdBy'>
): Promise<{ success: boolean; methodId?: string }> => {
    try {
        const methodId = `lm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const learningMethod: LearningMethod = {
            ...method,
            id: methodId,
            createdAt: new Date(),
            createdBy: teacherId
        };

        // Save to Supabase
        const { error } = await supabase.from('learning_methods').insert({
            id: methodId,
            class_id: method.classId,
            subject: method.subject,
            lesson_title: method.lessonTitle,
            source_content_id: method.sourceContentId,
            method_data: learningMethod, // JSONB column
            created_by: teacherId,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('❌ Failed to save learning method to Supabase:', error);
            return { success: false };
        }

        console.log('✅ Learning method saved to Supabase:', methodId);
        return { success: true, methodId };
    } catch (error) {
        console.error('Error saving learning method:', error);
        return { success: false };
    }
};

/**
 * Get learning methods for a class and subject
 */
export const getLearningMethods = async (
    classId: number,
    subject: string
): Promise<LearningMethod[]> => {
    try {
        const { data, error } = await supabase
            .from('learning_methods')
            .select('method_data')
            .eq('class_id', classId)
            .eq('subject', subject)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching learning methods:', error);
            return [];
        }

        if (!data || data.length === 0) return [];

        return data
            .map((row: any) => row.method_data as LearningMethod)
            .filter((m: any) => m !== null);
    } catch (error) {
        console.error('Error fetching learning methods:', error);
        return [];
    }
};

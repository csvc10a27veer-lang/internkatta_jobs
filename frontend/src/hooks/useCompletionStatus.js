import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useUserAuth } from '../context/UserAuthContext';

export const useCompletionStatus = (itemId, itemType = 'internship') => {
    const [isCompleted, setIsCompleted] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completionData, setCompletionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { auth } = useUserAuth();

    useEffect(() => {
        const checkCompletionStatus = async () => {
            if (!auth?.user?._id || !auth?.token || !itemId) {
                setLoading(false);
                return;
            }

            try {
                const endpoint = itemType === 'internship' 
                    ? `/api/users/internship-progress/${itemId}`
                    : `/api/users/course-progress/${itemId}`;
                
                const response = await api.get(endpoint, {
                    headers: { 'user-authorization': `Bearer ${auth.token}` }
                });

                const progress = response.data.progress;
                const item = response.data[itemType];
                const currentlyEnrolled = response.data.isEnrolled;
                
                if (currentlyEnrolled && progress && item) {
                    setIsEnrolled(true);
                    
                    // Check if all lectures are completed
                    let totalLectures = 0;
                    let completedLectures = 0;
                    
                    if (itemType === 'course') {
                        // For courses, count lectures from all sections
                        totalLectures = item.sections?.reduce((count, section) => count + (section.lectures?.length || 0), 0) || 0;
                        completedLectures = progress.completedLectures?.length || 0;
                    } else {
                        // For internships, use direct lectures
                        totalLectures = item.lectures?.length || 0;
                        completedLectures = progress.completedLectures?.filter(
                            lecture => lecture.status === 'Completed'
                        ).length || 0;
                    }
                    
                    const isFullyCompleted = totalLectures > 0 && completedLectures === totalLectures;
                    
                    setIsCompleted(isFullyCompleted);
                    
                    if (isFullyCompleted) {
                        setCompletionData({
                            completedDate: new Date().toISOString(),
                            progress: progress,
                            item: item
                        });
                    }
                } else {
                    setIsEnrolled(false);
                    setIsCompleted(false);
                }
            } catch (error) {
                console.error('Error checking completion status:', error);
                setIsCompleted(false);
                setIsEnrolled(false);
            } finally {
                setLoading(false);
            }
        };

        checkCompletionStatus();
    }, [itemId, itemType, auth?.user?._id, auth?.token]);

    return { isCompleted, isEnrolled, completionData, loading };
};

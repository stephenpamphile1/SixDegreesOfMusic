import axios from "axios";
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';


export const useGameProgress = () => {
    const { token } = useAuth();
    const [saving, setSaving] = useState(false);

    const saveProgress = async (puzzleData: {
        puzzleId: string;
        currentPath: string[];
        startingArtist: string;
        targetArtist: string;
        completed?: boolean;
    }) => {
        if (!token) return;

        setSaving(true);

        try {
            await axios.post(
                `${apiBaseUrl}/saveProgress`,
                {
                    ...puzzleData,
                    lastPlayed: new Date().toISOString(),
                    attempts: (puzzleData.attempts || 0) + 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.error('Failed to save progress:', error);
        } finally {
            setSaving(false);
        }
    };

    const loadProgress = async () => {
        if (!token) return null;

        try {
            const response = await axios.get(`${apiBaseUrl}/getProgress`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return null;
        }
    };

    return {
        saveProgress,
        loadProgress,
        saving
    };
};

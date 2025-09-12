import axios from "axios";
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';


export const useGameProgress = () => {
    const { token, user } = useAuth();
    const [saving, setSaving] = useState(false);
    const apiBaseUrl = "http://192.168.1.142:8080/api";

    const saveProgress = async (puzzleData: {
        puzzleId: string;
        currentPath: string[];
        startingArtist: string;
        targetArtist: string;
        completed?: boolean;
        timeSpentSeconds?: number;
        incorrectGuesses?: string[];
        playlistId?: string;
        userId?: string;
    }) => {
        if (!token) return;

        setSaving(true);

        try {
            const requestBody = {
                userId: user?.id,
                gameProgress: puzzleData,
                playlistId: puzzleData.playlistId,
                lastPlayed: new Date().toISOString(),
            };
            console.log('Saving progress:', requestBody);
            const response = await axios.post(
                `${apiBaseUrl}/saveProgress`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to save progress:', error);
            throw error;
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

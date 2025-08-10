export interface ArtistPathResponse {
    path: string[];
}

import axios from 'axios';

const BASE_URL = "http://localhost:8080/api/";

export const getArtistsToMatch = async (): Promise<ArtistPathResponse> => {
    try {
        const response = await axios.post<ArtistPathResponse>(
            `${BASE_URL}/getArtistsToMatch`
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching artists to match:', error);

        throw error;
    }
}

export const fetchAndDisplayArtists = async () => {
    try {
        const { path } = await getArtistsToMatch();

        return {
            startingArtist: path[0],
            targetArtist: path[path.length - 1],
            fullPath: path
        }
    } catch (error) {
        console.error('Failed to fetch artists:', error);

        return null;
    }
}
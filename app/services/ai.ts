import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AI_API_URL;

const TYPES = {
    CONTEXT: 'context',
    REFLECTION: 'reflection'
}

const getContextResponse = async (book: string, chapter: string, version: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/response`, {
            type: TYPES.CONTEXT,
            book,
            chapter,
            version
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching context response:", error);
        throw error;
    }
}

const getReflectionResponse = async (book: string, chapter: string, version: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/response`, {
            type: TYPES.REFLECTION,
            book,
            chapter,
            version
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching reflection response:", error);
        throw error;
    }
}

export { getContextResponse, getReflectionResponse };
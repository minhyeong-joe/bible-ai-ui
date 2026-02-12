import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AI_API_URL;
const API_KEY = import.meta.env.VITE_AI_API_KEY;

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
        }, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return { status: error.response.status, data: error.response.data };
        }
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
        }, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        console.error("Error fetching reflection response:", error);
        throw error;
    }
}

export { getContextResponse, getReflectionResponse };
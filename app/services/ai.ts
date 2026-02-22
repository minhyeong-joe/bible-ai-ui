import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AI_API_URL;
const API_KEY = import.meta.env.VITE_AI_API_KEY;

const TYPES = {
    CONTEXT: 'context',
    REFLECTION: 'reflection'
}

const warmUpServer = async () => {
    try {
        await axios.get(`${API_BASE_URL}`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
    } catch (error) {
        console.error("Error warming up server:", error);
    }
};

const getContextResponse = async (book: string, chapter: string, version: string, language: string = 'English') => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/response`, {
            type: TYPES.CONTEXT,
            book,
            chapter,
            version,
            language
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

const getReflectionResponse = async (book: string, chapter: string, version: string, language: string = 'English') => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/response`, {
            type: TYPES.REFLECTION,
            book,
            chapter,
            version,
            language
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

export { warmUpServer,getContextResponse, getReflectionResponse };
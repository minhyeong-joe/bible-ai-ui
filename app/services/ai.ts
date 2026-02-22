import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AI_API_URL;
const API_KEY = import.meta.env.VITE_AI_API_KEY;

const TYPES = {
    CONTEXT: 'context',
    REFLECTION: 'reflection'
}

const WARM_UP_RETRY_DELAY_MS = 5000;

const warmUpServer = async (): Promise<void> => {
    while (true) {
        try {
            await axios.get(`${API_BASE_URL}`, {
                headers: { 'x-api-key': API_KEY },
                timeout: 10000,
            });
            return; // server is up
        } catch {
            console.warn(`Server not ready — retrying in ${WARM_UP_RETRY_DELAY_MS / 1000}s…`);
            await new Promise((resolve) => setTimeout(resolve, WARM_UP_RETRY_DELAY_MS));
        }
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
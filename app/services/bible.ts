import axios from "axios"

export interface BibleVersionResponse {
    translations: BibleVersion[];
}

export interface BibleVersion {
    identifier: string;
    name: string;
    language: string;
    language_code: string;
    license: string;
    url: string;
}

export interface Translation {
    identifier: string;
    name: string;
    language: string;
    language_code: string;
    license: string;
}

export interface Book {
    id: string;
    name: string;
    url: string;
}

export interface BooksResponse {
    translation: Translation;
    books: Book[];
}

export interface Chapter {
    book_id: string;
    book: string;
    chapter: number;
    url: string;
}

export interface ChaptersResponse {
    translation: Translation;
    chapters: Chapter[];
}

export interface Verse {
    book_id: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface VersesResponse {
    translation: Translation;
    verses: Verse[];
}

const API_BASE_URL = import.meta.env.VITE_BIBLE_API_URL;

const fetchVersions = async (): Promise<BibleVersionResponse> => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching Bible versions:", error);
        throw error;
    }
}

const fetchBooks = async (version: string): Promise<BooksResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${version}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching books for version ${version}:`, error);
        throw error;
    }
}

const fetchChapters = async (version: string, bookId: string): Promise<ChaptersResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${version}/${bookId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching chapters for ${version}/${bookId}:`, error);
        throw error;
    }
}

const fetchVerses = async (version: string, bookId: string, chapter: number): Promise<VersesResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${version}/${bookId}/${chapter}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching verses for ${version}/${bookId}/${chapter}:`, error);
        throw error;
    }
}

export { 
    fetchVersions, 
    fetchBooks, 
    fetchChapters, 
    fetchVerses
};
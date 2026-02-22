import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export const LANGUAGES = ["English", "한국어", "中文"] as const;
export type LanguageType = (typeof LANGUAGES)[number];

export const UI_TEXT = {
	header: {
		title: {
			English: "Welcome to Bible AI",
			한국어: "바이블 AI에 오신 것을 환영합니다",
			中文: "欢迎来到 Bible AI",
		},
		description: {
			English:
				"Read the Bible with deeper understanding. Get helpful background insights and thoughtful reflection questions for every passage.",
			한국어:
				"성경을 더 깊이 이해하고 묵상할 수 있도록 돕는 도우미입니다. 각 본문마다 이해를 돕는 배경 설명과 생각해 볼 질문을 제공합니다.",
			中文: "帮助您更深入地理解和默想圣经。为每段经文提供背景说明与引导思考的问题，让阅读更加扎实而有意义。",
		},
	},
	navigation: {
		prev: {
			English: "Prev",
			한국어: "이전 장",
			中文: "上一章",
		},
		next: {
			English: "Next",
			한국어: "다음 장",
			中文: "下一章",
		},
	},
	aiTools: {
		tabs: {
			context: {
				English: "Summary & Context",
				한국어: "요약 및 배경",
				中文: "摘要与背景",
			},
			reflection: {
				English: "Reflection Questions",
				한국어: "묵상 질문",
				中文: "反思问题",
			},
		},
	},
} as const;

interface LanguageContextValue {
	language: LanguageType;
	setLanguage: (lang: LanguageType) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
	undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguage] = useLocalStorage<LanguageType>(
		"bible-ai:language",
		"한국어",
	);

	return (
		<LanguageContext.Provider value={{ language, setLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguageContext() {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error(
			"useLanguageContext must be used within a LanguageProvider",
		);
	}
	return context;
}

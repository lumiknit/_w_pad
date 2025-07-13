import { StreamLanguage, type LanguageSupport } from '@codemirror/language';
import type { Extension } from '@codemirror/state';

export const fileExtensionToLanguage: Record<string, string> = {
	bat: 'batch',
	c: 'c',
	cc: 'cpp',
	cpp: 'cpp',
	csharp: 'csharp',
	css: 'css',
	env: 'dotenv',
	fish: 'fish',
	go: 'go',
	groovy: 'groovy',
	h: 'cpp',
	hpp: 'cpp',
	hs: 'haskell',
	html: 'html',
	java: 'java',
	javascript: 'javascript',
	js: 'javascript',
	json: 'json',
	json5: 'json5',
	jsx: 'jsx',
	kt: 'kotlin',
	less: 'less',
	lua: 'lua',
	markdown: 'markdown',
	md: 'markdown',
	ml: 'ocaml',
	mli: 'ocaml',
	perl: 'perl',
	php: 'php',
	pl: 'prolog',
	ps1: 'powershell',
	py: 'python',
	python: 'python',
	rb: 'ruby',
	rs: 'rust',
	ruby: 'ruby',
	scss: 'scss',
	sh: 'shell',
	svg: 'svg',
	swift: 'swift',
	toml: 'toml',
	ts: 'typescript',
	tsx: 'tsx',
	wasm: 'wasm',
	wat: 'wat',
	xhtml: 'html',
	xml: 'xml',
	yaml: 'yaml',
	yml: 'yaml',
	zsh: 'shell',
};

export const getLanguageFromName = (filename: string): string => {
	const extension = filename.split('.').pop()?.toLowerCase();
	if (extension && fileExtensionToLanguage[extension]) {
		return fileExtensionToLanguage[extension];
	}
	return 'plaintext'; // Default language if no match found
};

const langMap: {
	[key: string]: () => Promise<LanguageSupport | StreamLanguage<unknown>>;
} = {
	// CM6 languages
	javascript: () =>
		import('@codemirror/lang-javascript').then((mod) => mod.javascript()),
	typescript: () =>
		import('@codemirror/lang-javascript').then((mod) =>
			mod.javascript({ typescript: true })
		),
	jsx: () =>
		import('@codemirror/lang-javascript').then((mod) =>
			mod.javascript({ jsx: true })
		),
	tsx: () =>
		import('@codemirror/lang-javascript').then((mod) =>
			mod.javascript({ jsx: true, typescript: true })
		),
	python: () => import('@codemirror/lang-python').then((mod) => mod.python()),
	markdown: () =>
		import('@codemirror/lang-markdown').then((mod) => mod.markdown()),
	yaml: () => import('@codemirror/lang-yaml').then((mod) => mod.yaml()),
	go: () => import('@codemirror/lang-go').then((mod) => mod.go()),
	wast: () => import('@codemirror/lang-wast').then((mod) => mod.wast()),
	rust: () => import('@codemirror/lang-rust').then((mod) => mod.rust()),
	json: () => import('@codemirror/lang-json').then((mod) => mod.json()),
	css: () => import('@codemirror/lang-css').then((mod) => mod.css()),
	sass: () => import('@codemirror/lang-sass').then((mod) => mod.sass()),
	scss: () => import('@codemirror/lang-sass').then((mod) => mod.sass()),

	// Legacy languages
	c: () =>
		import('@codemirror/legacy-modes/mode/clike').then((mod) =>
			StreamLanguage.define(mod.c)
		),
	cpp: () =>
		import('@codemirror/legacy-modes/mode/clike').then((mod) =>
			StreamLanguage.define(mod.cpp)
		),
	java: () =>
		import('@codemirror/legacy-modes/mode/clike').then((mod) =>
			StreamLanguage.define(mod.java)
		),
	html: () =>
		import('@codemirror/legacy-modes/mode/xml').then((mod) =>
			StreamLanguage.define(mod.html)
		),
	scala: () =>
		import('@codemirror/legacy-modes/mode/clike').then((mod) =>
			StreamLanguage.define(mod.scala)
		),
	kotlin: () =>
		import('@codemirror/legacy-modes/mode/clike').then((mod) =>
			StreamLanguage.define(mod.kotlin)
		),
	lua: () =>
		import('@codemirror/legacy-modes/mode/lua').then((mod) =>
			StreamLanguage.define(mod.lua)
		),
	powershell: () =>
		import('@codemirror/legacy-modes/mode/powershell').then((mod) =>
			StreamLanguage.define(mod.powerShell)
		),
	ruby: () =>
		import('@codemirror/legacy-modes/mode/ruby').then((mod) =>
			StreamLanguage.define(mod.ruby)
		),
	shell: () =>
		import('@codemirror/legacy-modes/mode/shell').then((mod) =>
			StreamLanguage.define(mod.shell)
		),
	sql: () =>
		import('@codemirror/legacy-modes/mode/sql').then((mod) =>
			StreamLanguage.define(mod.pgSQL)
		),
	swift: () =>
		import('@codemirror/legacy-modes/mode/swift').then((mod) =>
			StreamLanguage.define(mod.swift)
		),
	toml: () =>
		import('@codemirror/legacy-modes/mode/toml').then((mod) =>
			StreamLanguage.define(mod.toml)
		),
	xml: () =>
		import('@codemirror/legacy-modes/mode/xml').then((mod) =>
			StreamLanguage.define(mod.xml)
		),
};

const loadedLangs: {
	[key: string]: LanguageSupport | StreamLanguage<unknown>;
} = {};

export const cmLangExt = async (langName: string): Promise<Extension> => {
	// Check if the language is already loaded
	if (loadedLangs[langName]) {
		return loadedLangs[langName];
	}

	const lang = langMap[langName];
	if (!lang) {
		return [];
	}
	const l = await lang();
	loadedLangs[langName] = l;
	return l;
};

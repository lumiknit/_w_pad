// Utility functions for preview detection and content processing

export type PreviewType = 'markdown' | 'html' | 'svg' | 'json' | 'none';

export const detectPreviewType = (
	filename: string,
	code: string
): PreviewType => {
	// Check by file extension first
	const ext = filename.toLowerCase().split('.').pop() || '';

	switch (ext) {
		case 'md':
		case 'markdown':
			return 'markdown';
		case 'html':
		case 'htm':
			return 'html';
		case 'svg':
			return 'svg';
		case 'json':
			return 'json';
	}

	// Check by content if no extension
	const trimmedCode = code.trim().toLowerCase();

	if (
		trimmedCode.startsWith('<!doctype html') ||
		trimmedCode.startsWith('<html')
	) {
		return 'html';
	}

	if (trimmedCode.startsWith('<svg')) {
		return 'svg';
	}

	if (trimmedCode.startsWith('{') || trimmedCode.startsWith('[')) {
		try {
			JSON.parse(code);
			return 'json';
		} catch {
			// Not valid JSON
		}
	}

	// Check for markdown-like patterns
	if (
		trimmedCode.includes('#') ||
		trimmedCode.includes('**') ||
		trimmedCode.includes('*') ||
		trimmedCode.includes('```')
	) {
		return 'markdown';
	}

	return 'none';
};

export const isPreviewable = (filename: string, code: string): boolean => {
	return detectPreviewType(filename, code) !== 'none';
};

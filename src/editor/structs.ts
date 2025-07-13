import { z } from 'zod';

export const editorOptionsSchema = z.object({
	filename: z.string(),
	indentMode: z.enum(['space', 'tab']),
	indentSize: z.number().int().min(2).max(8),
	wrapMode: z.boolean(),
});

export type EditorOptions = z.infer<typeof editorOptionsSchema>;

export const defaultOptions = (): EditorOptions => ({
	filename: '',
	indentMode: 'space',
	indentSize: 2,
	wrapMode: true,
});

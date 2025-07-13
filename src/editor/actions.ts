import type { ActionItem } from './EditorFooter';
import type { EditorOptions } from './structs';
import toast from 'solid-toast';
import type { EditorState, Output } from './Editor';
import { getLanguageFromName } from '../shared/utils/extension-table';
import { formatUsingPrettier, executeJavaScript } from './actions/js-like';

export type CodeActionResult = {
	newCode?: string;
	outputs?: Output[];
};
export type CodeActionFn = (
	code: string,
	opts: EditorOptions
) => Promise<CodeActionResult>;

export type CodeActionItem = {
	label: string;
	action: CodeActionFn;
};

export type LangActions = {
	language: string;
	actions: CodeActionItem[];
};

// Universal actions available for all file types
const universalActions: CodeActionItem[] = [
	{
		label: 'Save',
		action: async (code: string, opts: EditorOptions) => {
			const filename = opts.filename || 'untitled.txt';
			const blob = new Blob([code], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();

			URL.revokeObjectURL(url);

			return {
				outputs: [
					{ kind: 'output', value: `File saved as ${filename}` },
				],
			};
		},
	},
	{
		label: 'Copy',
		action: async (code: string) => {
			try {
				await navigator.clipboard.writeText(code);
				return {
					outputs: [
						{ kind: 'output', value: 'Code copied to clipboard' },
					],
				};
			} catch (error) {
				return {
					outputs: [
						{ kind: 'error', value: 'Failed to copy to clipboard' },
					],
				};
			}
		},
	},
];

const langActionss: LangActions[] = [
	{
		language: 'json',
		actions: [
			{
				label: 'Prettify',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = JSON.stringify(
						JSON.parse(code),
						null,
						opts.indentMode === 'space'
							? ' '.repeat(opts.indentSize)
							: '\t'
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'JSON formatted successfully',
							},
						],
					};
				},
			},
			{
				label: 'Minify',
				action: async (code: string) => {
					const minified = JSON.stringify(JSON.parse(code));
					return {
						newCode: minified,
						outputs: [
							{
								kind: 'output',
								value: 'JSON minified successfully',
							},
						],
					};
				},
			},
		],
	},
	{
		language: 'javascript',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'babel',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'JavaScript formatted successfully',
							},
						],
					};
				},
			},
			{
				label: 'Run',
				action: async (code: string) => {
					const outputs = await executeJavaScript(code);
					return {
						outputs:
							outputs.length > 0
								? outputs
								: [{ kind: 'output', value: 'No output' }],
					};
				},
			},
		],
	},
	{
		language: 'typescript',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'babel',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'TypeScript formatted successfully',
							},
						],
					};
				},
			},
		],
	},
	{
		language: 'jsx',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'babel',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'JSX formatted successfully',
							},
						],
					};
				},
			},
		],
	},
	{
		language: 'tsx',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'babel',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'TSX formatted successfully',
							},
						],
					};
				},
			},
		],
	},
	// CSS, SCSS format
	{
		language: 'css',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'css',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'CSS formatted successfully',
							},
						],
					};
				},
			},
		],
	},
	{
		language: 'scss',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'css',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'SCSS formatted successfully',
							},
						],
					};
				},
			},
		],
	},
	// HTML format
	{
		language: 'html',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'html',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'HTML formatted successfully',
							},
						],
					};
				},
			},
		],
	},
	// YAML format
	{
		language: 'yaml',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const yaml = await import('yaml');

					try {
						// Parse YAML to validate and reformat
						const parsed = yaml.parse(code);
						const formatted = yaml.stringify(parsed, null, {
							indent:
								opts.indentMode === 'tab' ? 1 : opts.indentSize,
							lineWidth: 80,
							minContentWidth: 20,
						});

						return {
							newCode: formatted,
							outputs: [
								{
									kind: 'output',
									value: 'YAML formatted successfully',
								},
							],
						};
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: String(error);
						return {
							outputs: [
								{
									kind: 'error',
									value: `YAML format error: ${errorMessage}`,
								},
							],
						};
					}
				},
			},
		],
	},
	// Markdown format
	{
		language: 'markdown',
		actions: [
			{
				label: 'Format',
				action: async (code: string, opts: EditorOptions) => {
					const formatted = await formatUsingPrettier(
						'markdown',
						code,
						opts
					);
					return {
						newCode: formatted,
						outputs: [
							{
								kind: 'output',
								value: 'Markdown formatted successfully',
							},
						],
					};
				},
			},
		],
	},
];

/**
 * Map of code actions by language.
 * Language to action items.
 */
export const codeActions: Map<string, CodeActionItem[]> = new Map(
	langActionss.map((langActions) => [
		langActions.language,
		langActions.actions,
	])
);

export const buildFooterActionItems = (state: EditorState): ActionItem[] => {
	const name = getLanguageFromName(state.opts().filename);
	const languageActions = codeActions.get(name) || [];

	// Combine universal actions with language-specific actions
	const allActions = [...universalActions, ...languageActions];

	return allActions.map((action) => ({
		label: action.label,
		onSelect: async () => {
			try {
				state.setLoading(true);
				const result = await action.action(state.code(), state.opts());

				// Update code if provided
				if (result.newCode !== undefined) {
					state.setCode(result.newCode);
				}

				// Set outputs if provided
				if (result.outputs) {
					state.setOuts(result.outputs);
				}

				toast.success(
					`Action "${action.label}" applied successfully.`,
					{
						duration: 1000,
					}
				);
				console.log(`Action "${action.label}" applied successfully.`);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				toast.error(`Error applying action "${action.label}"`, {
					duration: 1000,
				});
				console.error(
					`Error applying action "${action.label}":`,
					error
				);

				// Set error output
				state.setOuts([{ kind: 'error', value: errorMessage }]);
			} finally {
				state.setLoading(false);
			}
		},
	}));
};

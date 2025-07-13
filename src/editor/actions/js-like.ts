import type { Output } from '../Editor';
import type { EditorOptions } from '../structs';

export const formatUsingPrettier = async (
	parser: 'babel' | 'css' | 'html' | 'markdown',
	code: string,
	opts: EditorOptions
): Promise<string> => {
	const prettier = await import('prettier/standalone');
	const pluginBabel = await import('prettier/parser-babel');
	const pluginEstree = (await import('prettier/plugins/estree')).default;
	const pluginHTML = await import('prettier/parser-html');
	const pluginPostcss = await import('prettier/parser-postcss');
	const pluginMarkdown = await import('prettier/parser-markdown');

	const formatted = await prettier.format(code, {
		parser,
		plugins: [
			pluginBabel,
			pluginEstree,
			pluginHTML,
			pluginPostcss,
			pluginMarkdown,
		],
		useTabs: opts.indentMode === 'tab',
		tabWidth: opts.indentSize,
		printWidth: 80, // For markdown formatting
		proseWrap: 'always', // For markdown line wrapping
	});

	return formatted;
};

// JavaScript execution function (reusable)
export const executeJavaScript = async (code: string): Promise<Output[]> => {
	const outputs: Output[] = [];

	// Create console mock
	const console = {
		log: (...args: any[]) => {
			const message = args
				.map((arg) =>
					typeof arg === 'object'
						? JSON.stringify(arg, null, 2)
						: String(arg)
				)
				.join(' ');
			outputs.push({ kind: 'output' as const, value: message });
		},
		error: (...args: any[]) => {
			const message = args
				.map((arg) =>
					typeof arg === 'object'
						? JSON.stringify(arg, null, 2)
						: String(arg)
				)
				.join(' ');
			outputs.push({ kind: 'error' as const, value: message });
		},
		warn: (...args: any[]) => {
			const message = args
				.map((arg) =>
					typeof arg === 'object'
						? JSON.stringify(arg, null, 2)
						: String(arg)
				)
				.join(' ');
			outputs.push({ kind: 'output' as const, value: `⚠️ ${message}` });
		},
	};

	try {
		// Wrap code in async function
		const wrappedCode = `(async (console) => {\n${code}\n})`;

		// Execute the code
		const asyncFn = eval(wrappedCode);
		const result = await asyncFn(console);

		// If the function returns something, log it
		if (result !== undefined) {
			console.log('Return value:', result);
		}

		if (outputs.length === 0) {
			outputs.push({
				kind: 'output',
				value: 'Code executed successfully (no output)',
			});
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		outputs.push({ kind: 'error', value: errorMessage });
	}

	return outputs;
};

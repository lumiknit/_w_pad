import { type Component, createMemo, Show } from 'solid-js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { detectPreviewType } from './utils';

type Props = {
	filename: string;
	code: string;
};

const MarkdownPreview: Component<{ code: string }> = (props) => {
	const html = createMemo(() => {
		try {
			const rawHtml = marked(props.code) as string;
			return DOMPurify.sanitize(rawHtml);
		} catch (error) {
			return `<p style="color: red;">Error rendering markdown: ${error}</p>`;
		}
	});

	return <div class="preview-content markdown-preview" innerHTML={html()} />;
};

const HtmlPreview: Component<{ code: string }> = (props) => {
	const sanitizedHtml = createMemo(() => {
		return DOMPurify.sanitize(props.code);
	});

	return (
		<div class="preview-content html-preview" innerHTML={sanitizedHtml()} />
	);
};

const SvgPreview: Component<{ code: string }> = (props) => {
	const sanitizedSvg = createMemo(() => {
		return DOMPurify.sanitize(props.code);
	});

	return (
		<div class="preview-content svg-preview" innerHTML={sanitizedSvg()} />
	);
};

const JsonPreview: Component<{ code: string }> = (props) => {
	const formattedJson = createMemo(() => {
		try {
			const parsed = JSON.parse(props.code);
			return JSON.stringify(parsed, null, 2);
		} catch (error) {
			return `Error parsing JSON: ${error}`;
		}
	});

	return (
		<div class="preview-content json-preview">
			<pre>
				<code>{formattedJson()}</code>
			</pre>
		</div>
	);
};

const Preview: Component<Props> = (props) => {
	const previewType = createMemo(() =>
		detectPreviewType(props.filename, props.code)
	);

	return (
		<div class="preview-container">
			<Show when={previewType() === 'markdown'}>
				<MarkdownPreview code={props.code} />
			</Show>
			<Show when={previewType() === 'html'}>
				<HtmlPreview code={props.code} />
			</Show>
			<Show when={previewType() === 'svg'}>
				<SvgPreview code={props.code} />
			</Show>
			<Show when={previewType() === 'json'}>
				<JsonPreview code={props.code} />
			</Show>
			<Show when={previewType() === 'none'}>
				<div class="preview-content no-preview">
					<p>No preview available for this file type.</p>
				</div>
			</Show>
		</div>
	);
};

export default Preview;

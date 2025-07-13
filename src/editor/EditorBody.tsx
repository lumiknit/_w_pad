import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { createMediaQuery } from '@solid-primitives/media';
import { EditorView } from 'codemirror';
import { lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
	autocompletion,
	completionKeymap,
	closeBrackets,
	closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { foldKeymap } from '@codemirror/language';
import {
	createEffect,
	createSignal,
	onCleanup,
	onMount,
	untrack,
	type Accessor,
	type Setter,
} from 'solid-js';
import {
	cmLangExt,
	getLanguageFromName,
} from '../shared/utils/extension-table';
import type { EditorOptions } from './structs';
import { defaultDark, defaultLight } from './cm_thm_default';

type Props = {
	code: Accessor<string>;
	setCode: Setter<string>;

	opts: Accessor<EditorOptions>;
};

const EditorBody = (props: Props) => {
	let editorRef: HTMLDivElement | undefined;

	const [view, setView] = createSignal<EditorView | undefined>(undefined);
	const [state, setState] = createSignal<EditorState | undefined>(undefined);
	const [codeSelfUpdate, setCodeSelfUpdate] = createSignal(false);

	const updateCompartment = (comp: Compartment) => (ext: Extension) => {
		view()?.dispatch({
			effects: comp.reconfigure(ext),
		});
	};

	// Language extension
	const getLangExt = async (): Promise<Extension> =>
		await cmLangExt(getLanguageFromName(props.opts().filename));
	let langCompartment = new Compartment();
	const updateLangExt = updateCompartment(langCompartment);
	createEffect(() => {
		console.log(props.opts().filename, getLangExt());
		getLangExt().then((ext) => {
			updateLangExt(ext);
		});
	});

	// Dark mode detect
	let themeCompartment = new Compartment();
	const updateThemeExt = updateCompartment(themeCompartment);
	const colorSchemeChanges = createMediaQuery('(prefers-color-scheme: dark)');
	const getThemeExt = () =>
		colorSchemeChanges() ? defaultDark : defaultLight;
	createEffect(() => updateThemeExt(getThemeExt()));

	// Wrap mode
	const getWrapModeExt = () =>
		props.opts().wrapMode ? EditorView.lineWrapping : [];
	let wrapModeCompartment = new Compartment();
	const updateWrapModeExt = updateCompartment(wrapModeCompartment);
	createEffect(() => updateWrapModeExt(getWrapModeExt()));

	// Indent configuration
	const getIndentExt = () => {
		const opts = props.opts();
		const indentString =
			opts.indentMode === 'tab' ? '\t' : ' '.repeat(opts.indentSize);
		return [
			EditorState.tabSize.of(opts.indentSize),
			indentUnit.of(indentString),
		];
	};
	let indentCompartment = new Compartment();
	const updateIndentExt = updateCompartment(indentCompartment);
	createEffect(() => updateIndentExt(getIndentExt()));

	createEffect(() => {
		const code = props.code();
		if (untrack(codeSelfUpdate)) {
			untrack(() => setCodeSelfUpdate(false));
			return;
		}
		const v = view();
		const s = state();
		if (!v || !s) return;
		const transaction = v.state.update({
			changes: {
				from: 0,
				to: v.state.doc.length,
				insert: code,
			},
		});
		console.log('Dispatch code update.');
		v.dispatch(transaction);
	});

	onMount(() => {
		const updateListener = EditorView.updateListener.of((e) => {
			if (e.docChanged) {
				const s = e.state.doc.toString();
				setCodeSelfUpdate(true);
				props.setCode(s);
			}
		});

		const extensions = [
			updateListener,
			lineNumbers(),
			history(),
			autocompletion(),
			closeBrackets(),
			highlightSelectionMatches(),
			keymap.of([
				indentWithTab,
				...closeBracketsKeymap,
				...defaultKeymap,
				...searchKeymap,
				...historyKeymap,
				...foldKeymap,
				...completionKeymap,
			]),
			langCompartment.of([]),
			themeCompartment.of(getThemeExt()),
			wrapModeCompartment.of(getWrapModeExt()),
			indentCompartment.of(getIndentExt()),
		];

		const s = EditorState.create({
			doc: props.code(),
			extensions,
		});
		setState(s);

		setView(
			new EditorView({
				state: s,
				parent: editorRef!,
			})
		);
	});

	onCleanup(() => {
		const v = view();
		v?.destroy();
	});

	return <div ref={editorRef} />;
};

export default EditorBody;

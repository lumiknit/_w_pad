import {
	createSignal,
	Show,
	type Accessor,
	type Component,
	type Setter,
} from 'solid-js';
import EditorHeader from './EditorHeader';
import EditorBody from './EditorBody';
import EditorOutputs from './EditorOutputs';
import { defaultOptions, type EditorOptions } from './structs';
import EditorFooter from './EditorFooter';
import { buildFooterActionItems } from './actions';
import Preview from './preview/Preview';

export type Output = {
	kind: 'error' | 'output';
	value: string;
};

export type ViewMode = 'code' | 'preview';

export type EditorState = {
	code: Accessor<string>;
	setCode: Setter<string>;

	opts: Accessor<EditorOptions>;
	setOpts: Setter<EditorOptions>;

	outs: Accessor<Output[] | undefined>;
	setOuts: Setter<Output[] | undefined>;

	loading: Accessor<boolean>;
	setLoading: Setter<boolean>;

	viewMode: Accessor<ViewMode>;
	setViewMode: Setter<ViewMode>;
};

export const emptyEditorState = () => {
	const [code, setCode] = createSignal<string>('', {
		equals: false,
	});
	const [opts, setOpts] = createSignal<EditorOptions>(defaultOptions());
	const [outs, setOuts] = createSignal<Output[] | undefined>(undefined);
	const [loading, setLoading] = createSignal<boolean>(false);
	const [viewMode, setViewMode] = createSignal<ViewMode>('code');

	return {
		code,
		setCode,
		opts,
		setOpts,
		outs,
		setOuts,
		loading,
		setLoading,
		viewMode,
		setViewMode,
	} as EditorState;
};

type Props = {
	state: EditorState;
	onDelete?: () => void;
};

const Editor: Component<Props> = (props) => {
	return (
		<div class="ed">
			<EditorHeader
				opts={props.state.opts()}
				onChange={(v) =>
					props.state.setOpts((prev) => ({ ...prev, ...v }))
				}
				onDelete={props.onDelete}
			/>

			<Show when={props.state.viewMode() === 'code'}>
				<EditorBody
					opts={props.state.opts}
					code={props.state.code}
					setCode={props.state.setCode}
				/>

				<EditorOutputs
					outputs={props.state.outs}
					loading={props.state.loading}
				/>
			</Show>

			<Show when={props.state.viewMode() === 'preview'}>
				<Preview
					filename={props.state.opts().filename}
					code={props.state.code()}
				/>
			</Show>

			<EditorFooter
				actionTitle="Actions"
				actions={buildFooterActionItems(props.state)}
				filename={props.state.opts().filename}
				code={props.state.code()}
				viewMode={props.state.viewMode()}
				onViewModeChange={props.state.setViewMode}
			/>
		</div>
	);
};

export default Editor;

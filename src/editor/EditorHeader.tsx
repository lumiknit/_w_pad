import { For, Show, splitProps, type Component, type JSX } from 'solid-js';
import type { EditorOptions } from './structs';
import { TbTrash } from 'solid-icons/tb';

type SelectItem = {
	value: string;
	label: string;
};
type SelectProps = Omit<JSX.IntrinsicElements['select'], 'onChange'> & {
	groupName: string;
	options: SelectItem[];
	value: string;
	onChange: (value: string) => void;
};
const Select: Component<SelectProps> = (props_) => {
	const [props, rest] = splitProps(props_, [
		'groupName',
		'options',
		'value',
		'onChange',
	]);

	return (
		<select
			{...rest}
			value={props.value}
			onChange={(e) => props.onChange(e.currentTarget.value)}
		>
			<optgroup label={props.groupName}>
				<For each={props.options}>
					{(opt) => (
						<option
							selected={opt.value === props.value}
							value={opt.value}
						>
							{opt.label}
						</option>
					)}
				</For>
			</optgroup>
		</select>
	);
};

const indentModeOptions: SelectItem[] = [
	{ value: 'space', label: 'Space' },
	{ value: 'tab', label: 'Tab' },
];

const indentSizeOptions: SelectItem[] = [
	{ value: '2', label: '2' },
	{ value: '4', label: '4' },
	{ value: '8', label: '8' },
];

const wrapModeOptions: SelectItem[] = [
	{ value: 'wrap', label: 'Wrap' },
	{ value: 'no-wrap', label: 'No wrap' },
];

type Props = {
	opts: EditorOptions;
	onChange: (opts: Partial<EditorOptions>) => void;
	onDelete?: () => void;
};

const EditorHeader: Component<Props> = (props) => {
	return (
		<div class="e-hd">
			<div class="e-hd-left">
				<input
					type="text"
					class="e-hd-left-input is-mono"
					placeholder="Filename including extension..."
					value={props.opts.filename}
					onChange={(e) =>
						props.onChange({ filename: e.currentTarget.value })
					}
				/>
				<Show when={props.onDelete}>
					<button
						class="btn-danger btn-small"
						onClick={props.onDelete}
					>
						<TbTrash />
					</button>
				</Show>
			</div>

			<div class="e-hd-right">
				<Select
					groupName="Indent Mode"
					options={indentModeOptions}
					value={props.opts.indentMode}
					onChange={(value: string) =>
						props.onChange({ indentMode: value as 'space' | 'tab' })
					}
				/>

				<Select
					groupName="Indent Size"
					options={indentSizeOptions}
					value={'' + props.opts.indentSize}
					onChange={(value: string) =>
						props.onChange({ indentSize: parseInt(value) })
					}
				/>

				<Select
					groupName="Wrap Mode"
					options={wrapModeOptions}
					value={props.opts.wrapMode ? 'wrap' : 'no-wrap'}
					onChange={(value: string) =>
						props.onChange({ wrapMode: value === 'wrap' })
					}
				/>
			</div>
		</div>
	);
};

export default EditorHeader;

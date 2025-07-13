import { For, splitProps, Show, type Component, type JSX } from 'solid-js';
import SwitchSelector from '../shared/components/SwitchSelector';
import { isPreviewable } from './preview/utils';
import type { ViewMode } from './Editor';

export type ActionItem = {
	label: string;
	onSelect: () => void;
};
type SelectProps = JSX.IntrinsicElements['select'] & {
	options: ActionItem[];
};
const ActionSelector: Component<SelectProps> = (props_) => {
	const [props, rest] = splitProps(props_, ['options']);

	return (
		<select
			{...rest}
			onChange={(e) => {
				const elem: HTMLSelectElement = e.currentTarget;
				const item = props.options.find(
					(opt) => opt.label === elem.value
				);
				if (item) {
					item.onSelect();
				}
				elem.value = ''; // Reset the select after action
			}}
		>
			<option disabled selected value="">
				Actions
			</option>
			<For each={props.options}>
				{(opt) => (
					<option selected={false} value={opt.label}>
						{opt.label}
					</option>
				)}
			</For>
		</select>
	);
};

type Props = {
	actions: ActionItem[];
	actionTitle: string;
	filename: string;
	code: string;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
};

const EditorFooter: Component<Props> = (props) => {
	const showPreviewSelector = () => isPreviewable(props.filename, props.code);

	return (
		<div class="e-ft">
			<div>
				<Show when={showPreviewSelector()}>
					<SwitchSelector
						items={[
							{ label: 'Code', value: 'code' },
							{ label: 'Preview', value: 'preview' },
						]}
						selected={props.viewMode}
						onChange={(value) => {
							props.onViewModeChange(value as ViewMode);
						}}
					/>
				</Show>
			</div>
			<div>
				<ActionSelector options={props.actions} />
			</div>
		</div>
	);
};

export default EditorFooter;

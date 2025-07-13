import { For, type Component } from 'solid-js';

export type SwitchItem = {
	label: string;
	value: string;
};

type Props = {
	items: SwitchItem[];
	selected: string;
	onChange: (value: string) => void;
};

const SwitchSelector: Component<Props> = (props) => {
	return (
		<>
			<div class="switch">
				<For each={props.items}>
					{(item) => (
						<button
							class={`switch-item ${props.selected === item.value ? 'active' : ''}`}
							onClick={() => props.onChange(item.value)}
						>
							{item.label}
						</button>
					)}
				</For>
			</div>
		</>
	);
};

export default SwitchSelector;

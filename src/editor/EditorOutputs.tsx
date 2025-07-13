import { For, Show, type Accessor, type Component } from 'solid-js';
import type { Output } from './Editor';

type Props = {
	outputs: Accessor<Output[] | undefined>;
	loading: Accessor<boolean>;
};

const Spinner: Component = () => (
	<div class="e-spinner">
		<div class="e-spinner-circle"></div>
	</div>
);

const EditorOutputs: Component<Props> = (props) => {
	return (
		<Show
			when={
				props.loading() ||
				(props.outputs() && props.outputs()!.length > 0)
			}
		>
			<div class="e-outputs">
				<Show when={props.loading()}>
					<Spinner />
				</Show>
				<div
					class={
						props.loading()
							? 'e-outputs-content loading'
							: 'e-outputs-content'
					}
				>
					<For each={props.outputs()}>
						{(output) => (
							<div
								class={`e-output-line ${output.kind === 'error' ? 'e-output-error' : 'e-output-normal'}`}
							>
								{output.value}
							</div>
						)}
					</For>
				</div>
			</div>
		</Show>
	);
};

export default EditorOutputs;

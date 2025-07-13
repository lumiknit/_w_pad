import {
	createSignal,
	createEffect,
	For,
	Show,
	type Component,
} from 'solid-js';
import { listPads, deletePad, type SavedPad } from './storage';
import type { EditorState } from '../../editor/Editor';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onLoadPad: (
		padId: string,
		description: string,
		editors: EditorState[]
	) => void;
};

const SavedPadsModal: Component<Props> = (props) => {
	const [pads, setPads] = createSignal<SavedPad[]>([]);
	const [loading, setLoading] = createSignal(false);
	const [selectedPads, setSelectedPads] = createSignal<Set<string>>(
		new Set()
	);

	const loadPads = async () => {
		setLoading(true);
		try {
			const savedPads = await listPads();
			setPads(savedPads);
		} catch (error) {
			console.error('Failed to load pads:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleLoadPad = async (pad: SavedPad) => {
		try {
			const { emptyEditorState } = await import('../../editor/Editor');
			const editorStates = pad.editors.map((editor) => {
				const state = emptyEditorState();
				state.setCode(editor.code);
				state.setOpts(editor.opts);
				return state;
			});

			props.onLoadPad(pad.id, pad.description, editorStates);
			props.onClose();
		} catch (error) {
			console.error('Failed to load pad:', error);
		}
	};

	const handleToggleSelect = (id: string) => {
		setSelectedPads((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const handleSelectAll = () => {
		const allSelected = selectedPads().size === pads().length;
		if (allSelected) {
			setSelectedPads(new Set<string>());
		} else {
			setSelectedPads(new Set<string>(pads().map((p) => p.id)));
		}
	};

	const handleDeleteSelected = async () => {
		const selectedCount = selectedPads().size;
		if (selectedCount === 0) return;

		if (
			confirm(
				`Are you sure you want to delete ${selectedCount} pad${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`
			)
		) {
			try {
				const deletePromises = Array.from(selectedPads()).map((id) =>
					deletePad(id)
				);
				await Promise.all(deletePromises);
				setSelectedPads(new Set<string>());
				await loadPads(); // Refresh list
			} catch (error) {
				console.error('Failed to delete pads:', error);
			}
		}
	};

	createEffect(() => {
		if (props.isOpen) {
			loadPads();
			setSelectedPads(new Set<string>()); // Clear selection when modal opens
		}
	});

	return (
		<Show when={props.isOpen}>
			<div class="modal-backdrop" onClick={props.onClose}>
				<div class="modal-content" onClick={(e) => e.stopPropagation()}>
					<div class="modal-header">
						<div class="modal-header-left">
							<h2>Saved Pads</h2>
							<Show when={!loading() && pads().length > 0}>
								<div class="bulk-actions">
									<label class="checkbox-label">
										<input
											type="checkbox"
											checked={
												selectedPads().size ===
												pads().length
											}
											ref={(el) => {
												if (el) {
													el.indeterminate =
														selectedPads().size >
															0 &&
														selectedPads().size <
															pads().length;
												}
											}}
											onChange={handleSelectAll}
										/>
										Select All
									</label>
									<Show when={selectedPads().size > 0}>
										<button
											class="btn-danger btn-small"
											onClick={handleDeleteSelected}
										>
											Delete ({selectedPads().size})
										</button>
									</Show>
								</div>
							</Show>
						</div>
						<button class="modal-close" onClick={props.onClose}>
							×
						</button>
					</div>
					<div class="modal-body">
						<Show when={loading()}>
							<div class="loading">Loading...</div>
						</Show>
						<Show when={!loading() && pads().length === 0}>
							<div class="empty-state">No saved pads found</div>
						</Show>
						<Show when={!loading() && pads().length > 0}>
							<div class="pads-list">
								<For each={pads()}>
									{(pad) => (
										<div class="pad-item">
											<label class="pad-checkbox">
												<input
													type="checkbox"
													checked={selectedPads().has(
														pad.id
													)}
													onChange={() =>
														handleToggleSelect(
															pad.id
														)
													}
												/>
											</label>
											<div
												class="pad-info"
												onClick={() =>
													handleLoadPad(pad)
												}
											>
												<div class="pad-description">
													{pad.description ||
														'Untitled Pad'}
												</div>
												<div class="pad-meta">
													<span class="pad-date">
														{new Date(
															pad.savedAt
														).toLocaleString()}
													</span>
													<span class="pad-editors">
														{pad.editors.length}{' '}
														file
														{pad.editors.length !==
														1
															? 's'
															: ''}
													</span>
												</div>
											</div>
										</div>
									)}
								</For>
							</div>
						</Show>
					</div>
				</div>
			</div>
		</Show>
	);
};

export default SavedPadsModal;

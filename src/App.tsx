import { createSignal, For, type Component, createEffect } from 'solid-js';
import { Toaster } from 'solid-toast';
import JSZip from 'jszip';

// import './App.css';
import Editor, { emptyEditorState, type EditorState } from './editor/Editor';
import NavBar from './features/editor-management/NavBar';
import SavedPadsModal from './features/storage/SavedPadsModal';
import { savePad, generatePadId } from './features/storage/storage';
import { TbFileZip, TbPlus, TbUpload } from 'solid-icons/tb';

const App: Component = () => {
	const [editorStates, setEditorStates] = createSignal<EditorState[]>([
		emptyEditorState(),
	]);
	const [description, setDescription] = createSignal<string>('');
	const [savedAt, setSavedAt] = createSignal<string>('');
	const [isModalOpen, setIsModalOpen] = createSignal(false);
	const [isDragOver, setIsDragOver] = createSignal(false);
	const [currentPadId, setCurrentPadId] =
		createSignal<string>(generatePadId());

	const handleNewPad = () => {
		setEditorStates([emptyEditorState()]);
		setDescription('');
		setSavedAt('');
		// Generate new pad ID for fresh start
		setCurrentPadId(generatePadId());
	};

	const handleDeleteCurrent = () => {
		if (
			confirm(
				'Are you sure you want to delete the current pad? This action cannot be undone.'
			)
		) {
			handleNewPad();
		}
	};

	const handleBrowseSaved = () => {
		setIsModalOpen(true);
	};

	const handleLoadPad = (
		padId: string,
		newDescription: string,
		newEditors: EditorState[]
	) => {
		setCurrentPadId(padId);
		setDescription(newDescription);
		setEditorStates(newEditors);
		setSavedAt(''); // Will be set when auto-save triggers
	};

	const processFiles = async (files: FileList | File[]) => {
		const newEditorStates: EditorState[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const content = await file.text();
			const editorState = emptyEditorState();
			editorState.setCode(content);
			editorState.setOpts((prev) => ({ ...prev, filename: file.name }));
			newEditorStates.push(editorState);
		}

		if (newEditorStates.length > 0) {
			setEditorStates((prev) => [...prev, ...newEditorStates]);
		}
	};

	const handleUpload = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.webkitdirectory = false;

		input.onchange = async (event) => {
			const files = (event.target as HTMLInputElement).files;
			if (!files) return;
			await processFiles(files);
		};

		input.click();
	};

	const handleSaveAll = async () => {
		const zip = new JSZip();
		const editors = editorStates();

		// Filter out empty editors
		const nonEmptyEditors = editors.filter(
			(state) =>
				state.code().trim() !== '' ||
				state.opts().filename?.trim() !== ''
		);

		if (nonEmptyEditors.length === 0) {
			alert('No files to save!');
			return;
		}

		nonEmptyEditors.forEach((state, index) => {
			let filename = state.opts().filename || `untitled-${index + 1}`;
			const code = state.code();

			// Auto-detect file extension if not provided
			if (!filename.includes('.')) {
				// Try to guess from content or use .txt as default
				const codeStart = code.trim().toLowerCase();
				let ext = 'txt';

				if (
					codeStart.includes('<!doctype') ||
					codeStart.includes('<html')
				) {
					ext = 'html';
				} else if (
					codeStart.includes('function') ||
					codeStart.includes('const ') ||
					codeStart.includes('let ')
				) {
					ext = 'js';
				} else if (
					codeStart.includes('def ') ||
					(codeStart.includes('import ') &&
						!codeStart.includes('from '))
				) {
					ext = 'py';
				} else if (codeStart.includes('{') && codeStart.includes('"')) {
					ext = 'json';
				}

				filename += `.${ext}`;
			}

			// JSZip automatically creates directory structure for paths with slashes
			zip.file(filename, code);
		});

		try {
			const content = await zip.generateAsync({ type: 'blob' });
			const url = URL.createObjectURL(content);

			const a = document.createElement('a');
			a.href = url;
			a.download = description() || 'pad-export.zip';
			// Ensure .zip extension
			if (!a.download.endsWith('.zip')) {
				a.download += '.zip';
			}
			a.click();

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to create ZIP file:', error);
			alert('Failed to create ZIP file');
		}
	};

	const handleDeleteEditor = (index: number) => {
		setEditorStates((prev) => prev.filter((_, i) => i !== index));
	};

	// Auto-save functionality
	const saveCurrentPad = async () => {
		try {
			const editors = editorStates().map((state) => ({
				code: state.code(),
				opts: state.opts(),
			}));

			await savePad(currentPadId(), {
				description: description(),
				editors,
			});

			setSavedAt(new Date().toLocaleString());
		} catch (error) {
			console.error('Failed to save pad:', error);
		}
	};

	// Auto-save when content changes
	createEffect(() => {
		// Track changes in description, editor states
		description();
		editorStates().forEach((state) => {
			state.code();
			state.opts();
		});

		// Debounce saving (save after 2 seconds of no changes)
		const timeoutId = setTimeout(saveCurrentPad, 2000);
		return () => clearTimeout(timeoutId);
	});

	// Global drag and drop handlers
	createEffect(() => {
		let dragCounter = 0;

		const handleGlobalDragEnter = (e: DragEvent) => {
			e.preventDefault();
			dragCounter++;
			if (dragCounter === 1) {
				setIsDragOver(true);
			}
		};

		const handleGlobalDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const handleGlobalDragLeave = (e: DragEvent) => {
			e.preventDefault();
			dragCounter--;
			if (dragCounter === 0) {
				setIsDragOver(false);
			}
		};

		const handleGlobalDrop = async (e: DragEvent) => {
			e.preventDefault();
			dragCounter = 0;
			setIsDragOver(false);

			const files = e.dataTransfer?.files;
			if (!files || files.length === 0) return;

			await processFiles(files);
		};

		document.addEventListener('dragenter', handleGlobalDragEnter);
		document.addEventListener('dragover', handleGlobalDragOver);
		document.addEventListener('dragleave', handleGlobalDragLeave);
		document.addEventListener('drop', handleGlobalDrop);

		return () => {
			document.removeEventListener('dragenter', handleGlobalDragEnter);
			document.removeEventListener('dragover', handleGlobalDragOver);
			document.removeEventListener('dragleave', handleGlobalDragLeave);
			document.removeEventListener('drop', handleGlobalDrop);
		};
	});

	return (
		<>
			<Toaster />
			{isDragOver() && (
				<div class="drag-overlay">
					<div class="drag-message">Drop files here to upload</div>
				</div>
			)}
			<NavBar
				onNewPad={handleNewPad}
				onDeleteCurrent={handleDeleteCurrent}
				onBrowseSaved={handleBrowseSaved}
			/>
			<SavedPadsModal
				isOpen={isModalOpen()}
				onClose={() => setIsModalOpen(false)}
				onLoadPad={handleLoadPad}
			/>
			<div class="container">
				<div class="pad-header">
					<input
						type="text"
						class="description-input"
						placeholder="Description here..."
						value={description()}
						onInput={(e) => setDescription(e.currentTarget.value)}
					/>
					<div class="saved-at">
						{savedAt() && `Saved at: ${savedAt()}`}
					</div>
				</div>
				<div class="editors">
					<For each={editorStates()}>
						{(editor, index) => (
							<div class="ed-container">
								<Editor
									state={editor}
									onDelete={
										editorStates().length > 1
											? () => handleDeleteEditor(index())
											: undefined
									}
								/>
							</div>
						)}
					</For>
				</div>
				<div class="app-actions">
					<div class="app-actions-left">
						<button
							onClick={() => {
								setEditorStates((prev) => [
									...prev,
									emptyEditorState(),
								]);
							}}
						>
							<TbPlus />
							Add
						</button>
						<button onClick={handleUpload}>
							<TbUpload />
							Upload
						</button>
					</div>
					<div class="app-actions-right">
						<button class="btn-success" onClick={handleSaveAll}>
							<TbFileZip />
							Save
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default App;

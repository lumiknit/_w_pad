import { TbPlus } from 'solid-icons/tb';
import { type Component } from 'solid-js';

type Props = {
	onNewPad: () => void;
	onDeleteCurrent: () => void;
	onBrowseSaved: () => void;
};

const NavBar: Component<Props> = (props) => {
	return (
		<nav class="navbar">
			<div class="navbar-content">
				<div class="navbar-brand">
					<h1>Pad</h1>
				</div>
				<div class="navbar-actions">
					<button
						class="navbar-btn btn-success"
						onClick={props.onNewPad}
						title="Create new pad"
					>
						<TbPlus />
						New
					</button>
					<button
						class="navbar-btn"
						onClick={props.onBrowseSaved}
						title="Browse saved pads"
					>
						Browse
					</button>
				</div>
			</div>
		</nav>
	);
};

export default NavBar;

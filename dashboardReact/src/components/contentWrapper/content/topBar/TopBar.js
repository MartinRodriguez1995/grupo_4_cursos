import React from 'react';
import Logo from './Logo';
import './topbar.css'


function Topbar() {
	let avatar = "/no_avatar.png";
	return (
		<nav className="navbar navbar-expand topbar mb-4 static-top shadow">

			<Logo />

			{ /* Topbar Navbar */}
			<ul className="navbar-nav ml-auto fondo">

				{ /* Nav Item - Alerts */}
				<li className="nav-item dropdown no-arrow mx-1">
					<a className="nav-link dropdown-toggle" href="/" id="alertsDropdown">
						<i className="fas fa-bell fa-fw"></i>
						{ /* Counter - Alerts */}
						<span className="badge badge-danger badge-counter">3+</span>
					</a>
				</li>

				<div className="topbar-divider d-none d-sm-block"></div>

				{ /* Nav Item - Messages */}
				<li className="nav-item dropdown no-arrow mx-1">
					<a className="nav-link dropdown-toggle" href="/" id="messagesDropdown">
						<i className="fas fa-envelope fa-fw"></i>
						{ /* Counter - Messages */}
						<span className="badge badge-danger badge-counter">7</span>
					</a>
				</li>

				<div className="topbar-divider d-none d-sm-block"></div>

				{ /* Nav Item - User Information */}
				<li className="nav-item dropdown no-arrow">
					<a className="nav-link dropdown-toggle" href="/" id="userDropdown">
						<span className="mr-2 d-none d-lg-inline text-white small">Web Academy Admin</span>
						<img className="img-profile rounded-circle" src={avatar} width="60" />
					</a>
				</li>

			</ul>

		</nav>
	)
}

export default Topbar;
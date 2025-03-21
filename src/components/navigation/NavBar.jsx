import React from 'react'
import '../../css/NavBar.css'
import logo from '/logo.svg'
import HamburgerMenu from './HamburgerMenu'


const NavBar = () => {
    return (
        <nav className='navBar'>
            <div><img className='logo' src={logo} alt="logo" /></div>
            <div><HamburgerMenu/>
            </div>
        </nav>
    )
}

export default NavBar
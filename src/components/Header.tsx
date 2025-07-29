import React, { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">TalentMap AI</span>
            <span className="logo-subtitle">by Umurava</span>
          </div>
          
          <nav className="nav">
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
            <button onClick={() => scrollToSection('get-started')} className="nav-link">Get Started</button>
          </nav>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>

          <nav className={`mobile-nav ${isMenuOpen ? 'mobile-nav-open' : ''}`}>
            <button onClick={() => scrollToSection('features')} className="mobile-nav-link">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="mobile-nav-link">How It Works</button>
            <button onClick={() => scrollToSection('get-started')} className="mobile-nav-link">Get Started</button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
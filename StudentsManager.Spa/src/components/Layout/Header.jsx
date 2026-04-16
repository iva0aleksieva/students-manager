import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import logo from '../../assets/icons/logo.svg';

function Header() {
    const { isLoggedIn, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolledDown, setIsScrolledDown] = useState(false);

    const headerRef = useRef(null);
    const menuItemsRef = useRef([]);
    const mobileMenuButtonRef = useRef(null);

    const assignMenuItemRef = useCallback((index) => (el) => {
        menuItemsRef.current[index] = el;
    }, []);

    // Combined effect: body scroll lock, GSAP animation, focus & Escape handling for mobile menu
    useEffect(() => {
        const scrollLockClass = 'modal_show';

        if (!isMobileMenuOpen) {
            // Ensure classes removed when closed
            document.body.classList.remove(scrollLockClass);
            document.documentElement.classList.remove(scrollLockClass);
            return;
        }

        // Opening: lock scroll
        document.body.classList.add(scrollLockClass);
        document.documentElement.classList.add(scrollLockClass);

        // GSAP animation for menu items
        const scope = headerRef.current || undefined;
        const ctx = gsap.context(() => {
            const items = menuItemsRef.current.filter(Boolean);
            if (items.length > 0) {
                gsap.fromTo(
                    items,
                    { autoAlpha: 0, y: 15 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.8,
                        delay: 0.6,
                        ease: 'power4.out',
                        stagger: 0.12,
                    }
                );
            }
        }, scope);

        // Focus first menu item (if any)
        const first = menuItemsRef.current.find(Boolean);
        if (first && typeof first.focus === 'function') {
            first.focus();
        }

        // Close on Escape
        const onKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('keydown', onKeyDown);

        // Cleanup when menu closes or component unmounts
        return () => {
            ctx.revert();
            document.removeEventListener('keydown', onKeyDown);
            document.body.classList.remove(scrollLockClass);
            document.documentElement.classList.remove(scrollLockClass);

            // Return focus to the toggle button when menu closes
            if (mobileMenuButtonRef.current) {
                mobileMenuButtonRef.current.focus();
            }
        };
    }, [isMobileMenuOpen]);

    // Scroll detection effect (keeps previous scroll position and ticking state in closure variables)
    useEffect(() => {
        const headerHeightThreshold = 105;
        let lastScrollTop = 0;
        let ticking = false;

        const handleScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const scrollTop = window.scrollY || window.pageYOffset || 0;
                if (scrollTop > headerHeightThreshold) {
                    setIsScrolledDown(scrollTop > lastScrollTop);
                } else {
                    setIsScrolledDown(false);
                }
                lastScrollTop = scrollTop;
                ticking = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((p) => !p), []);
    const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

    const handleLogout = useCallback(
        () => {
            logout();
            closeMobileMenu();
        },
        [logout, closeMobileMenu]
    );

    const headerClassName = `header${isMobileMenuOpen ? ' active-mobile-menu' : ''}${isScrolledDown ? ' down-state' : ''}`;

    return (
        <header ref={headerRef} className={headerClassName}>
            <div className="header-wrap">
                {/* Mobile Menu Row */}
                <div className="mobile-menu-row">
                    <div className="mobile-logo-container">
                        <Link to="/" className="mobile-logo-link" onClick={closeMobileMenu}>
                            <img src={logo} alt="Students Manager — Home" className="template-image" />
                        </Link>
                    </div>
                    <div className="mobile-menu-container">
                        <div className="mobile-menu-btn-wrap">
                            <button
                                ref={mobileMenuButtonRef}
                                type="button"
                                className={`menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
                                onClick={toggleMobileMenu}
                                aria-label="Toggle menu"
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="main-navigation"
                            >
                                <span className="lines-wrap">
                                    <span className="line line1" />
                                    <span className="line line2" />
                                    <span className="line line3" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="header-box">
                    <div className="header-box-inner">
                        <nav
                            id="main-navigation"
                            className="nav"
                            role={isMobileMenuOpen ? 'dialog' : 'navigation'}
                            aria-modal={isMobileMenuOpen ? 'true' : undefined}
                            aria-label="Main navigation"
                        >
                            <ul className="menu menu-left">
                                <li className="menu-item" ref={assignMenuItemRef(1)}>
                                    <Link to="/slido" className="menu-link" onClick={closeMobileMenu}>
                                        Slido
                                    </Link>
                                </li>
                                {/* <li className="menu-item" ref={assignMenuItemRef(5)}>
                                    <Link to="/comrades" className="menu-link" onClick={closeMobileMenu}>
                                        Comrades
                                    </Link>
                                </li> */}
                                {isLoggedIn && (
                                    <>
                                        <li className="menu-item" ref={assignMenuItemRef(5)}>
                                            <Link to="/comrades" className="menu-link" onClick={closeMobileMenu}>
                                                Comrades
                                            </Link>
                                        </li>
                                        <li className="menu-item" ref={assignMenuItemRef(0)}>
                                            <Link to="/profile" className="menu-link" onClick={closeMobileMenu}>
                                                Profile
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>

                            <h1 className="logo">
                                <Link to="/" className="logo-link desktop" onClick={closeMobileMenu}>
                                    <img src={logo} alt="Students Manager — Home" />
                                </Link>
                            </h1>

                            <ul className="menu menu-right">
                                <li className="menu-item" ref={assignMenuItemRef(2)}>
                                    <Link to="/quiz" className="menu-link" onClick={closeMobileMenu}>
                                        Quiz
                                    </Link>
                                </li>
                                {isLoggedIn && (
                                    <li className="menu-item" ref={assignMenuItemRef(3)}>
                                        <Link to="/chatbot" className="menu-link" onClick={closeMobileMenu}>
                                            Chatbot
                                        </Link>
                                    </li>
                                )}

                                {isLoggedIn && (
                                    <li className="menu-item" ref={assignMenuItemRef(3)}>
                                        <Link to="/timeline" className="menu-link" onClick={closeMobileMenu}>
                                            Timeline
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </nav>

                        <div className="login-container" ref={assignMenuItemRef(4)}>
                            <div className="login-container-inner">
                                <div className="login-btn-wrap">
                                    {isLoggedIn ? (
                                        <button type="button" className="login btn" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    ) : (
                                        <Link to="/login" className="login btn" onClick={closeMobileMenu}>
                                            Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
export default Header;

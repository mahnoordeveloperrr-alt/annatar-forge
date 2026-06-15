import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

const IMAGES = {
  heroMain: 'img/3.png',
  heroTexture1: 'img/4.png',
  heroTexture2: 'img/5.png',
  portfolio: {
    summit: 'img/6.png',
    rescue: 'img/7.png',
    alpineSans: 'img/8.png',
    avalanche: 'img/9.png',
    glacial: 'img/10.png',
    altitude: 'img/11.png',
  }
};

gsap.registerPlugin(ScrollTrigger);

const TestimonialSlide = ({ quote, name, role, image }) => (
  <div className="testimonial-card">
    <div className="quote-icon">"</div>
    <p className="testimonial-text" dangerouslySetInnerHTML={{ __html: quote }} />
    <div className="profile-wrapper">
      <img src={image} alt={name} className="profile-img" loading="lazy" />
      <div>
        <div className="profile-name">{name}</div>
        <div className="profile-role">{role}</div>
      </div>
    </div>
  </div>
);

const App = () => {
  // Loading screen
  const [loading, setLoading] = useState(true);

  // Dark mode
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'enabled'
  );
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next ? 'enabled' : 'disabled');
  };

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active section (navbar)
  const [activeSection, setActiveSection] = useState('heroSection');

  // Portfolio filter
  const [activeFilter, setActiveFilter] = useState('all');

  // Testimonial slider
  const testimonialsData = [
    { quote: "Parnian doesn't just design — she <strong>thinks strategically</strong>.", name: "Elena Marchetti", role: "Product Director", image: "https://randomuser.me/api/portraits/women/68.jpg" },
    { quote: "Her <strong>design system thinking</strong> elevates every deliverable.", name: "Marcus Chen", role: "Senior UX Lead", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { quote: "Rare combination of <strong>artistic intuition</strong> and <strong>analytical depth</strong>.", name: "Sophia Rodriguez", role: "Head of Product", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { quote: "She thinks <strong>systematically</strong> and always exceeds expectations.", name: "James Okonkwo", role: "CTO", image: "https://randomuser.me/api/portraits/men/45.jpg" },
    { quote: "Parnian's <strong>prototyping velocity</strong> amazes me.", name: "Yuki Tanaka", role: "Design Ops Manager", image: "https://randomuser.me/api/portraits/women/90.jpg" },
    { quote: "One of the <strong>most intellectually curious</strong> designers I've met.", name: "Liam O'Sullivan", role: "VP of Innovation", image: "https://randomuser.me/api/portraits/men/22.jpg" }
  ];
  const slidesChunks = useRef([]);
  for (let i = 0; i < testimonialsData.length; i += 3) {
    slidesChunks.current.push(testimonialsData.slice(i, i + 3));
  }
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoSlideRef = useRef(null);

  // Q&A accordion
  const [activeQA, setActiveQA] = useState(null);

  // Back to top visibility
  const [backToTopVisible, setBackToTopVisible] = useState(false);

  // Refs for cursor animation
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  // Refs for GSAP elements
  const barsRef = useRef([]);
  const skillRingsRef = useRef([]);
  const counterRefs = useRef([]);
  const revealRefs = useRef([]);

 // ---------- Cursor Animation ----------
useEffect(() => {
  const dot = dotRef.current;
  const ring = ringRef.current;

  const onMouseMove = (e) => {
    mousePos.current.x = e.clientX;
    mousePos.current.y = e.clientY;
    if (dot) {
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    }
  };

  const animateRing = () => {
    ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
    ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
    if (ring) {
      ring.style.left = ringPos.current.x + 'px';
      ring.style.top = ringPos.current.y + 'px';
    }
    rafId.current = requestAnimationFrame(animateRing);
  };

  window.addEventListener('mousemove', onMouseMove);
  animateRing();

  const onEnter = () => ringRef.current?.classList.add('large');
  const onLeave = () => ringRef.current?.classList.remove('large');
  const onMouseDown = () => dotRef.current?.classList.add('click');
  const onMouseUp = () => dotRef.current?.classList.remove('click');

  const hoverTargets = document.querySelectorAll(
    'a, button, .cursor-target, .project-card, .craft-card, .social-circle, .slider-arrow, .filter-btn, .back-to-top, .qa-card .question, .nav-link-mobile, .mobile-menu-contact'
  );

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
  });

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    cancelAnimationFrame(rafId.current);
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
    hoverTargets.forEach(el => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    });
  };
}, []);

  // ---------- Dark Mode class ----------
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // ---------- Loading screen ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      gsap.to('#loading-screen', {
        opacity: 0,
        duration: 0.5,
        delay: 0.3,
        onComplete: () => setLoading(false)
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // ---------- Scroll to active section & IntersectionObserver ----------
  useEffect(() => {
    const sections = [
      'heroSection',
      'portfolioSection',
      'skillsSection',
      'processSection',
      'testimonialSection',
      'contactSection'
    ];
    const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length > 0) {
          setActiveSection(intersecting[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -55% 0px' }
    );
    sectionElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---------- Back to top visibility ----------
  useEffect(() => {
    const onScroll = () => setBackToTopVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

 // ---------- GSAP ANIMATIONS ----------
useEffect(() => {
  // Bars
  barsRef.current.forEach((bar, i) => {
    if (bar) {
      gsap.to(bar, {
        width: bar.getAttribute('data-target'),
        duration: 1.2,
        delay: 0.4 + i * 0.2,
        scrollTrigger: {
          trigger: '#heroSection',
          start: 'top 70%'
        }
      });
    }
  });

  // Skill rings
  skillRingsRef.current.forEach(ring => {
    if (ring) {
      gsap.set(ring, { strokeDashoffset: 251.2 });
      ScrollTrigger.create({
        trigger: ring,
        start: 'top 85%',
        onEnter: () => gsap.to(ring, { strokeDashoffset: ring.getAttribute('data-target'), duration: 1.8, ease: 'power2.out' }),
        once: true
      });
    }
  });

  // Counters
  counterRefs.current.forEach(counter => {
    if (counter) {
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        onEnter: () => {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          gsap.to(counter, {
            innerText: target,
            duration: 2.2,
            snap: { innerText: 1 },
            ease: 'power2.out',
            onUpdate: function() {
              counter.innerText = Math.round(counter.innerText);
            }
          });
        },
        once: true
      });
    }
  });

  // Reveal elements
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('visible'),
      once: true
    });
  });

  // Floating star
  gsap.to('.floating-star-right', {
    y: -10,
    duration: 2.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
}, []);

  // ---------- Testimonial autoplay ----------
  useEffect(() => {
    const advance = () => {
      setCurrentSlide(prev => (prev + 1) % slidesChunks.current.length);
    };
    autoSlideRef.current = setInterval(advance, 5500);
    return () => clearInterval(autoSlideRef.current);
  }, []);

  const goToSlide = (idx) => {
    clearInterval(autoSlideRef.current);
    setCurrentSlide((idx + slidesChunks.current.length) % slidesChunks.current.length);
    autoSlideRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slidesChunks.current.length);
    }, 5500);
  };

  const prevSlide = () => goToSlide(currentSlide - 1);
  const nextSlide = () => goToSlide(currentSlide + 1);

  // ---------- Smooth scroll ----------
  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // ---------- Portfolio filter ----------
  const filteredProjects = [
    { category: 'branding', img: IMAGES.portfolio.summit, title: 'Summit Rebrand 2025', desc: 'Complete visual identity overhaul for alpine gear brand.', overlay: 'Summit Collective — Full Brand Identity' },
    { category: 'uiux', img: IMAGES.portfolio.rescue, title: 'RescueFlow Dashboard', desc: 'Emergency response system interface for mountain rescue.', overlay: 'RescueFlow — UI Architecture' },
    { category: 'typography', img: IMAGES.portfolio.alpineSans, title: 'Alpine Sans Typeface', desc: 'Custom geometric sans-serif for high-altitude readability.', overlay: 'Alpine Sans — Custom Typeface' },
    { category: 'motion', img: IMAGES.portfolio.avalanche, title: 'Avalanche Awareness Film', desc: 'Animated documentary short on mountain safety.', overlay: 'Avalanche — Motion Storytelling' },
    { category: 'branding', img: IMAGES.portfolio.glacial, title: 'Glacial Packaging System', desc: 'Premium unboxing experience for alpine apparel.', overlay: 'Glacial — Luxury Packaging' },
    { category: 'uiux', img: IMAGES.portfolio.altitude, title: 'Altitude Shop Experience', desc: 'Full e-commerce redesign with immersive 3D product views.', overlay: 'Altitude — E-commerce Platform' }
  ];
  const projectsToShow = activeFilter === 'all' ? filteredProjects : filteredProjects.filter(p => p.category === activeFilter);

  return (
    <>
      {/* Loading screen */}
      {loading && (
        <div id="loading-screen">
          <i className="fa-solid fa-mountain fa-fw text-3xl mb-2"></i>
          <span className="font-serif-alt text-2xl tracking-wide">Annatar Forge</span>
          <div className="loader-bar"><div className="loader-bar-fill"></div></div>
        </div>
      )}

      {/* Cursor elements */}
      <div className="cursor-dot" id="cursorDot" ref={dotRef}></div>
      <div className="cursor-ring" id="cursorRing" ref={ringRef}></div>

      {/* Back to top */}
      <button
        className={`back-to-top ${backToTopVisible ? 'visible' : ''}`}
        id="backToTop"
        aria-label="Back to top"
        onClick={scrollToTop}
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full px-[2px] z-50 mt-3">
        <div className="navbar-glass max-w-[98%] mx-auto flex items-center justify-between backdrop-blur-md bg-white/70 border border-gray-200 rounded-full px-6 py-3 shadow-sm transition-all">
          <div className="nav-links-desktop text-lg font-semibold">
            {['home', 'work', 'expertise', 'process', 'praise'].map((label, idx) => {
              const sectionIds = ['heroSection', 'portfolioSection', 'skillsSection', 'processSection', 'testimonialSection'];
              const isActive = activeSection === sectionIds[idx];
              return (
                <a
                  key={label}
                  href={`#${sectionIds[idx]}`}
                  className={`nav-link px-6 py-3 rounded-full ${isActive ? 'bg-black text-white nav-active' : 'text-gray-800 hover:bg-blue-50'} transition`}
                  data-section={sectionIds[idx]}
                  onClick={(e) => { e.preventDefault(); handleNavClick(sectionIds[idx]); }}
                >
                  {label}
                </a>
              );
            })}
          </div>

          <button
            className="hamburger-btn"
            id="hamburgerBtn"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          <div className="nav-actions-desktop">
            <button
              id="darkModeToggle"
              className="dark-mode-toggle w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition"
              onClick={toggleDarkMode}
            >
              <i className={`fa-regular ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <a
              href="#contactSection"
              className="px-8 py-3 text-lg font-semibold rounded-full bg-black text-white hover:bg-gray-900 transition ripple-btn"
              onClick={(e) => { e.preventDefault(); handleNavClick('contactSection'); }}
            >
              contact
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} id="mobileMenuOverlay" onClick={() => setMobileMenuOpen(false)}>
        <div className="mobile-menu-panel" id="mobileMenuPanel" onClick={(e) => e.stopPropagation()}>
          <button className="mobile-menu-close" id="mobileMenuClose" onClick={() => setMobileMenuOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="mobile-menu-links">
            {['home', 'work', 'expertise', 'process', 'praise'].map((label, idx) => {
              const sectionIds = ['heroSection', 'portfolioSection', 'skillsSection', 'processSection', 'testimonialSection'];
              const isActive = activeSection === sectionIds[idx];
              return (
                <a
                  key={label}
                  href={`#${sectionIds[idx]}`}
                  className={`nav-link-mobile ${isActive ? 'nav-active-mobile' : ''}`}
                  data-section={sectionIds[idx]}
                  onClick={(e) => { e.preventDefault(); handleNavClick(sectionIds[idx]); }}
                >
                  {label}
                </a>
              );
            })}
          </div>
          <a
            href="#contactSection"
            className="mobile-menu-contact"
            onClick={(e) => { e.preventDefault(); handleNavClick('contactSection'); }}
          >
            contact
          </a>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative w-full flex items-start pt-32 pb-12" id="heroSection">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-stone-50 -z-10"></div>
        <div className="w-full px-[2px]">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-28 h-[48rem]">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm overflow-hidden">
              <div className="inline-flex items-center gap-2 mb-3 bg-gray-100 px-3 py-1 rounded-full border">
                <i className="fa-solid fa-feather text-blue-600 text-xs"></i>
                <span className="text-[11px] uppercase tracking-[0.2em] text-blue-700 font-semibold">Haute altitude</span>
              </div>
              <h1 className="font-serif-alt text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.2]">
                Annatar forge<br /><span className="italic font-light text-blue-800">in secret elegant clothes</span>
              </h1>
              <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4 mt-8">
                <span className="text-xl md:text-2xl font-bold">EVEREST</span>
                <span className="text-xs text-gray-500 uppercase">· realm of giants</span>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  { icon: 'fa-flag', label: 'South Base Camp', value: '+4,881 m' },
                  { icon: 'fa-mountain', label: 'Advanced Camp', value: '+4,423 m' },
                  { icon: 'fa-person-hiking', label: 'Lhotse Face', value: '+3,910 m' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className={`fa-solid ${item.icon} text-blue-600 text-xs`}></i>
                      <span>{item.label}</span>
                    </div>
                    <span className="font-bold text-blue-700">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                {[
                  { icon: 'fa-flag-checkered', label: 'Endurance', val: '92%', id: 'bar1' },
                  { icon: 'fa-cloud-sun', label: 'Acclimatization', val: '78%', id: 'bar2' },
                  { icon: 'fa-mountain', label: 'Summit', val: '65%', id: 'bar3' }
                ].map((item, i) => (
                  <div key={item.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span><i className={`fa-solid ${item.icon} text-blue-600`}></i> {item.label}</span>
                      <span>{item.val}</span>
                    </div>
                    <div className="bar-container">
                      <div
                        ref={el => barsRef.current[i] = el}
                        className="bar-fill"
                        id={item.id}
                        data-target={item.val}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                <div><span className="text-xs text-gray-500">Product</span><div className="font-medium">Annatar Alpine Parka</div><div className="text-xs text-blue-600">heritage edition</div></div>
                <div><span className="text-xs text-gray-500">Price</span><div className="font-medium">$2,890 USD</div><div className="text-xs text-gray-400">limited series</div></div>
                <div><span className="text-xs text-gray-500">Client</span><div className="font-medium">Summit Collective</div><div className="text-xs text-blue-600">5x expedition trust</div></div>
              </div>
            </div>
            <div className="relative bg-white rounded-3xl shadow-md h-[48rem] overflow-hidden pr-6">
              <div className="image relative h-[48rem] overflow-hidden rounded-3xl">
                {/* NOW USING IMAGES.heroMain */}
                <img src={IMAGES.heroMain} className="w-full h-full object-cover" alt="Alpine elevation visual" loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/900x1200?text=Elevation+Visual'; }} />
                <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                  {['heart', 'share-nodes', 'bookmark'].map(icon => (
                    <button key={icon} className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white shadow-md hover:bg-gray-800 transition ripple-btn">
                      <i className={`fa-solid fa-${icon}`}></i>
                    </button>
                  ))}
                </div>
                <div className="absolute bottom-6 right-6 w-[250px] h-[250px] bg-white rounded-2xl shadow-[10px_10px_0px_rgba(0,0,0,0.8)] p-5 flex flex-col justify-between glow-pulse">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white self-end">
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                  <h1 className="text-5xl font-bold text-gray-900 w-full leading-none">EVENT</h1>
                  <p className="text-sm text-gray-500 leading-relaxed">Where innovation meets elevation — experience the summit of design.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRAFTSMANSHIP */}
      <section className="w-full py-20 md:py-28 bg-white" id="craftSection">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-[#CBD9F0]/30 px-4 py-1.5 rounded-full text-sm font-medium text-[#002877]">
              <i className="fa-regular fa-gem"></i> the forge chronicles
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div ref={el => revealRefs.current.push(el)} className="reveal">
              <h2 className="font-serif-alt text-4xl md:text-5xl font-bold leading-tight text-black">
                Where altitude<br />meets <span className="text-[#002877]">artisanship</span>
              </h2>
              <div className="w-16 h-1 bg-[#89BBEA] mt-6 mb-8"></div>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
                Every stitch, every seam is forged in the spirit of the highest peaks. Annatar doesn't just create clothing — we engineer <strong className="text-[#002877]">survival elegance</strong>.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8">
                With a heritage rooted in alpine exploration and modern design philosophy, we bring you <strong className="text-[#002877]">limited editions</strong> that blend technical performance with timeless silhouette.
              </p>
              <div className="flex flex-wrap gap-5">
                {[
                  { icon: 'fa-cloud-arrow-up', text: '7,000m+ tested' },
                  { icon: 'fa-feather', text: 'handcrafted detail' },
                  { icon: 'fa-star-of-life', text: 'lifetime warranty' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} text-2xl text-[#002877]`}></i>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { bg: 'bg-[#CBD9F0]', icon: 'fa-mountain-city', title: '14 peaks', desc: 'expedition-proven gear.' },
                { bg: 'bg-white border border-[#89BBEA]', icon: 'fa-clock', title: '40+ years', desc: 'collective heritage.' },
                { bg: 'bg-white border border-[#CBD9F0]', icon: 'fa-leaf', title: '100% RWS', desc: 'ethical down & recycled.' },
                { bg: 'bg-[#002877] text-white', icon: 'fa-people-group', iconColor: 'text-[#89BBEA]', title: 'summit collective', desc: 'trusted by 20+ guides.', textWhite: true }
              ].map((card, i) => (
                <div key={i} ref={el => revealRefs.current.push(el)} className={`${card.bg} rounded-2xl p-6 craft-card reveal`}>
                  <i className={`fa-solid ${card.icon} text-3xl ${card.iconColor || 'text-[#002877]'} mb-4`}></i>
                  <h3 className="font-bold text-xl">{card.title}</h3>
                  <p className={`${card.textWhite ? 'text-white/80' : 'text-gray-700'} text-sm`}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section className="w-full py-20 md:py-28 bg-gray-50/50" id="portfolioSection">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-[#CBD9F0]/30 px-4 py-1.5 rounded-full text-sm font-medium text-[#002877]">
              <i className="fa-solid fa-briefcase"></i> curated work
            </span>
            <h2 className="font-serif-alt text-4xl md:text-5xl font-bold mt-6 text-black">Selected <span className="text-[#002877]">Projects</span></h2>
            <div className="w-16 h-1 bg-[#89BBEA] mx-auto mt-4"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-10" id="filterButtons">
            {['all', 'branding', 'uiux', 'typography', 'motion'].map(filter => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                data-filter={filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'All Work' : filter === 'uiux' ? 'UI / UX' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolioGrid">
            {projectsToShow.map((project, idx) => (
              <div key={idx} className="project-card" data-category={project.category}>
                <div className="relative overflow-hidden h-64">
                  {/* IMAGES ALREADY FROM IMAGES OBJECT */}
                  <img src={project.img} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="project-overlay">
                    <span className="text-white font-semibold text-lg">{project.overlay}</span>
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-[#002877] uppercase tracking-wider">{project.category === 'uiux' ? 'UI / UX' : project.category.charAt(0).toUpperCase() + project.category.slice(1)}</span>
                  <h3 className="font-bold text-lg mt-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PALLERS */}
      <section>
        <div className="pallers">
          <img className="bg-image" src="https://images.pexels.com/photos/257360/pexels-photo-257360.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Alpine mountain range" loading="lazy" />
          <div className="relative z-20 w-full flex flex-col lg:flex-row items-center justify-between gap-8 px-6 md:px-12 py-12 md:py-16">
            <div className="stats-glass-card w-full lg:w-5/12 p-7 md:p-8 rounded-3xl">
              <div className="flex items-center gap-2 mb-5">
                <span className="badge-summit"><i className="fa-regular fa-snowflake"></i> SUMMIT MINDSET</span>
                <span className="text-xs font-medium text-[#002877] bg-white/40 px-3 py-1 rounded-full">Parnian Samareh · Lead Strategist</span>
              </div>
              <h3 className="font-serif-alt text-2xl md:text-3xl font-bold text-[#002877] mb-3">Alpine Design<br />Philosophy</h3>
              <div className="w-12 h-0.5 bg-[#89BBEA] mb-5"></div>
              <p className="text-gray-800 text-sm md:text-base leading-relaxed mb-5">
                "Our craft is a dialogue with thin air. <strong className="text-[#002877]">8,000 meters of functionality</strong> meets high alpine elegance."
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { number: '14', label: 'expeditions', color: 'border-[#002877]' },
                  { number: '7K+', label: 'meters tested', color: 'border-[#89BBEA]' },
                  { number: '23', label: 'awards', color: 'border-[#002877]' },
                  { number: '100%', label: 'retention', color: 'border-[#89BBEA]' }
                ].map((stat, i) => (
                  <div key={i} className={`border-l-4 ${stat.color} pl-3`}>
                    <div className="text-2xl font-black text-[#002877]">{stat.number}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="content-overlay-premium w-full lg:w-5/12 p-7 md:p-9 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/30">
              <i className="fa-regular fa-gem text-3xl text-[#89BBEA] mb-4 block"></i>
              <span className="text-xs uppercase tracking-[0.3em] text-[#CBD9F0] font-semibold">elevation code · annatar forge</span>
              <p className="text-2xl md:text-4xl font-serif-alt mt-3 text-white drop-shadow-md leading-tight">"Design that breathes at 8,000 meters"</p>
              <div className="my-6 h-px w-full bg-white/30"></div>
              <p className="text-white/90 text-base leading-relaxed font-light">
                Parnian Samareh bridges <strong className="text-[#89BBEA]">strategic foresight</strong> and alpine soul. <span className="inline-block mt-2">✦ Trusted by Himalayan Trust & Summit Labs ✦</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="w-full py-20 md:py-28 bg-white" id="skillsSection">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-[#CBD9F0]/30 px-4 py-1.5 rounded-full text-sm font-medium text-[#002877]">
              <i className="fa-solid fa-chart-pie"></i> core competencies
            </span>
            <h2 className="font-serif-alt text-4xl md:text-5xl font-bold mt-6 text-black">Mastery <span className="text-[#002877]">Spectrum</span></h2>
            <div className="w-16 h-1 bg-[#89BBEA] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { value: '90%', offset: '25', label: 'Brand Strategy' },
              { value: '80%', offset: '50', label: 'UI/UX Design' },
              { value: '94%', offset: '15', label: 'Typography' },
              { value: '76%', offset: '60', label: 'Motion Design' },
              { value: '86%', offset: '35', label: 'Design Systems' },
              { value: '82%', offset: '45', label: 'Prototyping' }
            ].map((skill, i) => (
              <div key={i} className="reveal flex flex-col items-center gap-3" ref={el => revealRefs.current.push(el)}>
                <div className="skill-ring-container">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle className="skill-ring-bg" cx="50" cy="50" r="40" />
                    <circle
                      ref={el => skillRingsRef.current[i] = el}
                      className="skill-ring-fg"
                      cx="50" cy="50" r="40"
                      strokeDasharray="251.2"
                      strokeDashoffset="251.2"
                      data-target={skill.offset}
                    />
                  </svg>
                  <span className="skill-ring-value">{skill.value}</span>
                </div>
                <span className="font-semibold text-sm text-gray-700">{skill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LANDO SULLIVAN HERO */}
      <div className="lando-hero" id="landoSection">
        <div className="hero-heading"><h1>Lando Sullivan</h1></div>
        <div className="bottom-section">
          <div className="two-column-grid">
            <div className="left-content">
              <p className="description">
                A London based designer with an infinite love for <span className="highlight-soft">typography</span>, specialised in <span className="highlight-soft">Branding</span> and <span className="highlight-soft">Visual identities</span>.
              </p>
              <div className="small-img-wrapper">
                <img className="small-product-img cursor-target" src={IMAGES.heroTexture1} alt="Typography specimen" loading="lazy" />
              </div>
            </div>
            <div className="right-content">
              <img className="portrait-img cursor-target" src={IMAGES.heroTexture2} alt="Lando Sullivan portrait" loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-text">LANDO SULLIVAN — TYPOGRAPHY — BRANDING — VISUAL IDENTITIES — DESIGN STRATEGY —</div>
          <div className="marquee-text">LANDO SULLIVAN — TYPOGRAPHY — BRANDING — VISUAL IDENTITIES — DESIGN STRATEGY —</div>
        </div>
      </div>

      {/* PROCESS SECTION */}
      <section className="w-full py-20 md:py-28 bg-white" id="processSection">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-[#CBD9F0]/30 px-4 py-1.5 rounded-full text-sm font-medium text-[#002877]">
              <i className="fa-solid fa-route"></i> how i work
            </span>
            <h2 className="font-serif-alt text-4xl md:text-5xl font-bold mt-6 text-black">The <span className="text-[#002877]">Process</span></h2>
            <div className="w-16 h-1 bg-[#89BBEA] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: '01', icon: 'fa-magnifying-glass', title: 'Discovery', desc: "Deep immersion into your brand's core narrative, audience, and market landscape." },
              { number: '02', icon: 'fa-pencil-ruler', title: 'Strategy', desc: 'Mood boards, typography exploration, color theory — building the strategic foundation.' },
              { number: '03', icon: 'fa-wand-magic-sparkles', title: 'Craft', desc: 'Iterative design with precision — every pixel, every curve refined to perfection.' },
              { number: '04', icon: 'fa-rocket', title: 'Launch', desc: 'Seamless delivery with comprehensive documentation and ongoing support.' }
            ].map((step, i) => (
              <div key={i} className="process-step reveal" ref={el => revealRefs.current.push(el)}>
                <div className="process-number">{step.number}</div>
                <i className={`fa-solid ${step.icon} text-3xl text-[#002877] mb-3`}></i>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTERS SECTION */}
      <section className="w-full py-16 md:py-20 bg-[#002877] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-white text-8xl font-bold">✦</div>
          <div className="absolute bottom-10 right-10 text-white text-8xl font-bold">✦</div>
        </div>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {[
            { target: '150', label: 'Projects Delivered' },
            { target: '42', label: 'Happy Clients' },
            { target: '18', label: 'Years Experience' },
            { target: '27', label: 'Awards Won' }
          ].map((counter, i) => (
            <div key={i} className="counter-card reveal bg-white/10 border-white/20 text-white" ref={el => revealRefs.current.push(el)}>
              <div
                className="counter-number"
                data-target={counter.target}
                ref={el => counterRefs.current[i] = el}
              >0</div>
              <div className="text-sm uppercase tracking-wider mt-2 opacity-80">{counter.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Q&A SECTION */}
      <section className="qa-section" id="qaSection">
        <div className="qa-container">
          <div className="qa-big-text-wrapper">
            <div className="qa-big-text">ASK<br />ME<br />ANYTHING</div>
          </div>
          <div className="qa-right">
            <div className="qa-heading">
              <h2>QUESTIONS & ANSWERS</h2>
              <div className="qa-sub">✦ deep insights from the forge ✦</div>
            </div>
            <div className="qa-accordion" id="qaAccordion">
              {[
                { q: "What is your design philosophy?", a: "I believe in <strong class='text-[#002877]'>functional minimalism</strong> — where every element serves a purpose." },
                { q: "Which industries do you specialise in?", a: "I've worked extensively with <strong class='text-[#002877]'>tech startups, cultural institutions, and lifestyle brands</strong>." },
                { q: "How do you approach a new branding project?", a: "Immersion in the brand's <strong>core narrative, audience, and market landscape</strong> first." },
                { q: "Do you work with international clients?", a: "Absolutely. Remote workflows are seamless; <strong>clarity and vision</strong> always come first." },
                { q: "What tools do you use?", a: "<strong>Figma, Adobe Creative Suite, and Webflow</strong>. For motion, After Effects." },
                { q: "How can I start a project with you?", a: "Reach out via email for a free discovery call. <strong class='text-[#002877]'>Let's make something remarkable.</strong>" }
              ].map((item, idx) => (
                <div key={idx} className={`qa-card ${activeQA === idx ? 'active' : ''}`}>
                  <div className="question" onClick={() => setActiveQA(activeQA === idx ? null : idx)}>
                    {item.q}
                    <i className={`fa-regular ${activeQA === idx ? 'fa-minus' : 'fa-plus'}`}></i>
                  </div>
                  <div className="answer" dangerouslySetInnerHTML={{ __html: item.a }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="w-full py-20 md:py-28 bg-gray-50/50" id="timelineSection">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-[#CBD9F0]/30 px-4 py-1.5 rounded-full text-sm font-medium text-[#002877]">
              <i className="fa-solid fa-timeline"></i> journey
            </span>
            <h2 className="font-serif-alt text-4xl md:text-5xl font-bold mt-6 text-black">Career <span className="text-[#002877]">Timeline</span></h2>
            <div className="w-16 h-1 bg-[#89BBEA] mx-auto mt-4"></div>
          </div>
          <div className="relative border-l-2 border-[#CBD9F0] pl-10 space-y-10">
            {[
              { year: '2024 — Present', title: 'Lead Design Strategist · Annatar Forge', desc: 'Directing alpine-inspired design systems and brand identities for global clients.' },
              { year: '2021 — 2024', title: 'Senior Brand Designer · Studio Alma', desc: 'Led rebranding initiatives for Fortune 500 companies across EMEA.' },
              { year: '2018 — 2021', title: 'UI/UX Designer · Velos Tech', desc: 'Designed scalable design systems for SaaS platforms serving 2M+ users.' },
              { year: '2016 — 2018', title: 'Junior Designer · Northe Creative', desc: 'Started the journey — honed typography and visual identity craft.' }
            ].map((item, i) => (
              <div key={i} className="timeline-card reveal" ref={el => revealRefs.current.push(el)}>
                <div className="timeline-dot"></div>
                <span className="text-xs font-bold text-[#002877] uppercase tracking-wider">{item.year}</span>
                <h3 className="font-bold text-lg mt-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="w-full bg-white pt-24 md:pt-28 relative" id="testimonialSection">
        <div className="heading-section text-center px-4">
          <h2 className="font-bold uppercase tracking-[0.18em] text-4xl md:text-5xl lg:text-[56px] text-black flex items-center justify-center flex-wrap gap-3">
            <span>COLLEAGUES'</span>
            <span className="star-accent text-[#002877]">✦</span>
            <span>WORDS</span>
          </h2>
        </div>
        <div className="relative w-full overflow-hidden" id="testimonialSlider">
          <div className="slides-track w-full" id="slidesTrack" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slidesChunks.current.map((chunk, chunkIdx) => (
              <div key={chunkIdx} className="slide">
                <div className="full-width-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-custom w-full">
                  {chunk.map((t, i) => (
                    <TestimonialSlide key={i} {...t} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button id="prevSlide" className="slider-arrow absolute left-4 top-1/2 -translate-y-1/2 z-20" onClick={prevSlide}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button id="nextSlide" className="slider-arrow absolute right-4 top-1/2 -translate-y-1/2 z-20" onClick={nextSlide}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          <div className="flex justify-center items-center gap-1 mt-14 pb-6" id="dotsContainer">
            {slidesChunks.current.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="premium-footer w-full mt-20 relative" id="contactSection">
        <div className="big-text-left"><div className="big-contact-text">CONTACT ME</div></div>
        <div className="floating-star-right"><i className="fas fa-star"></i></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full min-h-[420px] px-5">
          <div className="flex flex-wrap justify-center gap-5 md:gap-6 mb-12">
            {[
              { icon: 'far fa-envelope', href: 'mailto:hello@parnian.design' },
              { icon: 'fab fa-linkedin-in', href: '#' },
              { icon: 'fas fa-globe', href: '#' },
              { icon: 'fab fa-dribbble', href: '#' },
              { icon: 'fab fa-behance', href: '#' }
            ].map((social, i) => (
              <a key={i} href={social.href} className="social-circle group">
                <i className={`${social.icon} text-xl`}></i>
              </a>
            ))}
          </div>
          <div className="w-full max-w-6xl mx-auto mt-10 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
            <div className="text-black font-medium tracking-wide">© 2026 Parnian Samareh · Annatar Forge · Alpine Altitude Design</div>
            <div className="text-[#002877] font-semibold tracking-wide">Crafted with precision ✦</div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default App;
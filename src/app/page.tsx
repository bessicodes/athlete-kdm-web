"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const aboutVideoRef = useRef<HTMLVideoElement>(null);
  const soundPlayedOnceRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNavSolid, setIsNavSolid] = useState(false);

  const stats = [
    { label: "Clips Edited", target: 420, suffix: "+" },
    { label: "Community Reach", target: 1200, suffix: "K+" },
    { label: "Sports Covered", target: 18, suffix: "+" },
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".panel-section, .panel, .about-block, .about-legal, .about-video-wrap, .contact-intro, .contact-social-wrap, .social-card, .site-footer-inner"
      )
    );
    revealTargets.forEach((element) => element.classList.add("reveal-up"));

    const gridCards = Array.from(
      document.querySelectorAll<HTMLElement>(".social-grid .social-card")
    );
    gridCards.forEach((card, index) =>
      card.style.setProperty("--stagger-delay", `${index * 100}ms`)
    );

    let revealObserver: IntersectionObserver | null = null;
    if (prefersReducedMotion) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.16 }
      );

      revealTargets.forEach((element) => revealObserver?.observe(element));
    }

    const countupElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-countup]")
    );
    const countupFrames = new Map<HTMLElement, number>();

    const formatCountValue = (value: number, suffix: string) => {
      if (suffix === "K+") return `${Math.round(value)}K+`;
      return `${Math.round(value)}${suffix}`;
    };

    const runCountup = (element: HTMLElement) => {
      const target = Number.parseFloat(element.dataset.countup ?? "0");
      const suffix = element.dataset.suffix ?? "";
      if (!Number.isFinite(target)) return;

      if (prefersReducedMotion) {
        element.textContent = formatCountValue(target, suffix);
        return;
      }

      const duration = 1300;
      const start = performance.now();
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeOutCubic(progress);
        element.textContent = formatCountValue(target * eased, suffix);
        if (progress < 1) {
          countupFrames.set(element, window.requestAnimationFrame(tick));
        } else {
          countupFrames.delete(element);
        }
      };

      countupFrames.set(element, window.requestAnimationFrame(tick));
    };

    let countupObserver: IntersectionObserver | null = null;
    if (prefersReducedMotion) {
      countupElements.forEach((element) => runCountup(element));
    } else {
      countupObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCountup(entry.target as HTMLElement);
              countupObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.45, rootMargin: "0px 0px -8% 0px" }
      );
      countupElements.forEach((element) => countupObserver?.observe(element));
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;
    let lastScrollY = window.scrollY;

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const onScroll = () => {
      setIsNavSolid(window.scrollY > 80);

      const scrollDelta = window.scrollY - lastScrollY;
      if (!prefersReducedMotion) {
        targetY += scrollDelta * 0.22;
      }
      lastScrollY = window.scrollY;
      updateScrollMotion();
    };

    const updateScrollMotion = () => {
      if (prefersReducedMotion) {
        document.documentElement.style.setProperty("--scroll-ratio", "0");
        document.documentElement.style.setProperty("--hero-parallax-y", "0px");
        document.documentElement.style.setProperty("--panel-parallax-y", "0px");
        document.documentElement.style.setProperty("--bg-shift-x", "0px");
        document.documentElement.style.setProperty("--bg-shift-y", "0px");
        return;
      }

      const maxScrollable = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const ratio = Math.min(Math.max(window.scrollY / maxScrollable, 0), 1);
      const heroShift = -ratio * 22;
      const panelShift = -ratio * 12;
      const bgShiftX = ratio * 22;
      const bgShiftY = ratio * 36;
      document.documentElement.style.setProperty("--scroll-ratio", ratio.toFixed(4));
      document.documentElement.style.setProperty(
        "--hero-parallax-y",
        `${heroShift.toFixed(2)}px`
      );
      document.documentElement.style.setProperty(
        "--panel-parallax-y",
        `${panelShift.toFixed(2)}px`
      );
      document.documentElement.style.setProperty(
        "--bg-shift-x",
        `${bgShiftX.toFixed(2)}px`
      );
      document.documentElement.style.setProperty(
        "--bg-shift-y",
        `${bgShiftY.toFixed(2)}px`
      );
    };

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;
      const lagX = ((currentX / window.innerWidth) - 0.5) * 14;
      const lagY = ((currentY / window.innerHeight) - 0.5) * 10;
      document.documentElement.style.setProperty("--lag-x", `${lagX.toFixed(2)}px`);
      document.documentElement.style.setProperty("--lag-y", `${lagY.toFixed(2)}px`);
      frame = window.requestAnimationFrame(animateCursor);
    };

    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", onMouseMove);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!prefersReducedMotion) {
      frame = window.requestAnimationFrame(animateCursor);
    }

    const setHeaderOffset = () => {
      const header = document.querySelector(".site-header") as HTMLElement | null;
      const offset = (header?.offsetHeight ?? 96) + 18;
      document.documentElement.style.setProperty("--header-offset", `${offset}px`);
    };

    setHeaderOffset();
    updateScrollMotion();
    window.addEventListener("resize", setHeaderOffset);

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const easeInOutQuint = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

    let scrollFrame = 0;

    const smoothScrollTo = (targetY: number) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const distance = Math.abs(diff);
      if (prefersReducedMotion) {
        window.scrollTo(0, targetY);
        return;
      }

      const duration = Math.min(1500, Math.max(760, distance * 0.9));
      const startTime = performance.now();

      if (scrollFrame) {
        window.cancelAnimationFrame(scrollFrame);
      }

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutQuint(progress);
        window.scrollTo(0, startY + diff * eased);
        if (progress < 1) {
          scrollFrame = window.requestAnimationFrame(step);
        }
      };

      scrollFrame = window.requestAnimationFrame(step);
    };

    const handleAnchorClick = (event: Event) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const section = document.querySelector(href);
      if (!section) return;

      event.preventDefault();
      if (href === "#home") {
        smoothScrollTo(0);
        return;
      }
      const rawOffset = getComputedStyle(document.documentElement)
        .getPropertyValue("--header-offset")
        .trim();
      const headerOffset = Number.parseFloat(rawOffset) || 114;
      const rectTop = section.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(Math.max(rectTop - headerOffset, 0));
    };

    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    );
    anchors.forEach((anchor) => anchor.addEventListener("click", handleAnchorClick));

    return () => {
      revealObserver?.disconnect();
      countupObserver?.disconnect();
      window.removeEventListener("resize", setHeaderOffset);
      if (!prefersReducedMotion) {
        window.removeEventListener("mousemove", onMouseMove);
      }
      window.removeEventListener("scroll", onScroll);
      if (!prefersReducedMotion) {
        window.cancelAnimationFrame(frame);
      }
      countupFrames.forEach((animationId) =>
        window.cancelAnimationFrame(animationId)
      );
      if (scrollFrame) {
        window.cancelAnimationFrame(scrollFrame);
      }
      document.documentElement.style.setProperty("--lag-x", "0px");
      document.documentElement.style.setProperty("--lag-y", "0px");
      document.documentElement.style.setProperty("--scroll-ratio", "0");
      document.documentElement.style.setProperty("--hero-parallax-y", "0px");
      document.documentElement.style.setProperty("--panel-parallax-y", "0px");
      document.documentElement.style.setProperty("--bg-shift-x", "0px");
      document.documentElement.style.setProperty("--bg-shift-y", "0px");
      anchors.forEach((anchor) =>
        anchor.removeEventListener("click", handleAnchorClick)
      );
    };
  }, []);

  useEffect(() => {
    const video = aboutVideoRef.current;
    if (!video) return;

    video.volume = 0.08;
    video.muted = false;

    const startWithSound = async () => {
      try {
        video.currentTime = 0;
        await video.play();
        setIsPlaying(true);
        setIsMuted(false);
      } catch {
        video.muted = true;
        setIsMuted(true);
        void video.play();
      }
    };

    const muteAfterFirstAudioPass = () => {
      if (soundPlayedOnceRef.current) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      if (video.muted) return;

      if (video.currentTime >= video.duration - 0.15) {
        soundPlayedOnceRef.current = true;
        video.muted = true;
        setIsMuted(true);
      }
    };

    void startWithSound();
    video.addEventListener("timeupdate", muteAfterFirstAudioPass);

    const enableSoundOnFirstInteraction = () => {
      if (soundPlayedOnceRef.current) return;
      video.currentTime = 0;
      video.muted = false;
      video.volume = 0.08;
      setIsMuted(false);
      void video.play();
    };

    window.addEventListener("pointerdown", enableSoundOnFirstInteraction, {
      once: true,
      passive: true,
    });

    return () => {
      video.removeEventListener("timeupdate", muteAfterFirstAudioPass);
      window.removeEventListener("pointerdown", enableSoundOnFirstInteraction);
    };
  }, []);

  const toggleVideoPlayback = () => {
    const video = aboutVideoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleVideoSound = () => {
    const video = aboutVideoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.volume = 0.08;
    }
    setIsMuted(nextMuted);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("athletekingdomedits@gmail.com");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <header className={`site-header ${isNavSolid ? "is-solid" : ""}`}>
        <a href="#home" className="brand intro-logo">
          <Image
            src="./images/kdm-logo-header.png"
            alt="Athlete Kingdom logo"
            width={90}
            height={90}
            unoptimized
            priority
          />
        </a>
        <nav>
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      <main className="page-shell">
        <div className="vibrant-bg" aria-hidden />
        <section id="home" className="hero">
          <div className="hero-content reveal is-visible">
            <p className="hero-kicker">
              <span className="intro-tagline">THE HOME OF SPORTS</span>
            </p>
            <h1>
              <span className="filled">ATHLETE</span>
              <span className="outline">KINGDOM</span>
            </h1>
            <div className="hero-fog" aria-hidden>
              <span className="fog-layer fog-a" />
              <span className="fog-layer fog-b" />
              <span className="fog-layer fog-c" />
            </div>
          </div>

          <a href="#about" className="scroll-indicator" aria-label="Scroll down">
            <span />
          </a>
        </section>

        <section id="about" className="panel-section">
          <div className="panel reveal" data-reveal>
            <h2>ABOUT</h2>
            <div className="about-layout">
              <div className="about-content">
                <article className="about-block">
                  <span className="about-badge">Identity</span>
                  <h3>Athlete Kingdom: The Home of Sports</h3>
                  <p>
                    Join the community of sports lovers and athletes and connect
                    with content designed to inspire progress.
                  </p>
                </article>

                <details className="about-legal" open>
                  <summary>Copyright and Fair Use</summary>
                  <p>
                    I ensure all videos are transformative, featuring original
                    commentary and creative edits that add value beyond source
                    material.
                  </p>
                  <p>
                    Under Section 107 of the Copyright Act 1976, fair use
                    includes criticism, comment, news reporting, teaching,
                    scholarship, and research.
                  </p>
                </details>

                <div className="stats-grid">
                  {stats.map((stat) => (
                    <article className="stat-card" key={stat.label}>
                      <strong
                        data-countup={stat.target}
                        data-suffix={stat.suffix}
                        aria-label={`${stat.label} ${stat.target}${stat.suffix}`}
                      >
                        0
                        {stat.suffix}
                      </strong>
                      <span>{stat.label}</span>
                    </article>
                  ))}
                </div>
              </div>

              <div className="about-media">
                <div className="about-video-wrap">
                  <video
                    ref={aboutVideoRef}
                    className="about-video"
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    preload="auto"
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  >
                    <source src="./videos/edit2.mp4" type="video/mp4" />
                    Your browser does not support this video format.
                  </video>
                  <button
                    type="button"
                    className="video-toggle"
                    onClick={toggleVideoPlayback}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    type="button"
                    className="video-toggle sound"
                    onClick={toggleVideoSound}
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? "Sound On" : "Sound Off"}
                  </button>
                </div>

                <div className="about-media-meta">
                  <span>Transformative edits</span>
                  <span>Community-first sports content</span>
                </div>
              </div>
            </div>
            <p className="section-mark">ATHLETE KINGDOM</p>
          </div>
        </section>

        <section id="contact" className="panel-section">
          <div className="panel reveal" data-reveal>
            <h2>CONTACT</h2>
            <div className="contact-live">
              <div className="contact-intro">
                <p className="contact-eyebrow">Join the Kingdom Community</p>
                <h3 className="contact-title">
                  Let&apos;s connect, collaborate, and build the home of sports
                  together.
                </h3>
                <p>
                  Athlete Kingdom welcomes athletes, creators, brands, and sports
                  fans who want to grow with a passionate community. For
                  collaborations, questions, copyright support, or partnership
                  ideas, reach out via{" "}
                  <a href="mailto:athletekingdomedits@gmail.com">
                    athletekingdomedits@gmail.com
                  </a>
                  . You&apos;re always welcome here.
                </p>
                <blockquote className="contact-quote">
                  Built by passion. Driven by athletes.
                </blockquote>

                <div className="contact-actions">
                  <a
                    className="contact-btn primary"
                    href="mailto:athletekingdomedits@gmail.com"
                  >
                    Start a Conversation
                  </a>
                  <button className="contact-btn" type="button" onClick={copyEmail}>
                    {copied ? "Email Copied" : "Copy Email"}
                  </button>
                </div>
              </div>

              <div className="contact-social-wrap">
                <p className="contact-kicker">Connect on Social</p>
                <div className="social-grid">
                  <a
                    className="social-card"
                    href="https://instagram.com/athletekingdm?igsh=MWFkY2RrajhqN2psMA==&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="social-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                        <circle cx="12" cy="12" r="4.2" />
                        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="social-copy">
                      <small>Instagram</small>
                      <strong>Follow Athlete Kingdom</strong>
                    </span>
                  </a>
                  <a
                    className="social-card"
                    href="https://tiktok.com/@athletekingdm?_t=8kQJrUQWZmw&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="social-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M14 5v8.1a3.1 3.1 0 1 1-2.2-2.9" />
                        <path d="M14 5c.9 1.8 2.1 2.9 4 3.2" />
                      </svg>
                    </span>
                    <span className="social-copy">
                      <small>TikTok</small>
                      <strong>Watch Fresh Edits</strong>
                    </span>
                  </a>
                  <a
                    className="social-card"
                    href="https://www.youtube.com/@AthleteKingdom"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="social-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="2.5" y="6.5" width="19" height="11" rx="3.5" />
                        <path d="M10 9.5 15.5 12 10 14.5z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="social-copy">
                      <small>YouTube</small>
                      <strong>Subscribe for Weekly Drops</strong>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <p className="section-mark">THE HOME OF SPORTS</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="footer-brand">Athlete Kingdom</p>
          <p className="footer-copy">
            © {new Date().getFullYear()} Athlete Kingdom. All rights reserved.
          </p>
          <p className="footer-note">
            Content is transformative and shared under fair use principles
            (Copyright Act Section 107) for commentary, education, and creative
            editing.
          </p>
          <a className="footer-email" href="mailto:athletekingdomedits@gmail.com">
            athletekingdomedits@gmail.com
          </a>
        </div>
      </footer>
    </>
  );
}

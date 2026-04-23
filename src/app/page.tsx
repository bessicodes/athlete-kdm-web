"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const aboutVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
    );

    elements.forEach((element) => observer.observe(element));

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;
    let lastScrollY = window.scrollY;
    const cursor = document.querySelector<HTMLElement>(".cursor-ring");

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const onScroll = () => {
      const scrollDelta = window.scrollY - lastScrollY;
      targetY += scrollDelta * 0.22;
      lastScrollY = window.scrollY;
    };

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      const lagX = ((currentX / window.innerWidth) - 0.5) * 14;
      const lagY = ((currentY / window.innerHeight) - 0.5) * 10;
      document.documentElement.style.setProperty("--lag-x", `${lagX.toFixed(2)}px`);
      document.documentElement.style.setProperty("--lag-y", `${lagY.toFixed(2)}px`);
      if (cursor) {
        cursor.style.transform = `translate3d(${currentX - 10}px, ${currentY - 10}px, 0)`;
      }
      frame = window.requestAnimationFrame(animateCursor);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    frame = window.requestAnimationFrame(animateCursor);

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const smoothScrollTo = (targetY: number, duration = 900) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + diff * eased);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    };

    const handleAnchorClick = (event: Event) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const href = target.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const section = document.querySelector(href);
      if (!section) return;

      event.preventDefault();
      const headerOffset = 110;
      const rectTop = section.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(Math.max(rectTop - headerOffset, 0));
    };

    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    );
    anchors.forEach((anchor) => anchor.addEventListener("click", handleAnchorClick));

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
      document.documentElement.style.setProperty("--lag-x", "0px");
      document.documentElement.style.setProperty("--lag-y", "0px");
      anchors.forEach((anchor) =>
        anchor.removeEventListener("click", handleAnchorClick)
      );
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
      <header className="site-header">
        <a href="#home" className="brand">
          ATHLETE KINGDOM
        </a>
        <nav>
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      <main className="page-shell">
        <div className="vibrant-bg" aria-hidden />
        <div className="cursor-ring" aria-hidden />
        <section id="home" className="hero">
          <div className="hero-content reveal is-visible">
            <p className="hero-kicker">
              <span>THE HOME OF SPORTS</span>
            </p>
            <h1>
              <span className="filled">ATHLETE</span>
              <span className="outline">KINGDOM</span>
            </h1>
          </div>

          <a href="#about" className="scroll-indicator" aria-label="Scroll down">
            <span />
          </a>
        </section>

        <section id="about" className="panel-section">
          <div className="panel reveal" data-reveal>
            <p className="mini">SECTION</p>
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

                <article className="about-block">
                  <span className="about-badge">What You Get</span>
                  <ul className="about-list">
                    <li>Inspiring stories from the world of sport</li>
                    <li>Clips that motivate and educate</li>
                    <li>Videos to help you grow</li>
                    <li>The best sporting moments and highlights</li>
                    <li>Consistent creative content and more</li>
                  </ul>
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

                <div className="about-contact-strip">
                  <span>Credits, copyright, inquiries, or removal requests:</span>
                  <a href="mailto:athletekingdomedits@gmail.com">
                    athletekingdomedits@gmail.com
                  </a>
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
                    <source src="./videos/edit1.mp4" type="video/mp4" />
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
                    onClick={() => setIsMuted((prev) => !prev)}
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
            <p className="mini">SECTION</p>
            <h2>CONTACT</h2>
            <div className="contact-live">
              <p>
                Get in touch with Athlete Kingdom for collaborations, questions,
                copyright inquiries, or to connect with the sports community.
                Reach out via email at{" "}
                <a href="mailto:athletekingdomedits@gmail.com">
                  athletekingdomedits@gmail.com
                </a>{" "}
                or follow Athlete Kingdom on Instagram, TikTok, and YouTube.
                Whether you&apos;re an athlete, creator, or sports fan, this is
                the place to connect and become part of The Home of Sports.
              </p>

              <div className="contact-actions">
                <a
                  className="contact-btn primary"
                  href="mailto:athletekingdomedits@gmail.com"
                >
                  Email Athlete Kingdom
                </a>
                <button className="contact-btn" type="button" onClick={copyEmail}>
                  {copied ? "Email Copied" : "Copy Email"}
                </button>
              </div>

              <div className="social-grid">
                <a
                  className="social-card"
                  href="https://instagram.com/athletekingdm?igsh=MWFkY2RrajhqN2psMA==&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Instagram</span>
                  <strong>Follow</strong>
                </a>
                <a
                  className="social-card"
                  href="https://tiktok.com/@athletekingdm?_t=8kQJrUQWZmw&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>TikTok</span>
                  <strong>Follow</strong>
                </a>
                <a
                  className="social-card"
                  href="https://www.youtube.com/@AthleteKingdom"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>YouTube</span>
                  <strong>Subscribe</strong>
                </a>
              </div>
            </div>

            <p className="section-mark">THE HOME OF SPORTS</p>
          </div>
        </section>
      </main>
    </>
  );
}

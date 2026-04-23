"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const aboutVideoRef = useRef<HTMLVideoElement>(null);
  const soundPlayedOnceRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
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
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;
      const lagX = ((currentX / window.innerWidth) - 0.5) * 14;
      const lagY = ((currentY / window.innerHeight) - 0.5) * 10;
      document.documentElement.style.setProperty("--lag-x", `${lagX.toFixed(2)}px`);
      document.documentElement.style.setProperty("--lag-y", `${lagY.toFixed(2)}px`);
      frame = window.requestAnimationFrame(animateCursor);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    frame = window.requestAnimationFrame(animateCursor);

    const setHeaderOffset = () => {
      const header = document.querySelector(".site-header") as HTMLElement | null;
      const offset = (header?.offsetHeight ?? 96) + 18;
      document.documentElement.style.setProperty("--header-offset", `${offset}px`);
    };

    setHeaderOffset();
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
      observer.disconnect();
      window.removeEventListener("resize", setHeaderOffset);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
      if (scrollFrame) {
        window.cancelAnimationFrame(scrollFrame);
      }
      document.documentElement.style.setProperty("--lag-x", "0px");
      document.documentElement.style.setProperty("--lag-y", "0px");
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
      <header className="site-header">
        <a href="#home" className="brand">
          <Image
            src="./images/kdm-logo-header.png"
            alt="Athlete Kingdom logo"
            width={90}
            height={90}
            unoptimized
            quality={100}
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
              </div>

              <div className="contact-social-wrap">
                <p className="contact-kicker">Connect with Athlete Kingdom</p>
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
            </div>

            <p className="section-mark">THE HOME OF SPORTS</p>
          </div>
        </section>
      </main>
    </>
  );
}

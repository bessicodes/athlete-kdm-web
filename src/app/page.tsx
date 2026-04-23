"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const aboutVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

    const cursor = document.querySelector<HTMLElement>(".cursor-ring");
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      if (cursor) {
        cursor.style.transform = `translate3d(${currentX - 22}px, ${currentY - 22}px, 0)`;
      }
      frame = window.requestAnimationFrame(animateCursor);
    };

    window.addEventListener("mousemove", onMouseMove);
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
      window.cancelAnimationFrame(frame);
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
            <p className="section-mark">ATHLETE KINGDOM</p>
          </div>
        </section>

        <section id="contact" className="panel-section">
          <div className="panel reveal" data-reveal>
            <p className="mini">SECTION</p>
            <h2>CONTACT</h2>
            <p className="section-mark">ATHLETE KINGDOM</p>
          </div>
        </section>
      </main>
    </>
  );
}

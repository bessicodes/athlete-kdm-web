"use client";

import { useEffect } from "react";

export default function Home() {
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

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.cancelAnimationFrame(frame);
    };
  }, []);

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
          <div className="noise" />

          <div className="hero-content reveal is-visible">
            <p className="mini">ATHLETE KINGDOM</p>
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

"use client";

import { useEffect, useRef } from "react";

export default function ParticleGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120, // interactive radius
    };

    // Dot class
    class Dot {
      originalX: number;
      originalY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      targetRadius: number;
      color: string;
      targetColor: string;

      constructor(x: number, y: number) {
        this.originalX = x;
        this.originalY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 1.2;
        this.targetRadius = 1.2;
        const isLight = typeof document !== "undefined" && document.documentElement.classList.contains("light");
        this.color = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)";
        this.targetColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)";
      }

      update() {
        // Distance formula
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          // Push away force
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // Move target away from cursor
          const targetX = this.originalX - Math.cos(angle) * force * 35;
          const targetY = this.originalY - Math.sin(angle) * force * 35;

          // Lerp to pushed position
          this.x += (targetX - this.x) * 0.12;
          this.y += (targetY - this.y) * 0.12;

          // Scale and color transition
          this.targetRadius = 3.5;
          this.targetColor = `rgba(0, 229, 160, ${0.15 + force * 0.75})`; // Glow electric green
        } else {
          // Return to original grid spot (spring lerp)
          this.x += (this.originalX - this.x) * 0.08;
          this.y += (this.originalY - this.y) * 0.08;
          
          this.targetRadius = 1.2;
          const isLight = document.documentElement.classList.contains("light");
          this.targetColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.12)";
        }

        // Smoothly animate radius and color transitions
        this.radius += (this.targetRadius - this.radius) * 0.1;
        this.color = this.targetColor;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
      }
    }

    let dots: Dot[] = [];
    const spacing = 28; // spacing between dots

    const initGrid = () => {
      dots = [];
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      // Center the grid slightly inside canvas
      const xOffset = (width - cols * spacing) / 2 + spacing / 2;
      const yOffset = (height - rows * spacing) / 2 + spacing / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push(new Dot(i * spacing + xOffset, j * spacing + yOffset));
        }
      }
    };

    initGrid();

    // Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        dot.update();
        dot.draw(ctx);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Events
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[-1]" />;
}

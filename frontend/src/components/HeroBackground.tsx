import { useEffect, useRef } from "react";

const HeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Warm ember orbs
      const orbs = [
        { x: w * 0.15, y: h * 0.4, r: 350, color: "220, 80, 20" },
        { x: w * 0.6, y: h * 0.3, r: 280, color: "255, 120, 30" },
        { x: w * 0.4, y: h * 0.8, r: 220, color: "200, 60, 10" },
      ];

      orbs.forEach((orb, i) => {
        const ox = orb.x + Math.sin(time * 0.001 + i) * 30;
        const oy = orb.y + Math.cos(time * 0.0008 + i * 2) * 20;
        const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
        gradient.addColorStop(0, `rgba(${orb.color}, 0.1)`);
        gradient.addColorStop(1, `rgba(${orb.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });

      time += 16;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
};

export default HeroBackground;

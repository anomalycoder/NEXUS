import React, { useEffect, useRef } from 'react';

const InteractiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particles setup
        const particles: { x: number; y: number; ox: number; oy: number; vx: number; vy: number; r: number }[] = [];
        const numParticles = 120;

        const initParticles = () => {
            particles.length = 0;
            for (let i = 0; i < numParticles; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push({
                    x, y, ox: x, oy: y, vx: 0, vy: 0, r: Math.random() * 1.5 + 0.5
                });
            }
        };
        initParticles();
        window.addEventListener('resize', initParticles); // Re-initialize on large resizes could be good, but we'll just keep it simple

        let scanlineY = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const { x: mouseX, y: mouseY } = mouseRef.current;

            // --- 1. Cursor Spotlight ---
            if (mouseX > 0 && mouseY > 0) {
                ctx.save();

                // Cursor Spotlight: Soft indigo radial glow
                const spotRadius = 300;
                const spotGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, spotRadius);
                spotGradient.addColorStop(0, 'rgba(99, 102, 241, 0.08)'); // 8% opacity indigo core
                spotGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

                ctx.fillStyle = spotGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.restore();
            }

            const isReducedMotion = document.documentElement.classList.contains('reduce-motion');

            // --- 3. Scanline ---
            if (!isReducedMotion) {
                scanlineY += 1.5;
                if (scanlineY > canvas.height) scanlineY = -10;
            }
            const scanGradient = ctx.createLinearGradient(0, scanlineY, 0, scanlineY + 10);
            scanGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            scanGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
            scanGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = scanGradient;
            ctx.fillRect(0, scanlineY, canvas.width, 10);

            // --- 4. Particles (Repulsion & Elastic Physics) ---
            ctx.fillStyle = 'rgba(165, 180, 252, 0.8)'; // Indigo tint
            particles.forEach(p => {
                if (!isReducedMotion) {
                    const dx = mouseX - p.x;
                    const dy = mouseY - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Repulsion within 120px radius
                    if (dist < 120 && mouseX > 0) {
                        const force = (120 - dist) / 120;
                        p.vx -= (dx / dist) * force * 0.8;
                        p.vy -= (dy / dist) * force * 0.8;
                    }

                    // Elastic Spring Physics to home position
                    p.vx += (p.ox - p.x) * 0.03; // Spring constant
                    p.vy += (p.oy - p.y) * 0.03;

                    // Friction
                    p.vx *= 0.88;
                    p.vy *= 0.88;

                    p.x += p.vx;
                    p.y += p.vy;
                }

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                // Add tiny glow to particle
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(165, 180, 252, 0.5)';
                ctx.fill();
                ctx.shadowBlur = 0; // reset
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('resize', initParticles);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export default InteractiveBackground;

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { dataStore } from '@/lib/store';

/* ── Animated floating glass panels ── */
const PANELS = [
  { w: 280, h: 160, x: '8%',  y: '12%', delay: '0s',    duration: '14s', opacity: 0.04 },
  { w: 180, h: 280, x: '75%', y: '8%',  delay: '2s',    duration: '11s', opacity: 0.03 },
  { w: 220, h: 120, x: '60%', y: '68%', delay: '4s',    duration: '16s', opacity: 0.05 },
  { w: 120, h: 200, x: '15%', y: '65%', delay: '1.5s',  duration: '12s', opacity: 0.03 },
  { w: 340, h: 80,  x: '40%', y: '5%',  delay: '3s',    duration: '18s', opacity: 0.025 },
  { w: 90,  h: 140, x: '88%', y: '50%', delay: '5s',    duration: '10s', opacity: 0.04 },
];

/* ── Halftone dot grid wordmark: larger, bolder, fully visible, zero clipping ── */
function HalftoneWordmark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let imgData: ImageData | null = null;
    let W = 0;
    let H = 0;
    let STEP = 9;
    let dpr = 1;
    let prevW = 0;
    let prevH = 0;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setupMask = () => {
      try {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const curW = Math.floor(rect.width);
        const curH = Math.floor(rect.height || 140);

        if (curW <= 0 && W === 0) W = 460;
        else if (curW > 0) W = curW;

        if (curH <= 0 && H === 0) H = 140;
        else if (curH > 0) H = curH;

        if (Math.abs(W - prevW) < 2 && Math.abs(H - prevH) < 2 && imgData) {
          return;
        }
        prevW = W;
        prevH = H;

        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Offscreen canvas for rasterizing pixel mask
        const offscreen = document.createElement('canvas');
        offscreen.width = W;
        offscreen.height = H;
        const octx = offscreen.getContext('2d');
        if (!octx) return;

        const text = 'TRAC - AICTE';

        // Fit phrase responsively to 92% of available width with plenty of horizontal padding
        const targetWidth = Math.min(W * 0.92, 480);
        let testFontSize = 64;
        octx.font = `900 ${testFontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const measured = octx.measureText(text).width;

        if (measured > 0) {
          testFontSize = Math.floor((targetWidth / measured) * testFontSize);
        }
        // Cap font size for vertical and horizontal balance
        const maxVerticalFont = Math.floor(H * 0.58);
        const fontSize = Math.max(24, Math.min(testFontSize, maxVerticalFont, 76));
        STEP = Math.max(8, Math.min(10, Math.floor(fontSize / 6.5)));

        octx.clearRect(0, 0, W, H);
        octx.font = `900 ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillStyle = '#ffffff';
        octx.letterSpacing = '0.04em';
        octx.fillText(text, W / 2, H / 2);

        imgData = octx.getImageData(0, 0, W, H);
      } catch {
        // Fallback guard
      }
    };

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(setupMask).catch(() => setupMask());
    } else {
      setupMask();
    }

    const MAX_R = 4.2;
    const MIN_R = 0.6;
    const MOUSE_RADIUS = 90;
    const MOUSE_FORCE = 2.0;
    let t = 0;

    const draw = () => {
      if (imgData && W > 0 && H > 0) {
        ctx.clearRect(0, 0, W, H);
        if (!prefersReducedMotion) {
          t += 0.016;
        }

        for (let y = STEP / 2; y < H; y += STEP) {
          for (let x = STEP / 2; x < W; x += STEP) {
            const idx = (Math.round(y) * W + Math.round(x)) * 4;
            if (idx + 3 >= imgData.data.length) continue;
            const alpha = imgData.data[idx + 3] / 255;
            if (alpha < 0.05) continue;

            const dx = x - mouseRef.current.x;
            const dy = y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseFactor = dist < MOUSE_RADIUS
              ? 1 + (MOUSE_FORCE * (1 - dist / MOUSE_RADIUS))
              : 1;

            const breath = prefersReducedMotion
              ? 0.95
              : 0.74 + 0.26 * Math.sin(t + x * 0.03 + y * 0.02);

            const r = Math.max(MIN_R, Math.min(MAX_R * alpha * breath * mouseFactor, MAX_R * 1.6));
            const opacity = alpha * breath * 0.92 * (dist < MOUSE_RADIUS ? 1 + 0.3 * (1 - dist / MOUSE_RADIUS) : 1);

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.min(opacity, 0.98)})`;
            ctx.fill();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left),
        y: (e.clientY - rect.top),
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const resizeObserver = new ResizeObserver(() => {
      setupMask();
    });
    resizeObserver.observe(canvas);

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full pointer-events-none select-none"
      style={{ height: 140, display: 'block' }}
      aria-label="TRAC - AICTE"
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const allUsers = dataStore.getAllUsers();

  const [email, setEmail] = useState('admin@aicte.gov.in');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (!email.trim()) {
        setError('Please enter your official email address.');
        setIsLoading(false);
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password.');
        setIsLoading(false);
        return;
      }

      const user = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (user) {
        login(user.email, user.role);
      } else {
        login(email.trim());
      }
      setIsLoading(false);
      router.push('/');
    }, 400);
  };

  const handleQuickDemoLogin = (userEmail: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login(userEmail);
      router.push('/');
    }, 300);
  };

  const primaryUser = allUsers[0];

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-10 px-4"
      style={{ background: 'linear-gradient(160deg, #0a0a0c 0%, #111114 50%, #0d0d0f 100%)' }}
    >
      {/* ── Ambient radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 50% 28%, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
      />

      {/* ── Floating glass panels ── */}
      {mounted && PANELS.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-2xl pointer-events-none animate-float-slow"
          style={{
            width: p.w,
            height: p.h,
            left: p.x,
            top: p.y,
            background: `rgba(255,255,255,${p.opacity})`,
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(2px)',
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* ── Content wrapper ── */}
      <div className="relative z-10 w-full max-w-[460px] flex flex-col items-center gap-6">

        {/* ── Central Wordmark (Larger, Bolder, Perfectly Balanced) ── */}
        <div className="w-full text-center animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <h1 className="sr-only">TRAC - AICTE</h1>
          <div className="w-full relative flex items-center justify-center min-h-[140px]">
            {mounted ? (
              <HalftoneWordmark />
            ) : (
              <div
                className="text-4xl sm:text-5xl font-black tracking-wider text-white select-none py-6"
                style={{ letterSpacing: '0.06em' }}
              >
                TRAC - AICTE
              </div>
            )}
          </div>
          <p
            className="text-center mt-1 text-[11px] font-semibold tracking-[0.25em] uppercase"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Institutional Grievance Intelligence
          </p>
          <p
            className="text-center mt-2 text-xs max-w-sm mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Centralized Tri-Bureau Monitoring, Cross-Jurisdiction Surveillance &amp; SLA Accountability System
          </p>
        </div>

        {/* ── Original Dark Frosted Glass Login Card ── */}
        <div
          className="w-full rounded-2xl p-7 animate-fade-in-up"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 24px 72px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
            animationDelay: '100ms',
          }}
        >
          {/* Demo notice with visible default credentials */}
          <div
            className="mb-5 p-3 rounded-xl text-xs flex items-start gap-2.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white/60" />
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span className="font-semibold text-white/90">
                Demonstration Environment.
              </span>{' '}
              Default demo email: <strong className="text-white font-mono">admin@aicte.gov.in</strong> (Password: <span className="font-mono text-white/80">demo123</span>). Click <strong>Quick Login</strong> below for instant access.
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
              }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-white/70" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field (Dark translucent input — NEVER white) */}
            <div>
              <label
                className="block text-[11px] font-semibold tracking-wider uppercase mb-1.5"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Official Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aicte.gov.in"
                className="w-full px-4 py-2.5 text-sm rounded-xl text-white placeholder-white/30 transition-all focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password field (Dark translucent input — NEVER white) */}
            <div>
              <label
                className="block text-[11px] font-semibold tracking-wider uppercase mb-1.5"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Demo password: any value accepted"
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl text-white placeholder-white/30 transition-all focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 hover:text-white" />}
                </button>
              </div>
            </div>

            {/* Sign-in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl bg-white text-black hover:bg-neutral-200 transition-all mt-2 cursor-pointer shadow-[0_4px_16px_rgba(255,255,255,0.12)] active:scale-[0.99]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black/80 animate-spin"
                    style={{ animationDuration: '0.7s' }}
                  />
                  Authenticating…
                </span>
              ) : (
                <>Sign In to Terminal <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* ── Quick Demo Login Section ── */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Instant Quick Demo Login
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Primary quick-login */}
            <div
              className="rounded-xl p-3.5 mb-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">
                    {primaryUser?.name ?? 'Dr. Abhay Jere'}
                  </div>
                  <div className="text-[11px] font-mono mt-0.5 text-white/50">
                    {primaryUser?.email ?? 'admin@aicte.gov.in'}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5 text-white/40">
                    {primaryUser?.role?.replace('_', ' ') ?? 'Admin'} · Apex Authority
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(primaryUser?.email ?? 'admin@aicte.gov.in')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white text-black hover:bg-neutral-200 transition-all flex-shrink-0 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                >
                  Quick Login
                </button>
              </div>
            </div>

            {/* Other demo roles (Dark translucent cards — NEVER white) */}
            <div className="grid grid-cols-2 gap-2">
              {allUsers.slice(1, 5).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(u.email)}
                  className="p-2.5 text-left rounded-xl transition cursor-pointer text-white"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  <div className="text-[11px] font-semibold truncate text-white/90">
                    {u.name}
                  </div>
                  <div className="text-[10px] mt-0.5 uppercase tracking-wider truncate text-white/40">
                    {u.role.replace('_', ' ')}{u.bureau_code ? ` · ${u.bureau_code}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Product description footer ── */}
        <div
          className="text-center max-w-sm animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            TRAC-AICTE provides centralized institutional grievance monitoring, cross-bureau overlap
            detection, suspected duplicate review, institution resolution, and SLA surveillance across
            all AICTE Bureaus and Cells.
          </p>
          <p className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            All India Council for Technical Education · Ministry of Education, Govt. of India
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, ShieldCheck, Heart, AlertCircle, RefreshCw, Smartphone, Monitor } from "lucide-react";
import { synth } from "../utils/audio";


export default function LocketLanding({ onUnlockDashboard }) {
  const [waitlistCount, setWaitlistCount] = useState(1104);
  const [formData, setFormData] = useState({ name: "", email: "", country: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calibration Simulator State
  const [scanStep, setScanStep] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLog, setScanLog] = useState([]);

  const starfieldRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const stageRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Onboarding Scan Steps
  const scanSequences = [
    { text: "Booting biosensor receiver...", delay: 800 },
    { text: "Establishing secure Apple Watch accelerometer link... [OK]", delay: 1000 },
    { text: "Syncing circadian cortisol and sleep offset trackers... [OK]", delay: 900 },
    { text: "Parsing evening digital exposure blue-light logs... [OK]", delay: 1000 },
    { text: "Calibrating HRV baseline and adenosine clearance curves... [OK]", delay: 1100 },
    { text: "System fully synchronized. Telemetry Confidence: 89%", delay: 600 }
  ];

  const startCalibration = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStep(1);
    setScanLog([scanSequences[0].text]);
    synth.play("scanHum");

    let currentStep = 0;
    const runNextStep = () => {
      if (currentStep < scanSequences.length - 1) {
        currentStep++;
        setTimeout(() => {
          setScanStep(currentStep + 1);
          setScanLog((prev) => [...prev, scanSequences[currentStep].text]);
          synth.play("click");
          runNextStep();
        }, scanSequences[currentStep - 1].delay);
      } else {
        setTimeout(() => {
          setIsScanning(false);
          synth.play("chime");
          // Automatically navigate/unlock the dashboard with a tiny delay for the chime
          setTimeout(() => {
            if (onUnlockDashboard) {
              onUnlockDashboard();
            }
          }, 800);
        }, 1500);
      }
    };
    runNextStep();
  };


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleJoinWaitlist = (e) => {
    e.preventDefault();
    const { name, email, country } = formData;

    if (!name || !email || !country) {
      setMsg({ text: "Please fill in all fields.", type: "err" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg({ text: "Please enter a valid email.", type: "err" });
      return;
    }

    setIsSubmitting(true);
    setMsg({ text: "", type: "" });

    setTimeout(() => {
      setIsSubmitting(false);
      setWaitlistCount((c) => c + 1);
      setMsg({ text: "Welcome to the future of memory. Added to waitlist.", type: "ok" });
      synth.play("commit");
      setFormData({ name: "", email: "", country: "" });
    }, 1200);

  };

  // 1. Particle Starfield Canvas Effect
  useEffect(() => {
    const c = starfieldRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W, H;
    let particles = [];
    let animationFrameId;

    const resize = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse coordinate offsets for parallax drift
    const handleMouseMove = (e) => {
      const xPercent = (e.clientX / window.innerWidth) - 0.5;
      const yPercent = (e.clientY / window.innerHeight) - 0.5;
      // Gently drift particles opposite to mouse movement
      particles.forEach(p => {
        p.offsetX = xPercent * -30 * p.r;
        p.offsetY = yPercent * -30 * p.r;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Seed particles
    for (let i = 0; i < 110; i++) {
      particles.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        a: Math.random() * 0.5 + 0.05,
        da: (Math.random() - 0.5) * 0.004,
        offsetX: 0,
        offsetY: 0
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.da;
        if (p.a <= 0.05 || p.a >= 0.6) p.da *= -1;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const screenX = ((p.x / 1000) * W) + p.offsetX;
        const screenY = ((p.y / 1000) * H) + p.offsetY;

        ctx.beginPath();
        ctx.arc(screenX, screenY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 232, 226, ${p.a})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Three.js Locket & Orbiting Rings (with interactive mouse tilts)
  useEffect(() => {
    if (!window.THREE || !threeCanvasRef.current || !stageRef.current) return;

    const THREE = window.THREE;
    const stage = stageRef.current;
    const canvas = threeCanvasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);
    const clock = new THREE.Clock();

    const resize = () => {
      const w = stage.clientWidth || window.innerWidth;
      const h = stage.clientHeight || 280;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse coordinates for locket tilting
    const handleLocketMouseMove = (e) => {
      const rect = stage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) - 0.5;
      const y = ((e.clientY - rect.top) / rect.height) - 0.5;
      mouseRef.current.targetX = x * 0.7; // Tilt scaling
      mouseRef.current.targetY = y * 0.5;
    };
    window.addEventListener("mousemove", handleLocketMouseMove);

    // Helper: Brushed metal texture generator
    function makeBrushedTexture(size) {
      size = size || 512;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const g = c.getContext("2d");
      const cx = size / 2, cy = size / 2;
      g.fillStyle = "#d0d0ce";
      g.fillRect(0, 0, size, size);

      for (let i = 0; i < 280; i++) {
        const r = 5 + Math.random() * size * 0.6;
        const a0 = Math.random() * Math.PI * 2;
        const sp = 0.02 + Math.random() * 0.25;
        const al = 0.03 + Math.random() * 0.08;
        const dk = Math.random() > 0.45;
        g.strokeStyle = dk ? `rgba(0,0,0,${al})` : `rgba(255,255,255,${al * 0.6})`;
        g.lineWidth = 0.3 + Math.random() * 1.1;
        g.beginPath();
        g.arc(cx, cy, r, a0, a0 + sp);
        g.stroke();
      }

      // Scratch overlay
      for (let j = 0; j < 55; j++) {
        const x = Math.random() * size,
          y = Math.random() * size,
          a = Math.random() * Math.PI,
          ln = 6 + Math.random() * 50;
        g.strokeStyle = "rgba(0,0,0," + (0.008 + Math.random() * 0.02) + ")";
        g.lineWidth = 0.25;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * ln, y + Math.sin(a) * ln);
        g.stroke();
      }
      return new THREE.CanvasTexture(c);
    }

    const oledStars = [
      { x: 0.22, y: 0.19, phase: 0.0, freq: 0.38, sz: 1.2 },
      { x: 0.31, y: 0.14, phase: 1.8, freq: 0.62, sz: 0.7 },
      { x: 0.18, y: 0.3, phase: 3.4, freq: 0.44, sz: 0.6 },
      { x: 0.74, y: 0.18, phase: 0.9, freq: 0.3, sz: 0.9 },
      { x: 0.84, y: 0.28, phase: 2.2, freq: 0.52, sz: 2.0 },
      { x: 0.78, y: 0.38, phase: 4.1, freq: 0.36, sz: 0.65 },
      { x: 0.13, y: 0.52, phase: 1.1, freq: 0.68, sz: 0.75 },
      { x: 0.08, y: 0.64, phase: 3.7, freq: 0.4, sz: 0.6 },
      { x: 0.88, y: 0.55, phase: 0.5, freq: 0.58, sz: 0.7 },
      { x: 0.64, y: 0.64, phase: 2.6, freq: 0.34, sz: 2.1 },
      { x: 0.76, y: 0.72, phase: 4.9, freq: 0.48, sz: 0.6 },
      { x: 0.2, y: 0.74, phase: 1.5, freq: 0.72, sz: 0.8 },
      { x: 0.3, y: 0.82, phase: 3.1, freq: 0.42, sz: 0.6 },
      { x: 0.5, y: 0.82, phase: 0.3, freq: 0.6, sz: 0.7 },
      { x: 0.44, y: 0.2, phase: 2.8, freq: 0.5, sz: 0.65 },
      { x: 0.58, y: 0.12, phase: 5.2, freq: 0.32, sz: 0.75 },
    ];

    const scratchTex = makeBrushedTexture(512);
    scratchTex.wrapS = scratchTex.wrapT = THREE.RepeatWrapping;

    const mPlat = new THREE.MeshStandardMaterial({
      color: 0xf3efe9,
      metalness: 0.98,
      roughness: 0.15,
      roughnessMap: scratchTex,
    });
    const mPlatDark = new THREE.MeshStandardMaterial({
      color: 0x8f8c87,
      metalness: 0.94,
      roughness: 0.32,
    });
    const mChrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.015 });
    const mChain = new THREE.MeshStandardMaterial({ color: 0xeae6e0, metalness: 0.98, roughness: 0.04 });

    const oledCanvas = document.createElement("canvas");
    oledCanvas.width = 512;
    oledCanvas.height = 512;
    const oledTexture = new THREE.CanvasTexture(oledCanvas);
    const oledCtx = oledCanvas.getContext("2d");

    const oledTextCanvas = document.createElement("canvas");
    oledTextCanvas.width = 512;
    oledTextCanvas.height = 512;
    const oledTextCtx = oledTextCanvas.getContext("2d");

    const backCanvas = document.createElement("canvas");
    backCanvas.width = 512;
    backCanvas.height = 512;
    const bCtx = backCanvas.getContext("2d");
    const backTexture = new THREE.CanvasTexture(backCanvas);

    let curRotY = 0;

    function drawOledTexture(t) {
      const ctx = oledCtx,
        W = 512,
        H = 512,
        cx = W / 2,
        cy = H / 2,
        textY = cy - 8,
        FONT = '300 70px "Cormorant Garamond", Georgia, serif';
      const raw = Math.max(0, Math.min(1, Math.cos(curRotY * 0.92)));
      const face = raw * raw * (3 - 2 * raw);
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.arc(cx, cy, cx, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();

      if (face < 0.018) {
        oledTexture.needsUpdate = true;
        return;
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, cx, 0, Math.PI * 2);
      ctx.clip();
      const atm = ctx.createRadialGradient(cx * 0.52, cy * 0.44, 0, cx, cy, cx * 0.98);
      atm.addColorStop(0, "rgba(20,5,40," + face * 0.85 + ")");
      atm.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = atm;
      ctx.fillRect(0, 0, W, H);

      for (let si = 0; si < oledStars.length; si++) {
        const st = oledStars[si],
          tw = Math.pow(0.5 + 0.5 * Math.sin(t * st.freq * Math.PI * 2 + st.phase), 2);
        const alpha = Math.min(face * (0.28 + tw * 0.38), 0.62);
        if (alpha < 0.04) continue;
        const sx = cx + (st.x - 0.5) * W * 0.8,
          sy = cy + (st.y - 0.5) * H * 0.8;
        if (Math.sqrt((sx - cx) * (sx - cx) + (sy - cy) * (sy - cy)) > cx * 0.86) continue;

        if (st.sz >= 1.8) {
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, st.sz * 6);
          glow.addColorStop(0, "rgba(167,139,250," + alpha * 0.42 + ")");
          glow.addColorStop(0.5, "rgba(139,92,246," + alpha * 0.15 + ")");
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(sx, sy, st.sz * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(sx, sy, st.sz, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
        ctx.fill();
      }

      const period = 3.8,
        fillDur = 2.4,
        ph = t % period,
        fp = ph < fillDur ? Math.pow(ph / fillDur, 2) * (3 - 2 * (ph / fillDur)) : 1;
      oledTextCtx.clearRect(0, 0, W, H);
      oledTextCtx.font = FONT;
      oledTextCtx.textAlign = "center";
      oledTextCtx.textBaseline = "middle";
      oledTextCtx.fillStyle = "#fff";
      oledTextCtx.fillText("CHRONIS", cx, textY);
      oledTextCtx.globalCompositeOperation = "source-atop";

      const span = 148,
        sw = 0.06,
        grd = oledTextCtx.createLinearGradient(cx - span, 0, cx + span, 0);
      if (fp <= 0.001) {
        grd.addColorStop(0, "rgba(255,255,255,.12)");
        grd.addColorStop(1, "rgba(255,255,255,.12)");
      } else if (fp >= 0.999) {
        grd.addColorStop(0, "rgba(255,255,255,1)");
        grd.addColorStop(1, "rgba(255,255,255,1)");
      } else {
        const s0 = 0,
          s1 = Math.max(0.001, fp - sw),
          s2 = fp,
          s3 = Math.min(0.999, fp + sw * 0.4),
          s4 = Math.min(1, fp + sw),
          s5 = 1;
        grd.addColorStop(s0, "rgba(255,255,255,1.00)");
        if (s1 > s0) grd.addColorStop(s1, "rgba(255,255,255,1.00)");
        grd.addColorStop(s2, "rgba(255,255,255,1.00)");
        if (s3 > s2) grd.addColorStop(s3, "rgba(255,255,255,.72)");
        if (s4 > s3) grd.addColorStop(s4, "rgba(255,255,255,.12)");
        if (s5 > s4) grd.addColorStop(s5, "rgba(255,255,255,.12)");
      }
      oledTextCtx.fillStyle = grd;
      oledTextCtx.fillRect(0, 0, W, H);
      oledTextCtx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = face;
      ctx.drawImage(oledTextCanvas, 0, 0);
      ctx.globalAlpha = 1;

      const ruleAlpha = face * Math.max(0, (fp - 0.75) / 0.25) * 0.22;
      if (ruleAlpha > 0.01) {
        ctx.strokeStyle = "rgba(255,255,255," + ruleAlpha + ")";
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(cx - 64, textY + 38);
        ctx.lineTo(cx + 64, textY + 38);
        ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, cx - 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(167,139,250," + (0.12 + face * 0.15) + ")";
      ctx.lineWidth = 2.2;
      ctx.stroke();
      oledTexture.needsUpdate = true;
    }

    function drawBack(t) {
      const ctx = bCtx,
        bW = 512,
        bH = 512,
        bcx = bW / 2,
        bcy = bH / 2;
      ctx.clearRect(0, 0, bW, bH);
      const bgrd = ctx.createRadialGradient(bcx * 0.55, bcy * 0.46, 0, bcx, bcy, bcx * 1.02);
      bgrd.addColorStop(0, "#fdfbfa");
      bgrd.addColorStop(0.32, "#f1ece6");
      bgrd.addColorStop(0.65, "#dcd7cf");
      bgrd.addColorStop(1, "#c0b9af");
      ctx.beginPath();
      ctx.arc(bcx, bcy, bcx, 0, Math.PI * 2);
      ctx.fillStyle = bgrd;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(bcx, bcy, bcx, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.arc(bcx, bcy, 14 + i * 29, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0," + (0.018 - i * 0.0006) + ")";
        ctx.lineWidth = 0.38;
        ctx.stroke();
      }
      const shGrd = ctx.createRadialGradient(bcx * 0.38, bcy * 0.34, 0, bcx * 0.52, bcy * 0.44, bcx * 0.82);
      shGrd.addColorStop(0, "rgba(255,255,255,.36)");
      shGrd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shGrd;
      ctx.fillRect(0, 0, bW, bH);

      ctx.font = '300 50px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const ty = bcy + 2;
      ctx.fillStyle = "rgba(0,0,0,.52)";
      ctx.fillText("CHRONIS", bcx + 1.9, ty + 1.9);
      ctx.fillStyle = "rgba(72,72,82,.46)";
      ctx.fillText("CHRONIS", bcx, ty);
      ctx.fillStyle = "rgba(255,255,255,.28)";
      ctx.fillText("CHRONIS", bcx - 0.75, ty - 0.75);

      const arcRadius = 208,
        arcStart = (205 * Math.PI) / 180,
        arcEnd = (335 * Math.PI) / 180,
        f =
          0.72 +
          Math.sin(t * 4.3) * 0.1 +
          Math.cos(t * 7.1) * 0.06 +
          Math.sin(t * 2.9) * 0.04;
      ctx.save();
      ctx.strokeStyle = "rgba(124,58,237," + f * 0.22 + ")";
      ctx.lineWidth = 9;
      ctx.shadowColor = "rgba(167,139,250," + f * 0.52 + ")";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(bcx, bcy, arcRadius, arcStart, arcEnd);
      ctx.stroke();
      ctx.restore();

      const arcGrad = ctx.createLinearGradient(
        bcx + Math.cos(arcStart) * arcRadius,
        bcy + Math.sin(arcStart) * arcRadius,
        bcx + Math.cos(arcEnd) * arcRadius,
        bcy + Math.sin(arcEnd) * arcRadius
      );
      arcGrad.addColorStop(0, "rgba(124,58,237,0)");
      arcGrad.addColorStop(0.18, "rgba(167,139,250," + f * 0.78 + ")");
      arcGrad.addColorStop(0.5, "rgba(196,181,253," + f + ")");
      arcGrad.addColorStop(0.82, "rgba(167,139,250," + f * 0.78 + ")");
      arcGrad.addColorStop(1, "rgba(124,58,237,0)");
      ctx.save();
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(bcx, bcy, arcRadius, arcStart, arcEnd);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      backTexture.needsUpdate = true;
    }

    const mScreen = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0,
      roughness: 0.02,
      map: oledTexture,
      emissiveMap: oledTexture,
      emissive: 0x111111,
      emissiveIntensity: 0.32,
    });
    const mBack = new THREE.MeshStandardMaterial({
      color: 0xeae6e0,
      metalness: 0.94,
      roughness: 0.16,
      map: backTexture,
      roughnessMap: scratchTex,
    });
    const mAccent = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      metalness: 0.1,
      roughness: 0.24,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.75,
    });
    const mArc = new THREE.MeshStandardMaterial({
      color: 0xc4b5fd,
      metalness: 0,
      emissive: 0xa78bfa,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.82,
    });

    const G = new THREE.Group();
    scene.add(G);

    const bodyGeometry = new THREE.CylinderGeometry(1.42, 1.42, 0.285, 128, 1, false);
    const body = new THREE.Mesh(bodyGeometry, mPlat);
    body.rotation.x = Math.PI / 2;
    G.add(body);

    G.add(new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.0095, 8, 128), mPlatDark));
    const inner = new THREE.Mesh(new THREE.TorusGeometry(1.305, 0.0075, 8, 128), mPlatDark);
    inner.position.z = 0.125;
    G.add(inner);

    const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.295, 0.088, 20, 128), mChrome);
    bezel.position.z = 0.144;
    G.add(bezel);

    const scrn = new THREE.Mesh(new THREE.CircleGeometry(1.2, 128), mScreen);
    scrn.position.z = 0.143;
    G.add(scrn);

    const sEdge = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.015, 8, 128), mAccent);
    sEdge.position.z = 0.144;
    G.add(sEdge);

    const backDisc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 128), mBack);
    backDisc.position.z = -0.143;
    backDisc.rotation.y = Math.PI;
    G.add(backDisc);

    const bezelBack = new THREE.Mesh(new THREE.TorusGeometry(1.295, 0.088, 20, 128), mChrome);
    bezelBack.position.z = -0.144;
    G.add(bezelBack);

    const arcMesh = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.01, 8, 64, (Math.PI * 130) / 180), mArc);
    arcMesh.position.z = -0.145;
    arcMesh.rotation.z = (205 * Math.PI) / 180;
    G.add(arcMesh);

    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.275, 18), mPlat);
    hinge.position.set(0, 1.43, 0);
    G.add(hinge);

    const bail = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.034, 12, 32), mChain);
    bail.position.set(0, 1.62, 0);
    bail.rotation.x = Math.PI / 2;
    G.add(bail);

    // Build chains
    const cR = 0.06,
      cTube = 0.015,
      cStep = 0.13,
      cCount = 12,
      sides = [-1, 1];
    for (let si = 0; si < sides.length; si++) {
      const side = sides[si];
      for (let i = 0; i < cCount; i++) {
        const lk = new THREE.Mesh(new THREE.TorusGeometry(cR, cTube, 10, 26), mChain);
        const drift = side * Math.min(i * 0.034, 0.45);
        lk.position.set(side * 0.042 + drift, 1.74 + i * cStep, 0);
        if (i % 2 === 0) lk.rotation.x = Math.PI / 2;
        else lk.rotation.z = Math.atan2(0.034, cStep) * side * 0.48;
        G.add(lk);
      }
    }

    const ctrlGroove = new THREE.Mesh(
      new THREE.TorusGeometry(1.424, 0.0042, 8, 80, Math.PI * 0.38),
      mPlatDark
    );
    ctrlGroove.rotation.z = -Math.PI * 0.19;
    G.add(ctrlGroove);

    const pip = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 14), mAccent);
    pip.rotation.z = Math.PI / 2;
    pip.position.set(1.437, 0.04, 0);
    G.add(pip);

    // ───────────────── ADDED: Circadian Orbital Ring Particles (Unique Enhancement) ─────────────────
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const orbitCount = 42;
    const ringGeometry = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(orbitCount * 3);
    const ringSpeeds = [];
    const ringAngles = [];

    for (let o = 0; o < orbitCount; o++) {
      const radius = 2.1 + Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      ringSpeeds.push(0.2 + Math.random() * 0.4);
      ringAngles.push({ r: radius, current: angle, tiltX: (Math.random() - 0.5) * 0.8, tiltY: (Math.random() - 0.5) * 0.8 });
      
      ringPositions[o * 3] = Math.cos(angle) * radius;
      ringPositions[o * 3 + 1] = Math.sin(angle) * radius;
      ringPositions[o * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
    const ringMaterial = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.042,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending
    });
    const orbitParticles = new THREE.Points(ringGeometry, ringMaterial);
    orbitGroup.add(orbitParticles);

    // Starfield Background Elements
    const pGeo = new THREE.BufferGeometry();
    const pN = 220;
    const pPos = new Float32Array(pN * 3);
    for (let pi = 0; pi < pN; pi++) {
      pPos[pi * 3] = (Math.random() - 0.5) * 18;
      pPos[pi * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[pi * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    scene.add(
      new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.015,
          transparent: true,
          opacity: 0.12,
          sizeAttenuation: true,
        })
      )
    );

    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    scene.add(new THREE.HemisphereLight(0xe8eeff, 0x553377, 0.62));
    
    // Colorful spotlights mapping onto the metallic surfaces
    const keyL = new THREE.PointLight(0xfff5e6, 8.2, 26);
    keyL.position.set(4.5, 5.5, 5);
    scene.add(keyL);
    const fillL = new THREE.PointLight(0xc8d8f8, 2.5, 20);
    fillL.position.set(-5, 2, 3);
    scene.add(fillL);
    const rimL = new THREE.PointLight(0x8b5cf6, 11.2, 22); // Vibrant Violet
    rimL.position.set(0.5, -4.8, -6);
    scene.add(rimL);
    const topL = new THREE.PointLight(0xffffff, 2.4, 14);
    topL.position.set(0, 6.5, 2);
    scene.add(topL);

    const glowL = new THREE.PointLight(0xdb2777, 8.5, 20); // Pink/Rose ambient
    glowL.position.set(0, 2.0, -2.4);
    scene.add(glowL);

    const applyScale = () => {
      const s = window.innerWidth < 420 ? 1.05 : window.innerWidth < 768 ? 1.2 : 1.35;
      G.scale.setScalar(s);
    };
    applyScale();
    window.addEventListener("resize", applyScale);

    let floatOffset = 0;
    let reqId;

    // Smooth Lerp Rotation values for mouse follow
    let currentRotX = -0.12;
    let currentRotY = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      drawOledTexture(t);
      drawBack(t);
      mArc.emissiveIntensity =
        0.64 + Math.sin(t * 4.3) * 0.12 + Math.cos(t * 7.1) * 0.07 + Math.sin(t * 2.8) * 0.05;
      mArc.opacity = 0.7 + Math.sin(t * 3.7) * 0.1 + Math.cos(t * 5.9) * 0.06;

      // Mouse position based tilt interpolation
      const targetRotX = -0.12 - mouseRef.current.targetY * 0.6;
      const targetRotY = (Math.sin(t * 0.22) * 0.08 + t * 0.12) + mouseRef.current.targetX * 0.8;

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      curRotY = currentRotY;

      G.rotation.x = currentRotX;
      G.rotation.y = currentRotY;

      // Floating translation
      floatOffset = Math.sin(t * 0.52) * 0.06;
      G.position.set(0, 1.25 + floatOffset, 0);

      // Orbiting particles ring update
      const positions = ringGeometry.attributes.position.array;
      for (let o = 0; o < orbitCount; o++) {
        const meta = ringAngles[o];
        meta.current += ringSpeeds[o] * 0.015;
        
        positions[o * 3] = Math.cos(meta.current) * meta.r;
        positions[o * 3 + 1] = Math.sin(meta.current) * meta.r * 0.4 + Math.cos(meta.current) * meta.tiltX;
        positions[o * 3 + 2] = Math.sin(meta.current) * meta.r * meta.tiltY;
      }
      ringGeometry.attributes.position.needsUpdate = true;
      orbitGroup.rotation.y = t * 0.04;
      orbitGroup.position.set(0, 1.25 + floatOffset, 0);

      camera.position.x = Math.sin(t * 0.18) * 0.08;
      camera.position.y = 0.1 + Math.cos(t * 0.26) * 0.08;
      camera.lookAt(0, 0.24, 0);

      rimL.intensity = 10.0 + Math.sin(t * 0.62) * 2.0;
      glowL.intensity = 8.5 + Math.sin(t * 1.1) * 1.5 + Math.cos(t * 0.66) * 0.8;
      renderer.render(scene, camera);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(animate);
    } else {
      animate();
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", applyScale);
      window.removeEventListener("mousemove", handleLocketMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, []);

  // 3. Enhanced 3D Tilt Card Glow Mouse Tracking
  useEffect(() => {
    const cards = document.querySelectorAll(".liquid-card");
    const handles = [];

    cards.forEach((card) => {
      const onMouseMove = (e) => {
        const r = card.getBoundingClientRect();
        const mouseX = e.clientX - r.left;
        const mouseY = e.clientY - r.top;
        card.style.setProperty("--gx", `${mouseX}px`);
        card.style.setProperty("--gy", `${mouseY}px`);

        // Compute 3D rotation angles based on cursor offset
        const rotateX = ((mouseY / r.height) - 0.5) * -15; // max 15deg
        const rotateY = ((mouseX / r.width) - 0.5) * 15;
        card.style.setProperty("--rx", `${rotateX}deg`);
        card.style.setProperty("--ry", `${rotateY}deg`);
      };
      const onMouseLeave = () => {
        card.style.setProperty("--gx", "-320px");
        card.style.setProperty("--gy", "-320px");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      };

      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);

      handles.push({ card, onMouseMove, onMouseLeave });
    });

    return () => {
      handles.forEach(({ card, onMouseMove, onMouseLeave }) => {
        card.removeEventListener("mousemove", onMouseMove);
        card.removeEventListener("mouseleave", onMouseLeave);
      });
    };
  }, []);

  return (
    <div className="locket-landing-root fade-in">
      {/* Background star field */}
      <canvas ref={starfieldRef} id="bgc" />

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-inner">
          <div className="hero-ey">
            <span className="hero-dot" />
            Biological Intelligence
          </div>
          <h1>
            so no life becomes <span className="soft">fragmented.</span>
          </h1>
          <p className="hero-sub font-serif">
            Replicating human intelligence in its most intimate form — voice, memory, values, context,
            and patterns — so the people who shape a life do not collapse into disconnected fragments.
          </p>

          {/* Interactive Calibration Panel (Unique Enhancement) */}
          <div className="telemetry-calibration-panel glass-panel">
            <div className="cal-header">
              <Sparkles className="cal-icon text-accent animate-pulse-slow" size={18} />
              <h3 className="cal-title font-sans">Circadian Calibration Console</h3>
            </div>
            
            {!isScanning && scanStep === 0 ? (
              <div className="cal-body">
                <p className="cal-intro font-sans">
                  The locket synchronizes your heart rate variability, melatonin indicators, and screen latency curves. Click calibrate to boot telemetry streams.
                </p>
                <button className="cal-start-btn" onClick={startCalibration} onMouseEnter={() => synth.play("hoverTick")}>
                  <RefreshCw size={14} className="spin-on-hover" />
                  <span>Calibrate Biosensors & Unlock Dashboard</span>
                </button>
              </div>
            ) : (
              <div className="cal-console">
                <div className="console-logs">
                  {scanLog.map((log, index) => (
                    <div key={index} className="console-line">
                      <span className="line-caret">&gt;</span> {log}
                    </div>
                  ))}
                  {isScanning && (
                    <div className="console-line scanning-glow animate-pulse-slow">
                      <span className="line-caret">&gt;</span> Analyzing bio-signals...
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="cal-progress-bar-bg">
                  <div 
                    className="cal-progress-bar-fill"
                    style={{ width: `${(scanStep / scanSequences.length) * 100}%` }}
                  />
                </div>
                
                <div className="cal-footer-meta">
                  <span className="meta-sync"><Smartphone size={10} /> Syncing Apple Watch</span>
                  <span className="meta-status">Step {scanStep} of {scanSequences.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Waitlist Box */}
          <div className="waitlist-shell" id="waitlist" style={{ marginTop: "40px" }}>
            <div className="wl-top">
              <div className="wl-count">
                <span className="wl-count-num" id="count">
                  {waitlistCount.toLocaleString()}
                </span>
                <span className="wl-count-label">on the waitlist</span>
              </div>
              <div className="wl-note">coming soon</div>
            </div>
            <form className="wl-form" onSubmit={handleJoinWaitlist}>
              <input
                className="fi"
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                maxLength={80}
              />
              <input
                className="fi"
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                maxLength={120}
              />
              <select
                className="fi full"
                id="country"
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Your country
                </option>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
                <option>Germany</option>
                <option>France</option>
                <option>Singapore</option>
                <option>UAE</option>
                <option>Other</option>
              </select>
              <button className="join-btn full" id="jb" type="submit" disabled={isSubmitting} onMouseEnter={() => synth.play("hoverTick")}>
                {isSubmitting ? "Joining…" : "Join the waitlist"} <span className="join-arrow">→</span>
              </button>
            </form>
            {msg.text && (
              <div className={`form-msg ${msg.type}`}>
                {msg.text}
              </div>
            )}
          </div>

          <div className="hero-scroll">
            <a href="#discover" className="hero-scroll-btn" onMouseEnter={() => synth.play("hoverTick")}>
              <span>Discover</span>
              <span>↓</span>
            </a>
          </div>
        </div>

        {/* 3D Model Stage */}
        <div ref={stageRef} className="hero-stage" aria-hidden="true">
          <div className="hero-neon-diffuse" />
          <div className="hero-neon-diffuse-2" />
          <div className="hero-neon-arc" />
          <canvas ref={threeCanvasRef} id="hero-c3" />
        </div>
      </section>

      {/* Discover Section */}
      <section className="discover" id="discover">
        <div className="discover-inner">
          <span className="discover-label">Discover Chronis</span>
          <div className="discover-head">
            <h2 className="discover-title font-sans" style={{ fontWeight: 800 }}>
              A memory object,<br/>
              not a content archive.
            </h2>
            <p className="discover-copy font-serif">
              Designed like a premium object and built like a long-horizon intelligence system, Chronis
              turns preservation into something intentional, private, and worth returning to.
            </p>
          </div>

          <div className="card-grid">
            <article className="card liquid-card" onMouseEnter={() => synth.play("hoverTick")}>
              <div className="card-top">
                <span className="card-kicker">01 · Presence</span>
                <span className="card-index">◈</span>
              </div>
              <h3 className="font-serif">
                Human context,
                <br />
                not just files.
              </h3>
              <p className="font-serif">
                Chronis is built to preserve how someone thinks, explains, remembers, and guides — not
                just what they once uploaded or recorded.
              </p>
              <div className="card-meta">voice · stories · values · decision patterns</div>
            </article>

            <article className="card liquid-card" onMouseEnter={() => synth.play("hoverTick")}>
              <div className="card-top">
                <span className="card-kicker">02 · Object</span>
                <span className="card-index">◈</span>
              </div>
              <h3 className="font-serif">
                A locket that feels
                <br />
                worth keeping.
              </h3>
              <p className="font-serif">
                The hardware is meant to feel intimate and lasting: quiet materials, controlled light, a
                black OLED face, and a silhouette that reads as memory before it reads as tech.
              </p>
              <div className="card-meta">wearable · tactile · heirloom-led</div>
            </article>

            <article className="card liquid-card" onMouseEnter={() => synth.play("hoverTick")}>
              <div className="card-top">
                <span className="card-kicker">03 · Privacy</span>
                <span className="card-index">◈</span>
              </div>
              <h3 className="font-serif">
                Private by default.
                <br />
                Dignified by design.
              </h3>
              <p className="font-serif">
                Chronis is not built as social content. It is built for your eyes only. To understand
                yourself the better way.
              </p>
              <div className="card-meta">controlled access · encrypted intent</div>
            </article>

            <article className="card liquid-card" onMouseEnter={() => synth.play("hoverTick")}>
              <div className="card-top">
                <span className="card-kicker">04 · Continuity</span>
                <span className="card-index">◈</span>
              </div>
              <h3 className="font-serif">
                So what matters
                <br />
                stays coherent.
              </h3>
              <p className="font-serif">
                When wisdom, stories, and emotional nuance survive in one place, a person stops
                dissolving into scattered clips, fading recollections, and half-remembered sentences.
              </p>
              <div className="card-meta">continuity asset · long-horizon memory</div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

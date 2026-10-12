import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// --- Vintage Ticket 1: Retro Boarding Pass / Flight Ticket ---
const BoardingPassTicket = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`w-72 rounded-lg bg-[#FAF7F0] text-[#4A4036] p-3.5 shadow-md border border-[#E5DEC9] select-none font-mono ${className}`}
    style={style}
  >
    <div className="flex justify-between items-center border-b border-dashed border-[#C5BBA4] pb-2 mb-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] tracking-widest font-black uppercase text-[#8C7A65]">BOARDING PASS</span>
      </div>
      <span className="text-[9px] font-bold text-[#8C7A65]">VCH-FLIGHT</span>
    </div>
    
    <div className="flex justify-between items-baseline mb-2">
      <div>
        <p className="text-[9px] text-[#A69784] uppercase">DEPART</p>
        <p className="text-sm font-black tracking-wider text-[#3D332A]">BOM</p>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[8px] text-[#A69784]">✈ FLIGHT 804</span>
        <div className="w-16 border-t border-dashed border-[#C5BBA4] my-1 relative">
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px]">●</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[9px] text-[#A69784] uppercase">ARRIVE</p>
        <p className="text-sm font-black tracking-wider text-[#3D332A]">DEL</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-1 text-[8px] bg-[#F2EDE1] p-1.5 rounded border border-[#E0D7C2] mb-2">
      <div><span className="text-[#A69784]">GATE:</span> <b className="text-[#3D332A]">12B</b></div>
      <div><span className="text-[#A69784]">SEAT:</span> <b className="text-[#3D332A]">04A</b></div>
      <div><span className="text-[#A69784]">CLASS:</span> <b className="text-[#3D332A]">EXP</b></div>
    </div>

    {/* Barcode strip & stamp */}
    <div className="flex justify-between items-center pt-1 border-t border-dashed border-[#C5BBA4]">
      <div className="flex gap-[2px] h-5 items-end opacity-70">
        {[2,4,1,3,2,5,1,4,2,3,5,1,2,4,3,1,5,2,3].map((h, i) => (
          <div key={i} className="bg-[#5C4F40] w-[2px]" style={{ height: `${h * 4}px` }} />
        ))}
      </div>
      <div className="border-2 border-emerald-700/60 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded -rotate-6 uppercase tracking-wider">
        APPROVED
      </div>
    </div>
  </div>
);

// --- Vintage Ticket 2: Cafe / Restaurant Receipt with Perforated Zigzag ---
const CafeReceiptTicket = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`w-60 bg-[#FAF9F5] text-[#3D3730] p-4 shadow-md border-x border-[#E0D8C8] select-none font-mono text-[9px] relative ${className}`}
    style={style}
  >
    {/* Zigzag top border illusion */}
    <div className="text-center border-b border-dashed border-[#BFB29E] pb-2 mb-2">
      <p className="font-extrabold tracking-widest text-[11px] text-[#2C2620]">METRO BISTRO & CAFE</p>
      <p className="text-[8px] text-[#8C8070]">TAX INVOICE / EXPENSE</p>
      <p className="text-[7.5px] text-[#A69A89]">RECEIPT #08942 • 14:32 PM</p>
    </div>

    <div className="space-y-1 my-2 border-b border-dashed border-[#BFB29E] pb-2 text-[8px]">
      <div className="flex justify-between">
        <span>2x Cold Brew Coffee</span>
        <span>₹380.00</span>
      </div>
      <div className="flex justify-between">
        <span>1x Client Lunch Meal</span>
        <span>₹1,240.00</span>
      </div>
      <div className="flex justify-between text-[#8C8070]">
        <span>GST @ 5%</span>
        <span>₹81.00</span>
      </div>
    </div>

    <div className="flex justify-between font-bold text-[10px] text-[#2C2620] mb-2">
      <span>TOTAL PAID:</span>
      <span>₹1,701.00</span>
    </div>

    <div className="flex justify-center items-center gap-2 pt-1 border-t border-dashed border-[#BFB29E]">
      <span className="text-[8px] text-[#8C8070] uppercase">PAID VIA CARD</span>
      <div className="border border-indigo-700/60 text-indigo-800 text-[7px] font-black px-1 rounded rotate-3">
        CLAIMED
      </div>
    </div>
  </div>
);

// --- Vintage Ticket 3: Classic Transit / Train Ticket Stub with Notches ---
const TransitTicketStub = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`w-64 rounded-md bg-[#FBF4E4] text-[#4A3B2C] p-3 shadow-md border-2 border-[#D9C8A9] select-none font-serif relative ${className}`}
    style={style}
  >
    {/* Left & Right Notch cutouts */}
    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--bg-base)] rounded-full border-r border-[#D9C8A9]" />
    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--bg-base)] rounded-full border-l border-[#D9C8A9]" />

    <div className="border border-[#D4C3A3] p-2 rounded">
      <div className="flex justify-between items-center border-b border-[#D4C3A3] pb-1 mb-1.5">
        <span className="text-[10px] font-black tracking-widest text-[#735C45]">RAPID TRANSIT PASS</span>
        <span className="text-[8px] font-mono text-[#8C755E]">№ 449201</span>
      </div>

      <div className="flex justify-between items-center text-[9px] mb-1.5">
        <div>
          <p className="text-[7.5px] uppercase text-[#9E8870] font-sans">CLASS</p>
          <p className="font-bold">1ST CLASS</p>
        </div>
        <div className="text-center">
          <p className="text-[7.5px] uppercase text-[#9E8870] font-sans">FARE</p>
          <p className="font-bold font-mono">₹450.00</p>
        </div>
        <div className="text-right">
          <p className="text-[7.5px] uppercase text-[#9E8870] font-sans">STATUS</p>
          <p className="font-bold text-amber-900">VERIFIED</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-[7.5px] font-mono border-t border-dashed border-[#D4C3A3] pt-1">
        <span>VALID FOR DAY OF ISSUE</span>
        <span className="font-black">★ ADMIT ONE ★</span>
      </div>
    </div>
  </div>
);

// --- Vintage Ticket 4: Hotel & Lodging Voucher ---
const HotelVoucherTicket = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`w-68 rounded-lg bg-[#FAF8F2] text-[#3D352B] p-3.5 shadow-md border border-[#DED7C6] select-none font-mono ${className}`}
    style={style}
  >
    <div className="flex items-center justify-between border-b border-[#CFC5B0] pb-1.5 mb-2">
      <div className="flex items-center gap-1">
        <span className="text-xs">🏨</span>
        <span className="text-[9.5px] font-extrabold tracking-wider text-[#615241]">GRAND CONTINENTAL</span>
      </div>
      <span className="text-[8px] bg-[#EAE3D2] px-1 py-0.5 rounded font-bold">VOUCHER</span>
    </div>

    <div className="text-[8.5px] space-y-1 mb-2">
      <div className="flex justify-between">
        <span className="text-[#8F816F]">ROOM CHARGE (2 NIGHTS):</span>
        <span className="font-bold">₹8,400.00</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#8F816F]">BUSINESS AMENITIES:</span>
        <span className="font-bold">₹1,200.00</span>
      </div>
    </div>

    <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-[#CFC5B0]">
      <span className="text-[8px] text-[#8F816F]">REF: HTL-2026-904</span>
      <div className="border border-rose-800/60 text-rose-800 text-[7px] font-black px-1.5 py-0.5 rounded -rotate-3">
        SUBMITTED
      </div>
    </div>
  </div>
);

// --- Vintage Ticket 5: Yellow Cab Taxi Meter Fare Receipt ---
const TaxiReceiptTicket = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`w-56 bg-[#FFFBEB] text-[#451A03] p-3 shadow-md border border-[#FDE68A] select-none font-mono text-[8.5px] ${className}`}
    style={style}
  >
    <div className="flex justify-between items-center border-b-2 border-black/80 pb-1 mb-1">
      <span className="font-black tracking-widest text-[10px]">YELLOW CAB CO.</span>
      <span className="text-[7.5px] bg-amber-400 text-black px-1 font-black rounded">NYC</span>
    </div>
    <div className="space-y-0.5 my-1">
      <div className="flex justify-between"><span>BASE METER:</span><span>₹150.00</span></div>
      <div className="flex justify-between"><span>DISTANCE (14 KM):</span><span>₹420.00</span></div>
      <div className="flex justify-between"><span>TOLL SURCHARGE:</span><span>₹85.00</span></div>
    </div>
    <div className="flex justify-between font-extrabold text-[9.5px] border-t border-dashed border-[#F59E0B] pt-1">
      <span>TOTAL FARE:</span>
      <span>₹655.00</span>
    </div>
    <p className="text-[7px] text-amber-900/70 text-center mt-1">*** PAID IN CASH • EXPENSE VALID ***</p>
  </div>
);

// --- Vintage Ticket 6: Retro Cinema / Event Admission Stub ---
const CinemaAdmissionStub = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`w-52 rounded bg-[#FEF2F2] text-[#7F1D1D] p-2.5 shadow-md border-2 border-dashed border-[#F87171] select-none font-serif text-[8px] relative ${className}`}
    style={style}
  >
    <div className="flex justify-between items-center border-b border-[#FCA5A5] pb-1 mb-1">
      <span className="font-black tracking-widest text-[9.5px]">ADMIT ONE</span>
      <span className="font-mono text-[8px]">№ 049182</span>
    </div>
    <p className="font-sans font-bold text-[8.5px] text-center my-1 uppercase">ANNUAL TECH SUMMIT ENTRY</p>
    <div className="flex justify-between items-center text-[7.5px] font-mono border-t border-[#FCA5A5] pt-1">
      <span>SECTION: VIP</span>
      <span className="font-bold text-emerald-700">PAID ₹2,500</span>
    </div>
  </div>
);

// --- Vintage Ticket 7: Fuel & Petrol Station Slip ---
const FuelReceiptTicket = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`w-56 bg-[#F0FDF4] text-[#14532D] p-3 shadow-md border border-[#BBF7D0] select-none font-mono text-[8px] ${className}`}
    style={style}
  >
    <div className="text-center border-b border-[#86EFAC] pb-1 mb-1">
      <p className="font-black text-[9.5px]">EXPRESS PETROL & FUEL</p>
      <p className="text-[7px] text-emerald-800/75">RECEIPT #77291 • PUMP 04</p>
    </div>
    <div className="space-y-0.5 my-1">
      <div className="flex justify-between"><span>VOLUME:</span><span>28.45 LTRS</span></div>
      <div className="flex justify-between"><span>RATE:</span><span>₹104.20 / L</span></div>
    </div>
    <div className="flex justify-between font-bold text-[9px] border-t border-dashed border-[#86EFAC] pt-1">
      <span>TOTAL PAID:</span>
      <span>₹2,964.50</span>
    </div>
  </div>
);

export const ParallaxBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 200, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 60;
      const y = (clientY / window.innerHeight - 0.5) * 60;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#0B0F19]">
      {/* Background glow orbs for rich dark atmosphere */}
      <motion.div 
        className="absolute inset-[-50%] opacity-20 blur-[160px]"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 100,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#3B82F6] rounded-full mix-blend-screen opacity-20" />
        <div className="absolute top-1/2 right-1/4 w-[35vw] h-[35vw] bg-[#00DC82] rounded-full mix-blend-screen opacity-20" />
        <div className="absolute bottom-1/4 left-1/2 w-[30vw] h-[30vw] bg-[#8B5CF6] rounded-full mix-blend-screen opacity-15" />
      </motion.div>

      {/* ========================================================================= */}
      {/* FULL COVERAGE: MASSIVE OVERLAPPING VINTAGE TICKETS COLLAGE SPREAD OUT */}
      {/* ========================================================================= */}

      {/* CLUSTER 1: Top-Left Dense Stack (4 Overlapping Tickets) */}
      <motion.div
        className="absolute -top-10 -left-10 md:top-4 md:left-6 z-0 pointer-events-none opacity-[0.20] hover:opacity-[0.35] transition-opacity duration-500"
        animate={{ y: [-6, 6, -6], rotate: [-4, -2, -4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ x: useSpring(useMotionValue(smoothX.get() * 0.04), springConfig) }}
      >
        <div className="relative">
          <div className="rotate-[-14deg]"><BoardingPassTicket /></div>
          <div className="absolute -top-3 left-10 rotate-[12deg]"><TransitTicketStub /></div>
          <div className="absolute top-8 left-4 rotate-[-6deg]"><CafeReceiptTicket /></div>
          <div className="absolute top-16 left-14 rotate-[18deg]"><CinemaAdmissionStub /></div>
        </div>
      </motion.div>

      {/* CLUSTER 2: Top-Center Floating Strip (4 Overlapping Tickets) */}
      <motion.div
        className="hidden md:block absolute -top-8 left-1/3 z-0 pointer-events-none opacity-[0.18]"
        animate={{ y: [8, -8, 8], rotate: [2, 5, 2] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: useSpring(useMotionValue(-smoothY.get() * 0.03), springConfig) }}
      >
        <div className="relative">
          <div className="rotate-[8deg]"><HotelVoucherTicket /></div>
          <div className="absolute top-6 -left-10 rotate-[-12deg]"><TaxiReceiptTicket /></div>
          <div className="absolute top-10 left-12 rotate-[4deg]"><FuelReceiptTicket /></div>
        </div>
      </motion.div>

      {/* CLUSTER 3: Top-Right Dense Stack (5 Overlapping Tickets) */}
      <motion.div
        className="absolute -top-6 -right-12 md:top-6 md:right-8 z-0 pointer-events-none opacity-[0.22] hover:opacity-[0.38] transition-opacity duration-500"
        animate={{ y: [-10, 10, -10], rotate: [4, 7, 4] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{
          x: useSpring(useMotionValue(-smoothX.get() * 0.05), springConfig),
          y: useSpring(useMotionValue(-smoothY.get() * 0.05), springConfig)
        }}
      >
        <div className="relative">
          <div className="rotate-[-16deg]"><BoardingPassTicket /></div>
          <div className="absolute top-6 left-6 rotate-[14deg]"><TransitTicketStub /></div>
          <div className="absolute top-12 -left-4 rotate-[-4deg]"><CafeReceiptTicket /></div>
          <div className="absolute top-20 left-10 rotate-[22deg]"><TaxiReceiptTicket /></div>
          <div className="absolute top-24 left-2 rotate-[-10deg]"><CinemaAdmissionStub /></div>
        </div>
      </motion.div>

      {/* CLUSTER 4: Middle-Left Cascade (4 Overlapping Tickets) */}
      <motion.div
        className="hidden lg:block absolute top-1/3 -left-10 z-0 pointer-events-none opacity-[0.19]"
        animate={{ y: [10, -10, 10], rotate: [8, 12, 8] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ x: useSpring(useMotionValue(smoothX.get() * 0.05), springConfig) }}
      >
        <div className="relative">
          <div className="rotate-[16deg]"><HotelVoucherTicket /></div>
          <div className="absolute -top-6 left-8 rotate-[-12deg]"><CafeReceiptTicket /></div>
          <div className="absolute top-12 left-4 rotate-[6deg]"><FuelReceiptTicket /></div>
          <div className="absolute top-20 left-12 rotate-[-8deg]"><TransitTicketStub /></div>
        </div>
      </motion.div>

      {/* CLUSTER 5: Center Ambient Watermark Tickets (4 Overlapping Tickets) */}
      <motion.div
        className="hidden xl:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-[0.14]"
        animate={{ y: [-8, 8, -8], rotate: [-6, -3, -6] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{
          x: useSpring(useMotionValue(-smoothX.get() * 0.03), springConfig),
          y: useSpring(useMotionValue(-smoothY.get() * 0.03), springConfig)
        }}
      >
        <div className="relative">
          <div className="rotate-[-8deg]"><BoardingPassTicket /></div>
          <div className="absolute -top-6 left-12 rotate-[15deg]"><TransitTicketStub /></div>
          <div className="absolute top-8 -left-8 rotate-[-16deg]"><CinemaAdmissionStub /></div>
        </div>
      </motion.div>

      {/* CLUSTER 6: Middle-Right Cascade (5 Overlapping Tickets) */}
      <motion.div
        className="hidden md:block absolute top-1/3 -right-8 z-0 pointer-events-none opacity-[0.20]"
        animate={{ y: [-12, 12, -12], rotate: [-14, -10, -14] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
        style={{ x: useSpring(useMotionValue(-smoothX.get() * 0.04), springConfig) }}
      >
        <div className="relative">
          <div className="rotate-[-18deg]"><BoardingPassTicket /></div>
          <div className="absolute top-8 -left-6 rotate-[8deg]"><CafeReceiptTicket /></div>
          <div className="absolute top-16 left-6 rotate-[-6deg]"><TaxiReceiptTicket /></div>
          <div className="absolute top-24 -left-4 rotate-[16deg]"><HotelVoucherTicket /></div>
        </div>
      </motion.div>

      {/* CLUSTER 7: Bottom-Left Dense Stack (5 Overlapping Tickets) */}
      <motion.div
        className="absolute bottom-4 -left-10 md:bottom-12 md:left-10 z-0 pointer-events-none opacity-[0.22] hover:opacity-[0.38] transition-opacity duration-500"
        animate={{ y: [8, -8, 8], rotate: [-6, -3, -6] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        style={{
          x: useSpring(useMotionValue(smoothX.get() * 0.04), springConfig),
          y: useSpring(useMotionValue(smoothY.get() * 0.04), springConfig)
        }}
      >
        <div className="relative">
          <div className="rotate-[18deg]"><HotelVoucherTicket /></div>
          <div className="absolute -top-8 left-8 rotate-[-10deg]"><CafeReceiptTicket /></div>
          <div className="absolute top-6 left-12 rotate-[6deg]"><TransitTicketStub /></div>
          <div className="absolute top-16 left-2 rotate-[-14deg]"><TaxiReceiptTicket /></div>
          <div className="absolute top-24 left-14 rotate-[12deg]"><FuelReceiptTicket /></div>
        </div>
      </motion.div>

      {/* CLUSTER 8: Bottom-Center Cascade (4 Overlapping Tickets) */}
      <motion.div
        className="hidden md:block absolute -bottom-8 left-1/3 z-0 pointer-events-none opacity-[0.18]"
        animate={{ y: [-8, 8, -8], rotate: [4, 8, 4] }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: useSpring(useMotionValue(smoothY.get() * 0.04), springConfig) }}
      >
        <div className="relative">
          <div className="rotate-[12deg]"><BoardingPassTicket /></div>
          <div className="absolute -top-6 left-10 rotate-[-14deg]"><CinemaAdmissionStub /></div>
          <div className="absolute top-8 -left-6 rotate-[6deg]"><TransitTicketStub /></div>
        </div>
      </motion.div>

      {/* CLUSTER 9: Bottom-Right Dense Stack (6 Overlapping Tickets) */}
      <motion.div
        className="absolute -bottom-8 -right-10 md:bottom-8 md:right-12 z-0 pointer-events-none opacity-[0.22] hover:opacity-[0.38] transition-opacity duration-500"
        animate={{ y: [10, -10, 10], rotate: [10, 14, 10] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          x: useSpring(useMotionValue(-smoothX.get() * 0.05), springConfig),
          y: useSpring(useMotionValue(-smoothY.get() * 0.05), springConfig)
        }}
      >
        <div className="relative">
          <div className="rotate-[14deg]"><CafeReceiptTicket /></div>
          <div className="absolute -top-6 -left-8 rotate-[-12deg]"><HotelVoucherTicket /></div>
          <div className="absolute top-10 left-6 rotate-[4deg]"><BoardingPassTicket /></div>
          <div className="absolute top-18 -left-6 rotate-[-18deg]"><TransitTicketStub /></div>
          <div className="absolute top-26 left-10 rotate-[20deg]"><TaxiReceiptTicket /></div>
          <div className="absolute top-32 -left-2 rotate-[-8deg]"><FuelReceiptTicket /></div>
        </div>
      </motion.div>

      {/* Vintage Paper Texture Noise Overlay */}
      <motion.div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

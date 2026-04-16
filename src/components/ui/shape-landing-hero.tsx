"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ElegantShapeProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}

export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-primary/20",
}: ElegantShapeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 10 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, -18, 0],
          rotate: [rotate, rotate + 3, rotate],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.5,
        }}
        style={{ width, height }}
        className="relative"
      >
        {/* Outer glow layer */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r opacity-40 blur-2xl",
            gradient
          )}
        />
        {/* Glass shape */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r",
            gradient,
            "backdrop-blur-sm border border-white/10",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

interface HeroGeometricProps {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
  children?: React.ReactNode;
}

export function HeroGeometric({
  badge = "AI-Powered",
  title1 = "Predict.",
  title2 = "Win.",
  description = "Professional-grade intelligence platform.",
  children,
}: HeroGeometricProps) {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.5 + i * 0.15, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] },
    }),
  };

  return (
    <div className="relative w-full overflow-hidden bg-background flex items-center justify-center">
      {/* Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={-15}
          gradient="from-primary/30 to-cyan-500/20"
          className="-top-20 -left-40"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={20}
          gradient="from-cyan-400/20 to-primary/15"
          className="top-1/4 -right-32"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-primary/15 to-emerald-500/10"
          className="bottom-1/4 left-1/4"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={45}
          gradient="from-cyan-300/15 to-primary/10"
          className="top-1/3 left-1/3"
        />
        <ElegantShape
          delay={0.7}
          width={400}
          height={100}
          rotate={-25}
          gradient="from-primary/10 to-teal-400/10"
          className="-bottom-10 -right-20"
        />
      </div>

      {/* Radial glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(0,255,136,0.07),transparent)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          {badge && (
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {badge}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-2">
            <span className="block text-foreground/90">{title1}</span>
            <span className="block bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {title2}
            </span>
          </h1>
        </motion.div>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            {description}
          </p>
        </motion.div>

        {children && (
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import PitchHero from "@/components/pitch/PitchHero";
import LuminaCase from "@/components/pitch/LuminaCase";
import HowItWorks from "@/components/pitch/HowItWorks";
import WhyItMatters from "@/components/pitch/WhyItMatters";

export default function Pitch() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PitchHero />
      <LuminaCase />
      <HowItWorks />
      <WhyItMatters />
    </div>
  );
}
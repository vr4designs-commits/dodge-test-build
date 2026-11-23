import { Hero } from "@/app/components/hero";
import { Challenge } from "@/app/components/challenge";
import { Approach } from "@/app/components/approach";
import { Stats } from "@/app/components/stats";
import { Latest } from "@/app/components/latest";
import { Compliance } from "@/app/components/compliance";
import { Cta } from "@/app/components/cta";
import { Footer } from "@/app/components/footer";

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Challenge />
        <Approach />
        <Stats />
        <Latest />
        <Compliance />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

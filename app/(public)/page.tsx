import { CallToAction } from "@/components/home/call-to-action";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedServices } from "@/components/home/featured-services";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Reveal } from "@/components/shared/reveal";
import { getFeaturedServices } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await getFeaturedServices(6);

  return (
    <>
      <Hero />
      <Reveal>
        <CategoriesSection />
      </Reveal>
      <Reveal>
        <FeaturedServices services={services} />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>
      <Reveal>
        <CallToAction />
      </Reveal>
    </>
  );
}

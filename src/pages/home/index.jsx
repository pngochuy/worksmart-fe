import { Banner } from "./Banner";
import { RegisterationBanners } from "./RegisterationBanners";
import { JobCategories } from "./JobCategories";
import { JobSection } from "./JobSection";
import { CTA } from "./CTA";
import { FunFact } from "./FunFact";
import { CallToAction } from "./CallToAction";
import { PopularCity } from "./PopularCity";
import { Subscribe } from "./Subscribe";

export const Index = () => {
  return (
    <>
      {/* Banner Section Three*/}
      <Banner />
      {/* End Banner Section Three*/}

      {/* Registeration Banners */}
      <RegisterationBanners />
      {/* End Registeration Banners */}

      {/* Job Categories */}
      <JobCategories />
      {/* End Job Categories */}

      {/* Job Section */}
      <JobSection />
      {/* End Job Section */}

      {/* CTA */}
      <CTA />
      {/* End About Section */}

      {/* Fun Fact Section */}
      <FunFact />
      {/* Fun Fact Section */}

      {/* Call To Action */}
      <CallToAction />
      {/* End Call To Action */}

      {/* Popular City */}
      <PopularCity />
      {/* End Popular City */}

      {/* Subscribe Section */}
      <Subscribe />
      {/* End Subscribe Section */}
    </>
  );
};

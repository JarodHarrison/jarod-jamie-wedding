export type FashionLink = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  cta: string;
};

export const fashionInspirationLinks: FashionLink[] = [
  {
    id: "women",
    title: "Women",
    subtitle: "ASOS Design",
    description:
      "Colourful cocktail vibes — browse ASOS Design for dresses and outfits that pop against the hinterland greenery.",
    href: "https://www.asos.com/au/search/?q=asos%20design&currentpricerange=5-680&refine=attribute_10313:50364",
    cta: "Shop Women's ASOS Design",
  },
  {
    id: "men",
    title: "Men",
    subtitle: "ASOS Design",
    description:
      "Smart, colourful cocktail looks — tailored shirts, suits, and statement pieces from ASOS Design.",
    href: "https://www.asos.com/au/men/a-to-z-of-brands/asos-design/cat/?cid=27871&currentpricerange=5-380&refine=attribute_10992:61467|base_colour:1,16,17,2,3,33,37,4,5,7,8,9",
    cta: "Shop Men's ASOS Design",
  },
  {
    id: "glam",
    title: "Feeling Glam?",
    subtitle: "Sequin Tuxedos",
    description:
      "Go full sparkle — sequin tuxedos and formal wear for guests who want to turn every head on the dance floor.",
    href: "https://www.gentlemansguru.com/product-category/formal-wear/tuxedos/sequin-tuxedos/",
    cta: "Browse Sequin Tuxedos",
  },
];

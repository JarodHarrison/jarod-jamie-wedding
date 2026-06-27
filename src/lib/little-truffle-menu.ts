export type SampleMenuItem = {
  name: string;
  description?: string;
  dietary?: string;
};

export type SampleMenuCourse = {
  title: string;
  note?: string;
  items: SampleMenuItem[];
};

export type SampleMenu = {
  title: string;
  courses: SampleMenuCourse[];
  footnote?: string;
  pdfUrl?: string;
};

/** Group booking sample menu — Little Truffle, Mermaid Beach. */
export const LITTLE_TRUFFLE_SAMPLE_MENU: SampleMenu = {
  title: "Sample 4-course menu",
  pdfUrl: "/little-truffle-menu.pdf",
  footnote: "$89 per person · dietary needs accommodated with notice",
  courses: [
    {
      title: "Amuse bouche",
      items: [
        {
          name: "Cauliflower, parsnip & truffle soup",
          description: "Chives",
          dietary: "V, GF",
        },
      ],
    },
    {
      title: "Entrée",
      note: "Choose one",
      items: [
        {
          name: "Heirloom beetroot salad",
          description: "Orange, whipped ricotta & goats' cheese",
          dietary: "V, GF",
        },
        {
          name: "Zucchini flower",
          description: "Filled with scallop mousseline, lightly steamed, citrus beurre blanc",
          dietary: "GF",
        },
        {
          name: "Beef tartare",
          description: "Potato pave, pickled shimeji mushroom, red wine sauce, truffle mayonnaise",
          dietary: "GF",
        },
        {
          name: "Terrine",
          description: "Confit chicken, duck & pistachios, apricot relish & toasted brioche",
        },
      ],
    },
    {
      title: "Main",
      note: "Choose one · Angus beef fillet upgrade +$18",
      items: [
        {
          name: "Tortellini",
          description: "Filled with Moreton Bay bug & prawn, sweet mustard fruit beurre blanc",
        },
        {
          name: "Salmon, lightly steamed",
          description:
            "Crustacean mousseline encased in zucchini flowers, creamed potato, Champagne sauce",
          dietary: "GF",
        },
        {
          name: "Chicken ballotine",
          description: "Risotto of forest mushroom & Alsace bacon, vermouth cream sauce",
          dietary: "GF",
        },
        {
          name: "Angus beef fillet, chargrilled",
          description:
            "Beef cheek croquette, pommes purée, shallot purée, sautéed spinach, red wine & shallot jus",
        },
      ],
    },
    {
      title: "Dessert",
      note: "Choose one",
      items: [
        {
          name: "Raspberry soufflé",
          description: "White chocolate sauce",
          dietary: "V, GF",
        },
        {
          name: "Daniel's cherries jubilee",
          dietary: "V, GF",
        },
        {
          name: "Vanilla panna cotta",
          description: "Variations of berries",
          dietary: "GF",
        },
        {
          name: "Cheese",
          description: "Selection of local & imported cheeses, honeycomb",
          dietary: "V",
        },
      ],
    },
  ],
};

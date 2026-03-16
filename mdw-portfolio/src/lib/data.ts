export type Project = {
  id: string;
  title: string;
  client: string;
  year: string;
  imageUrl: string;
  imageAlt: string;
  photographer?: string;
  publication?: string;
  link?: string;
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  projects: Project[];
};

export const PORTFOLIO_CATEGORIES: Category[] = [
  {
    id: "0",
    slug: "covers",
    title: "Covers",
    description: "Magazine covers spanning the world's most prestigious publications.",
    coverImage: "https://images.unsplash.com/photo-1524502397800-2eeaead7c3fe?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "cov1", title: "Glamour", client: "Aurora James", year: "2022", imageUrl: "https://images.unsplash.com/photo-1524502397800-2eeaead7c3fe?q=80&w=800&auto=format&fit=crop", imageAlt: "Aurora James Glamour Cover", publication: "Glamour", link: "https://www.glamour.com/story/aurora-james-glamour-women-of-the-year-2022" },
      { id: "cov2", title: "Vogue", client: "Lupita Nyong'o", year: "2022", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop", imageAlt: "Lupita Nyong'o Vogue Cover", publication: "Vogue", link: "https://www.vogue.com/article/lupita-nyongo-beauty-facial-jewels-orange-eyeshadow-new-york-city" },
      { id: "cov3", title: "Vanity Fair", client: "Maria Taylor", year: "2022", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", imageAlt: "Maria Taylor Vanity Fair Cover", publication: "Vanity Fair", link: "https://www.vanityfair.com/hollywood/2022/02/maria-taylor-espn-nbc-olympics-super-bowl" },
      { id: "cov4", title: "W Magazine", client: "Fousheé", year: "2022", imageUrl: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=800&auto=format&fit=crop", imageAlt: "Fousheé W Magazine Cover", publication: "W Magazine", link: "https://www.wmagazine.com/culture/foushee-deep-end-tiktok-time-machine-interview" },
      { id: "cov5", title: "ELLE UK", client: "Magazine Feature", year: "2019", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=800&auto=format&fit=crop", imageAlt: "ELLE UK Feature", publication: "ELLE UK", link: "https://gb.readly.com/magazines/elle-uk/2019-08-08/5d4d07ac11cba3b7e745f866" },
      { id: "cov6", title: "PhotoBook Magazine", client: "Alisha Wainwright", year: "2022", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop", imageAlt: "Alisha Wainwright PhotoBook Cover", publication: "PhotoBook Magazine", link: "https://www.photobookmagazine.com/features/alisha-wainwright" },
      { id: "cov7", title: "PhotoBook Magazine", client: "Gracie Marie Bradley", year: "2022", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=800&auto=format&fit=crop", imageAlt: "Gracie Marie Bradley PhotoBook Cover", publication: "PhotoBook Magazine", link: "https://www.photobookmagazine.com/features/gracie-marie-bradley" },
      { id: "cov8", title: "Composure Magazine", client: "Ritu Arya", year: "2022", imageUrl: "https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?q=80&w=800&auto=format&fit=crop", imageAlt: "Ritu Arya Composure Cover", publication: "Composure Magazine", link: "https://composuremagazine.com/ritu-arya/" },
      { id: "cov9", title: "Flaunt Magazine", client: "Chloe Coleman", year: "2022", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=800&auto=format&fit=crop", imageAlt: "Chloe Coleman Flaunt Cover", publication: "Flaunt Magazine" },
    ]
  },
  {
    id: "1",
    slug: "editorial",
    title: "Editorial",
    description: "Fashion editorial storytelling spanning the world's leading publications — from conceptual fashion stories to intimate portrait series.",
    coverImage: "https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "e1", title: "Vogue Beauty Feature", client: "Lupita Nyong'o", year: "2022", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lupita Nyong'o Vogue beauty", publication: "Vogue", link: "https://www.vogue.com/article/lupita-nyongo-beauty-facial-jewels-orange-eyeshadow-new-york-city" },
      { id: "e2", title: "Valentino Global Makeup Artist", client: "Raoul Alejandre", year: "2022", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop", imageAlt: "Raoul Alejandre Vogue", publication: "Vogue", link: "https://www.vogue.com/article/raoul-alejandre-valentino-global-makeup-artist" },
      { id: "e3", title: "Deep End", client: "Fousheé", year: "2022", imageUrl: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=1000&auto=format&fit=crop", imageAlt: "Fousheé W Magazine", publication: "W Magazine", link: "https://www.wmagazine.com/culture/foushee-deep-end-tiktok-time-machine-interview" },
      { id: "e4", title: "Aurora Rising", client: "Aurora James", year: "2022", imageUrl: "https://images.unsplash.com/photo-1524502397800-2eeaead7c3fe?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James editorial", publication: "Grazia USA", link: "https://graziamagazine.com/us/articles/aurora-rising-aurora-james/" },
      { id: "e5", title: "Women of the Year 2022", client: "Aurora James", year: "2022", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James Glamour WOTY", publication: "Glamour", link: "https://www.glamour.com/story/aurora-james-glamour-women-of-the-year-2022" },
      { id: "e6", title: "Ready for the Spotlight", client: "Saniyya Sidney", year: "2022", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney Cultured", publication: "Cultured Magazine", link: "https://www.culturedmag.com/article/2022/03/15/saniyya-sidney-is-ready-for-the-spotlight/" },
      { id: "e7", title: "SAG Awards GRWM", client: "Saniyya Sidney", year: "2022", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney Teen Vogue", publication: "Teen Vogue", link: "https://www.teenvogue.com/story/king-richard-star-saniyya-sidney-sag-awards-2022-grwm" },
      { id: "e8", title: "King Richard Feature", client: "Saniyya Sidney & Demi Singleton", year: "2021", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop", imageAlt: "King Richard LA Times", publication: "Los Angeles Times" },
      { id: "e9", title: "Maria Taylor Feature", client: "Maria Taylor", year: "2022", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Maria Taylor Vanity Fair", publication: "Vanity Fair", link: "https://www.vanityfair.com/hollywood/2022/02/maria-taylor-espn-nbc-olympics-super-bowl" },
      { id: "e10", title: "Let Me Break This Down For You Again", client: "Chloe Coleman", year: "2022", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop", imageAlt: "Chloe Coleman Flaunt", publication: "Flaunt Magazine" },
      { id: "e11", title: "Zaria Portrait", client: "Zaria", year: "2022", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Zaria portrait", publication: "Andie Elloway", link: "https://www.andielloway.com/celebrity-/-portrait/zaria" },
      { id: "e12", title: "Composure Feature", client: "Ritu Arya", year: "2022", imageUrl: "https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?q=80&w=1000&auto=format&fit=crop", imageAlt: "Ritu Arya editorial", publication: "Composure Magazine", link: "https://composuremagazine.com/ritu-arya/" },
      { id: "e13", title: "Summer TV & Film Ones to Watch", client: "Featured Talent", year: "2022", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Who What Wear feature", publication: "Who What Wear", link: "https://www.whowhatwear.com/summer-tv-film-ones-to-watch-2022" },
      { id: "e14", title: "L'Officiel Malaysia", client: "Hao Zeng", year: "2022", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "L'Officiel Malaysia editorial", publication: "Beauty Scene", link: "https://www.beautyscene.net/editorial/lofficiel-malaysia-hao-zeng/" },
      { id: "e15", title: "Under Cover: Big Sky", client: "Television Academy", year: "2021", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Big Sky Television Academy", publication: "Television Academy", link: "https://www.televisionacademy.com/video/under-cover-big-sky" },
      { id: "e16", title: "ContentMode Feature", client: "Editorial", year: "2022", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", imageAlt: "ContentMode editorial", publication: "ContentMode", link: "https://contentmode.com/10196-2/" },
      { id: "e17", title: "ELLE UK Feature", client: "Magazine Feature", year: "2019", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop", imageAlt: "ELLE UK feature", publication: "ELLE UK", link: "https://gb.readly.com/magazines/elle-uk/2019-08-08/5d4d07ac11cba3b7e745f866" },
      { id: "e18", title: "Editorial", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop", imageAlt: "Editorial" },
      { id: "e19", title: "Editorial", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop", imageAlt: "Editorial" },
      { id: "e20", title: "Editorial", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1000&auto=format&fit=crop", imageAlt: "Editorial" },
    ]
  },
  {
    id: "2",
    slug: "red-carpet",
    title: "Red Carpet",
    description: "High-stakes glamour crafted for cinema's biggest stages, award shows, and international galas.",
    coverImage: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "rc1", title: "NAACP Image Awards", client: "Saniyya Sidney", year: "2022", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney NAACP Awards", link: "https://www.redcarpet-fashionawards.com/2022/02/25/saniyya-sidney-wore-philosophy-di-lorenzo-serafini-to-the-2022-naacp-image-awards-nominees-reception/" },
      { id: "rc2", title: "ACE Awards", client: "Lupita Nyong'o", year: "2022", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lupita Nyong'o ACE Awards", publication: "Vogue", link: "https://www.vogue.com/article/lupita-nyongo-beauty-facial-jewels-orange-eyeshadow-new-york-city" },
      { id: "rc3", title: "Met Gala", client: "Aurora James", year: "2022", imageUrl: "https://images.unsplash.com/photo-1524502397800-2eeaead7c3fe?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James Met Gala" },
      { id: "rc4", title: "Vanity Fair Oscar Party", client: "Aurora James", year: "2022", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James Vanity Fair Oscar Party", publication: "Vanity Fair" },
      { id: "rc5", title: "SAG Awards GRWM", client: "Saniyya Sidney", year: "2022", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney SAG Awards", publication: "Teen Vogue", link: "https://www.teenvogue.com/story/king-richard-star-saniyya-sidney-sag-awards-2022-grwm" },
      { id: "rc6", title: "HCA Awards", client: "Saniyya Sidney", year: "2022", imageUrl: "https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney HCA Awards" },
      { id: "rc7", title: "BET Awards", client: "Rihanna", year: "2022", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Rihanna BET Awards" },
      { id: "rc8", title: "The Daily Show", client: "Lizzo", year: "2022", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lizzo Daily Show" },
      { id: "rc9", title: "NBC Olympics / Super Bowl", client: "Maria Taylor", year: "2022", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Maria Taylor NBC Olympics", publication: "Vanity Fair", link: "https://www.vanityfair.com/hollywood/2022/02/maria-taylor-espn-nbc-olympics-super-bowl" },
      { id: "rc10", title: "Project Runway", client: "Elaine Welteroth", year: "2022", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Elaine Welteroth Project Runway" },
      { id: "rc11", title: "Kindred Premiere", client: "Mallori Johnson", year: "2022", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Mallori Johnson Kindred Premiere" },
      { id: "rc12", title: "Deadline Contenders", client: "Liesl Tommy", year: "2022", imageUrl: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=1000&auto=format&fit=crop", imageAlt: "Liesl Tommy Deadline Contenders" },
      { id: "rc13", title: "City of Hope Gala", client: "Billy Porter", year: "2022", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop", imageAlt: "Billy Porter City of Hope" },
      { id: "rc14", title: "Event Appearance", client: "Meena Harris", year: "2022", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "Meena Harris red carpet" },
      { id: "rc15", title: "Grammy Awards", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Grammy Awards red carpet" },
      { id: "rc16", title: "Emmy Awards", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Emmy Awards red carpet" },
      { id: "rc17", title: "Film Premiere", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Film premiere red carpet" },
      { id: "rc18", title: "Award Show", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Award show red carpet" },
    ]
  },
  {
    id: "3",
    slug: "beauty",
    title: "Beauty",
    description: "Detail-obsessed close-up work that honors texture, radiance, and the artistry of natural hair.",
    coverImage: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "b1", title: "ACE Awards Beauty", client: "Lupita Nyong'o", year: "2022", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lupita Nyong'o ACE Awards beauty", link: "https://www.vogue.com/article/lupita-nyongo-beauty-facial-jewels-orange-eyeshadow-new-york-city" },
      { id: "b2", title: "Crop Over", client: "Rihanna", year: "2019", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", imageAlt: "Rihanna Crop Over beauty" },
      { id: "b3", title: "Studio Portrait I", client: "Carmen Solomons", year: "2022", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Carmen Solomons studio portrait" },
      { id: "b4", title: "Studio Portrait II", client: "Carmen Solomons", year: "2022", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "Carmen Solomons studio portrait II" },
      { id: "b5", title: "Underground Railroad", client: "Thuso Mbedu", year: "2021", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=1000&auto=format&fit=crop", imageAlt: "Thuso Mbedu Underground Railroad" },
      { id: "b6", title: "Gunpowder Milkshake", client: "Chloe Coleman", year: "2022", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Chloe Coleman Gunpowder Milkshake" },
      { id: "b7", title: "Beauty Portrait", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1000&auto=format&fit=crop", imageAlt: "Beauty portrait" },
      { id: "b8", title: "Natural Texture Study", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Natural texture beauty" },
      { id: "b9", title: "Beauty Campaign", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop", imageAlt: "Beauty campaign" },
      { id: "b10", title: "Close-Up Series", client: "TBD", year: "2022", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Close-up beauty series" },
    ]
  },
  {
    id: "4",
    slug: "commercial-ecom",
    title: "Commercial / ECOM",
    description: "Brand campaigns and e-commerce productions for global names — polished, strategic, and campaign-ready.",
    coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "com1", title: "Greatest Dynasty Ever", client: "Nike", year: "2021", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "Nike Greatest Dynasty Ever", publication: "Nike" },
      { id: "com2", title: "Spring 2019 Campaign", client: "Savage X Fenty — Tabria Majors", year: "2019", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Savage X Fenty Spring 2019" },
      { id: "com3", title: "Group Campaign", client: "Savage X Fenty — Nina Marie Daniele", year: "2019", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Savage X Fenty group campaign" },
      { id: "com4", title: "Christian Cowan x Le Specs", client: "Veronika Vilim", year: "2020", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Christian Cowan x Le Specs", link: "https://lespecs.com/blogs/le-specs/christian-cowan-x-le-specs-1" },
      { id: "com5", title: "Le Specs Feature", client: "Christian Cowan x Le Specs", year: "2020", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop", imageAlt: "Christian Cowan Le Specs Models.com", link: "https://models.com/work/christian-cowan-christian-cowan-x-le-specs" },
      { id: "com6", title: "Brother Vellies Campaign", client: "Mical Bockru", year: "2021", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Brother Vellies campaign" },
      { id: "com7", title: "Brother Vellies Campaign", client: "Ebony Riley", year: "2021", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Brother Vellies campaign II" },
      { id: "com8", title: "Christian Cowan 2020", client: "Lisa Rinna", year: "2020", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lisa Rinna Christian Cowan" },
    ]
  }
];

export const FEATURED_CLIENTS = [
  "Rihanna", "Nike", "Savage X Fenty", "Brother Vellies", "Christian Cowan", "Le Specs",
  "Vogue", "Vanity Fair", "W Magazine", "Glamour", "ELLE UK", "Grazia",
  "Teen Vogue", "Refinery29", "Who What Wear", "Los Angeles Times",
  "Composure", "Cultured", "Flaunt", "PhotoBook Magazine",
  "ContentMode", "Television Academy", "L'Officiel", "Andie Elloway"
];

export const PRESS_MENTIONS = [
  {
    id: "1",
    publication: "Vogue",
    date: "2022",
    title: "Lupita Nyong'o's Beauty Look",
    excerpt: "Michael David crafted an ethereal look for Lupita Nyong'o at the ACE Awards — featuring facial jewels and vibrant orange eyeshadow.",
    link: "https://www.vogue.com/article/lupita-nyongo-beauty-facial-jewels-orange-eyeshadow-new-york-city"
  },
  {
    id: "2",
    publication: "Vogue",
    date: "2022",
    title: "Raoul Alejandre, Valentino Global Makeup Artist",
    excerpt: "Hair direction by Michael David for Vogue's profile of Valentino's global makeup artist Raoul Alejandre.",
    link: "https://www.vogue.com/article/raoul-alejandre-valentino-global-makeup-artist"
  },
  {
    id: "3",
    publication: "Vanity Fair",
    date: "2022",
    title: "Maria Taylor: ESPN, NBC Olympics & Super Bowl",
    excerpt: "Michael David's editorial precision brought Maria Taylor's on-screen presence to life for NBC's Olympic and Super Bowl coverage.",
    link: "https://www.vanityfair.com/hollywood/2022/02/maria-taylor-espn-nbc-olympics-super-bowl"
  },
  {
    id: "4",
    publication: "W Magazine",
    date: "2022",
    title: "Fousheé: Deep End",
    excerpt: "On set with Fousheé for W Magazine — hair direction by Michael David.",
    link: "https://www.wmagazine.com/culture/foushee-deep-end-tiktok-time-machine-interview"
  },
  {
    id: "5",
    publication: "Glamour",
    date: "2022",
    title: "Aurora James — Women of the Year 2022",
    excerpt: "Aurora James photographed for Glamour's Women of the Year — hair by Michael David.",
    link: "https://www.glamour.com/story/aurora-james-glamour-women-of-the-year-2022"
  },
  {
    id: "6",
    publication: "Grazia USA",
    date: "2022",
    title: "Aurora Rising: Aurora James",
    excerpt: "A profile of designer Aurora James with hair direction by Michael David.",
    link: "https://graziamagazine.com/us/articles/aurora-rising-aurora-james/"
  },
  {
    id: "7",
    publication: "Los Angeles Times",
    date: "2021",
    title: "King Richard: Saniyya Sidney & Demi Singleton",
    excerpt: "Los Angeles Times covers the rising stars of King Richard — with hair by Michael David.",
    link: ""
  },
  {
    id: "8",
    publication: "Teen Vogue",
    date: "2022",
    title: "King Richard Star Saniyya Sidney's SAG Awards GRWM",
    excerpt: "A behind-the-scenes look at getting Saniyya Sidney red-carpet ready for the 2022 SAG Awards.",
    link: "https://www.teenvogue.com/story/king-richard-star-saniyya-sidney-sag-awards-2022-grwm"
  },
  {
    id: "9",
    publication: "Cultured Magazine",
    date: "2022",
    title: "Saniyya Sidney Is Ready for the Spotlight",
    excerpt: "Cultured Magazine's feature on Saniyya Sidney — styled with hair direction by Michael David.",
    link: "https://www.culturedmag.com/article/2022/03/15/saniyya-sidney-is-ready-for-the-spotlight/"
  },
  {
    id: "10",
    publication: "Nike",
    date: "2021",
    title: "Greatest Dynasty Ever",
    excerpt: "Hair direction by Michael David for Nike's iconic Greatest Dynasty Ever campaign.",
    link: ""
  },
  {
    id: "11",
    publication: "Refinery29",
    date: "2022",
    title: "Pregnancy Doulas & Black Medical Bias",
    excerpt: "Refinery29 feature examining pregnancy doulas and Black medical bias — hair by Michael David.",
    link: ""
  },
  {
    id: "12",
    publication: "Refinery29",
    date: "2022",
    title: "Raena Granberry — Black Motherhood",
    excerpt: "A powerful feature on Raena Granberry exploring the realities of Black motherhood — hair by Michael David.",
    link: ""
  },
  {
    id: "13",
    publication: "Refinery29",
    date: "2022",
    title: "OfflineTV Feature",
    excerpt: "Refinery29's feature on OfflineTV — with hair direction by Michael David.",
    link: ""
  },
  {
    id: "14",
    publication: "Refinery29",
    date: "2022",
    title: "Black Women Creators to Watch",
    excerpt: "Refinery29 spotlights emerging Black creators — featuring work by Michael David.",
    link: "https://www.refinery29.com/en-us/2022/12/11221549/black-women-creators-elsa-lala-aliyah-fannita-cleotrapa"
  },
  {
    id: "15",
    publication: "Who What Wear",
    date: "2022",
    title: "Summer TV & Film Ones to Watch 2022",
    excerpt: "Who What Wear's summer guide to breakout talent in TV and film — hair by Michael David.",
    link: "https://www.whowhatwear.com/summer-tv-film-ones-to-watch-2022"
  },
  {
    id: "16",
    publication: "PhotoBook Magazine",
    date: "2022",
    title: "Gracie Marie Bradley",
    excerpt: "Gracie Marie Bradley photographed for PhotoBook Magazine — hair direction by Michael David.",
    link: "https://www.photobookmagazine.com/features/gracie-marie-bradley"
  },
  {
    id: "17",
    publication: "PhotoBook Magazine",
    date: "2022",
    title: "Alisha Wainwright",
    excerpt: "PhotoBook's feature on actress Alisha Wainwright — hair by Michael David.",
    link: "https://www.photobookmagazine.com/features/alisha-wainwright"
  },
  {
    id: "18",
    publication: "Beauty Scene",
    date: "2022",
    title: "L'Officiel Malaysia — Hao Zeng",
    excerpt: "An editorial for L'Officiel Malaysia photographed by Hao Zeng — hair direction by Michael David.",
    link: "https://www.beautyscene.net/editorial/lofficiel-malaysia-hao-zeng/"
  },
  {
    id: "19",
    publication: "Television Academy",
    date: "2021",
    title: "Under Cover: Big Sky",
    excerpt: "Television Academy's Under Cover series featuring the Big Sky production — hair by Michael David.",
    link: "https://www.televisionacademy.com/video/under-cover-big-sky"
  },
  {
    id: "20",
    publication: "ContentMode",
    date: "2022",
    title: "Editorial Feature",
    excerpt: "ContentMode editorial feature — hair direction by Michael David.",
    link: "https://contentmode.com/10196-2/"
  },
  {
    id: "21",
    publication: "Composure Magazine",
    date: "2022",
    title: "Ritu Arya",
    excerpt: "A portrait feature on Ritu Arya for Composure Magazine — hair by Michael David.",
    link: "https://composuremagazine.com/ritu-arya/"
  },
  {
    id: "22",
    publication: "Flaunt Magazine",
    date: "2022",
    title: "Chloe Coleman: Let Me Break This Down For You Again",
    excerpt: "Flaunt Magazine's feature on Chloe Coleman — hair by Michael David.",
    link: ""
  },
  {
    id: "23",
    publication: "Andie Elloway",
    date: "2022",
    title: "Zaria Portrait",
    excerpt: "A striking portrait of Zaria photographed by Andie Elloway — hair by Michael David.",
    link: "https://www.andielloway.com/celebrity-/-portrait/zaria"
  },
  {
    id: "24",
    publication: "Le Specs",
    date: "2020",
    title: "Christian Cowan x Le Specs",
    excerpt: "Hair direction for the Christian Cowan x Le Specs campaign — by Michael David.",
    link: "https://lespecs.com/blogs/le-specs/christian-cowan-x-le-specs-1"
  },
  {
    id: "25",
    publication: "Models.com",
    date: "2020",
    title: "Christian Cowan x Le Specs",
    excerpt: "Models.com feature on the Christian Cowan x Le Specs collaboration — hair by Michael David.",
    link: "https://models.com/work/christian-cowan-christian-cowan-x-le-specs"
  },
  {
    id: "26",
    publication: "ELLE UK",
    date: "2019",
    title: "Magazine Feature",
    excerpt: "ELLE UK feature — hair direction by Michael David.",
    link: "https://gb.readly.com/magazines/elle-uk/2019-08-08/5d4d07ac11cba3b7e745f866"
  },
  {
    id: "27",
    publication: "Red Carpet Fashion Awards",
    date: "2022",
    title: "Saniyya Sidney at 2022 NAACP Image Awards",
    excerpt: "Saniyya Sidney at the 2022 NAACP Image Awards Nominees Reception — hair by Michael David.",
    link: "https://www.redcarpet-fashionawards.com/2022/02/25/saniyya-sidney-wore-philosophy-di-lorenzo-serafini-to-the-2022-naacp-image-awards-nominees-reception/"
  }
];

export const CAREER_TIMELINE = [
  { year: "Early 2000s", event: "Began as an assistant stylist", detail: "Started assisting leading hairstylists in the fashion and entertainment industry, building foundational craft across editorial and celebrity work." },
  { year: "Mid-2000s", event: "First editorial credits", detail: "Earned first major editorial credits in regional and national publications, establishing a voice rooted in texture and natural hair artistry." },
  { year: "2010s", event: "Joined Rihanna's creative team", detail: "Worked with Rihanna and her creative circle for nearly four years, contributing to campaigns, editorials, performances, and red-carpet moments seen around the world." },
  { year: "2015–2019", event: "Global editorial expansion", detail: "Built a portfolio spanning Vogue, Vanity Fair, W Magazine, and international editions — working across New York, London, Los Angeles, Paris, Tokyo, and beyond." },
  { year: "2019–2020", event: "Major brand campaigns", detail: "Directed hair for Savage X Fenty, Nike's Greatest Dynasty Ever, and the Christian Cowan x Le Specs campaign — marking a transition into luxury commercial work." },
  { year: "2020–2022", event: "Industry Recognition & Global Reach", detail: "Expanded a global creative practice spanning fashion, entertainment, and editorial storytelling — working across New York, London, Paris, Tokyo, and beyond." },
  { year: "2022–Present", event: "Founder / Author / Creative Director", detail: "Now operating as a creative entrepreneur — providing hair direction, consulting, and creative vision for top-tier editorial, celebrity, and commercial clients globally." },
];

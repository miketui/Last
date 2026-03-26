export type Project = {
  id: string;
  title: string;
  client: string;
  year: string;
  imageUrl: string;
  imageAlt: string;
  filename?: string;
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
      { id: "cov1", title: "Harper's Bazaar", client: "Duckie Thot", year: "2018", filename: "cover_2018_duckie-thot_harpers-bazaar_01.jpg", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop", imageAlt: "Duckie Thot Harper's Bazaar Cover", publication: "Harper's Bazaar" },
      { id: "cov2", title: "Wonderland", client: "Duckie Thot", year: "2018", filename: "cover_2018_duckie-thot_wonderland_02.jpg", imageUrl: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=800&auto=format&fit=crop", imageAlt: "Duckie Thot Wonderland Cover", publication: "Wonderland" },
      { id: "cov3", title: "Stylist UK", client: "Duckie Thot", year: "2018", filename: "cover_2018_duckie-thot_stylist-uk_03.jpg", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", imageAlt: "Duckie Thot Stylist UK Cover", publication: "Stylist UK" },
      { id: "cov4", title: "Emmy Magazine", client: "Kylie Bunbury", year: "2021", filename: "cover_2021_kylie-bunbury_emmy-magazine_04.jpg", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop", imageAlt: "Kylie Bunbury Emmy Magazine Cover", publication: "Emmy Magazine" },
      { id: "cov5", title: "PhotoBook Magazine", client: "Alisha Wainwright", year: "2022", filename: "cover_2022_alisha-wainwright_photobook_05.jpg", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=800&auto=format&fit=crop", imageAlt: "Alisha Wainwright PhotoBook Cover", publication: "PhotoBook Magazine", link: "https://www.photobookmagazine.com/features/alisha-wainwright" },
      { id: "cov6", title: "Variety", client: "Gugu Mbatha-Raw", year: "2020", filename: "cover_2020_gugu-mbatha-raw_variety_06.jpg", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=800&auto=format&fit=crop", imageAlt: "Gugu Mbatha-Raw Variety Cover", publication: "Variety" },
      { id: "cov7", title: "Chic Album Cover", client: "Duckie Thot & Jazzelle", year: "2018", filename: "cover_2018_duckie-thot-jazzelle_chic-album_07.jpg", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=800&auto=format&fit=crop", imageAlt: "Duckie Thot and Jazzelle Neil Rogers Chic Album Cover", publication: "Neil Rogers" },
      { id: "cov8", title: "Glamour", client: "Aurora James", year: "2022", filename: "cover_2022_aurora-james_glamour_08.jpg", imageUrl: "https://images.unsplash.com/photo-1524502397800-2eeaead7c3fe?q=80&w=800&auto=format&fit=crop", imageAlt: "Aurora James Glamour Cover", publication: "Glamour", link: "https://www.glamour.com/story/aurora-james-glamour-women-of-the-year-2022" },
      { id: "cov9", title: "Coveteur", client: "Gottmik", year: "2022", filename: "cover_2022_gottmik_coveteur_09.jpg", imageUrl: "https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?q=80&w=800&auto=format&fit=crop", imageAlt: "Gottmik Coveteur Cover", publication: "Coveteur" },
    ]
  },
  {
    id: "1",
    slug: "editorial",
    title: "Editorial",
    description: "Fashion editorial storytelling spanning the world's leading publications — from conceptual fashion stories to intimate portrait series.",
    coverImage: "https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "e1", title: "L'Officiel Malaysia II", client: "Najiyah Imani & Marie", year: "2018", filename: "Editorial_2018_twins_lofficiel-malaysia_41.jpg", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop", imageAlt: "Najiyah Imani and Marie L'Officiel Malaysia editorial II", publication: "L'Officiel Malaysia" },
      { id: "e2", title: "Anaïs Bodysuits I", client: "Duckie Thot", year: "2018", filename: "Editorial_2018_duckie-thot_anais-bodysuits_22.jpg", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", imageAlt: "Duckie Thot Anaïs Bodysuits editorial" },
      { id: "e3", title: "Anaïs Bodysuits II", client: "Duckie Thot", year: "2018", filename: "Editorial_2018_duckie-thot_anais-bodysuits_23.jpg", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop", imageAlt: "Duckie Thot Anaïs Bodysuits editorial II" },
      { id: "e4", title: "Harper's Bazaar Mexico", client: "Duckie Thot", year: "2018", filename: "Editorial_2018_duckie-thot_harpers-bazaar-mexico_24.jpg", imageUrl: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=1000&auto=format&fit=crop", imageAlt: "Duckie Thot Harper's Bazaar Mexico editorial", publication: "Harper's Bazaar Mexico" },
      { id: "e5", title: "PhotoBook Magazine", client: "Arica Himmel", year: "2021", filename: "Editorial_2021_arica-himmel_photobook_25.jpg", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Arica Himmel PhotoBook editorial", publication: "PhotoBook Magazine" },
      { id: "e6", title: "Refinery29 Feature", client: "Saniyya Sidney", year: "2021", filename: "Editorial_2021_saniyya-sidney_refinery29_26.jpg", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney Refinery29 editorial", publication: "Refinery29" },
      { id: "e7", title: "Refinery29 Feature", client: "Saniyya Sidney & Demi Singleton", year: "2021", filename: "Editorial_2021_saniyya-demi_refinery29_27.jpg", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney and Demi Singleton Refinery29", publication: "Refinery29" },
      { id: "e8", title: "Portrait", client: "Henson", year: "2018", filename: "Editorial_2018_henson_micaiah-carter_28.jpg", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop", imageAlt: "Henson portrait by Micaiah Carter", photographer: "Micaiah Carter" },
      { id: "e9", title: "Schön Magazine I", client: "Salem Mitchell", year: "2021", filename: "Editorial_2021_salem-mitchell_schon-magazine_29.jpg", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop", imageAlt: "Salem Mitchell Schön Magazine editorial", publication: "Schön Magazine" },
      { id: "e10", title: "Schön Magazine II", client: "Salem Mitchell", year: "2021", filename: "Editorial_2021_salem-mitchell_schon-magazine_30.jpg", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "Salem Mitchell Schön Magazine editorial II", publication: "Schön Magazine" },
      { id: "e11", title: "Rollacoaster Magazine I", client: "Alyah Chanelle Scott", year: "2021", filename: "Editorial_2021_alyah-chanelle-scott_rollacoaster_31.jpg", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Alyah Chanelle Scott Rollacoaster Magazine", publication: "Rollacoaster Magazine" },
      { id: "e12", title: "Rollacoaster Magazine II", client: "Alyah Chanelle Scott", year: "2021", filename: "Editorial_2021_alyah-chanelle-scott_rollacoaster_32.jpg", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Alyah Chanelle Scott Rollacoaster Magazine II", publication: "Rollacoaster Magazine" },
      { id: "e13", title: "PhotoBook Magazine", client: "Alisha Wainwright", year: "2022", filename: "Editorial_2022_alisha-wainwright_photobook_33.jpg", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Alisha Wainwright PhotoBook Magazine editorial", publication: "PhotoBook Magazine", link: "https://www.photobookmagazine.com/features/alisha-wainwright" },
      { id: "e14", title: "Aurora Rising I", client: "Aurora James", year: "2021", filename: "Editorial_2021_aurora-james_grazia-usa_34.jpg", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James Grazia USA editorial", publication: "Grazia USA", link: "https://graziamagazine.com/us/articles/aurora-rising-aurora-james/" },
      { id: "e15", title: "Aurora Rising II", client: "Aurora James", year: "2021", filename: "Editorial_2021_aurora-james_grazia-usa_35.jpg", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James Grazia USA editorial II", publication: "Grazia USA", link: "https://graziamagazine.com/us/articles/aurora-rising-aurora-james/" },
      { id: "e16", title: "Emmy Magazine", client: "Kylie Bunbury", year: "2021", filename: "Editorial_2021_kylie-bunbury_emmy-magazine_36.jpg", imageUrl: "https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?q=80&w=1000&auto=format&fit=crop", imageAlt: "Kylie Bunbury Emmy Magazine editorial", publication: "Emmy Magazine" },
      { id: "e17", title: "ContentsBeauté", client: "Hailey Kilgore", year: "2021", filename: "Editorial_2021_hailey-kilgore_contents-beauty_37.jpg", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop", imageAlt: "Hailey Kilgore ContentsBeauté cover", publication: "ContentsBeauté" },
      { id: "e18", title: "Variety", client: "Gugu Mbatha-Raw", year: "2021", filename: "Editorial_2021_gugu-mbatha-raw_variety_38.jpg", imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop", imageAlt: "Gugu Mbatha-Raw Variety editorial", publication: "Variety" },
      { id: "e19", title: "ELLE UK", client: "Elaine Welteroth", year: "2019", filename: "Editorial_2019_elaine-welteroth_elle-uk_39.jpg", imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1000&auto=format&fit=crop", imageAlt: "Elaine Welteroth ELLE UK editorial", publication: "ELLE UK" },
      { id: "e20", title: "L'Officiel Malaysia", client: "Najiyah Imani & Marie", year: "2018", filename: "Editorial_2018_twins_lofficiel-malaysia_40.jpg", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Najiyah Imani and Marie L'Officiel Malaysia editorial", publication: "L'Officiel Malaysia" },
    ]
  },
  {
    id: "2",
    slug: "red-carpet",
    title: "Red Carpet",
    description: "High-stakes glamour crafted for cinema's biggest stages, award shows, and international galas.",
    coverImage: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "rc1", title: "Red Carpet I", client: "Ebony Obsidian", year: "2022", filename: "Redcarpet_2022_ebony-obsidian_red-carpet_01.jpg", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=1000&auto=format&fit=crop", imageAlt: "Ebony Obsidian red carpet 2022" },
      { id: "rc2", title: "Red Carpet II", client: "Ebony Obsidian", year: "2022", filename: "Redcarpet_2022_ebony-obsidian_red-carpet_02.jpg", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop", imageAlt: "Ebony Obsidian red carpet 2022 II" },
      { id: "rc3", title: "NAACP Image Awards", client: "Saniyya Sidney", year: "2022", filename: "Redcarpet_2022_saniyya-sidney_naacp-awards_03.jpg", imageUrl: "https://images.unsplash.com/photo-1524502397800-2eeaead7c3fe?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney NAACP Image Awards 2022" },
      { id: "rc4", title: "Red Carpet", client: "Aurora James & Elaine Welteroth", year: "2018", filename: "Redcarpet_unknown_aurora-james-elaine-welteroth_red-carpet_04.jpg", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James and Elaine Welteroth red carpet 2018" },
      { id: "rc5", title: "Project Runway", client: "Elaine Welteroth", year: "2021", filename: "Redcarpet_2021_elaine-welteroth_project-runway_05.jpg", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", imageAlt: "Elaine Welteroth Project Runway 2021" },
      { id: "rc6", title: "Met Gala", client: "Aurora James", year: "2019", filename: "Redcarpet_2019_aurora-james_met-gala_06.jpg", imageUrl: "https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James Met Gala 2019" },
      { id: "rc7", title: "Vanity Fair", client: "Aurora James", year: "2023", filename: "Redcarpet_2023_aurora-james_vanity-fair_07.jpg", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Aurora James Vanity Fair 2023", publication: "Vanity Fair" },
      { id: "rc8", title: "Deadline Contenders", client: "Liesl Tommy", year: "2021", filename: "Redcarpet_2021_liesl-tommy_deadline-contenders_08.jpg", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop", imageAlt: "Liesl Tommy Deadline Contenders 2021" },
      { id: "rc9", title: "HCA Awards", client: "Saniyya Sidney", year: "2022", filename: "Redcarpet_2022_saniyya-sidney_hca-awards_09.jpg", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Saniyya Sidney HCA Awards 2022" },
      { id: "rc10", title: "Red Carpet", client: "Chloe Coleman", year: "2019", filename: "Redcarpet_unknown_chloe-coleman_red-carpet_10.jpg", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Chloe Coleman red carpet 2019" },
      { id: "rc11", title: "Kindred Premiere", client: "Mallori Johnson", year: "2022", filename: "Redcarpet_2022_mallori-johnson_kindred-premiere_11.jpg", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Mallori Johnson Kindred Premiere 2022" },
      { id: "rc12", title: "The White Lotus SAG Panel", client: "Brittany O'Grady", year: "2021", filename: "Redcarpet_2021_brittany-ogrady_sag-panel_12.jpg", imageUrl: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=1000&auto=format&fit=crop", imageAlt: "Brittany O'Grady The White Lotus SAG Panel 2021" },
      { id: "rc13", title: "BET Awards", client: "Rihanna", year: "2019", filename: "Redcarpet_2019_rihanna_bet-awards_13.jpg", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop", imageAlt: "Rihanna BET Awards 2019" },
      { id: "rc14", title: "ACE Awards", client: "Lupita Nyong'o", year: "2018", filename: "Redcarpet_2018_lupita-nyongo_ace-awards_14.jpg", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lupita Nyong'o ACE Awards 2018" },
      { id: "rc15", title: "Press Event", client: "Meena Harris", year: "2022", filename: "Redcarpet_2022_meena-harris_press_15.jpg", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Meena Harris press event 2022" },
      { id: "rc16", title: "City of Hope Gala", client: "Billy Porter", year: "2022", filename: "Redcarpet_2022_billy-porter_city-of-hope_16.jpg", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Billy Porter City of Hope Gala 2022" },
      { id: "rc17", title: "Spirit Day", client: "Billy Porter", year: "2022", filename: "Redcarpet_2022_billy-porter_spirit-day_17.jpg", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Billy Porter Spirit Day 2022" },
      { id: "rc18", title: "The Daily Show", client: "Lizzo", year: "2019", filename: "Redcarpet_unknown_lizzo_the-daily-show_18.jpg", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lizzo The Daily Show 2019" },
    ]
  },
  {
    id: "3",
    slug: "beauty",
    title: "Beauty",
    description: "Detail-obsessed close-up work that honors texture, radiance, and the artistry of natural hair.",
    coverImage: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "b1", title: "Studio Portrait I", client: "Carmen Solomons", year: "2021", filename: "Beauty_2021_carmen-solomons_studio_11.jpg", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Carmen Solomons studio portrait I" },
      { id: "b2", title: "Studio Portrait II", client: "Carmen Solomons", year: "2021", filename: "Beauty_2021_carmen-solomons_studio_12.jpg", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Carmen Solomons studio portrait II" },
      { id: "b3", title: "Gunpowder Milkshake", client: "Chloe Coleman", year: "2021", filename: "Beauty_2021_chloe-coleman_gunpowder-milkshake_13.jpg", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "Chloe Coleman Gunpowder Milkshake beauty" },
      { id: "b4", title: "ACE Awards", client: "Lupita Nyong'o", year: "2018", filename: "Beauty_2018_lupita-nyongo_ace-awards_14.JPG", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lupita Nyong'o ACE Awards beauty 2018" },
      { id: "b5", title: "Crop Over", client: "Rihanna", year: "2019", filename: "Beauty_Rihanna_crop-over_15.JPG", imageUrl: "https://images.unsplash.com/photo-1515347619362-75fe3f0e08f2?q=80&w=1000&auto=format&fit=crop", imageAlt: "Rihanna Crop Over beauty" },
      { id: "b6", title: "Underground Railroad", client: "Thuso Mbedu", year: "2021", filename: "Beauty_2021_thuso-mbedu_underground-railroad_16.JPG", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Thuso Mbedu Underground Railroad beauty" },
      { id: "b7", title: "Tastemaker Session 2", client: "Liesl Tommy", year: "2017", filename: "Beauty_2021_liesl-tommy_crafted_17.jpg", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop", imageAlt: "Liesl Tommy Crafted Tastemaker Session 2", publication: "Crafted" },
      { id: "b8", title: "Savage X Fenty", client: "Rihanna", year: "2019", filename: "Beauty_2019_rihanna_savage-fenty_18.jpg", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop", imageAlt: "Rihanna Savage X Fenty beauty 2019" },
      { id: "b9", title: "Paper Magazine", client: "Lizzo", year: "2018", filename: "Beauty_2018_lizzo_paper-magazine_19.jpg", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lizzo Paper Magazine beauty 2018", publication: "Paper Magazine" },
      { id: "b10", title: "Harper's Bazaar I", client: "Duckie Thot", year: "2018", filename: "Beauty_2018_duckie-thot_harpers-bazaar_20.jpg", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Duckie Thot Harper's Bazaar beauty I", publication: "Harper's Bazaar" },
      { id: "b11", title: "Harper's Bazaar II", client: "Duckie Thot", year: "2018", filename: "Beauty_2018_duckie-thot_harpers-bazaar_21.jpg", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Duckie Thot Harper's Bazaar beauty II", publication: "Harper's Bazaar" },
      { id: "b12", title: "Harper's Bazaar III", client: "Duckie Thot", year: "2018", filename: "Beauty_2018_duckie-thot_harpers-bazaar_22.jpg", imageUrl: "https://images.unsplash.com/photo-1516053641324-4f05ba7b55f1?q=80&w=1000&auto=format&fit=crop", imageAlt: "Duckie Thot Harper's Bazaar beauty III", publication: "Harper's Bazaar" },
      { id: "b13", title: "Harper's Bazaar IV", client: "Duckie Thot", year: "2018", filename: "Beauty_2018_duckie-thot_harpers-bazaar_23.jpg", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop", imageAlt: "Duckie Thot Harper's Bazaar beauty IV", publication: "Harper's Bazaar" },
    ]
  },
  {
    id: "4",
    slug: "commercial-ecom",
    title: "Commercial / ECOM",
    description: "Brand campaigns and e-commerce productions for global names — polished, strategic, and campaign-ready.",
    coverImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    projects: [
      { id: "com1", title: "Christian Cowan x Le Specs", client: "Veronika Vilim", year: "2020", filename: "Ecom_2020_veronika-vilim_le-specs_01.jpg", imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop", imageAlt: "Veronika Vilim Christian Cowan x Le Specs", link: "https://lespecs.com/blogs/le-specs/christian-cowan-x-le-specs-1" },
      { id: "com2", title: "Savage X Fenty Campaign", client: "Tabria Majors", year: "2019", filename: "Ecom_2019_tabria-majors_savage-x-fenty_02.jpg", imageUrl: "https://images.unsplash.com/photo-1512413914439-011853f0cc57?q=80&w=1000&auto=format&fit=crop", imageAlt: "Tabria Majors Savage X Fenty campaign 2019" },
      { id: "com3", title: "Savage X Fenty Group Campaign", client: "Nina Marie Daniele & Models", year: "2019", filename: "Ecom_2019_nina-marie-daniele-and-models_savage-x-fenty_03.jpg", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=1000&auto=format&fit=crop", imageAlt: "Nina Marie Daniele and models Savage X Fenty 2019" },
      { id: "com4", title: "Savage X Fenty Campaign", client: "Nina Marie Daniele", year: "2019", filename: "Ecom_2019_nina-marie-daniele_savage-x-fenty_04.jpg", imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edaa3b?q=80&w=1000&auto=format&fit=crop", imageAlt: "Nina Marie Daniele Savage X Fenty 2019" },
      { id: "com5", title: "Brother Vellies Campaign I", client: "Mical Bockru", year: "2018", filename: "Ecom_unknown_mical-bockru_brother-vellies_05.jpg", imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Mical Bockru Brother Vellies campaign I" },
      { id: "com6", title: "Brother Vellies Campaign II", client: "Mical Bockru", year: "2018", filename: "Ecom_unknown_mical-bockru_brother-vellies_06.jpg", imageUrl: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop", imageAlt: "Mical Bockru Brother Vellies campaign II" },
      { id: "com7", title: "Brother Vellies Campaign", client: "Ebony Riley & Mical Bockru", year: "2018", filename: "Ecom_unknown_ebony-riley-mical-bockru_brother-vellies_07.jpg", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop", imageAlt: "Ebony Riley and Mical Bockru Brother Vellies" },
      { id: "com8", title: "Christian Cowan", client: "Lisa Rinna", year: "2020", filename: "Ecom_2020_lisa-rinna_christian-cowan_10.jpg", imageUrl: "https://images.unsplash.com/photo-1526413232644-8a407dd5d2f0?q=80&w=1000&auto=format&fit=crop", imageAlt: "Lisa Rinna Christian Cowan 2020" },
    ]
  }
];

export const FEATURED_CLIENTS = [
  "Rihanna", "Lizzo", "Lupita Nyong'o", "Aurora James", "Billy Porter",
  "Duckie Thot", "Gugu Mbatha-Raw", "Saniyya Sidney", "Mallori Johnson",
  "Elaine Welteroth", "Kylie Bunbury", "Gottmik", "Alisha Wainwright",
  "Savage X Fenty", "Brother Vellies", "Christian Cowan", "Le Specs",
  "Harper's Bazaar", "Vanity Fair", "Glamour", "ELLE UK", "Grazia USA",
  "Variety", "Coveteur", "Emmy Magazine", "PhotoBook Magazine",
  "Schön Magazine", "Rollacoaster", "L'Officiel Malaysia", "Refinery29"
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

export type GalleryCategoryName = string;

export type GallerySubcategoryName = string;

export type GalleryImageAsset = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type GalleryPiece = {
  id: string;
  title: string;
  category: GalleryCategoryName;
  subcategory: GallerySubcategoryName;
  material: string;
  note: string;
  archiveCount: number;
  featured?: boolean;
  rank?: number;
  image: GalleryImageAsset;
  images: GalleryImageAsset[];
};

export type GallerySubcategory = {
  name: GallerySubcategoryName;
  pieces: GalleryPiece[];
};

export type GalleryCategory = {
  name: GalleryCategoryName;
  eyebrow: string;
  description: string;
  subcategories: GallerySubcategory[];
};

export type GalleryCategoryDefinition = {
  name: GalleryCategoryName;
  eyebrow: string;
  description: string;
  subcategories: GallerySubcategoryName[];
  rank?: number;
};

export type GalleryContent = {
  previewEyebrow: string;
  previewHeading: string;
  previewDescription: string;
  pageEyebrow: string;
  pageHeading: string;
  pageDescription: string;
  categories: GalleryCategoryDefinition[];
  pieces: GalleryPiece[];
};

const categoryDefinitions: GalleryCategoryDefinition[] = [
  {
    name: 'Living Room',
    eyebrow: 'Gallery I',
    description:
      'Gathering pieces shaped around conversation, texture, and the slower rhythm of lived-in rooms.',
    subcategories: ['Shelves', 'Tables', 'TV Unit', 'Chairs', 'Sofa', 'Wall Artwork'],
  },
  {
    name: 'Dining Room',
    eyebrow: 'Gallery II',
    description:
      'Tables, storage, and lighting composed for hosting, ceremony, and the quiet architecture of meals.',
    subcategories: ['Shelves', 'Tables', 'Benches', 'Chairs', 'Buffet'],
  },
  {
    name: 'Outdoor Seating',
    eyebrow: 'Gallery III',
    description:
      'Open-air pieces documented through benches, lounge seating, lighting, planters, and relaxed exterior gatherings.',
    subcategories: ['Chairs', 'Tables', 'Sofa'],
  },
  {
    name: 'Restroom',
    eyebrow: 'Gallery IV',
    description:
      'Compact interventions where material choice, silhouette, and restraint do most of the visual work.',
    subcategories: ['Holders', 'Countertop'],
  },
  {
    name: 'Bedroom',
    eyebrow: 'Gallery V',
    description:
      'Private-room pieces arranged around storage, tactility, and a sense of calm that lasts beyond trends.',
    subcategories: ['Wardrobe', 'Commode', 'Beds', 'Dressing Table', 'Chairs', 'Hanger'],
  },
   {
     name: 'Home Accessories',
     eyebrow: 'Gallery VI',
     description:
       'Smaller objects and accents where craft, detail, and material expression take priority over scale.',
     subcategories: ['Coasters', 'Lights', 'Mirrors'],
   },
];

const subcategoryNotes: Record<string, string> = {
  Lights: 'Lighting documented as atmosphere first, object second.',
  Shelves: 'Storage and display pieces treated as part of the room architecture.',
  Tables: 'Surfaces built to let grain, proportion, and edge do the storytelling.',
  'TV Unit': 'Media storage approached with the restraint of built-in joinery.',
  Chairs: 'Seating shaped as sculptural presence as much as utility.',
  Sofa: 'Lounge pieces with handcrafted structure and a softer room rhythm.',
  'Wall Artwork': 'Architectural gestures and decorative interventions documented as spatial pieces.',
  Mirrors: 'Reflective forms framed to feel tactile, grounded, and room-specific.',
  Benches: 'Bench forms composed with the same material honesty as the tables around them.',
  Buffet: 'Storage pieces made for serving, staging, and quiet sculptural presence.',
  Holders: 'Small accessories elevated through timber selection and hand finish.',
  Countertop: 'Vanity surfaces where the live edge remains the focal gesture.',
  Wardrobe: 'Full-height storage treated as architecture rather than mere cabinetry.',
  Commode: 'Companion storage pieces made to bring warmth beside the bed.',
  Beds: 'Bed frames built around presence, tactile comfort, and grounded proportion.',
  'Dressing Table': 'Private rituals supported by pieces that balance utility and lightness.',
  Hanger: 'Everyday hanging storage reworked with the character of solid timber.',
  Coasters: 'Small tabletop objects shaped to bring tactility and calm to intimate details.',
};

const galleryFolderFiles: Record<string, string[]> = {
  "Closet/contar oak wood wardrope": [
    "IMG-20240404-WA0043.jpg",
    "IMG-20240405-WA0068.jpg",
    "WhatsApp Image 2024-04-04 at 23.54.31_efdb1190.jpg",
  ],
  "Closet/contar oak wood waredrope and dresser": [
    "IMG-20240404-WA0044.jpg",
    "IMG-20240405-WA0059.jpg",
    "IMG-20240405-WA0078.jpg",
    "IMG-20240405-WA0079.jpg",
    "IMG_20220818_172921.jpg",
    "IMG_20220818_172925.jpg",
    "WhatsApp Image 2024-04-04 at 23.54.33_db9939e3.jpg",
  ],
  "Closet/dressing from contar oak wood": [
    "IMG_20220726_190904.jpg",
    "IMG_20220726_190911.jpg",
  ],
  "Closet/hanging ladder from tree trunks": [
    "0D2A6316.jpg",
    "0D2A6318.jpg",
    "0D2A6322.jpg",
    "1.jpg",
    "IMG_0101.jpg",
    "IMG_0136 (1).jpg",
    "IMG_0136.jpg",
  ],
  "Closet/oak contar wood waredrope": [
    "0D2A0057.jpg",
    "0D2A0066.jpg",
    "0D2A0084.jpg",
    "0D2A0090.jpg",
    "0D2A0125.jpg",
  ],
  "Closet/pine wood hanger": [
    "0D2A6133.jpg",
    "0D2A6144.jpg",
    "0D2A6154.jpg",
    "0D2A6166.jpg",
    "0D2A6210.jpg",
    "0D2A6212.jpg",
  ],
  "Closet/waredrope from massive oak wood": [
    "0D2A5739.jpg",
    "0D2A5815.jpg",
    "0D2A5818.jpg",
    "0D2A5836.jpg",
    "0D2A5842.jpg",
  ],
  "Closet/white wardrope with canee": [
    "IMG-20240405-WA0060.jpg",
    "IMG-20240405-WA0061.jpg",
    "IMG-20240405-WA0063.jpg",
    "IMG-20240405-WA0074.jpg",
    "IMG-20240405-WA0075.jpg",
    "IMG-20240405-WA0084.jpg",
  ],
  "Desk/beech wood desk with metal legs": [
    "544A0216.jpg",
    "544A0226.jpg",
    "544A0228.jpg",
  ],
  "Desk/massive acacia tree wood desk": [
    "0D2A0053.jpg",
    "0D2A0055.jpg",
    "0D2A0057.jpg",
    "0D2A0063.jpg",
    "0D2A0064.jpg",
    "0D2A0065.jpg",
    "0D2A0067.jpg",
    "1661174386982.jpg",
  ],
  "beds/canee bed from contar oak wood": [
    "IMG-20240405-WA0076.jpg",
    "IMG-20240405-WA0077.jpg",
  ],
  "beds/canee with massive pitch pine wood bed": [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "AE1A4443.jpg",
    "IMG_0143.jpg",
    "IMG_0144.jpg",
    "IMG_0148.jpg",
    "IMG_0152-2.jpg",
  ],
  "beds/massive Oak wood": [
    "0D2A5741.jpg",
    "0D2A5785.jpg",
    "0D2A5806.jpg",
    "0D2A5809.jpg",
    "0D2A5815.jpg",
  ],
  "beds/massive beech wood bed with bleached white color": [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
  ],
  "beds/massive pine wood bed": [
    "0D2A6246.jpg",
    "0D2A6248.jpg",
    "0D2A6249.jpg",
    "0D2A6255.jpg",
    "0D2A6258.jpg",
    "0D2A6264.jpg",
    "0D2A6279.jpg",
    "0D2A6280.jpg",
    "0D2A6289.jpg",
  ],
  "beds/massive pitch pine wood bed with bamboo": [
    "0D2A6124.jpg",
    "0D2A6127.jpg",
    "0D2A6167.jpg",
    "0D2A6169.jpg",
    "0D2A6172.jpg",
    "1.jpg",
    "3.jpg",
    "6.jpg",
  ],
  "chairs/DIABLO side chair from tree stump made from sisso wood whole tree": [
    "1-.jpg",
    "10-.jpg",
    "14-.jpg",
    "16-.jpg",
    "8-.jpg",
  ],
  "chairs/bench from acacia wood with metal legs": [
    "0D2A5878.jpg",
    "0D2A5882.jpg",
    "0D2A5903.jpg",
    "0D2A5919.jpg",
    "0D2A5927.jpg",
  ],
  "chairs/bench from massive beech tree wood slap": [
    "3-.jpg",
    "6U6A9947.jpg",
    "6U6A9962.jpg",
    "7-.jpg",
    "IMG_0001-copy-2.jpg",
    "IMG_0007.jpg",
    "IMG_0019.jpg",
    "IMG_0026.jpg",
  ],
  "chairs/bench from massive cherry wood with metal legs": [
    "IMG_0019.jpg",
    "IMG_0027-copy.jpg",
    "IMG_0027.jpg",
    "IMG_0052.jpg",
  ],
  "chairs/bench from olive tree wood": [
    "IMG_20210801_223134.jpg",
    "IMG_20210801_223138.jpg",
  ],
  "chairs/black tree trunk with live edge from sisso wood": [
    "1661174387734.jpg",
    "1661174387894.jpg",
    "1661174388317.jpg",
    "1661174388429.jpg",
    "1661174388800.jpg",
    "1661174388842.jpg",
    "1661174495762.jpg",
    "1661174495908.jpg",
    "1661174496124.jpg",
    "1661174861764.jpg",
    "FB_IMG_1662390480574.jpg",
  ],
  "chairs/bomba chair with flank old wood": [
    "0D2A5571.jpg",
    "0D2A5572.jpg",
    "0D2A5577.jpg",
  ],
  "chairs/corner chair shoe rack with shelves": [
    "0D2A0109.jpg",
    "0D2A0111.jpg",
    "0D2A0122.jpg",
    "0D2A0125.jpg",
  ],
  "chairs/curved tree stamp from sisso wood": [
    "1661174387383.jpg",
    "1661174387894.jpg",
    "1661174388317.jpg",
    "1661174388429.jpg",
    "1661174388674.jpg",
    "1661174495438.jpg",
    "1661174495762.jpg",
    "1661174861729.jpg",
  ],
  "chairs/massive beech wood bench with tree trunk in bleached white color": [
    "1661174387179.jpg",
    "1661174387295.jpg",
    "1661174387774.jpg",
    "1661174387855.jpg",
    "1661174388241.jpg",
    "1661174388355.jpg",
    "1661174388883.jpg",
    "1661174389089.jpg",
    "1661174389129.jpg",
    "1661174495366.jpg",
    "1661174495870.jpg",
    "1661174861624.jpg",
  ],
  "chairs/massive beech wood chair": [
    "0D2A0110.jpg",
    "0D2A5910.jpg",
    "0D2A5911.jpg",
    "0D2A5915.jpg",
    "IMG_0003_2.jpg",
    "IMG_0008.jpg",
    "IMG_0010.jpg",
  ],
  "chairs/massive beech wood with tree trunk chair in bleached white": [
    "1661174388086.jpg",
    "1661174388203.jpg",
    "1661174388355.jpg",
    "1661174496089.jpg",
    "1661174496198.jpg",
    "1661174861590.jpg",
  ],
  "chairs/massive berry wood tree side chair": [
    "0D2A1168.jpg",
    "0D2A1174.jpg",
    "0D2A1189.jpg",
    "0D2A1194.jpg",
  ],
  "chairs/mini sofa with old flank wood": [
    "0D2A5592.jpg",
    "0D2A5596.jpg",
    "0D2A5600.jpg",
  ],
  "chairs/olive wood side chair": [
    "0D2A1138.jpg",
    "0D2A1231.jpg",
    "0D2A1235.jpg",
  ],
  "chairs/rocking chair from beech wood": [
    "0D2A5580.jpg",
    "0D2A5591.jpg",
  ],
  "chairs/sofa from old flank wood": [
    "0D2A5509.jpg",
    "0D2A5515.jpg",
    "0D2A5517.jpg",
    "0D2A5518.jpg",
    "0D2A5656.jpg",
  ],
  "chairs/sofa from pine and beech wood from connected separated parts": [
    "0D2A6051.jpg",
    "0D2A6081.jpg",
    "0D2A6099.jpg",
    "0D2A6117.jpg",
    "0D2A6121.jpg",
    "0D2A6393.jpg",
    "0D2A6458.jpg",
    "0D2A6469.jpg",
  ],
  "chairs/stool from train rail old flank wood": [
    "0D2A5895.jpg",
    "0D2A5897.jpg",
    "0D2A5898.jpg",
    "0D2A5900.jpg",
    "0D2A5903.jpg",
    "0D2A5953.jpg",
    "0D2A5956.jpg",
  ],
  "chairs/tree wood curved chair": [
    "0D2A1131.jpg",
    "0D2A1207.jpg",
    "0D2A1220-Recovered.jpg",
    "0D2A1222.jpg",
  ],
  "coffee tables/acacia leaving table": [
    "IMG_20220422_145647.jpg",
  ],
  "coffee tables/coffee table from massive beech wood tree slaps": [
    "1 .jpg",
    "2 .jpg",
    "3 .jpg",
    "4 .jpg",
    "5 .jpg",
    "544A0055.jpg",
    "6 .jpg",
    "7 .jpg",
  ],
  "coffee tables/contar oak leaving table": [
    "0D2A0341.jpg",
    "0D2A0342.jpg",
    "0D2A0343.jpg",
    "0D2A0351.jpg",
    "0D2A0355.jpg",
    "IMG-20240404-WA0045.jpg",
    "IMG-20240405-WA0080.jpg",
    "IMG-20240405-WA0081.jpg",
    "IMG-20240405-WA0082.jpg",
    "IMG-20240405-WA0083.jpg",
    "WhatsApp Image 2024-04-04 at 23.54.33_0fe96861.jpg",
  ],
  "coffee tables/kaya tree trunk side table": [
    "544A0206.jpg",
    "544A0231.jpg",
  ],
  "coffee tables/leaving table made of glass top and flank wood from old train rail wood": [
    "0D2A6041.jpg",
    "0D2A6044.jpg",
    "0D2A6051.jpg",
    "0D2A6081.jpg",
    "0D2A6099.jpg",
    "0D2A6111.jpg",
    "0D2A6384.jpg",
    "0D2A6389.jpg",
    "0D2A6393.jpg",
    "0D2A6403.jpg",
    "0D2A6405.jpg",
    "0D2A6458.jpg",
    "0D2A6469.jpg",
  ],
  "coffee tables/massive beech wood from tree slaps leaving table": [
    "1661174387970.jpg",
    "1661174388715.jpg",
    "1661174495727.jpg",
    "1661174495834.jpg",
    "1661174495980.jpg",
  ],
  "coffee tables/oak wood with resin side table": [
    "IMG_0022.jpg",
    "IMG_0027.jpg",
    "IMG_0028.jpg",
    "IMG_0082.jpg",
  ],
  "coffee tables/olive wood leaving table": [
    "0D2A5509.jpg",
    "0D2A5515.jpg",
    "0D2A5517.jpg",
    "0D2A5550.jpg",
    "0D2A5554.jpg",
    "0D2A5558.jpg",
    "0D2A5565.jpg",
  ],
  "coffee tables/olive wood with resin coffee table": [
    "0D2A1120.jpg",
    "0D2A1127.jpg",
    "0D2A1128.jpg",
    "0D2A1133.jpg",
    "0D2A1137.jpg",
    "0D2A1220-Recovered.jpg",
    "0D2A1222.jpg",
    "0D2A1224.jpg",
    "0D2A1225.jpg",
  ],
  "coffee tables/pitch pine wood in black color side table": [
    "1661174387257.jpg",
    "1661174387932.jpg",
    "1661174388317.jpg",
    "1661174388429.jpg",
    "1661174388674.jpg",
    "1661174388842.jpg",
    "1661174388924.jpg",
    "1661174495329.jpg",
    "1661174495943.jpg",
    "1661174861694.jpg",
    "FB_IMG_1662390480574.jpg",
  ],
  "coffee tables/side table from massive berry wood": [
    "1 .jpg",
    "10 .jpg",
    "11 .jpg",
    "2 .jpg",
    "3 .jpg",
    "4 .jpg",
    "5 .jpg",
    "6 .jpg",
    "7 .jpg",
    "8 .jpg",
    "9 .jpg",
  ],
  "coffee tables/side table from pine wood": [
    "0D2A6246.jpg",
    "0D2A6279.jpg",
    "0D2A6280.jpg",
    "0D2A6291.jpg",
  ],
  "coffee tables/side table from train rail flank wood": [
    "0D2A5937.jpg",
    "0D2A5939.jpg",
    "0D2A5940.jpg",
    "0D2A5941.jpg",
    "0D2A5942.jpg",
    "0D2A5945.jpg",
    "0D2A5949.jpg",
    "0D2A5953.jpg",
  ],
  "coffee tables/walnut wood with resin side table": [
    "IMG_0024.jpg",
    "IMG_0027.jpg",
    "IMG_0028.jpg",
    "IMG_0079.jpg",
    "IMG_0081.jpg",
  ],
  "comodes/2 drawer comodes from pine wood": [
    "3.jpg",
    "IMG_0123.jpg",
  ],
  "comodes/canee with contar oak wood comode": [
    "0D2A6172.jpg",
    "0D2A6174.jpg",
    "0D2A6215.jpg",
    "0D2A6216.jpg",
    "0D2A6219.jpg",
    "0D2A6225.jpg",
  ],
  "comodes/canee with massive pine wood comode": [
    "IMG_0007.jpg",
    "IMG_0144.jpg",
    "IMG_0148.jpg",
    "IMG_0152-2.jpg",
    "IMG_0152-2ss.jpg",
  ],
  "comodes/comode from old train rail flank wood": [
    "0D2A5911.jpg",
    "0D2A5912.jpg",
    "0D2A5914.jpg",
    "0D2A5915.jpg",
    "0D2A5917.jpg",
    "0D2A5918.jpg",
    "0D2A5920.jpg",
    "0D2A5921.jpg",
  ],
  "comodes/drawer comode from contar oak wood": [
    "IMG-20240405-WA0072.jpg",
    "IMG-20240405-WA0073.jpg",
  ],
  "comodes/massive beech wood comode with 1 drawer in bleached white color comode": [
    "1.jpg",
    "3.jpg",
  ],
  "consoles/bar from massive beech tree wood": [
    "6U6A0001.jpg",
    "6U6A0006.jpg",
    "6U6A0013.jpg",
    "6U6A0021.jpg",
  ],
  "consoles/bauffet from olive wood and black resin": [
    "IMG_20210801_223148.jpg",
  ],
  "consoles/console from massive beech tree wood with rough edges": [
    "1 .jpg",
    "10 .jpg",
    "11 .jpg",
    "12 .jpg",
    "2 .jpg",
    "3 .jpg",
    "4 .jpg",
    "5 .jpg",
    "6 .jpg",
    "7 .jpg",
    "8 .jpg",
    "9 .jpg",
  ],
  "consoles/console from old train rail flank wood": [
    "0D2A6308.jpg",
  ],
  "consoles/console with tree trunks and flying shelves": [
    "1733073772179.jpg",
    "1733073772228.jpg",
    "1733073772281.jpg",
    "1733073772329.jpg",
    "1733073772381.jpg",
    "1733073772434.jpg",
    "1733073772487.jpg",
    "1733073772540.jpg",
    "1733073772597.jpg",
    "1733073772660.jpg",
    "1733073772713.jpg",
    "1733073772763.jpg",
    "1733073772841.jpg",
    "1733073772905.jpg",
  ],
  "consoles/oval shape console from beech wood and canee": [
    "1733073774198.jpg",
    "1733073774243.jpg",
  ],
  "countar tops/acacia countar top sink": [
    "0D2A0153.jpg",
    "0D2A0160.jpg",
    "0D2A0166.jpg",
    "0D2A0172.jpg",
    "0D2A0174.jpg",
    "0D2A0182.jpg",
    "0D2A5850.jpg",
    "0D2A5858.jpg",
    "1733073773266.jpg",
    "1733073773312.jpg",
    "1733073773366.jpg",
    "1733073773416.jpg",
    "1733073773464.jpg",
    "1733073773512.jpg",
    "1733073773558.jpg",
    "1733073773604.jpg",
    "1733073773654.jpg",
    "1733073773700.jpg",
    "1733073773746.jpg",
    "1733073773791.jpg",
    "1733073773836.jpg",
    "1733073773882.jpg",
  ],
  "countar tops/contar oak wood for sink": [
    "0D2A0189.jpg",
  ],
  "countar tops/sisso wood counter top": [
    "1733073773926.jpg",
    "1733073773973.jpg",
    "1733073774019.jpg",
    "1733073774064.jpg",
    "1733073774109.jpg",
    "1733073774152.jpg",
  ],
  "dining tables/acacia wood dining table with metal legs": [
    "0D2A5873.jpg",
    "0D2A5878.jpg",
    "0D2A5882.jpg",
    "0D2A5901.jpg",
    "0D2A5903.jpg",
    "0D2A5919.jpg",
    "0D2A5927.jpg",
    "0D2A5950.jpg",
    "0D2A5981.jpg",
    "0D2A5996.jpg",
    "0D2A5999.jpg",
    "0D2A6010.jpg",
    "IMG_0001_1.jpg",
    "IMG_0002_2.jpg",
    "IMG_0008.jpg",
  ],
  "dining tables/dining table from olive wood and black resin": [
    "IMG_20210801_223134.jpg",
  ],
  "dining tables/massive cherry tree wood with glass in the middle": [
    "IMG_0001_1.jpg",
    "IMG_0009.jpg",
    "IMG_0019.jpg",
    "IMG_0027-copy.jpg",
    "IMG_0027.jpg",
    "IMG_0052.jpg",
    "IMG_0056.jpg",
    "IMG_0058.jpg",
    "IMG_0059.jpg",
    "IMG_0066.jpg",
  ],
  "dining tables/massive dinning table from beech tree wood with live tree edges": [
    "105-.jpg",
    "29-.jpg",
    "3-.jpg",
    "6U6A9947.jpg",
    "6U6A9962.jpg",
    "7-.jpg",
    "IMG_0001-copy-2.jpg",
    "IMG_0003-copy.jpg",
    "IMG_0007.jpg",
    "IMG_0026.jpg",
  ],
  "dining tables/sisso wood dining table": [
    "6U6A0319.jpg",
    "6U6A0325.jpg",
    "6U6A0327.jpg",
    "6U6A0333.jpg",
  ],
  "doors/flank wood door": [
    "0D2A5662.jpg",
    "0D2A5664.jpg",
  ],
  "doors/hidden door from pine wood": [
    "0D2A5640.jpg",
    "0D2A5643.jpg",
    "0D2A5648.jpg",
  ],
  "dresser/contar oak flying dresser": [
    "IMG-20240405-WA0070.jpg",
    "IMG-20240405-WA0084.jpg",
  ],
  "dresser/dresser from canee and contar oak wood": [
    "0D2A6233.jpg",
    "0D2A6237.jpg",
    "0D2A6241.jpg",
  ],
  "dresser/dresser from contar oak wood and canee": [
    "2.jpg",
    "4.jpg",
    "5.jpg",
    "IMG_0014.jpg",
  ],
  "dresser/dresser from oak wood with special design": [
    "IMG_20220726_185124.jpg",
  ],
  "dresser/oak contar wood dresser": [
    "0D2A0066.jpg",
    "0D2A0084.jpg",
    "0D2A0091.jpg",
    "0D2A0135.jpg",
  ],
  "entry pictures": [
    "FB_IMG_1660169241995.jpg",
    "FB_IMG_1660169263115.jpg",
    "FB_IMG_1660169269466.jpg",
    "FB_IMG_1660169294766.jpg",
    "FB_IMG_1662390464444.jpg",
    "FB_IMG_1662390470195.jpg",
    "FB_IMG_1662390476350.jpg",
  ],
  "home accessories/ashtray from tree trunk": [
    "IMG_0007.jpg",
  ],
  "home accessories/coaster from resin and olive wood": [
    "0D2A0235.jpg",
    "0D2A0252.jpg",
    "0D2A0254.jpg",
    "0D2A0258.jpg",
    "0D2A0261.jpg",
    "0D2A0264.jpg",
    "0D2A0270.jpg",
    "0D2A0271.jpg",
  ],
  "home accessories/coaster from resin and walnut wood": [
    "0D2A0422.jpg",
    "0D2A0424.jpg",
    "0D2A0427.jpg",
    "0D2A0429.jpg",
    "0D2A0434.jpg",
    "0D2A0439.jpg",
  ],
  "home accessories/flying shelves from half tree trunk": [
    "544A0033.jpg",
    "544A0082.jpg",
    "544A0083.jpg",
  ],
  "home accessories/flying shelves from massive beech tree wood with live tree edges": [
    "3 .jpg",
    "4 .jpg",
    "5 .jpg",
    "544A0103.jpg",
    "544A0143.jpg",
    "544A0151.jpg",
    "544A0153.jpg",
    "544A0158.jpg",
    "544A0219.jpg",
    "6 .jpg",
  ],
  "home accessories/indoor pergola from pine wood": [
    "1.jpg",
    "IMG_0032.jpg",
  ],
  "home accessories/melted glass aquarium on tree roots": [
    "0D2A0038.jpg",
    "0D2A0039.jpg",
    "0D2A0050.jpg",
    "0D2A0072.jpg",
    "2.jpg",
    "3.jpg",
    "8.jpg",
    "9.jpg",
    "IMG_0027.jpg",
    "IMG_0029.jpg",
  ],
  "home accessories/side lamp from live tree trunk": [
    "1 highres.jpg",
    "1 lowres.jpg",
    "2 highres.jpg",
    "2 lowres.jpg",
    "3 highres.jpg",
    "3 lowres.jpg",
  ],
  "home accessories/soap holder from massive olive wood": [
    "0D2A0275.jpg",
    "0D2A0279.jpg",
    "0D2A0280.jpg",
    "0D2A0449.jpg",
    "0D2A0456.jpg",
    "0D2A0462.jpg",
    "0D2A0466.jpg",
    "0D2A0475.jpg",
    "0D2A0478.jpg",
    "0D2A0479.jpg",
  ],
  "home accessories/socket cover from wood": [
    "0D2A5528.jpg",
    "0D2A5535.jpg",
    "0D2A5662.jpg",
  ],
  "home accessories/vases from massive tree wood": [
    "0D2A0194.jpg",
    "0D2A0217.jpg",
    "0D2A0223.jpg",
    "0D2A0226.jpg",
    "0D2A0227.jpg",
    "0D2A0228.jpg",
    "0D2A0231.jpg",
    "0D2A6429.jpg",
    "0D2A6430.jpg",
    "0D2A6431.jpg",
    "0D2A6432.jpg",
    "0D2A6433.jpg",
    "0D2A6434.jpg",
    "0D2A6435.jpg",
    "1661174387218.jpg",
    "1661174387422.jpg",
    "1661174387578.jpg",
    "1661174388279.jpg",
  ],
  "kitchen ware/cheese platters with resin from walnut wood": [
    "IMG_0011.jpg",
    "IMG_0014.jpg",
    "IMG_0015.jpg",
    "IMG_0020.jpg",
    "IMG_0023.jpg",
    "IMG_0033.jpg",
    "IMG_0038.jpg",
    "IMG_0041.jpg",
    "IMG_0047.jpg",
    "IMG_0049.jpg",
  ],
  "kitchen ware/cups from sisso wood": [
    "0D2A6417.jpg",
    "0D2A6422.jpg",
    "0D2A6424.jpg",
    "0D2A6427.jpg",
    "0D2A6436.jpg",
    "0D2A6437.jpg",
    "0D2A6438.jpg",
    "544A0093.jpg",
    "544A0101.jpg",
    "IMG_0031.jpg",
    "IMG_0037.jpg",
    "IMG_0038_1.jpg",
    "IMG_0039.jpg",
    "IMG_0041_1.jpg",
    "IMG_0043.jpg",
    "k.jpg",
  ],
  "kitchen ware/sisso wood bowls and plates": [
    "6U6A0086.jpg",
    "6U6A0087.jpg",
    "6U6A0089.jpg",
    "IMG_0002.jpg",
    "IMG_0005.jpg",
    "IMG_0006.jpg",
    "IMG_0008.jpg",
    "IMG_0009.jpg",
    "IMG_0011_1.jpg",
    "IMG_0012.jpg",
    "IMG_0016.jpg",
    "IMG_0017.jpg",
    "IMG_0053.jpg",
    "IMG_0054.jpg",
    "IMG_0055.jpg",
    "IMG_0056.jpg",
    "IMG_0057.jpg",
    "IMG_0062.jpg",
    "IMG_0063.jpg",
    "IMG_0064.jpg",
    "IMG_0069.jpg",
  ],
  "kitchen ware/sisso wood cutting board": [
    "0D2A1270.jpg",
    "6U6A0070.jpg",
  ],
  "kitchen ware/tray from sisso wood": [
    "544A0093.jpg",
    "544A0101.jpg",
    "544A0109.jpg",
    "6U6A0202.jpg",
  ],
  "lighting/bamboo lighting": [
    "1661174386942.jpg",
    "1661174494924.jpg",
    "1661174494962.jpg",
    "1661174494997.jpg",
    "1661174495034.jpg",
    "FB_IMG_1660169294766.jpg",
  ],
  "lighting/chandlier from tree rings with live edges": [
    "544A0007.jpg",
    "544A0019.jpg",
    "544A0028.jpg",
    "544A0053.jpg",
  ],
  "lighting/flank wood from old train rails with spot lights": [
    "0D2A1439.JPG",
    "0D2A1440.JPG",
    "0D2A1442.JPG",
    "0D2A1444.JPG",
    "0D2A1449.JPG",
    "0D2A1450.JPG",
    "0D2A1457.JPG",
  ],
  "lighting/floor lamp from massive acacia tree wood": [
    "1661174388279.jpg",
    "1661174388392.jpg",
    "1661174495179.jpg",
    "1661174495401.jpg",
    "1661174495655.jpg",
    "1661174495692.jpg",
    "1661174861833.jpg",
  ],
  "lighting/floor tree backlight lamp": [
    "0D2A5535.jpg",
  ],
  "lighting/floor tree lamp": [
    "0D2A5603.jpg",
    "0D2A5613.jpg",
  ],
  "lighting/tree ring wood shape with lighting": [
    "0D2A1386.JPG",
    "0D2A1395.JPG",
    "0D2A1416.JPG",
    "0D2A1417.JPG",
    "0D2A1425.JPG",
  ],
  "lighting/wall mount beech wood back light plate": [
    "1661174495179.jpg",
    "1661174495401.jpg",
    "1661174495512.jpg",
    "1661174495583.jpg",
    "1661174861799.jpg",
  ],
  "mirrors/Oak tree wood mirror 2 meter": [
    "IMG_20210519_192037.jpg",
    "IMG_20210519_192039.jpg",
    "IMG_20210519_192123.jpg",
    "IMG_20210519_192615.jpg",
    "IMG_20210519_192617.jpg",
    "IMG_20210519_192622.jpg",
  ],
  "mirrors/frameless mirror from irregular shape": [
    "0D2A0153.jpg",
    "0D2A0160.jpg",
    "0D2A0166.jpg",
    "0D2A0189.jpg",
    "355eee9b9bdfb5f1d417adb7971fc72c.jpg",
    "FB_IMG_1662390484641.jpg",
  ],
  "mirrors/massive olive wood mirror door": [
    "0D2A0045-01.jpeg",
    "0D2A0045.jpg",
    "0D2A6002.jpg",
    "0D2A6005.jpg",
    "0D2A6011.jpg",
  ],
  "mirrors/mirror from massive beech tree wood with live tree edges 2 meters": [
    "1 .jpg",
    "2 .jpg",
    "IMG-20200927-WA0004.jpg",
  ],
  "mirrors/mirror from old train rail flank wood": [
    "0D2A5927.jpg",
    "0D2A5928.jpg",
    "0D2A5937.jpg",
    "0D2A5956.jpg",
    "0D2A5957.jpg",
    "0D2A5984.jpg",
    "0D2A6295.jpg",
    "0D2A6308.jpg",
  ],
  "mirrors/rectangelar shape mirror": [
    "1733073774198.jpg",
    "1733073774243.jpg",
  ],
  "mirrors/round mirror from tree trunks": [
    "1733073772954.jpg",
    "1733073773006.jpg",
    "1733073773059.jpg",
    "1733073773109.jpg",
    "1733073773157.jpg",
    "1733073773208.jpg",
  ],
  "owner pic": [
    "0D2A6365.JPG",
  ],
  "plant pots/plant pot cover from massive pine wood": [
    "6U6A0041.jpg",
    "6U6A0046.jpg",
    "6U6A0048.jpg",
    "6U6A9907.jpg",
    "6U6A9909.jpg",
    "6U6A9915.jpg",
  ],
  "plant pots/plant pots from massive tree trunks": [
    "0D2A0208.jpg",
    "0D2A0210.jpg",
    "0D2A0212.jpg",
    "0D2A0215.jpg",
    "0D2A0343.jpg",
    "6U6A0094.jpg",
    "6U6A0173.jpg",
    "6U6A0174.jpg",
    "6U6A0183.jpg",
    "6U6A0198.jpg",
    "6U6A0221.jpg",
    "6U6A0231.jpg",
    "6U6A0238.jpg",
    "6U6A0249.jpg",
    "6U6A0253.jpg",
    "6U6A0265.jpg",
    "6U6A0266.jpg",
    "6U6A9882.jpg",
    "6U6A9937.jpg",
  ],
  "plant pots/square plant pots from pine wood": [
    "6U6A9976.jpg",
    "6U6A9989.jpg",
  ],
  "tv unit/beech wood tv unit with live tree edges": [
    "544A0167.jpg",
    "544A0182.jpg",
    "544A0187.jpg",
  ],
  "tv unit/contar oak wood elevated tv unit": [
    "IMG-20240405-WA0067.jpg",
  ],
  "tv unit/massive beech wood tv unit with bleached white color": [
    "0D2A0195.jpg",
    "0D2A0198.jpg",
    "0D2A0203.jpg",
    "0D2A0205.jpg",
    "1661174387102.jpg",
    "1661174387218.jpg",
    "1661174387422.jpg",
    "1661174387460.jpg",
    "1661174387578.jpg",
    "1661174387618.jpg",
    "1661174387658.jpg",
    "1661174388757.jpg",
    "1661174495476.jpg",
    "1661174495512.jpg",
    "1661174495617.jpg",
    "1661174861558.jpg",
    "1661174861658.jpg",
  ],
  "tv unit/tv unit from old train rail flank wood": [
    "0D2A6051.jpg",
    "0D2A6084.jpg",
    "0D2A6102.jpg",
    "0D2A6108.jpg",
    "0D2A6393.jpg",
    "0D2A6458.jpg",
  ],
  "wall cladding/wooden black strips wall cladding": [
    "6U6A0129.jpg",
    "6U6A0144.jpg",
    "6U6A0145.jpg",
    "Copy of 6U6A0129.jpg",
    "Copy of 6U6A0144.jpg",
    "Copy of 6U6A0145.jpg",
  ],
};

const titleOverrides: Record<string, string> = {
  'chairs/DIABLO side chair from tree stump made from sisso wood whole tree': 'Diablo Side Chair',
  'chairs/black tree trunk with live edge from sisso wood': 'Black Sisso Live Edge Chair',
  'chairs/curved tree stamp from sisso wood': 'Curved Sisso Stump Chair',
  'chairs/bomba chair with flank old wood': 'Bomba Chair in Reclaimed Plank Wood',
  'chairs/mini sofa with old flank wood': 'Mini Sofa in Reclaimed Plank Wood',
  'chairs/sofa from old flank wood': 'Old Plank Wood Sofa',
  'chairs/sofa from pine and beech wood from connected separated parts': 'Connected Pine and Beech Sofa',
  'chairs/tree wood curved chair': 'Curved Tree Wood Chair',
  'coffee tables/acacia leaving table': 'Acacia Coffee Table',
  'coffee tables/contar oak leaving table': 'Contar Oak Coffee Table',
  'coffee tables/leaving table made of glass top and flank wood from old train rail wood':
    'Glass and Rail Plank Coffee Table',
  'coffee tables/olive wood leaving table': 'Olive Wood Coffee Table',
  'consoles/bauffet from olive wood and black resin': 'Olive Resin Buffet',
  'countar tops/acacia countar top sink': 'Acacia Countertop Sink',
  'countar tops/contar oak wood for sink': 'Contar Oak Vanity Top',
  'countar tops/sisso wood counter top': 'Sisso Wood Countertop',
  'dining tables/massive dinning table from beech tree wood with live tree edges':
    'Live Edge Beech Dining Table',
  'entry pictures': 'Project Interior Overview',
  'home accessories/melted glass aquarium on tree roots': 'Melted Glass Aquarium on Tree Roots',
  'home accessories/side lamp from live tree trunk': 'Live Trunk Side Lamp',
  'lighting/chandlier from tree rings with live edges': 'Tree Ring Chandelier',
  'lighting/flank wood from old train rails with spot lights': 'Rail Plank Spotlight Beam',
  'lighting/tree ring wood shape with lighting': 'Tree Ring Light Form',
  'mirrors/Oak tree wood mirror 2 meter': 'Oak Mirror, Two-Meter Form',
  'mirrors/massive olive wood mirror door': 'Olive Wood Mirror Door',
  'mirrors/rectangelar shape mirror': 'Rectangular Mirror',
  'plant pots/plant pots from massive tree trunks': 'Planters from Massive Tree Trunks',
  'wall cladding/wooden black strips wall cladding': 'Black Strip Wall Cladding',
};

const featuredFolders = new Set([
  'tv unit/beech wood tv unit with live tree edges',
  'dining tables/acacia wood dining table with metal legs',
  'chairs/sofa from old flank wood',
  'countar tops/acacia countar top sink',
  'Closet/contar oak wood waredrope and dresser',
  'coffee tables/olive wood with resin coffee table',
  'chairs/bench from massive beech tree wood slap',
  'entry pictures',
]);

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function cleanFolderLabel(folderKey: string) {
  const parts = folderKey.split('/');
  const rawName = parts.length > 1 ? parts[1] : parts[0];

  return rawName
    .replace(/wardrope/gi, 'wardrobe')
    .replace(/waredrope/gi, 'wardrobe')
    .replace(/canee/gi, 'cane')
    .replace(/countar/gi, 'counter')
    .replace(/dinning/gi, 'dining')
    .replace(/comodes/gi, 'commodes')
    .replace(/comode/gi, 'commode')
    .replace(/slap/gi, 'slab')
    .replace(/stamp/gi, 'stump')
    .replace(/rectangelar/gi, 'rectangular')
    .replace(/chandlier/gi, 'chandelier')
    .replace(/flank/gi, 'plank')
    .replace(/tree slaps/gi, 'tree slabs')
    .replace(/leaving table/gi, 'coffee table')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTitleForFolder(folderKey: string) {
  return titleOverrides[folderKey] ?? toTitleCase(cleanFolderLabel(folderKey));
}

function getMaterialForFolder(folderKey: string) {
  const source = cleanFolderLabel(folderKey).toLowerCase();
  const materials: string[] = [];

  const add = (value: string) => {
    if (!materials.includes(value)) {
      materials.push(value);
    }
  };

  if (source.includes('pitch pine')) add('Pitch pine');
  if (source.includes('pine') && !source.includes('pitch pine')) add('Pine wood');
  if (source.includes('beech')) add('Beech wood');
  if (source.includes('oak')) add('Oak wood');
  if (source.includes('acacia')) add('Acacia wood');
  if (source.includes('olive')) add('Olive wood');
  if (source.includes('sisso')) add('Sisso wood');
  if (source.includes('walnut')) add('Walnut wood');
  if (source.includes('cherry')) add('Cherry wood');
  if (source.includes('berry')) add('Berry wood');
  if (source.includes('bamboo')) add('Bamboo');
  if (source.includes('glass')) add('Glass');
  if (source.includes('resin')) add('Resin detailing');
  if (source.includes('metal legs')) add('Metal legs');
  if (source.includes('cane')) add('Cane weave');
  if (source.includes('mirror')) add('Mirror glass');
  if (source.includes('rail plank') || source.includes('train rail')) add('Reclaimed rail plank wood');
  if (source.includes('tree trunk')) add('Tree trunk timber');
  if (source.includes('tree rings') || source.includes('tree ring')) add('Tree ring timber');
  if (source.includes('live edge') || source.includes('live tree edges')) add('Live edge detailing');
  if (source.includes('lighting') || source.includes('backlight') || source.includes('spot lights')) {
    add('Integrated lighting');
  }

  if (materials.length === 0) {
    return 'Solid timber construction';
  }

  return materials.join(', ');
}

function inferPlacement(folderKey: string): {
  category: GalleryCategoryName;
  subcategory: GallerySubcategoryName;
} {
  const [topFolder, rawName] = folderKey.split('/');
  const name = (rawName ?? topFolder).toLowerCase();

  if (
    name.includes('lamp') ||
    name.includes('light') ||
    name.includes('lighting') ||
    name.includes('mirror') ||
    name.includes('coaster')
  ) {
    if (name.includes('coaster')) {
      return { category: 'Home Accessories', subcategory: 'Coasters' };
    }
    if (name.includes('mirror')) {
      return { category: 'Home Accessories', subcategory: 'Mirrors' };
    }
    return { category: 'Home Accessories', subcategory: 'Lights' };
  }

  if (folderKey === 'entry pictures') {
    return { category: 'Bedroom', subcategory: 'Beds' };
  }

  switch (topFolder) {
    case 'Closet':
      if (name.includes('hanger') || name.includes('ladder')) {
        return { category: 'Bedroom', subcategory: 'Hanger' };
      }
      if (name.includes('dresser') || name.includes('dressing')) {
        return { category: 'Bedroom', subcategory: 'Dressing Table' };
      }
      return { category: 'Bedroom', subcategory: 'Wardrobe' };
    case 'Desk':
      return { category: 'Bedroom', subcategory: 'Dressing Table' };
    case 'beds':
      return { category: 'Bedroom', subcategory: 'Beds' };
    case 'chairs':
      if (name.includes('bench from massive beech tree wood slap') || name.includes('bench from olive tree wood')) {
        return { category: 'Outdoor Seating', subcategory: 'Chairs' };
      }
      if (name.includes('bench')) {
        return { category: 'Dining Room', subcategory: 'Benches' };
      }
      if (name.includes('sofa')) {
        if (name.includes('old flank wood')) {
          return { category: 'Outdoor Seating', subcategory: 'Sofa' };
        }
        return { category: 'Living Room', subcategory: 'Sofa' };
      }
      if (name.includes('rocking') || name.includes('shoe rack')) {
        return { category: 'Bedroom', subcategory: 'Chairs' };
      }
      if (
        name.includes('side chair') ||
        name === 'massive beech wood chair' ||
        name.includes('olive wood side chair')
      ) {
        return { category: 'Dining Room', subcategory: 'Chairs' };
      }
      return { category: 'Living Room', subcategory: 'Chairs' };
    case 'coffee tables':
      return { category: 'Living Room', subcategory: 'Tables' };
    case 'comodes':
      return { category: 'Bedroom', subcategory: 'Commode' };
    case 'consoles':
      if (name.includes('shelves')) {
        return { category: 'Dining Room', subcategory: 'Shelves' };
      }
      return { category: 'Dining Room', subcategory: 'Buffet' };
    case 'countar tops':
      return { category: 'Restroom', subcategory: 'Countertop' };
    case 'dining tables':
      return { category: 'Dining Room', subcategory: 'Tables' };
    case 'doors':
      return { category: 'Living Room', subcategory: 'Wall Artwork' };
    case 'dresser':
      return { category: 'Bedroom', subcategory: 'Dressing Table' };
    case 'home accessories':
      if (name.includes('shelves')) {
        return { category: 'Living Room', subcategory: 'Shelves' };
      }
      if (name.includes('soap')) {
        return { category: 'Restroom', subcategory: 'Holders' };
      }
      if (name.includes('side lamp')) {
        return { category: 'Bedroom', subcategory: 'Lights' };
      }
      if (name.includes('lamp')) {
        return { category: 'Living Room', subcategory: 'Lights' };
      }
      if (name.includes('pergola')) {
        return { category: 'Outdoor Seating', subcategory: 'Tables' };
      }
      if (name.includes('ashtray') || name.includes('coaster')) {
        return { category: 'Dining Room', subcategory: 'Tables' };
      }
      return { category: 'Living Room', subcategory: 'Wall Artwork' };
    case 'kitchen ware':
      return { category: 'Dining Room', subcategory: 'Tables' };
    case 'lighting':
      if (name.includes('bamboo')) {
        return { category: 'Outdoor Seating', subcategory: 'Lights' };
      }
      if (name.includes('wall mount')) {
        return { category: 'Restroom', subcategory: 'Lights' };
      }
      if (name.includes('chandelier') || name.includes('chandlier')) {
        return { category: 'Dining Room', subcategory: 'Lights' };
      }
      if (name.includes('side lamp')) {
        return { category: 'Bedroom', subcategory: 'Lights' };
      }
      return { category: 'Living Room', subcategory: 'Lights' };
    case 'mirrors':
      if (name.includes('frameless') || name.includes('irregular')) {
        return { category: 'Restroom', subcategory: 'Mirrors' };
      }
      if (name.includes('door') || name.includes('rectangular') || name.includes('rectangelar')) {
        return { category: 'Bedroom', subcategory: 'Mirrors' };
      }
      if (name.includes('oak tree wood mirror') || name.includes('round mirror')) {
        return { category: 'Dining Room', subcategory: 'Mirrors' };
      }
      return { category: 'Living Room', subcategory: 'Mirrors' };
    case 'plant pots':
      return { category: 'Outdoor Seating', subcategory: 'Tables' };
    case 'tv unit':
      return { category: 'Living Room', subcategory: 'TV Unit' };
    case 'wall cladding':
      return { category: 'Living Room', subcategory: 'Wall Artwork' };
    default:
      return { category: 'Living Room', subcategory: 'Tables' };
  }
}

const legacyPlacementOverrides = new Map<string, { category: GalleryCategoryName; subcategory: GallerySubcategoryName }>([
  ['lighting-chandlier-from-tree-rings-with-live-edges', { category: 'Dining Room', subcategory: 'Lights' }],
  ['home-accessories-side-lamp-from-live-tree-trunk', { category: 'Bedroom', subcategory: 'Lights' }],
  ['chairs-diablo-side-chair-from-tree-stump-made-from-sisso-wood-whole-tree', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-massive-beech-wood-chair', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-massive-berry-wood-tree-side-chair', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-olive-wood-side-chair', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-rocking-chair-from-beech-wood', { category: 'Bedroom', subcategory: 'Chairs' }],
  ['chairs-corner-chair-shoe-rack-with-shelves', { category: 'Bedroom', subcategory: 'Chairs' }],
  ['chairs-mini-sofa-with-old-flank-wood', { category: 'Outdoor Seating', subcategory: 'Sofa' }],
  ['chairs-sofa-from-old-flank-wood', { category: 'Outdoor Seating', subcategory: 'Sofa' }],
  ['mirrors-oak-tree-wood-mirror-2-meter', { category: 'Dining Room', subcategory: 'Mirrors' }],
  ['mirrors-round-mirror-from-tree-trunks', { category: 'Dining Room', subcategory: 'Mirrors' }],
  ['mirrors-rectangelar-shape-mirror', { category: 'Bedroom', subcategory: 'Mirrors' }],
]);

function applyLegacyPlacementOverride(piece: GalleryPiece): GalleryPiece {
  const override = legacyPlacementOverrides.get(piece.id);

  if (!override) {
    return piece;
  }

  return {
    ...piece,
    category: override.category,
    subcategory: override.subcategory,
  };
}

function encodeUploadPath(relativePath: string) {
  return relativePath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function createGalleryImageAsset(folderKey: string, fileName: string, title: string, index: number): GalleryImageAsset {
  return {
    src: `/${encodeUploadPath(`uploads/aon imgaes/${folderKey}/${fileName}`)}`,
    alt: `${title} image ${index + 1}`,
  };
}

function createPieceId(folderKey: string) {
  return folderKey.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const defaultCategoryOrder = categoryDefinitions.map((category) => category.name);

function sortGalleryPieces(pieces: GalleryPiece[], categoryOrder: string[] = defaultCategoryOrder) {
  return [...pieces].sort((left, right) => {
    const leftIndex = categoryOrder.indexOf(left.category);
    const rightIndex = categoryOrder.indexOf(right.category);

    if (leftIndex !== rightIndex) {
      if (leftIndex === -1) {
        return 1;
      }
      if (rightIndex === -1) {
        return -1;
      }
      return leftIndex - rightIndex;
    }

    if (left.subcategory !== right.subcategory) {
      return left.subcategory.localeCompare(right.subcategory);
    }

    if ((left.rank ?? 0) !== (right.rank ?? 0)) {
      return (left.rank ?? 0) - (right.rank ?? 0);
    }

    return left.title.localeCompare(right.title);
  });
}

const galleryPieces: GalleryPiece[] = Object.entries(galleryFolderFiles)
  .filter(([folderKey]) => folderKey !== 'owner pic')
  .map(([folderKey, fileNames]) => {
    const placement = inferPlacement(folderKey);
    const title = getTitleForFolder(folderKey);
    const images = fileNames.map((fileName, index) =>
      createGalleryImageAsset(folderKey, fileName, title, index)
    );

    return applyLegacyPlacementOverride({
      id: createPieceId(folderKey),
      title,
      category: placement.category,
      subcategory: placement.subcategory,
      material: getMaterialForFolder(folderKey),
      note: subcategoryNotes[placement.subcategory],
      archiveCount: images.length,
      featured: featuredFolders.has(folderKey),
      image: images[0],
      images,
    });
  });

export const defaultGalleryContent: GalleryContent = {
  previewEyebrow: 'Gallery',
  previewHeading: 'Previous Work',
  previewDescription:
    'A quiet selection of bespoke pieces, shown as fragments of atmosphere, craft, and material language.',
  pageEyebrow: 'Gallery',
  pageHeading: 'An editorial archive of crafted interiors.',
  pageDescription:
    'Arranged by room rather than product, the gallery reads as a set of atmospheres: furniture, lighting, and details shaped to belong to a space rather than compete with it.',
  categories: categoryDefinitions,
  pieces: sortGalleryPieces(galleryPieces),
};

export function buildGalleryCategories(content: GalleryContent): GalleryCategory[] {
  const categoryByName = new Map(content.categories.map((category) => [category.name, category]));
  const definedCategoryNames = content.categories.map((category) => category.name);
  const pieceCategoryNames = Array.from(new Set(content.pieces.map((piece) => piece.category)));
  const categoryOrder = [...definedCategoryNames, ...pieceCategoryNames.filter((name) => !definedCategoryNames.includes(name))];

  return categoryOrder.map((categoryName) => {
    const category = categoryByName.get(categoryName);
    const piecesForCategory = content.pieces.filter((piece) => piece.category === categoryName);
    const inferredSubcategoryNames = Array.from(new Set(piecesForCategory.map((piece) => piece.subcategory)));
    const subcategoryNames = category
      ? [...category.subcategories, ...inferredSubcategoryNames.filter((name) => !category.subcategories.includes(name))]
      : inferredSubcategoryNames;

    return {
      name: categoryName,
      eyebrow: category?.eyebrow ?? '',
      description: category?.description ?? '',
      subcategories: subcategoryNames.map((subcategory) => ({
        name: subcategory,
        pieces: sortGalleryPieces(
          content.pieces.filter(
            (piece) => piece.category === categoryName && piece.subcategory === subcategory
          ),
          categoryOrder
        ),
      })),
    };
  });
}

export function getFeaturedGalleryPieces(content: GalleryContent) {
  return sortGalleryPieces(content.pieces.filter((piece) => piece.featured), content.categories.map((category) => category.name));
}

export function getHomepageGalleryPieces(content: GalleryContent, count: number = 6) {
  const categoryOrder = content.categories.map((category) => category.name);
  const featured = sortGalleryPieces(content.pieces.filter((piece) => piece.featured), categoryOrder);
  if (featured.length >= count) {
    return featured.slice(0, count);
  }

  const featuredIds = new Set(featured.map((piece) => piece.id));
  const fallbackPieces = sortGalleryPieces(content.pieces, categoryOrder).filter((piece) => !featuredIds.has(piece.id));
  return [...featured, ...fallbackPieces].slice(0, count);
}

export function getGalleryCategoryId(categoryName: GalleryCategoryName) {
  return categoryName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getGalleryCategoryHref(categoryName: GalleryCategoryName) {
  return `/gallery#${getGalleryCategoryId(categoryName)}`;
}

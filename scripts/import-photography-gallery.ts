import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { connectToDatabase } from '../server/db';
import { GalleryCategoryRecordModel } from '../server/models/GalleryCategoryRecord';
import { GallerySubcategoryRecordModel } from '../server/models/GallerySubcategoryRecord';
import { GalleryItemRecordModel } from '../server/models/GalleryItemRecord';

const sourceRoot = path.resolve('Art of nature photography');
const uploadsRoot = path.resolve('uploads/aon imgaes');
const publicUploadsPrefix = '/uploads/aon imgaes';

type GalleryImportEntry = {
  source: string;
  destination: string;
  title: string;
  category: string;
  subcategory: string;
  material: string;
  note: string;
  excludeFiles?: string[];
  featured?: boolean;
};

const categoryCopy: Record<string, { eyebrow: string; description: string; rank: number }> = {
  'Living Room': {
    eyebrow: 'Gallery I',
    description: 'Gathering pieces shaped around conversation, texture, and the slower rhythm of lived-in rooms.',
    rank: 0,
  },
  'Dining Room': {
    eyebrow: 'Gallery II',
    description: 'Tables, storage, and lighting composed for hosting, ceremony, and the quiet architecture of meals.',
    rank: 1,
  },
  'Outdoor Seating': {
    eyebrow: 'Gallery III',
    description: 'Open-air pieces documented through benches, lounge seating, lighting, planters, and relaxed exterior gatherings.',
    rank: 2,
  },
  Restroom: {
    eyebrow: 'Gallery IV',
    description: 'Compact interventions where material choice, silhouette, and restraint do most of the visual work.',
    rank: 3,
  },
  Bedroom: {
    eyebrow: 'Gallery V',
    description: 'Private-room pieces arranged around storage, tactility, and a sense of calm that lasts beyond trends.',
    rank: 4,
  },
  'Home Accessories': {
    eyebrow: 'Gallery VI',
    description: 'Smaller objects and accents where craft, detail, and material expression take priority over scale.',
    rank: 5,
  },
};

const imports: GalleryImportEntry[] = [
  {
    source: 'Art work',
    destination: 'home accessories/wall art/art work timber wall composition',
    title: 'Art Work Timber Wall Composition',
    category: 'Home Accessories',
    subcategory: 'Wall Art',
    material: 'Mixed timber panels',
    note: 'Wall-mounted timber studies composed as small architectural artwork.',
  },
  {
    source: '1- 22.9.2020(gouna)/Aroka black wall',
    destination: 'wall cladding/aroka black timber wall',
    title: 'Aroka Black Timber Wall',
    category: 'Living Room',
    subcategory: 'Wall Artwork',
    material: 'Charred timber cladding',
    note: 'A dark timber wall treatment documented as texture, threshold, and atmosphere.',
  },
  {
    source: '1- 22.9.2020(gouna)/high res/aquarium',
    destination: 'home accessories/aquariums/melted glass aquarium on tree roots',
    title: 'Melted Glass Aquarium On Tree Roots',
    category: 'Home Accessories',
    subcategory: 'Aquariums',
    material: 'Tree root and formed glass',
    note: 'A small sculptural aquarium where glass settles into the irregular form of natural timber.',
  },
  {
    source: '1- 22.9.2020(gouna)/high res/chairs',
    destination: 'plant pots/stacked timber plant pots',
    title: 'Stacked Timber Plant Pots',
    category: 'Home Accessories',
    subcategory: 'Plant Pots',
    material: 'Solid timber',
    note: 'Plant vessels shaped as compact timber objects for interior and terrace settings.',
  },
  {
    source: '1- 22.9.2020(gouna)/high res/coffee table',
    destination: 'coffee tables/gouna coffee table',
    title: 'Gouna Coffee Table',
    category: 'Living Room',
    subcategory: 'Tables',
    material: 'Natural timber slab',
    note: 'A low table documented through close grain, edge detail, and relaxed living-room scale.',
  },
  {
    source: '1- 22.9.2020(gouna)/high res/console',
    destination: 'consoles/gouna timber console styling',
    title: 'Gouna Timber Console Styling',
    category: 'Dining Room',
    subcategory: 'Buffet',
    material: 'Timber console structure',
    note: 'A console arrangement used as a quiet display surface for plants and handcrafted objects.',
  },
  {
    source: '1- 22.9.2020(gouna)/high res/dinning table',
    destination: 'dining tables/gouna dining table',
    title: 'Gouna Dining Table',
    category: 'Dining Room',
    subcategory: 'Tables',
    material: 'Solid timber',
    note: 'A dining surface documented for proportion, edge, and warm gathering light.',
  },
  {
    source: '1- 22.9.2020(gouna)/high res/Mirror & Shelf',
    destination: 'home accessories/mirrors/gouna mirror and shelf',
    title: 'Gouna Mirror And Shelf',
    category: 'Home Accessories',
    subcategory: 'Mirrors',
    material: 'Mirror glass and timber shelf',
    note: 'A paired mirror and shelf installation treated as a small interior composition.',
  },
  {
    source: '1- 22.9.2020(gouna)/lamp',
    destination: 'lighting/gouna timber lamp',
    title: 'Gouna Timber Lamp',
    category: 'Home Accessories',
    subcategory: 'Lights',
    material: 'Timber and integrated lighting',
    note: 'A small lamp study where the timber base carries the character of the object.',
  },
  {
    source: '1- 22.9.2020(gouna)/low res/grapetables',
    destination: 'coffee tables/grape wood nested side tables',
    title: 'Grape Wood Nested Side Tables',
    category: 'Living Room',
    subcategory: 'Tables',
    material: 'Live-edge timber and metal legs',
    note: 'Nested side tables arranged around irregular grain and compact living-room utility.',
  },
  {
    source: '10- 2.2.2022 lighting',
    destination: 'lighting/february lighting studies',
    title: 'February Lighting Studies',
    category: 'Home Accessories',
    subcategory: 'Lights',
    material: 'Timber and warm integrated lighting',
    note: 'Lighting pieces documented as atmosphere, shadow, and small sculptural presence.',
  },
  {
    source: '11- 25.6.2022 masyaf',
    destination: 'home accessories/styled interiors/masyaf coastal interior collection',
    title: 'Masyaf Coastal Interior Collection',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Mixed timber furniture and accessories',
    note: 'A styled project set showing beds, tables, lighting, mirrors, and accessories in one coastal interior.',
    excludeFiles: ['1661174496052.jpg', 'FB_IMG_1660169279925.jpg', 'FB_IMG_1660169294766.jpg'],
  },
  {
    source: '12- 29.9.2022 soma bay/Bedroom 1',
    destination: 'beds/soma bay bedroom one',
    title: 'Soma Bay Bedroom One',
    category: 'Bedroom',
    subcategory: 'Beds',
    material: 'Timber bedroom furniture',
    note: 'A bedroom set documented through bed scale, side pieces, and soft interior light.',
  },
  {
    source: '12- 29.9.2022 soma bay/Bedroom 2',
    destination: 'beds/soma bay bedroom two',
    title: 'Soma Bay Bedroom Two',
    category: 'Bedroom',
    subcategory: 'Beds',
    material: 'Timber bedroom furniture',
    note: 'A second bedroom arrangement focused on material warmth and quiet storage details.',
  },
  {
    source: '12- 29.9.2022 soma bay/Livingroom',
    destination: 'coffee tables/soma bay living room tables',
    title: 'Soma Bay Living Room Tables',
    category: 'Living Room',
    subcategory: 'Tables',
    material: 'Timber tables and living-room pieces',
    note: 'Living-room pieces documented as part of a bright coastal interior.',
  },
  {
    source: '12- 29.9.2022 soma bay/accessories',
    destination: 'home accessories/vases/soma bay timber accessories',
    title: 'Soma Bay Timber Accessories',
    category: 'Home Accessories',
    subcategory: 'Vases',
    material: 'Turned timber and small sculptural objects',
    note: 'Small accessory pieces presented through form, silhouette, and grain variation.',
  },
  {
    source: '12- 29.9.2022 soma bay/dinning',
    destination: 'dining tables/soma bay dining table',
    title: 'Soma Bay Dining Table',
    category: 'Dining Room',
    subcategory: 'Tables',
    material: 'Timber dining table',
    note: 'A dining table documented in place with emphasis on proportion and surface.',
  },
  {
    source: '13-madinty',
    destination: 'home accessories/styled interiors/madinty timber interior set',
    title: 'Madinty Timber Interior Set',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Mixed timber furniture and interior details',
    note: 'A mixed interior set combining bedroom, kitchen, lighting, and storage pieces.',
  },
  {
    source: '14-downtown dining pic',
    destination: 'dining tables/downtown dining table',
    title: 'Downtown Dining Table',
    category: 'Dining Room',
    subcategory: 'Tables',
    material: 'Solid timber dining table',
    note: 'A dining table documented as a long, warm surface for gathering.',
  },
  {
    source: '16- 29.3.2023',
    destination: 'home accessories/styled interiors/march timber collection',
    title: 'March Timber Collection',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Mixed timber furniture and objects',
    note: 'A broad collection of tables, chairs, mirrors, planters, and detail studies.',
  },
  {
    source: '17-flank wood',
    destination: 'home accessories/styled interiors/flank wood collection',
    title: 'Flank Wood Collection',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Old flank wood',
    note: 'A collection of dark timber pieces spanning mirrors, stools, boxes, and display surfaces.',
  },
  {
    source: '18-my home',
    destination: 'home accessories/styled interiors/private home timber collection',
    title: 'Private Home Timber Collection',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Mixed timber furniture and architectural details',
    note: 'A personal interior study showing doors, lighting, seating, tables, and wall details together.',
  },
  {
    source: '19-mirrors',
    destination: 'mirrors/photography mirror collection',
    title: 'Photography Mirror Collection',
    category: 'Home Accessories',
    subcategory: 'Mirrors',
    material: 'Timber and mirror glass',
    note: 'A mirror collection documented across shapes, edges, and interior placements.',
  },
  {
    source: '20-inertia north coast',
    destination: 'home accessories/styled interiors/inertia north coast interior collection',
    title: 'Inertia North Coast Interior Collection',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Mixed timber bedroom and living furniture',
    note: 'A project set showing beds, wardrobes, tables, mirrors, benches, and room-wide placements.',
  },
  {
    source: '2- 11.1.2021(aroka,sheref,nihal,zamalek)/Zamalek',
    destination: 'dining tables/zamalek dining table',
    title: 'Zamalek Dining Table',
    category: 'Dining Room',
    subcategory: 'Tables',
    material: 'Solid timber dining table',
    note: 'A dining table photographed in place with emphasis on its long timber surface.',
  },
  {
    source: '2- 11.1.2021(aroka,sheref,nihal,zamalek)/aroka edited',
    destination: 'plant pots/aroka plant pots and outdoor details',
    title: 'Aroka Plant Pots And Outdoor Details',
    category: 'Home Accessories',
    subcategory: 'Plant Pots',
    material: 'Timber planters and small accessories',
    note: 'Outdoor and garden-adjacent pieces photographed as part of a planted setting.',
  },
  {
    source: '2- 11.1.2021(aroka,sheref,nihal,zamalek)/nihal maadi',
    destination: 'home accessories/styled interiors/nihal maadi interior details',
    title: 'Nihal Maadi Interior Details',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Timber lighting, shelves, trays, and tables',
    note: 'A mixed interior detail set with lighting, wall pieces, table objects, and surfaces.',
  },
  {
    source: '2- 11.1.2021(aroka,sheref,nihal,zamalek)/osana',
    destination: 'plant pots/osana plant pots and accessories',
    title: 'Osana Plant Pots And Accessories',
    category: 'Home Accessories',
    subcategory: 'Plant Pots',
    material: 'Timber plant pots and small crafted pieces',
    note: 'Plant-focused accessories and outdoor objects documented in a garden setting.',
  },
  {
    source: '2- 11.1.2021(aroka,sheref,nihal,zamalek)/sherif',
    destination: 'home accessories/styled interiors/sherif living room details',
    title: 'Sherif Living Room Details',
    category: 'Living Room',
    subcategory: 'Shelves',
    material: 'Timber shelves, tables, and living-room objects',
    note: 'Living-room pieces documented through shelves, display surfaces, and small furniture.',
  },
  {
    source: '3- 26.5.2021 mountain view/Bambo Room',
    destination: 'beds/mountain view bamboo room',
    title: 'Mountain View Bamboo Room',
    category: 'Bedroom',
    subcategory: 'Beds',
    material: 'Timber and cane bedroom furniture',
    note: 'A bedroom set with woven texture, timber framing, and soft material rhythm.',
  },
  {
    source: '3- 26.5.2021 mountain view/Close ups',
    destination: 'home accessories/styled interiors/mountain view detail studies',
    title: 'Mountain View Detail Studies',
    category: 'Home Accessories',
    subcategory: 'Styled Interiors',
    material: 'Mixed timber details',
    note: 'Close-up studies of bedroom furniture, accessories, cane, lighting, and carved wood forms.',
  },
  {
    source: '3- 26.5.2021 mountain view/Master room',
    destination: 'comodes/mountain view master room storage',
    title: 'Mountain View Master Room Storage',
    category: 'Bedroom',
    subcategory: 'Commode',
    material: 'Timber and cane storage',
    note: 'Bedroom storage and side pieces documented within a calm master-room setting.',
  },
  {
    source: '3- 26.5.2021 mountain view/Product shots',
    destination: 'home accessories/vases/mountain view product shots',
    title: 'Mountain View Product Shots',
    category: 'Home Accessories',
    subcategory: 'Vases',
    material: 'Turned timber and root glass objects',
    note: 'Small product studies focused on vases, glass, and timber-root forms.',
  },
  {
    source: '3- 26.5.2021 mountain view/White room',
    destination: 'beds/mountain view white room',
    title: 'Mountain View White Room',
    category: 'Bedroom',
    subcategory: 'Beds',
    material: 'White-finished timber bedroom furniture',
    note: 'A bright bedroom set documented through bed frames, side pieces, and woven detail.',
  },
  {
    source: '4- 3.9.2021 acacia table',
    destination: 'coffee tables/acacia table photography set',
    title: 'Acacia Table Photography Set',
    category: 'Living Room',
    subcategory: 'Tables',
    material: 'Acacia wood',
    note: 'A table study centered on acacia grain, live edge, and surface detail.',
  },
  {
    source: '5- 21.9.2021 bowls and cups',
    destination: 'kitchen ware/bowls and cups photography set',
    title: 'Bowls And Cups Photography Set',
    category: 'Home Accessories',
    subcategory: 'Kitchen Ware',
    material: 'Turned timber',
    note: 'Bowls, cups, and small tableware objects documented as tactile household pieces.',
  },
  {
    source: '6- 30.10.2021 coasters and pots',
    destination: 'home accessories/coasters and pots photography set',
    title: 'Coasters And Pots Photography Set',
    category: 'Home Accessories',
    subcategory: 'Coasters',
    material: 'Timber and resin',
    note: 'Small tabletop pieces and planters photographed as intimate crafted details.',
  },
  {
    source: '6- 30.10.2021 coasters and pots/soap holder',
    destination: 'home accessories/soap holder photography set',
    title: 'Soap Holder Photography Set',
    category: 'Restroom',
    subcategory: 'Holders',
    material: 'Solid timber',
    note: 'Soap holders documented as compact bathroom objects shaped by grain and proportion.',
  },
  {
    source: '8- 13.11.2021 cherry dinning',
    destination: 'dining tables/cherry dining table photography set',
    title: 'Cherry Dining Table Photography Set',
    category: 'Dining Room',
    subcategory: 'Tables',
    material: 'Cherry wood',
    note: 'A dining table set documented through rich tone, edge, and full-room presence.',
  },
  {
    source: '9- 28.11.2021 olive table',
    destination: 'coffee tables/olive table photography set',
    title: 'Olive Table Photography Set',
    category: 'Living Room',
    subcategory: 'Tables',
    material: 'Olive wood',
    note: 'Olive wood table images focused on texture, surface, and sculptural table form.',
  },
  {
    source: '9- 28.11.2021 olive table/cheese platters',
    destination: 'kitchen ware/olive table cheese platters',
    title: 'Olive Table Cheese Platters',
    category: 'Home Accessories',
    subcategory: 'Kitchen Ware',
    material: 'Timber and resin',
    note: 'Cheese platters and serving objects documented as handcrafted tableware.',
  },
  {
    source: 'Elmaria Downtown',
    destination: 'chairs/elmaria downtown chair and bar detail',
    title: 'Elmaria Downtown Chair And Bar Detail',
    category: 'Dining Room',
    subcategory: 'Chairs',
    material: 'Timber seating and bar details',
    note: 'A compact set of seating and hospitality details photographed in a downtown interior.',
  },
];

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isImageFile(filename: string) {
  return /\.(jpe?g|png)$/i.test(filename);
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listImages(sourceDirectory: string, excludeFiles: string[] = []) {
  const excluded = new Set(excludeFiles);
  const entries = await fs.readdir(sourceDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => isImageFile(name) && !excluded.has(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

async function copyImages(entry: GalleryImportEntry) {
  const sourceDirectory = path.join(sourceRoot, entry.source);
  const destinationDirectory = path.join(uploadsRoot, entry.destination);

  if (!(await pathExists(sourceDirectory))) {
    throw new Error(`Missing source folder: ${entry.source}`);
  }

  await fs.mkdir(destinationDirectory, { recursive: true });
  const imageNames = await listImages(sourceDirectory, entry.excludeFiles);

  const copied = await Promise.all(
    imageNames.map(async (imageName) => {
      const sourcePath = path.join(sourceDirectory, imageName);
      const destinationPath = path.join(destinationDirectory, imageName);

      if (!(await pathExists(destinationPath))) {
        await fs.copyFile(sourcePath, destinationPath);
      }

      const publicPath = `${publicUploadsPrefix}/${entry.destination}/${imageName}`;
      let metadata: { width?: number; height?: number } = {};

      try {
        const imageMetadata = await sharp(destinationPath).metadata();
        metadata = {
          width: imageMetadata.width,
          height: imageMetadata.height,
        };
      } catch {
        metadata = {};
      }

      return {
        src: publicPath,
        alt: entry.title,
        ...metadata,
      };
    })
  );

  return copied;
}

async function upsertCategory(name: string) {
  const slug = slugify(name);
  const fallback = categoryCopy[name] ?? {
    eyebrow: 'Gallery',
    description: `${name} pieces and archive sets from Art of Nature.`,
    rank: 100,
  };

  const existing = await GalleryCategoryRecordModel.findOne({ key: slug }).lean();
  await GalleryCategoryRecordModel.findOneAndUpdate(
    { key: slug },
    {
      key: slug,
      slug,
      name,
      eyebrow: existing?.eyebrow ?? fallback.eyebrow,
      description: existing?.description ?? fallback.description,
      rank: existing?.rank ?? fallback.rank,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    key: slug,
    slug,
    name,
  };
}

async function upsertSubcategory(category: { key: string; slug: string; name: string }, name: string) {
  const slug = slugify(name);
  const key = `${category.key}:${slug}`;
  const existing = await GallerySubcategoryRecordModel.findOne({ key }).lean();
  const count = await GallerySubcategoryRecordModel.countDocuments({ categoryKey: category.key });

  await GallerySubcategoryRecordModel.findOneAndUpdate(
    { key },
    {
      key,
      slug,
      name,
      categoryKey: category.key,
      categorySlug: category.slug,
      categoryName: category.name,
      rank: existing?.rank ?? count,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    key,
    slug,
    name,
  };
}

async function nextItemRank(categoryKey: string, subcategoryKey: string) {
  const highest = await GalleryItemRecordModel.findOne({ categoryKey, subcategoryKey })
    .sort({ rank: -1 })
    .lean();
  return typeof highest?.rank === 'number' ? highest.rank + 1 : 0;
}

async function importEntry(entry: GalleryImportEntry) {
  const images = await copyImages(entry);

  if (!images.length) {
    return { entry, status: 'skipped-empty' as const, images: 0 };
  }

  const category = await upsertCategory(entry.category);
  const subcategory = await upsertSubcategory(category, entry.subcategory);
  const key = `photography-${slugify(entry.title)}`;
  const existing = await GalleryItemRecordModel.findOne({ key }).lean();
  const rank = existing?.rank ?? (await nextItemRank(category.key, subcategory.key));

  await GalleryItemRecordModel.findOneAndUpdate(
    { key },
    {
      key,
      slug: key,
      title: entry.title,
      categoryKey: category.key,
      categorySlug: category.slug,
      categoryName: category.name,
      subcategoryKey: subcategory.key,
      subcategorySlug: subcategory.slug,
      subcategoryName: subcategory.name,
      material: entry.material,
      note: entry.note,
      archiveCount: images.length,
      featured: entry.featured === true || existing?.featured === true,
      rank,
      image: existing?.image?.src ? existing.image : images[0],
      images,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { entry, status: existing ? 'updated' as const : 'created' as const, images: images.length };
}

async function run() {
  await connectToDatabase();

  const results = [];
  for (const entry of imports) {
    results.push(await importEntry(entry));
  }

  const created = results.filter((result) => result.status === 'created').length;
  const updated = results.filter((result) => result.status === 'updated').length;
  const skipped = results.filter((result) => result.status === 'skipped-empty').length;
  const imageCount = results.reduce((sum, result) => sum + result.images, 0);

  console.log(`Photography import complete. Created: ${created}. Updated: ${updated}. Empty: ${skipped}. Images copied/referenced: ${imageCount}.`);
  results.forEach((result) => {
    console.log(`${result.status.padEnd(13)} ${String(result.images).padStart(4)} images  ${result.entry.category} / ${result.entry.subcategory} / ${result.entry.title}`);
  });
}

run()
  .catch((error) => {
    console.error('Photography import failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

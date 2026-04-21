import { SiteVisitModel } from './models/SiteVisit';

const SITE_VISIT_KEY = 'site-visits-total';

type SiteVisitDocument = {
  key: string;
  count: number;
};

export async function getVisitCount(): Promise<number> {
  const doc = await SiteVisitModel.findOne<SiteVisitDocument>({ key: SITE_VISIT_KEY }).lean();
  return typeof doc?.count === 'number' ? doc.count : 0;
}

export async function incrementVisitCount(): Promise<number> {
  const doc = await SiteVisitModel.findOneAndUpdate<SiteVisitDocument>(
    { key: SITE_VISIT_KEY },
    {
      $inc: { count: 1 },
      $setOnInsert: { key: SITE_VISIT_KEY },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return typeof doc?.count === 'number' ? doc.count : 0;
}

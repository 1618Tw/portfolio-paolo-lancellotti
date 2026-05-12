export type Work = {
  slug: string;
  title: string;
  type: string;
  year: number;
  visitSite?: string;
  externalUrl?: string;
  cover: string;
  /** Optional separate image for the project page hero. Falls back to `cover`. */
  hero?: string;
  order: number;
  body: string;
  clickable: true;
};

export type CarouselItem = Work;

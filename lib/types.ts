export type Work = {
  slug: string;
  title: string;
  type: string;
  year: number;
  visitSite?: string;
  cover: string;
  order: number;
  body: string;
  clickable: true;
};

export type ComingSoonSentinel = {
  slug: null;
  title: string;
  cover: string;
  clickable: false;
};

export type CarouselItem = Work | ComingSoonSentinel;

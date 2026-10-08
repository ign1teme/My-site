export const siteConfig = {
  name: "枝海",
  title: "枝海｜湖边的文字与故事",
  description: "文字是枝，思想是海。在芬兰的湖边记下日常、写作随想与连续的故事。",
  url: "https://hanam7.win",
} as const;

export function absoluteUrl(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteConfig.url}${path}`;
}

export function parseContentDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return undefined;
  return date;
}

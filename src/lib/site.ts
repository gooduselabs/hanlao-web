export const SITE = {
  name: 'Hàn Lão Đọc Truyện',
  shortName: 'Hàn Lão',
  description:
    'Truyện tiên hiệp nguyên tác do Hàn Lão kể — đọc trọn bộ Tàn Đăng Ký với giao diện đọc truyện hiện đại, dễ chịu cho mắt.',
  youtube: 'https://www.youtube.com/@hanlaodoctruyen',
  locale: 'vi_VN',
  disclosure:
    'Các truyện trên trang là tác phẩm nguyên tác của Hàn Lão, được viết với sự hỗ trợ của AI.',
};

const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';

/** Prefix an internal path with the configured base path. */
export function url(path = '/'): string {
  return BASE + path.replace(/^\/+/, '');
}

export const episodePath = (series: string, ep: number) => url(`truyen/${series}/hoi-${ep}/`);
export const seriesPath = (series: string) => url(`truyen/${series}/`);

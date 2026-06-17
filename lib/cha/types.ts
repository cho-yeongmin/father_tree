export interface ChaListItem {
  name: string;
  nameHanja: string;
  region: string;
  district: string;
  admin: string;
  ccbaKdcd: string;
  ccbaCtcd: string;
  ccbaAsno: string;
  ccbaCpno: string;
  latitude: number;
  longitude: number;
}

export interface ChaDetailItem {
  address: string;
  content: string;
  imageUrl: string;
  designatedAt: string;
  region: string;
  district: string;
}

export interface ChaImageItem {
  url: string;
  description: string;
}

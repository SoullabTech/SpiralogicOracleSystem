export interface Metadata {
  timestamp: string | number;
  clientId?: string;
  element?: string;
  processedAt?: string;
  prefect?: any;
  guide?: boolean;
  mentor?: boolean;
  category?: string;
  adviceType?: string;
  [key: string]: any;
}
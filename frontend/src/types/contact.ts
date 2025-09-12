export interface ContactInfo {
  id?: number;
  email: string;
  phone: string;
  address: string;
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  google_map_link: string;
}

export interface ContactFormData {
  email: string;
  phone: string;
  address: string;
  business_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  google_map_link?: string;
}

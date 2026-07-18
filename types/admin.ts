export type AdminConfig = {
  allowAnySignedInUser: boolean;
  adminUserIds: string[];
  notes?: string;
};

export type BankTransferConfig = {
  enabled: boolean;
  beneficiary: string;
  iban: string;
  bic: string;
  bankName: string;
  referencePrefix: string;
  paymentWindowHours: number;
  instructions: string;
  phone: string;
};

export type GoogleShoppingConfig = {
  enabled: boolean;
  currency: string;
  country: string;
  language: string;
  brand: string;
  condition: "new" | "used" | "refurbished";
  defaultGoogleProductCategory: string;
  shipping: {
    country: string;
    service: string;
    price: number;
  };
};
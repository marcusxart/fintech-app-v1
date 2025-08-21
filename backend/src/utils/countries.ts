export interface Country {
  name: string;
  dialCode: string;
  countryCode: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
}

export const countries: Country[] = [
  {
    name: "Nigeria",
    dialCode: "+234",
    countryCode: "NGA",
    currency: "Naira",
    currencyCode: "NGN",
    currencySymbol: "₦",
  },
  {
    name: "Ghana",
    dialCode: "+233",
    countryCode: "GHA",
    currency: "Ghanaian Cedi",
    currencyCode: "GHS",
    currencySymbol: "₵",
  },
];

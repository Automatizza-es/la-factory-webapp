export interface InvoiceDetails {
  companyName: string;
  nif: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
}

export function hasInvoiceDetails(details: InvoiceDetails): boolean {
  return [details.companyName, details.nif, details.address, details.city,
    details.postalCode, details.province, details.country]
    .every((value) => typeof value === "string" && value.trim().length > 0);
}

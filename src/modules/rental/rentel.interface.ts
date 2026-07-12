export interface IRentalItem {
  gearItemId: string;
  quantity: number;
}

export interface ICreateRental {
  startDate: string;
  endDate: string;
  items: IRentalItem[];
}

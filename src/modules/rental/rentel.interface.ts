export interface IRentalItem {
  gearItemId: string;
  quantity: number;
}

export interface ICreateRental {
  startDate: string;
  endDate: string;
  items: IRentalItem[];
}

export interface IRentalQuery {
  status?: string;
  page?: string;
  limit?: string;
}

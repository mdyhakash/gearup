export interface ICreateReview {
  rentalOrderId: string;
  gearItemId: string;
  rating: number;
  comment?: string;
}

export interface IReviewQuery {
  page?: string;
  limit?: string;
}

import { StyleValue } from "./style-value";

type Rating = {
  styleValueByStyles: StyleValue;
  content: string;
  star: number;
  fullname: string;
  image: string;
  createdAt: Date;
};

type RatingResponse = Rating;
export type { Rating, RatingResponse };

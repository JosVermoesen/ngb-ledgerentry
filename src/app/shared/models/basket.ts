import { FGuid } from '../functions/guid';

export interface IBasket {
  id: string;
  items: IBasketItem[];
  description: string;
  entryDate: string;
  squareControl: number;
}

export interface IBasketItem {
  id: string;
  dcOption: string;
  amount: number;
  account: string;
  tAccount: string;
}

export class Basket implements IBasket {
  id = FGuid();
  items: IBasketItem[] = [];
  description: string;
  entryDate: string;
  squareControl: number;
}

export interface IBasketSolde {
  ctrlSolde: number;
}

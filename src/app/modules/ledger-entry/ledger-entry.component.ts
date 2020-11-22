import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import * as moment from 'moment';

import { FGuid } from '../../shared/functions/guid';
import { IBasket, IBasketItem, IBasketSolde } from '../../shared/models/basket';
import { BasketService } from '../../shared/services/basket.service';

@Component({
  selector: 'app-ledger-entry',
  templateUrl: './ledger-entry.component.html',
  styleUrls: ['./ledger-entry.component.scss']
})
export class LedgerEntryComponent implements OnInit {
  ledgerEntryHeaderForm: FormGroup;
  entryHeaderLocked: boolean;
  descriptionAsHeader: string;
  dateAsHeader: string;

  ledgerEntryForm: FormGroup;

  btnAddOrEdit: string;
  readyForBooking = false;
  totalSolde: number;

  loaded = false;
  basket$: Observable<IBasket>;
  basketJson: IBasket = null;
  selectedBasketItem: IBasketItem;
  basketSolde$: Observable<IBasketSolde>;

  constructor(
    private basketService: BasketService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    // check open redis session for ledgerEntry
    const entryId = localStorage.getItem('ledgerEntry_id');
    if (entryId) {
      this.basketService.getLedgerEntry(entryId)
        .subscribe(() => {
          console.log('initialised ledgerEntry');
          this.basket$ = this.basketService.basket$;
          this.basketSolde$ = this.basketService.basketSolde$;
          this.refreshBasket();

          const ledgerEntryId = localStorage.getItem('ledgerEntry_id');
          if (ledgerEntryId) {
            this.descriptionAsHeader = this.basketJson.description;
            const ioDate = this.basketJson.entryDate;
            const momentDate = moment(ioDate).format('YYYY-MM-DD');
            this.dateAsHeader = momentDate;
            this.entryHeaderLocked = true;
          } else {
            this.descriptionAsHeader = null;
            const momentDate = moment().format('YYYY-MM-DD');
            this.dateAsHeader = momentDate;
            this.entryHeaderLocked = false;
          }

          this.ledgerEntryHeaderForm = this.fb.group({
            description: [this.descriptionAsHeader, Validators.required],
            lDate: [this.dateAsHeader, Validators.required]
          });

          this.btnAddOrEdit = 'Add';
          this.clearState();

        }, error => {
          console.log('there is an error: ', error);
        });
    }


  }

  refreshBasket() {
    this.basketJson = this.basketService.getCurrentBasketValue();
    this.loaded = true;
  }

  onSubmit() {
    if (this.ledgerEntryForm.valid) {
      const basketItem: IBasketItem = Object.assign(
        {},
        this.ledgerEntryForm.value
      );
      this.loaded = false;
      const entryDescription = this.ledgerEntryHeaderForm.value.description;
      const entryDate = this.ledgerEntryHeaderForm.value.lDate;

      this.basketService.addItemToBasket(basketItem, entryDescription, entryDate, -1);
    }
    this.refreshBasket();
    this.clearState();
  }

  clearState() {
    this.readyForBooking = false;

    this.ledgerEntryForm = this.fb.group({
      id: FGuid(),
      dcOption: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      account: [
        null,
        [Validators.required, Validators.minLength(3), Validators.maxLength(7)]
      ],
      tAccount: [null]
    });
  }

  checkBalance() {

  }

  onBooking() {
    if (confirm('Are you sure?')) {
      // send to redis API
    }
  }

  onSelect(item: IBasketItem) {
    // console.log(item);
    this.setForUpdate(item);
  }

  setForUpdate(item: IBasketItem) {
    // this.readyForBooking = false;

    this.ledgerEntryForm = this.fb.group({
      id: item.id,
      dcOption: [item.dcOption, Validators.required],
      amount: [item.amount, [Validators.required, Validators.min(0.01)]],
      account: [
        item.account,
        [Validators.required, Validators.minLength(3), Validators.maxLength(7)]
      ],
      tAccount: [item.tAccount]
    });
    this.btnAddOrEdit = 'Save';
  }

  onDelete(item: IBasketItem) {
    // console.log(item);
    if (confirm('Are you sure?')) {
      this.loaded = false;
      this.basketService.removeItemFromBasket(item);
      this.refreshBasket();
    }
  }

  getColor(option: string) {
    switch (option.substring(0, 1)) {
      case 'D':
        return 'blue'; // debit

      case 'C':
        return 'red'; // credit

      case 'T':
        return 'green'; // with t bookingnumber
    }
  }

  clearEntry() { }
}

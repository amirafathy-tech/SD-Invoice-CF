import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from '../shared/ApiService.service';
import { MainItemServiceInvoice } from './service-invoice.model';
    
@Injectable()
export class ServiceInvoiceService {



  
  private mainItems: MainItemServiceInvoice[] = [];

  // Add a new MainItem
  // addMainItem(item: MainItemServiceInvoice) {
  //   item.serviceInvoiceCode = this.mainItems.length + 1;
  //   this.mainItems.push(item);
  //   console.log(this.mainItems);
  // }

  //  // Retrieve all MainItems
  //  getMainItems(): MainItemServiceInvoice[] {
  //   return this.mainItems;
  // }

    recordsChanged = new Subject<MainItemServiceInvoice[]>();
    startedEditing = new Subject<number>();
    constructor(private apiService: ApiService) { }
    private recordsApi!: MainItemServiceInvoice[]
  
    getRecords() {
      this.apiService.get<MainItemServiceInvoice[]>('serviceinvoice').subscribe(response => {
        console.log(response);
        this.recordsApi = response;
        this.recordsChanged.next(this.recordsApi);
      });
    }
  
    getRecord(index: number): Observable<MainItemServiceInvoice> {
      return this.apiService.getID<MainItemServiceInvoice>('serviceinvoice', index);
    }
   
    addRecord(record: MainItemServiceInvoice) {
      this.apiService.post<MainItemServiceInvoice>('serviceinvoice', record).subscribe((response: MainItemServiceInvoice) => {
        console.log('MainItemServiceInvoice  created:', response);
        this.getRecords();
        return response
      });
    }
  
    updateRecord(index: number, newRecord: MainItemServiceInvoice) {
      this.apiService.put<MainItemServiceInvoice>('serviceinvoice', index, newRecord).subscribe(response => {
        console.log('MainItemServiceInvoice updated:',response);
        this.getRecords()
      });
    }
  
    deleteRecord(index: any) {
      this.apiService.delete<MainItemServiceInvoice>('serviceinvoice', index).subscribe(response => {
        console.log('mainitem deleted:',response);
        this.getRecords()
      });
    }

    getMainItemsWithSubItemsData() {
        return [
            {
                id: 1000,
                code: 'f230fh0g3',
                serviceNumber: 'Service 1',
                description: 'Service Description',
                quantity: 24,
                uom: 'KM',
                formula:'formula 1',
                amountPerUnit: 6500,
                currency: 'EGP',
                total: 20000,
                profitMargin: 5,
                totalWithProfit: 18000,
                selected: false,
                subItems: [
                    {
                        id: 1000-0,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 65000,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    },
                    {
                        id: 1000-1,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 6500,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    },
                    {
                        id: 1000-2,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 6500,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    },
                    {
                        id: 1000-3,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 6500,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    }
                ]
            },
            {
                id: 1001,
                code: 'f230fh0g3',
                serviceNumber: 'Service 1',
                description: 'Service Description',
                quantity: 24,
                uom: 'KM',
                formula:'formula 1',
                amountPerUnit: 6500,
                currency: 'EGP',
                total: 20000,
                profitMargin: 5,
                totalWithProfit: 18000,
                selected: false,
                subItems: [
                    {
                        id: 1000-0,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 65000,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    },
                    {
                        id: 1000-1,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 6500,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    },
                    {
                        id: 1000-2,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 6500,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    },
                    {
                        id: 1000-3,
                        mainCode: 'f230fh0g3',
                        serviceNumber: 'Service sub 1',
                        description: 'Service Description',
                        quantity: 24,
                        uom: 'KM',
                        formula:'formula 1',
                        amountPerUnit: 6500,
                        currency: 'EGP',
                        total: 20000,
                        selected: false
                    }
                ]
            },
           
           
        ];
    }

    getMainItemsWithSubItems() {
        return Promise.resolve(this.getMainItemsWithSubItemsData());
    }
};
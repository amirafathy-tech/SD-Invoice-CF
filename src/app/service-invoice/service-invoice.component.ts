import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ServiceInvoiceService } from './service-invoice.service';
import { MainItemServiceInvoice } from './service-invoice.model';
import { ApiService } from '../shared/ApiService.service';
import * as FileSaver from 'file-saver';
import { MainItemExecutionOrder } from '../models/execution-order.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-invoice',
  templateUrl: './service-invoice.component.html',
  styleUrls: ['./service-invoice.component.css'],
  providers: [MessageService, ServiceInvoiceService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ServiceInvoiceComponent {


  //cloud data:
  documentNumber!: number;
  itemNumber!: number;
  customerId!: number;
  itemText:string="";
  displayExecutionDocumentDialog = false;
  executionDocumentNumber: string = '';

  savedInMemory: boolean = false;

  public rowIndex = 0;
  executionOrders: MainItemExecutionOrder[] = [];
  serviceInvoiceRecords: MainItemServiceInvoice[] = [];
  displayExecutionOrderDialog: boolean = false;
  selectedExecutionOrders: MainItemExecutionOrder[] = [];
  selectedServiceInvoice: MainItemServiceInvoice[] = [];

  lineNumber: string = "";
  executionOrderWithlineNumber?: MainItemExecutionOrder;
  savedServiceInvoice?: MainItemServiceInvoice

  searchKey: string = ""
  currency: any
  totalValue: number = 0.0
  loading: boolean = true;

  constructor(private cdr: ChangeDetectorRef, private router: Router, private _ApiService: ApiService, private _ServiceInvoiceService: ServiceInvoiceService, private messageService: MessageService, private confirmationService: ConfirmationService) {
    this.documentNumber = this.router.getCurrentNavigation()?.extras.state?.['documentNumber'];
    this.itemNumber = this.router.getCurrentNavigation()?.extras.state?.['itemNumber'];
    this.customerId = this.router.getCurrentNavigation()?.extras.state?.['customerId'];
    console.log(this.documentNumber, this.itemNumber, this.customerId);
  }

    // Initial calculation of totalValue (call this when initializing the component)
    calculateTotalValue(): void {
      this.totalValue = this.serviceInvoiceRecords.reduce((sum, item) => sum + (item.total || 0), 0);
    }
  
    // Call this method when the mainItemsRecords array is updated
    updateTotalValueAfterAction(): void {
      this.calculateTotalValue();
      console.log('Updated Total Value:', this.totalValue);
    }


  openDocumentDialog() {
    this.displayExecutionDocumentDialog = true;
  }


  getExecutionOrdersByDocument() {
    if (this.executionDocumentNumber) {
      this.displayExecutionDocumentDialog = false;

      // Fetch data based on document number and update the table
      this._ApiService.get<MainItemExecutionOrder[]>(`executionordermain/referenceid?referenceId=${this.executionDocumentNumber}`).subscribe({
        next: (res) => {
          this.executionOrders = res.sort((a, b) => a.executionOrderMainCode - b.executionOrderMainCode);
          console.log(this.executionOrders);
          // this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
        }
      });
    } else {
      console.warn('Please enter a valid document number');
    }
  }

  getExecutionOrders() {
    this._ApiService.get<MainItemExecutionOrder[]>(`executionordermain/all`).subscribe({
      next: (res) => {
        this.executionOrders = res.sort((a, b) => a.executionOrderMainCode - b.executionOrderMainCode);
        console.log(this.executionOrders);
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {
      }
    });

  }
  getAppServiceInvoice() {
    this._ApiService.get<MainItemServiceInvoice[]>(`serviceinvoice`).subscribe({
      next: (res) => {
        this.serviceInvoiceRecords = res.sort((a, b) => a.serviceInvoiceCode - b.serviceInvoiceCode);
        console.log(this.serviceInvoiceRecords);
        this.loading = false;
        const filteredRecords = this.serviceInvoiceRecords.filter(record => record.lineTypeCode != "Contingency line");
        this.totalValue = filteredRecords.reduce((sum, record) => sum + record.total, 0);
        console.log('Total Value:', this.totalValue);
      }, error: (err) => {
        console.log(err);
        console.log(err.status);
        if (err.status == 404) {
          this.serviceInvoiceRecords = [];
          this.loading = false;
          this.totalValue = this.serviceInvoiceRecords.reduce((sum, record) => sum + record.total, 0);
          console.log('Total Value:', this.totalValue);
        }
      },
      complete: () => {
      }
    });
  }

  ngOnInit() {
    console.log(this.selectedServiceInvoice);

    if (this.savedInMemory) {
      this.serviceInvoiceRecords = [...this._ServiceInvoiceService.getMainItems()];
      console.log(this.serviceInvoiceRecords);

    }

    this._ApiService.get<MainItemServiceInvoice[]>(`serviceinvoice/referenceid?referenceId=${this.documentNumber}`).subscribe({
      next: (res) => {
        this.serviceInvoiceRecords = res.sort((a, b) => a.serviceInvoiceCode - b.serviceInvoiceCode);
        this.itemText=this.serviceInvoiceRecords[0].debitMemoRequestItemText?this.serviceInvoiceRecords[0].debitMemoRequestItemText:"";
        console.log(this.itemText);

        console.log(this.serviceInvoiceRecords);
        this.loading = false;
        const filteredRecords = this.serviceInvoiceRecords.filter(record => record.lineTypeCode != "Contingency line");
        this.totalValue = filteredRecords.reduce((sum, record) => sum + record.total, 0);
        console.log('Total Value:', this.totalValue);
      }, error: (err) => {
        console.log(err);
        console.log(err.status);
        if (err.status == 404) {
          this.serviceInvoiceRecords = [];
          this.loading = false;
          this.totalValue = this.serviceInvoiceRecords.reduce((sum, record) => sum + record.total, 0);
          console.log('Total Value:', this.totalValue);
        }
      },
      complete: () => {
      }
    });

    this._ApiService.get<MainItemExecutionOrder[]>('executionordermain/all').subscribe(response => {
      this.executionOrders = response.sort((a, b) => a.executionOrderMainCode - b.executionOrderMainCode);
      console.log(this.executionOrders);
    });
  }

  // For Edit  ServiceInvoice MainItem:
  clonedMainItem: { [s: number]: MainItemServiceInvoice } = {};
  onMainItemEditInit(record: MainItemServiceInvoice) {
    this.clonedMainItem[record.serviceInvoiceCode] = { ...record };
  }
  onMainItemEditSave(index: number, record: MainItemServiceInvoice) {
    let executionOrderMainCode: number = 0;
    let executionOrderMain: any
    console.log(record);
    if (record.lineNumber) {
      this._ApiService.get<MainItemExecutionOrder[]>('executionordermain/linenumber', record.lineNumber).subscribe(response => {
        executionOrderMainCode = response[0].executionOrderMainCode;
        executionOrderMain = response[0];
        console.log(executionOrderMain);
        console.log(executionOrderMainCode);

        //record.executionOrderMainCode=executionOrderMainCode;
        record.executionOrderMain = executionOrderMain;

        if ((record.quantity + record.actualQuantity) > record.totalQuantity) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: ' Sum of Quantity and ActualQuantity is greater than TotalQuantity',
            life: 8000
          });
        }
        else {
          console.log(record);

          const updatedMainItem = this.removePropertiesFrom(record, ['serviceInvoiceCode']);
          console.log(updatedMainItem);
          const filteredRecord = Object.fromEntries(
            Object.entries(updatedMainItem).filter(([_, value]) => {
              return value !== '' && value !== 0 && value !== undefined && value !== null;
            })
          ) ;
          console.log(filteredRecord);

          //..................

        const bodyRequest: any = {
          quantity: filteredRecord['quantity'],
          totalQuantity: filteredRecord['totalQuantity'],
          amountPerUnit: filteredRecord['amountPerUnit'],
         // executionOrderMainCode: filteredRecord['executionOrderMainCode'],
         // unlimitedOverFulfillment:filteredRecord['unlimitedOverFulfillment']?filteredRecord['unlimitedOverFulfillment']:false
        };

        this._ApiService.post<any>(`/calculatequantities`, bodyRequest).subscribe({
          next: (res) => {
            console.log('mainitem with total:', res);
            // this.totalValue = 0;
            record.actualQuantity = res.actualQuantity;
            record.remainingQuantity = res.remainingQuantity;
            record.actualPercentage = res.actualPercentage;
            console.log(' Record:', record);

            const filteredRecord = Object.fromEntries(
              Object.entries(record).filter(([_, value]) => {
                return value !== '' && value !== 0 && value !== undefined && value !== null;
              })
            ) as MainItemServiceInvoice;
            console.log(filteredRecord);

            const mainItemIndex = this.serviceInvoiceRecords.findIndex(item => item.serviceInvoiceCode === index);
            if (mainItemIndex > -1) {
              console.log(filteredRecord);
  
              // Replace the object entirely to ensure Angular detects the change
              this.serviceInvoiceRecords[mainItemIndex] = {
                ...this.serviceInvoiceRecords[mainItemIndex],
                ...filteredRecord,
              };
  
              // Ensure the array itself updates its reference
              this.serviceInvoiceRecords = [...this.serviceInvoiceRecords];
  
              this.updateTotalValueAfterAction();

            ///.................
            

            this.updateTotalValueAfterAction();

            console.log(this.serviceInvoiceRecords);

          }
         }, error: (err) => {
            console.log(err);
          },
          complete: () => {
          }
        });

        //..................


          //....................

          // const bodyRequest: any = {
          //   quantity: newRecord.totalQuantity,
          //   amountPerUnit: newRecord.amountPerUnit
          // };
          // this._ApiService.post<any>(`/total`, bodyRequest).subscribe({
          //   next: (res) => {
          //     console.log('mainitem with total:', res);
          //     newRecord.total = res.totalWithProfit;
          //     const mainItemIndex = this.mainItemsRecords.findIndex(item => item.executionOrderMainCode === index);
          //     if (mainItemIndex > -1) {
          //       console.log(newRecord);

          //       // Replace the object entirely to ensure Angular detects the change
          //       this.mainItemsRecords[mainItemIndex] = {
          //         ...this.mainItemsRecords[mainItemIndex],
          //         ...newRecord,
          //       };

          //       // Ensure the array itself updates its reference
          //       this.mainItemsRecords = [...this.mainItemsRecords];

                      //this.updateTotalValueAfterAction();
          //     }
          //     this.cdr.detectChanges();
          //     console.log(this.mainItemsRecords);
          //   }, error: (err) => {
          //     console.log(err);
          //   },
          //   complete: () => {
          //   }
          // });

          ///...................

          // this._ApiService.update<MainItemServiceInvoice>(`serviceinvoice/${this.documentNumber}/${this.itemNumber}/20/1/${this.customerId}`, filteredRecord).subscribe({
          //   next: (res) => {
          //     console.log('serviceInvoice  updated:', res);
          //     this.savedServiceInvoice = res;
          //     this.totalValue = 0;
          //     this.ngOnInit()
          //   }, error: (err) => {
          //     console.log(err);
          //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
          //   },
          //   complete: () => {
          //     console.log(this.savedServiceInvoice);
          //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
          //     // this.savedServiceInvoice=undefined;
          //     // will be commented:
          //     if (executionOrderMainCode && this.savedServiceInvoice) {
          //       this._ApiService.patch<MainItemExecutionOrder>('executionordermain', executionOrderMainCode, { actualQuantity: this.savedServiceInvoice.actualQuantity, actualPercentage: this.savedServiceInvoice.actualPercentage }).subscribe({
          //         next: (res) => {
          //           console.log('execution order updated:', res);
          //           this.ngOnInit()
          //         }, error: (err) => {
          //           console.log(err);
          //         },
          //         complete: () => {
          //           this.savedServiceInvoice = undefined;
          //         }
          //       });
          //     }
          //   }
          // });
        }
      });
    }
    else{
      // if ((record.quantity + record.actualQuantity) > record.totalQuantity) {
      //   this.messageService.add({
      //     severity: 'error',
      //     summary: 'Error',
      //     detail: ' Sum of Quantity and ActualQuantity is greater than TotalQuantity',
      //     life: 8000
      //   });
      // }
      // else {
        console.log(record);

        const updatedMainItem = this.removePropertiesFrom(record, ['serviceInvoiceCode']);
        console.log(updatedMainItem);
        const filteredRecord = Object.fromEntries(
          Object.entries(updatedMainItem).filter(([_, value]) => {
            return value !== '' && value !== 0 && value !== undefined && value !== null;
          })
        ) ;
        console.log(filteredRecord);

        //..................

      const bodyRequest: any = {
        quantity: filteredRecord['quantity'],
        totalQuantity: filteredRecord['totalQuantity'],
        amountPerUnit: filteredRecord['amountPerUnit'],
       // executionOrderMainCode: filteredRecord['executionOrderMainCode'],
       // unlimitedOverFulfillment:filteredRecord['unlimitedOverFulfillment']?filteredRecord['unlimitedOverFulfillment']:false
      };

      this._ApiService.post<any>(`/calculatequantities`, bodyRequest).subscribe({
        next: (res) => {
          console.log('mainitem with total:', res);
          // this.totalValue = 0;
          record.actualQuantity = res.actualQuantity;
          record.remainingQuantity = res.remainingQuantity;
          record.actualPercentage = res.actualPercentage;
          console.log(' Record:', record);

          const filteredRecord = Object.fromEntries(
            Object.entries(record).filter(([_, value]) => {
              return value !== '' && value !== 0 && value !== undefined && value !== null;
            })
          ) as MainItemServiceInvoice;
          console.log(filteredRecord);

          const mainItemIndex = this.serviceInvoiceRecords.findIndex(item => item.serviceInvoiceCode === index);
          if (mainItemIndex > -1) {
            console.log(filteredRecord);

            // Replace the object entirely to ensure Angular detects the change
            this.serviceInvoiceRecords[mainItemIndex] = {
              ...this.serviceInvoiceRecords[mainItemIndex],
              ...filteredRecord,
            };

            // Ensure the array itself updates its reference
            this.serviceInvoiceRecords = [...this.serviceInvoiceRecords];

            this.updateTotalValueAfterAction();

          ///.................
          

          this.updateTotalValueAfterAction();

          console.log(this.serviceInvoiceRecords);

        }
       }, error: (err) => {
          console.log(err);
        },
        complete: () => {
        }
      });
      }
    //}

  }
  onMainItemEditCancel(row: MainItemServiceInvoice, index: number) {
    this.serviceInvoiceRecords[index] = this.clonedMainItem[row.serviceInvoiceCode]
    delete this.clonedMainItem[row.serviceInvoiceCode]
  }
  // Delete ServiceInvoice MainItem 
  deleteRecord() {
    console.log(this.selectedServiceInvoice);
    if (this.selectedServiceInvoice.length) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete the selected record?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          for (const record of this.selectedServiceInvoice) {
            console.log(record);


            this.serviceInvoiceRecords = this.serviceInvoiceRecords.filter(item => item.serviceInvoiceCode !== record.serviceInvoiceCode);
            this.updateTotalValueAfterAction();
            //this.cdr.detectChanges();
            console.log(this.serviceInvoiceRecords);

            // this._ApiService.delete<MainItemServiceInvoice>('serviceinvoice', record.serviceInvoiceCode).subscribe({
            //   next: (res) => {
            //     console.log('serviceinvoice deleted :', res);
            //     this.totalValue = 0;
            //     this.ngOnInit()
            //   }, error: (err) => {
            //     console.log(err);
            //   },
            //   complete: () => {
            //     this.messageService.add({ severity: 'success', summary: 'Successfully', detail: 'Deleted', life: 3000 });
            //     this.selectedServiceInvoice = []
            //   }
            // })
          }
          // this.selectedMainItems = []; 
        }
      });
    }

  }

  saveDocument() {
    // if (this.selectedMainItems.length) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to save the document?',
      header: 'Confirm Saving ',
      accept: () => {

        const saveRequests = this.serviceInvoiceRecords.map((item) => ({
          executionOrderMain: item.executionOrderMain, // as an object 
          executionOrderMainCode: item.executionOrderMainCode, // code


          refrenceId: this.documentNumber,
          quantity: item.quantity,
          amountPerUnit: item.amountPerUnit,
          total: item.total,
          serviceNumberCode: item.serviceNumberCode,
          unitOfMeasurementCode: item.unitOfMeasurementCode,
          currencyCode: item.currencyCode,
          description: item.description,

          materialGroupCode: item.materialGroupCode,
          serviceTypeCode: item.serviceTypeCode,
          personnelNumberCode: item.personnelNumberCode,
          lineTypeCode: item.lineTypeCode,

          totalQuantity: item.totalQuantity,

          // quantities:
          actualQuantity: item.actualQuantity,
          actualPercentage: item.actualPercentage,
          remainingQuantity: item.remainingQuantity,


          overFulfillmentPercentage: item.overFulfillmentPercentage,
          unlimitedOverFulfillment: item.unlimitedOverFulfillment,
          manualPriceEntryAllowed: item.manualPriceEntryAllowed,
          externalServiceNumber: item.externalServiceNumber,
          serviceText: item.serviceText,
          lineText: item.lineText,
          lineNumber: item.lineNumber,

          biddersLine: item.biddersLine,
          supplementaryLine: item.supplementaryLine,
          lotCostOne: item.lotCostOne,
          doNotPrint: item.doNotPrint,

        }));

        // Set dynamic parameters for URL
        const url = `serviceinvoice?debitMemoRequest=${this.documentNumber}&debitMemoRequestItem=${this.itemNumber}&pricingProcedureStep=20&pricingProcedureCounter=1&customerNumber=${this.customerId}`;

        // Send the array of bodyRequest objects to the server in a single POST request
        this._ApiService.post<MainItemServiceInvoice[]>(url, saveRequests).subscribe({
          next: (res) => {
            console.log('All main items saved successfully:', res);
            this.serviceInvoiceRecords = res;
            console.log(this.serviceInvoiceRecords);
            
            this.updateTotalValueAfterAction();
            // const lastRecord = res[res.length - 1];
            // this.totalValue = 0;
            // this.totalValue = lastRecord.totalHeader ? lastRecord.totalHeader : 0;

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'The Document has been saved successfully',
              life: 3000
            });

          }, error: (err) => {
            console.error('Error saving main items:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error saving The Document',
              life: 3000
            });
          },
          complete: () => {
            // this.ngOnInit();
          }
        })
        // .toPromise()
        //   .then((responses) => {
        //     console.log('All main items saved successfully:', responses);
        //     this.ngOnInit();

        //     // Optionally, update the saved records as persisted
        //     //  unsavedItems.forEach(item => item.isPersisted = true);

        //     this.messageService.add({
        //       severity: 'success',
        //       summary: 'Success',
        //       detail: 'The Document has been saved successfully',
        //       life: 3000
        //     });
        //   })
        //   .catch((error) => {
        //     console.error('Error saving main items:', error);
        //     this.messageService.add({
        //       severity: 'error',
        //       summary: 'Error',
        //       detail: 'Error saving The Document',
        //       life: 3000
        //     });
        //   });

        // // get the last object of mainItemsRecords and post its total header to the cloud
        // console.log(this.serviceInvoiceRecords[this.serviceInvoiceRecords.length - 1]);
        // const lastRecord = this.serviceInvoiceRecords[this.serviceInvoiceRecords.length - 1];
        // //const bodyRequest=  this.removePropertiesFrom(lastRecord, ['serviceInvoiceCode']);
        // const totalHeader = this.totalValue;
        // //this.serviceInvoiceRecords[this.serviceInvoiceRecords.length -1].totalHeader;
        // console.log(totalHeader);
        // const bodyRequest = {
        //   totalHeader: totalHeader, refrenceId: this.documentNumber, quantity: this.serviceInvoiceRecords[this.serviceInvoiceRecords.length - 1].quantity,
        //   amountPerUnit: this.serviceInvoiceRecords[this.serviceInvoiceRecords.length - 1].amountPerUnit,
        //   totalQuantity: this.serviceInvoiceRecords[this.serviceInvoiceRecords.length - 1].totalQuantity,
        //   unlimitedOverFulfillment: this.serviceInvoiceRecords[this.serviceInvoiceRecords.length - 1].unlimitedOverFulfillment
        // }
        // console.log(bodyRequest);
        // this._ApiService.update<MainItemServiceInvoice>(`serviceinvoice/${this.documentNumber}/${this.itemNumber}/20/1/${this.customerId}`, bodyRequest).subscribe({
        //   next: (res) => {
        //     console.log('serviceInvoice created in s4:', res);
        //     // this.savedServiceInvoice = res;
        //     this.ngOnInit();

        //     this._ApiService.updateApp<MainItemServiceInvoice>(`serviceinvoice`).subscribe({
        //       next: (res) => {
        //         console.log('mainitem Updated with permanent:', res);
        //         this.totalValue = 0;
        //         // this.savedDBApp = false;
        //       }, error: (err) => {
        //         console.log(err);
        //       },
        //       complete: () => {
        //       }
        //     });

        //   }, error: (err) => {
        //     console.log(err);
        //   },
        //   complete: () => {
        //     // console.log(this.savedServiceInvoice);
        //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document saved successfully ' });

        //     // this.savedServiceInvoice=undefined;
        //     // this.selectedExecutionOrders = [];

        //     // will be commented:
        //     // if (mainItem.executionOrderMainCode && this.savedServiceInvoice) {
        //     //   //remainingQuantity: this.savedServiceInvoice.remainingQuantity
        //     //   this._ApiService.patch<MainItemExecutionOrder>('executionordermain', mainItem.executionOrderMainCode, { actualQuantity: this.savedServiceInvoice.actualQuantity, actualPercentage: this.savedServiceInvoice.actualPercentage }).subscribe({
        //     //     next: (res) => {
        //     //       console.log('execution order updated:', res);

        //     //       const index = this.selectedExecutionOrders.findIndex(order => order.executionOrderMainCode === mainItem.executionOrderMainCode);
        //     //       if (index !== -1) {
        //     //         this.selectedExecutionOrders.splice(index, 1);
        //     //       }
        //     //       this.ngOnInit()
        //     //     }, error: (err) => {
        //     //       console.log(err);
        //     //     },
        //     //     complete: () => {
        //     //       this.savedServiceInvoice = undefined;
        //     //     }
        //     //   });
        //     //   // this.selectedExecutionOrders = [];
        //     // }

        //   }
        // });

      }, reject: () => {
        // delete the added records and get the last object of mainItemsRecords and post its total header to the cloud:
        // this._ApiService.deleteFromApp<MainItemServiceInvoice>(`serviceinvoice`).subscribe({
        //   next: (res) => {
        //     console.log('mainitem deleted with temporary:', res);
        //     this.totalValue = 0;
        //     //this.savedDBApp = false;

        //     // this.getCloudDocument();
        //     this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });

        //   }, error: (err) => {
        //     console.log(err);
        //   },
        //   complete: () => {
        //   }
        // });
      }
    });
    //}
  }
  // For Add new  Main Item
  addMainItem() {
    if (this.executionOrderWithlineNumber) {
      console.log(this.executionOrderWithlineNumber);
      const newRecord: MainItemServiceInvoice = {

        executionOrderMainCode: this.executionOrderWithlineNumber.executionOrderMainCode,
        executionOrderMain: undefined,
        // executionOrderMain: this.executionOrderWithlineNumber,

        serviceNumberCode: this.executionOrderWithlineNumber.serviceNumberCode,
        description: this.executionOrderWithlineNumber.description,
        unitOfMeasurementCode: this.executionOrderWithlineNumber.unitOfMeasurementCode,
        currencyCode: this.executionOrderWithlineNumber.currencyCode,

        materialGroupCode: this.executionOrderWithlineNumber.materialGroupCode,
        serviceTypeCode: this.executionOrderWithlineNumber.serviceTypeCode,
        personnelNumberCode: this.executionOrderWithlineNumber.personnelNumberCode,
        lineTypeCode: this.executionOrderWithlineNumber.lineTypeCode,

        totalQuantity: this.executionOrderWithlineNumber.totalQuantity ? this.executionOrderWithlineNumber.totalQuantity : 0,

        quantity: this.executionOrderWithlineNumber.serviceQuantity ? this.executionOrderWithlineNumber.serviceQuantity : 0,

        amountPerUnit: this.executionOrderWithlineNumber.amountPerUnit,
        total: this.executionOrderWithlineNumber.total,
        // remainingQuantity:,
        // actualQuantity: this.newMainItem.actualQuantity,
        // actualPercentage: this.newMainItem.actualPercentage,
        overFulfillmentPercentage: this.executionOrderWithlineNumber.overFulfillmentPercentage,
        unlimitedOverFulfillment: this.executionOrderWithlineNumber.unlimitedOverFulfillment,
        manualPriceEntryAllowed: this.executionOrderWithlineNumber.manualPriceEntryAllowed,
        externalServiceNumber: this.executionOrderWithlineNumber.externalServiceNumber,
        serviceText: this.executionOrderWithlineNumber.serviceText,
        lineText: this.executionOrderWithlineNumber.lineText,
        lineNumber: this.executionOrderWithlineNumber.lineNumber,

        biddersLine: this.executionOrderWithlineNumber.biddersLine,
        supplementaryLine: this.executionOrderWithlineNumber.supplementaryLine,
        lotCostOne: this.executionOrderWithlineNumber.lotCostOne,
        doNotPrint: this.executionOrderWithlineNumber.doNotPrint,

        serviceInvoiceCode: 0,

        totalHeader: 0,
        actualQuantity: 0
      }
      console.log(newRecord);
      //this.executionOrderWithlineNumber.serviceQuantity
      if (newRecord.quantity === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: ' Quantity is required',
          life: 8000
        });
      }
      else {
        console.log(newRecord);

        //..................

        const bodyRequest: any = {
          quantity: newRecord.quantity,
          totalQuantity: newRecord.totalQuantity,
          amountPerUnit: newRecord.amountPerUnit,
          executionOrderMainCode: newRecord.executionOrderMainCode,
          unlimitedOverFulfillment:newRecord.unlimitedOverFulfillment?newRecord.unlimitedOverFulfillment:false
        };

        this._ApiService.post<any>(`/quantities`, bodyRequest).subscribe({
          next: (res) => {
            console.log('mainitem with total:', res);
            // this.totalValue = 0;
            newRecord.actualQuantity = res.actualQuantity;
            newRecord.remainingQuantity = res.remainingQuantity;
            newRecord.actualPercentage = res.actualPercentage;
            console.log(' Record:', newRecord);

            const filteredRecord = Object.fromEntries(
              Object.entries(newRecord).filter(([_, value]) => {
                return value !== '' && value !== 0 && value !== undefined && value !== null;
              })
            ) as MainItemServiceInvoice;
            console.log(filteredRecord);

            ///.................
            this._ServiceInvoiceService.addMainItem(filteredRecord);

            this.savedInMemory = true;
           // this.cdr.detectChanges();

            const newMainItems = this._ServiceInvoiceService.getMainItems();

            // Combine the current mainItemsRecords with the new list, ensuring no duplicates
            this.serviceInvoiceRecords = [
              ...this.serviceInvoiceRecords.filter(item => !newMainItems.some(newItem => newItem.serviceInvoiceCode === item.serviceInvoiceCode)), // Remove existing items
              ...newMainItems
            ];

            this.updateTotalValueAfterAction();

            console.log(this.serviceInvoiceRecords);
            this.resetNewMainItem();
            this.executionOrderWithlineNumber = undefined;

          }, error: (err) => {
            console.log(err);
          },
          complete: () => {
          }
        });

        //..................
        // Remove properties with empty or default values
        // const filteredRecord = Object.fromEntries(
        //   Object.entries(newRecord).filter(([_, value]) => {
        //     return value !== '' && value !== 0 && value !== undefined && value !== null;
        //   })
        // ) as MainItemServiceInvoice;
        // console.log(filteredRecord);

        // ///.................
        // this._ServiceInvoiceService.addMainItem(filteredRecord);

        // this.savedInMemory = true;
        // this.cdr.detectChanges();

        // const newMainItems = this._ServiceInvoiceService.getMainItems();

        // // Combine the current mainItemsRecords with the new list, ensuring no duplicates
        // this.serviceInvoiceRecords = [
        //   ...this.serviceInvoiceRecords.filter(item => !newMainItems.some(newItem => newItem.serviceInvoiceCode === item.serviceInvoiceCode)), // Remove existing items
        //   ...newMainItems
        // ];
        // console.log(this.serviceInvoiceRecords);
        // this.resetNewMainItem();
        // this.executionOrderWithlineNumber = undefined;
        //...................

        // this._ApiService.post<MainItemServiceInvoice>(`serviceinvoice`, filteredRecord).subscribe({
        //   next: (res) => {
        //     console.log('serviceInvoice created:', res);
        //     this.savedServiceInvoice = res;
        //     this.ngOnInit()
        //   }, error: (err) => {
        //     console.log(err);
        //   },
        //   complete: () => {
        //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
        //     //this.ngOnInit()
        //     console.log(this.savedServiceInvoice);

        //     // this.savedServiceInvoice=undefined
        //     // this.executionOrderWithlineNumber = undefined;
        //     // will be commented:
        //     if (this.executionOrderWithlineNumber?.executionOrderMainCode && this.savedServiceInvoice) {
        //       this._ApiService.patch<MainItemExecutionOrder>('executionordermain', this.executionOrderWithlineNumber.executionOrderMainCode, { actualQuantity: this.savedServiceInvoice.actualQuantity, actualPercentage: this.savedServiceInvoice.actualPercentage }).subscribe({
        //         next: (res) => {
        //           console.log('execution order updated:', res);
        //           this.ngOnInit()
        //         }, error: (err) => {
        //           console.log(err);
        //         },
        //         complete: () => {
        //           this.savedServiceInvoice = undefined
        //           this.executionOrderWithlineNumber = undefined;
        //         }
        //       });
        //       this.executionOrderWithlineNumber = undefined;
        //     }
        //     //
        //   }
        // });
      }
    }
  }
  cancelMainItemExecutionOrder(item: any): void {
    this.selectedExecutionOrders = this.selectedExecutionOrders.filter(i => i !== item);
  }
  // for selected execution orders:
  saveMainItem(mainItem: MainItemExecutionOrder) {
    console.log(mainItem);
    const newRecord: MainItemServiceInvoice = {
      executionOrderMainCode: mainItem.executionOrderMainCode,
      executionOrderMain: undefined,
      //executionOrderMain: mainItem,
      serviceNumberCode: mainItem.serviceNumberCode,
      description: mainItem.description,
      unitOfMeasurementCode: mainItem.unitOfMeasurementCode,
      currencyCode: mainItem.currencyCode,

      materialGroupCode: mainItem.materialGroupCode,
      serviceTypeCode: mainItem.serviceTypeCode,
      personnelNumberCode: mainItem.personnelNumberCode,
      lineTypeCode: mainItem.lineTypeCode,

      totalQuantity: mainItem.totalQuantity ? mainItem.totalQuantity : 0,

      quantity: mainItem.serviceQuantity ? mainItem.serviceQuantity : 0,

      amountPerUnit: mainItem.amountPerUnit,
      total: mainItem.total,

      //remainingQuantity: (mainItem.remainingQuantity ?? 0) - (mainItem.serviceQuantity ?? 0),
      // actualQuantity: (mainItem.actualQuantity ?? 0) + (mainItem.serviceQuantity ?? 0),
      // actualPercentage: this.newMainItem.actualPercentage,
      overFulfillmentPercentage: mainItem.overFulfillmentPercentage,
      unlimitedOverFulfillment: mainItem.unlimitedOverFulfillment,
      manualPriceEntryAllowed: mainItem.manualPriceEntryAllowed,
      externalServiceNumber: mainItem.externalServiceNumber,
      serviceText: mainItem.serviceText,
      lineText: mainItem.lineText,
      lineNumber: mainItem.lineNumber,

      biddersLine: mainItem.biddersLine,
      supplementaryLine: mainItem.supplementaryLine,
      lotCostOne: mainItem.lotCostOne,
      doNotPrint: mainItem.doNotPrint,


      // temporaryDeletion: "temporary",
      referenceId: this.documentNumber,

      serviceInvoiceCode: 0,
      totalHeader: 0,
      actualQuantity: 0,

    }
    console.log(newRecord);
    // mainItem.serviceQuantity
    if (newRecord.quantity === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: ' Quantity is required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);
      //................


      const bodyRequest: any = {
        quantity: newRecord.quantity,
        totalQuantity: newRecord.totalQuantity,
        amountPerUnit: newRecord.amountPerUnit,
        executionOrderMainCode: newRecord.executionOrderMainCode,
        unlimitedOverFulfillment:newRecord.unlimitedOverFulfillment?newRecord.unlimitedOverFulfillment:false
        //newRecord.unlimitedOverFulfillment
      };
      this._ApiService.post<any>(`/quantities`, bodyRequest).subscribe({
        next: (res) => {
          console.log('mainitem with total:', res);
          // this.totalValue = 0;
          newRecord.actualQuantity = res.actualQuantity;
          newRecord.remainingQuantity = res.remainingQuantity;
          newRecord.actualPercentage = res.actualPercentage;
          console.log(' Record:', newRecord);

          const filteredRecord = Object.fromEntries(
            Object.entries(newRecord).filter(([_, value]) => {
              return value !== '' && value !== 0 && value !== undefined && value !== null;
            })
          ) as MainItemServiceInvoice;
          console.log(filteredRecord);
          this._ServiceInvoiceService.addMainItem(filteredRecord);

          this.savedInMemory = true;
         // this.cdr.detectChanges();

          const newMainItems = this._ServiceInvoiceService.getMainItems();

          // Combine the current mainItemsRecords with the new list, ensuring no duplicates
          this.serviceInvoiceRecords = [
            ...this.serviceInvoiceRecords.filter(item => !newMainItems.some(newItem => newItem.serviceInvoiceCode === item.serviceInvoiceCode)), // Remove existing items
            ...newMainItems
          ];

          this.updateTotalValueAfterAction();

          console.log(this.serviceInvoiceRecords);
          this.resetNewMainItem();
          const index = this.selectedExecutionOrders.findIndex(order => order.executionOrderMainCode === mainItem.executionOrderMainCode);
          if (index !== -1) {
            this.selectedExecutionOrders.splice(index, 1);
          }

        }, error: (err) => {
          console.log(err);
        },
        complete: () => {
        }
      });
      //................
      // const filteredRecord = Object.fromEntries(
      //   Object.entries(newRecord).filter(([_, value]) => {
      //     return value !== '' && value !== 0 && value !== undefined && value !== null;
      //   })
      // ) as MainItemServiceInvoice;
      // console.log(filteredRecord);
      // ///.................
      // this._ServiceInvoiceService.addMainItem(filteredRecord);

      // this.savedInMemory = true;
      // this.cdr.detectChanges();

      // const newMainItems = this._ServiceInvoiceService.getMainItems();

      // // Combine the current mainItemsRecords with the new list, ensuring no duplicates
      // this.serviceInvoiceRecords = [
      //   ...this.serviceInvoiceRecords.filter(item => !newMainItems.some(newItem => newItem.serviceInvoiceCode === item.serviceInvoiceCode)), // Remove existing items
      //   ...newMainItems
      // ];
      // console.log(this.serviceInvoiceRecords);
      // this.resetNewMainItem();
      // const index = this.selectedExecutionOrders.findIndex(order => order.executionOrderMainCode === mainItem.executionOrderMainCode);
      // if (index !== -1) {
      //   this.selectedExecutionOrders.splice(index, 1);
      // }
      //this.selectedExecutionOrders = [];



      //...................

      // this._ApiService.post<MainItemServiceInvoice>(`serviceinvoice`, filteredRecord).subscribe({
      //   next: (res) => {
      //     console.log('serviceInvoice created:', res);
      //     this.savedServiceInvoice = res;
      //     this.ngOnInit();
      //     //this.getAppServiceInvoice();
      //   }, error: (err) => {
      //     console.log(err);
      //   },
      //   complete: () => {
      //     console.log(this.savedServiceInvoice);
      //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });

      //     // this.savedServiceInvoice=undefined;
      //     // this.selectedExecutionOrders = [];

      //     // will be commented:
      //     if (mainItem.executionOrderMainCode && this.savedServiceInvoice) {
      //       //remainingQuantity: this.savedServiceInvoice.remainingQuantity
      //       this._ApiService.patch<MainItemExecutionOrder>('executionordermain', mainItem.executionOrderMainCode, { actualQuantity: this.savedServiceInvoice.actualQuantity, actualPercentage: this.savedServiceInvoice.actualPercentage }).subscribe({
      //         next: (res) => {
      //           console.log('execution order updated:', res);

      //           const index = this.selectedExecutionOrders.findIndex(order => order.executionOrderMainCode === mainItem.executionOrderMainCode);
      //           if (index !== -1) {
      //             this.selectedExecutionOrders.splice(index, 1);
      //           }
      //           this.ngOnInit()
      //         }, error: (err) => {
      //           console.log(err);
      //         },
      //         complete: () => {
      //           this.savedServiceInvoice = undefined;
      //         }
      //       });
      //       // this.selectedExecutionOrders = [];
      //     }

      //   }
      // });
    }
  }
  //Export  to Excel Sheet
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const selectedRows = this.serviceInvoiceRecords;
      const worksheet = xlsx.utils.json_to_sheet(selectedRows);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'Service Invoice');
    });
  }
  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  // Helper Functions:
  removePropertiesFrom(obj: any, propertiesToRemove: string[]): any {
    const newObj: any = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          // If the property is an array, recursively remove properties from each element
          newObj[key] = obj[key].map((item: any) => this.removeProperties(item, propertiesToRemove));
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // If the property is an object, recursively remove properties from the object
          newObj[key] = this.removeProperties(obj[key], propertiesToRemove);
        } else if (!propertiesToRemove.includes(key)) {
          // Otherwise, copy the property if it's not in the list to remove
          newObj[key] = obj[key];
        }
      }
    }

    return newObj;
  }
  removeProperties(obj: any, propertiesToRemove: string[]): any {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      if (!propertiesToRemove.includes(key)) {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  }
  showExecutionOrderDialog() {
    this.displayExecutionOrderDialog = true;
  }
  saveSelection() {
    console.log(this.serviceInvoiceRecords);
    console.log('Selected items:', this.selectedExecutionOrders);
    this.displayExecutionOrderDialog = false;
  }

  searchLineNumber(lineNumber: string) {
    if (lineNumber) {
      this._ApiService.get<MainItemExecutionOrder[]>('executionordermain/linenumber', lineNumber).subscribe(response => {
        this.executionOrderWithlineNumber = response[0]
        console.log(this.executionOrderWithlineNumber);
      });
      console.log(lineNumber);
    }
    else {
      this.executionOrderWithlineNumber = undefined
      console.log(this.executionOrderWithlineNumber);
    }
  }
  // to handel checkbox selection:
  selectedMainItems: MainItemServiceInvoice[] = [];
  onMainItemSelection(event: any, mainItem: MainItemServiceInvoice) {

    mainItem.selected = event.checked;
    console.log(event.checked);
    console.log(this.selectedMainItems);

    if (mainItem.selected) {
      this.selectedMainItems.push(mainItem);
      console.log(this.selectedMainItems);
    }
    else {
      const index = this.selectedMainItems.indexOf(mainItem);
      console.log(index);
      if (index !== -1) {
        this.selectedMainItems.splice(index, 1);
        console.log(this.selectedMainItems);
      }

    }
  }
  // to handle All Records Selection / Deselection 
  selectedAllRecords: MainItemServiceInvoice[] = [];
  onSelectAllRecords(event: any): void {
    if (Array.isArray(event.checked) && event.checked.length > 0) {
      this.selectedAllRecords = [...this.serviceInvoiceRecords];
      console.log(this.selectedAllRecords);
    } else {
      this.selectedAllRecords = [];
    }
  }

  newMainItem: MainItemServiceInvoice = {
    serviceInvoiceCode: 0,
    executionOrderMainCode: 0,
    serviceNumberCode: 0,
    description: "",
    unitOfMeasurementCode: "",
    currencyCode: "",
    materialGroupCode: "",
    serviceTypeCode: "",
    personnelNumberCode: "",
    lineTypeCode: "",

    totalQuantity: 0,
    amountPerUnit: 0,
    total: 0,
    totalHeader: 0,
    actualQuantity: 0,
    actualPercentage: 0,
    overFulfillmentPercentage: 0,
    unlimitedOverFulfillment: false,
    manualPriceEntryAllowed: false,
    externalServiceNumber: "",
    serviceText: "",
    lineText: "",
    lineNumber: "",

    biddersLine: false,
    supplementaryLine: false,
    lotCostOne: false,
    doNotPrint: false,
    quantity: 0,

    executionOrderMain: undefined,
    //debitMemoRequestItemText:"",
  };
  resetNewMainItem() {
    this.newMainItem = {
      serviceInvoiceCode: 0,
      executionOrderMainCode: 0,
      serviceNumberCode: 0,
      description: "",
      unitOfMeasurementCode: "",
      currencyCode: "",
      materialGroupCode: "",
      serviceTypeCode: "",
      personnelNumberCode: "",
      lineTypeCode: "",

      totalQuantity: 0,
      amountPerUnit: 0,
      total: 0,
      totalHeader: 0,
      actualQuantity: 0,
      actualPercentage: 0,
      overFulfillmentPercentage: 0,
      unlimitedOverFulfillment: false,
      manualPriceEntryAllowed: false,
      externalServiceNumber: "",
      serviceText: "",
      lineText: "",
      lineNumber: "",

      biddersLine: false,
      supplementaryLine: false,
      lotCostOne: false,
      doNotPrint: false,
      quantity: 0,
      executionOrderMain: undefined,
      //debitMemoRequestItemText:"",
    }
  }

}

import { Pipe, PipeTransform } from '@angular/core';
import { MainItemServiceInvoice } from '../service-invoice/service-invoice.model';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(list:MainItemServiceInvoice[],text:string): MainItemServiceInvoice[] {
    return list.filter(item => item.description?.toLowerCase().includes(text.toLowerCase()) || item.unitOfMeasurementCode?.toLowerCase().includes(text.toLowerCase()) || item.currencyCode?.toLowerCase().includes(text.toLowerCase()));
  }

}  

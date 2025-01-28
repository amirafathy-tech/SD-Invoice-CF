export class MainItemServiceInvoice {
    originalIndex?: number;

    referenceId?:number;

    serviceInvoiceCode: number = 0;

    executionOrderMainCode: number = 0;
    executionOrderMain : any;

    invoiceMainItemCode?: number;

    serviceNumberCode?: number;
    description?: string;

    unitOfMeasurementCode?: string;
    currencyCode?: string;
    materialGroupCode?: string;
    serviceTypeCode?: string;
    personnelNumberCode?: string;
    lineTypeCode?: string;

    remainingQuantity?: number;

    quantity: number = 0;

    totalQuantity: number = 0;
    amountPerUnit?: number;
    total: number = 0;

    totalHeader: number = 0;

    actualQuantity: number = 0;
    actualPercentage?: number;
    overFulfillmentPercentage?: number;
    unlimitedOverFulfillment?: boolean;
    manualPriceEntryAllowed?: boolean;
    externalServiceNumber?: string;
    serviceText?: string;
    lineText?: string;
    lineNumber?: string;


    biddersLine?: boolean;
    supplementaryLine?: boolean;
    lotCostOne?: boolean;
    doNotPrint?: boolean;

    alternatives?: string;
    serviceNumber?: string;

    selected?: boolean;
    // debitMemoRequestItemText:string="";
    debitMemoRequestItemText?:string;
    // executionOrdersubList?:SubItem[];

}
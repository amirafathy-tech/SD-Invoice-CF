export class MaterialGroup {
    public materialGroupCode!:number;
      public code: string;
      public description: string;
  
      constructor(code:string,description: string
      ) {
          this.code = code;
        this.description=description;
      }
  }
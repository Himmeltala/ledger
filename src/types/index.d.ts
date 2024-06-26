declare interface IComment {
  value?: string;
  type?: "支" | "收";
  text?: string;
  cost?: number;
  id?: string;
}

declare interface IBalance {
  cost?: number;
  text?: string;
  type?: "支" | "收";
}

declare interface IMonth {
  surplus?: number;
  budget?: number;
  balance?: IBalance[];
}

declare type IRecord = {
  id: string;
  items: Record<string, IMonth>;
};

declare type IConfig = {
  Y: string;
  M: string;
  budget: number;
  isChart: boolean;
}
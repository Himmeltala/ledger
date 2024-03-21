declare interface IComments extends IItems {
  value?: string;
}

declare interface ILastViewd {
  year?: string;
  month?: string;
}

declare interface IStorageData {
  comments?: IComments[];
  record?: IRecord;
  viewdDate?: ILastViewd;
}

declare interface IItems {
  cost?: number;
  text?: string;
  type?: "支" | "收";
  sameat?: ISameat;
}

declare type ISameat = number[] | string[];

declare interface IMonth {
  items?: IItems[];
  budget?: number;
  surplus?: number;
}

declare type IRecord = Record<string, Record<string, IMonth>>;

declare interface IMenuProp {
  name?: string;
}

export type TBitFieldValue = '0' | '1'

export enum OrderStatus {
  All = 0,
  Pending = 1,
  Confirmed = 2,
  Processing = 3,
  OutOfDelivery = 4,
  Delivered = 5,
  Returned = 6,
  Failed = 7,
  Canceled = 8
  }
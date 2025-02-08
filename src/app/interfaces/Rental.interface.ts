export interface Rental {
  rental_id?: number;
  rental_id_formatted?: string;
  inventory_id: string;
  customer_id: string;
  ins_company: string;
  ins_policy_no: string;
  ins_expiry_dt: Date;
  start_date: Date;
  end_date: Date;
  days?: number;
  duration?: number;
  rate: number;
  discount?: number;
  rent_amount?: number;
  pay_method: 'Cash' | 'Cheque' | 'Card';
  adv_amnt?: number;
  ref_amnt?: number;
  ref_name?: string;
  ref_ph?: string;
  ext_yn?: boolean;
}
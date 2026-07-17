declare module "sslcommerz-lts" {
  export default class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string);
    init(data: Record<string, unknown>): Promise<any>;
    validate(data: Record<string, unknown>): Promise<any>;
  }
}

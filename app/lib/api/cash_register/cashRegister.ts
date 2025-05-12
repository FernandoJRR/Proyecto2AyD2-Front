import type { Entity } from "../utils/entity";
import type { Warehouse } from "../warehouse/warehouse";

const CURRENT_CASH_REGISTER_URI = "/v1/cash-registers";

export interface CashRegister extends Entity {
  code: String;
  employeeId: String;
  active: Boolean;
  warehouse: Warehouse;
}

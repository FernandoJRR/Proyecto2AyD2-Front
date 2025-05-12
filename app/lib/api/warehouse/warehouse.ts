import type { Entity } from "../utils/entity";

const CURRENT_WAREHOUSE_URI = "/v1/warehouses";

export interface Warehouse extends Entity {
  name: String;
  ubication: String;
  active: Boolean;
}
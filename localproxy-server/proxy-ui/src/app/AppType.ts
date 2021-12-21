type RouteCategoryType = "ui" | "api" | "data";

export interface DynamicRouteType {
  static: false;
  route: string;
  hostname: string;
  port: number;
  trimRoute?: boolean;
  priority?: number;
  type?: RouteCategoryType;
}

export interface StaticRouteType {
  static: true;
  route: string;
  staticDir: string;
  rootIndexFallback?: boolean;
  dirListings?: boolean;
  priority?: number;
  type?: RouteCategoryType;
}

export type RouteType = StaticRouteType | DynamicRouteType;

export interface AppType {
  id: string;
  name: string;
  persist?: boolean;
  system?: boolean;
  pid?: number;
  routes: RouteType[];
}

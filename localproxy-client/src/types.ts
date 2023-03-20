export type RouteType = "ui" | "api" | "data";
export type LocalproxyStaticRoute = {
  static: true;
  route: string;
  staticDir: string;
  rootIndexFallback: boolean;
  dirListings: boolean;
  priority: number;
  type: RouteType;
};
export type LocalproxyDynamicRoute = {
  static: false;
  route: string;
  hostname: string;
  port: number;
  trimRoute: boolean;
  priority: number;
  type: RouteType;
};
export type LocalproxyRoute = LocalproxyStaticRoute | LocalproxyDynamicRoute;
export type LocalproxyApp = {
  id: string;
  name: string;
  pid?: number;
  persist?: true;
  routes: LocalproxyRoute[];
};

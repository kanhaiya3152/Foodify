import "leaflet";

declare module "leaflet" {
  interface RoutingStatic {
    control(options: any): any;
    osrmv1(options?: any): any;
  }
  const Routing: RoutingStatic;
}

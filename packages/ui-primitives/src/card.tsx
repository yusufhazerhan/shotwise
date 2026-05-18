import * as React from "react";
import { cn } from "./cn.js";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...rest }, ref) {
    return <div ref={ref} data-slot="card" className={cn("sw-card", className)} {...rest} />;
  }
);

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return (
      <div ref={ref} data-slot="card-header" className={cn("sw-card-header", className)} {...rest} />
    );
  }
);

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return (
      <h3 ref={ref} data-slot="card-title" className={cn("sw-card-title", className)} {...rest} />
    );
  }
);

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...rest }, ref) {
    return (
      <div ref={ref} data-slot="card-body" className={cn("sw-card-body", className)} {...rest} />
    );
  }
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return (
      <div ref={ref} data-slot="card-footer" className={cn("sw-card-footer", className)} {...rest} />
    );
  }
);

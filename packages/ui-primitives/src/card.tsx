import * as React from "react";
import { cn } from "./cn.js";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...rest }, ref) {
    return <div ref={ref} data-slot="card" className={cn("card", className)} {...rest} />;
  }
);

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn("p-5 pb-2", className)}
        {...rest}
      />
    );
  }
);

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function CardTitle({ className, ...rest }, ref) {
  return (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn("text-base font-semibold m-0", className)}
      {...rest}
    />
  );
});

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...rest }, ref) {
    return <div ref={ref} data-slot="card-body" className={cn("p-5", className)} {...rest} />;
  }
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return <div ref={ref} data-slot="card-footer" className={cn("px-5 pb-5", className)} {...rest} />;
  }
);

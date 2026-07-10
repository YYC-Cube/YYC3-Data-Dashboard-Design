"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}: Omit<React.ComponentProps<typeof AspectRatioPrimitive.Root>, "children"> & {
  children?: React.ReactNode;
}) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };

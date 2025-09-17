import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export const IsRequired = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="cursor-pointer">
          <span className="rounded-full text-center size-4 pt-1.5 text-black font-extrabold flex items-center justify-center">
            *
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-black">Required</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

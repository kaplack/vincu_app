import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";

import { useIsMobile } from "@/components/ui/use-mobile";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value) => {
      const next = typeof value === "function" ? value(open) : value;
      onOpenChange ? onOpenChange(next) : _setOpen(next);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [open, onOpenChange],
  );

  const toggleSidebar = React.useCallback(() => {
    isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const value = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          }}
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Mobile sidebar</SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-side={side}
      data-variant={variant}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      className="group hidden md:block"
    >
      <div
        className={cn(
          "fixed inset-y-0 z-10 w-[var(--sidebar-width)] transition-all duration-200",
          side === "left" ? "left-0" : "right-0",
          state === "collapsed" &&
            collapsible === "offcanvas" &&
            (side === "left"
              ? "-left-[var(--sidebar-width)]"
              : "-right-[var(--sidebar-width)]"),
          variant === "floating" && "p-2",
        )}
      >
        <div className="bg-sidebar h-full w-full flex flex-col rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trigger & Rail                                                             */
/* -------------------------------------------------------------------------- */

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      data-slot="sidebar-trigger"
      className={cn("size-7", className)}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      data-slot="sidebar-rail"
      onClick={toggleSidebar}
      className={cn("absolute inset-y-0 z-20 hidden w-4 sm:flex", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Layout helpers                                                             */
/* -------------------------------------------------------------------------- */

const SidebarInset = ({ className, ...props }) => (
  <main
    data-slot="sidebar-inset"
    className={cn("flex flex-1 flex-col", className)}
    {...props}
  />
);

const SidebarHeader = ({ className, ...props }) => (
  <div className={cn("p-2", className)} {...props} />
);

const SidebarFooter = ({ className, ...props }) => (
  <div className={cn("p-2", className)} {...props} />
);

const SidebarContent = ({ className, ...props }) => (
  <div
    className={cn("flex flex-1 flex-col overflow-auto", className)}
    {...props}
  />
);

const SidebarSeparator = (props) => <Separator className="mx-2" {...props} />;

/* -------------------------------------------------------------------------- */
/*  Menu                                                                       */
/* -------------------------------------------------------------------------- */

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent",
);

function SidebarMenu({ className, ...props }) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }) {
  return <li className={cn("relative", className)} {...props} />;
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants(), className)}
      {...props}
    />
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent hidden={state !== "collapsed" || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function SidebarMenuSkeleton({ showIcon = false }) {
  return (
    <div className="flex items-center gap-2 px-2">
      {showIcon && <Skeleton className="size-4" />}
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Exports                                                                    */
/* -------------------------------------------------------------------------- */

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

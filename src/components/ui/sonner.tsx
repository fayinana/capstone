
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast !bg-zinc-900 !border-yellow-300/20 !text-white !shadow-lg",
          title: "group-[.toast]:text-white !font-semibold !text-sm",
          description: "group-[.toast]:text-zinc-400 !text-xs",
          actionButton:
            "group-[.toast]:bg-yellow-300 group-[.toast]:text-black",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

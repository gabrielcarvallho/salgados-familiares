import { useCurrentUser } from "@/hooks/useUser";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Loader2, User } from "lucide-react";
import { formatGroup } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export const Profile = () => {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { logout, isLoading } = useAuth();

  const group = formatGroup(user?.groups?.[0]?.name);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Você foi desconectado!", {
        description: "Te movendo para o login...",
        duration: 3000,
      });
      router.push("/login");
    } catch (errorLogin) {
      toast.error("Falha!", {
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-x-2 space-y-2">
      <div className="flex space-x-2 items-center w-full justify-center">
        <div className="flex ">
          <Avatar>
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{user?.email}</span>
          <span className="text-sm text-accent-foreground">{group}</span>
        </div>
      </div>
      <div className="w-full">
        <Button
          onClick={handleLogout}
          variant={"outline"}
          className="cursor-pointer w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saindo...
            </>
          ) : (
            "Sair"
          )}
        </Button>
      </div>
    </div>
  );
};

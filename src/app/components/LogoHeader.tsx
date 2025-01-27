import { Switch } from "@/app/components/ui/switch";
import UserNavMenu from "./UserNavMenu";
import { Label } from "./ui/label";
import { useChat } from "@/context/ChatContext";

const LogoHeader = () => {
  const { isGekko, toggleGekkoStyle } = useChat();
  return (
    <section className="bg-slate-300 w-full flex items-center justify-between px-4 py-2 mb-5">
      <div className="flex items-center gap-4">
        <h1 className="text-black text-2xl mx-auto ">GekkoChat.io</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="gekko-style"
          checked={isGekko}
          onCheckedChange={toggleGekkoStyle}
        />
        <Label htmlFor="gekko-style">{isGekko ? "Gekko" : "Normal"}</Label>
      </div>
      <UserNavMenu />
    </section>
  );
};

export default LogoHeader;

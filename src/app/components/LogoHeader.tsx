import UserNavMenu from "./UserNavMenu";

const LogoHeader = () => {
  return (
    <section className="bg-slate-300 w-full flex items-center justify-between px-4 py-2 mb-5">
      <div className="flex items-center gap-4">
        <h1 className="text-black text-2xl mx-auto ">GekkoChat.io</h1>
      </div>
      <UserNavMenu />
    </section>
  );
};

export default LogoHeader;

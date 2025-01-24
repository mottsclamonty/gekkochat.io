import { signIn } from "next-auth/react";
import React from "react";

const SignInContainer = () => {
  return (
    <section
      className="h-screen w-screen relative bg-cover bg-top"
      style={{ backgroundImage: "url('/gekko_hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
        <h1 className="text-6xl font-bold mb-12">Money never sleeps</h1>
        <button
          type="button"
          onClick={() => signIn()}
          className="px-6 py-3 bg-slate-500 hover:bg-slate-700 text-white rounded-md font-semibold transition"
        >
          Sign in to get started
        </button>
      </div>
    </section>
  );
};

export default SignInContainer;

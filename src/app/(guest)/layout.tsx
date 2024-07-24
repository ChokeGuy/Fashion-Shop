"use client";
import { account } from "@/src/assests";
import Image from "next/image";
import React, { ReactNode } from "react";
type LayoutProps = {
  children: ReactNode;
};

const GuestLayout = ({ children }: LayoutProps) => {
  const imageUrl =
    "https://res.cloudinary.com/dt2yrsa81/image/upload/v1711022488/account-bg_cla1tm.svg" ||
    account;
  return (
    <main className="w-full grid place-items-center">
      <div className="fixed inset-0 z-0">
        <Image
          placeholder={"blur"}
          blurDataURL={imageUrl}
          width={1920}
          height={1080}
          className="size-full inset-0 object-cover object-center z-0"
          src={imageUrl}
          alt="account-img"
        ></Image>
      </div>
      <div className="relative z-10 mt-10">{children}</div>
    </main>
  );
};

export default GuestLayout;

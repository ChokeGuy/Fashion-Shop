"use client";
import Link from "next/link";
import Image from "next/image";
import { logo } from "@/src/assests";

import {
  selectCartStatus,
  getAllCartItemsAsync,
} from "@/src/lib/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import { useEffect } from "react";
import {
  getUserAddressAsync,
  selectAddressesStatus,
} from "@/src/lib/features/address/addressSlice";
export default function CartNav({ title = "Giỏ Hàng" }: { title: any }) {
  const cartStatus = useAppSelector(selectCartStatus);
  const addressStatus = useAppSelector(selectAddressesStatus);
  const dispatch = useAppDispatch();
  useEffect(() => {
    // if (cartStatus === "idle") {
    dispatch(getAllCartItemsAsync());
    // }
    if (addressStatus === "idle") {
      dispatch(getUserAddressAsync());
    }
  }, [dispatch, cartStatus]);

  return (
    <nav className="border border-border-color relative z-40 bg-white">
      <div className="flex items-center lg:h-[5.25rem] h-[4.25rem] container justify-between max-lg:gap-x-8">
        <div className="flex items-center">
          <div className="pr-4 border-r border-primary-color">
            <Link replace={true} href={"/"}>
              <Image className="w-[7.5rem]" src={logo} alt="Logo"></Image>
            </Link>
          </div>
          <div className="pl-4 text-xl font-semibold text-primary-color">
            {title}
          </div>
        </div>
      </div>
    </nav>
  );
}

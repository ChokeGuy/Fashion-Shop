"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/lib/redux/hooks";
import {
  getAllPromotionsAsync,
  selectPromotions,
  selectPromotionStatus,
} from "@/src/lib/features/promotion/promotionSlice";
import dayjs from "dayjs";

const PromotionPage = () => {
  // const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const promotions = useAppSelector(selectPromotions);
  const promotionStatus = useAppSelector(selectPromotionStatus);
  useEffect(() => {
    if (promotionStatus === "idle") {
      dispatch(getAllPromotionsAsync(0));
    }
  }, [promotionStatus]);

  return (
    <div className="col-span-full border border-border-color md:col-span-8 lg:col-span-8 bg-white rounded-xl shadow-sm">
      <div className="w-full p-6">
        <h2 className="text-2xl font-semibold mb-4">Mã ưu đãi</h2>
        <ul className="flex items-center flex-wrap justify-between gap-y-4">
          {promotions &&
            promotions.length > 0 &&
            promotions.map((promotion) => {
              return (
                <li className="flex">
                  <div
                    className="flex flex-col gap-y-1 lg:max-w-[280px] items-start bg-white rounded-lg shadow-sm p-4
                       border border-border-color rounded-tr-none rounded-br-none"
                    key={promotion.promotionName}
                  >
                    <div className="px-2 py-1 bg-background">
                      <p className="text-sm text-primary-color">
                        {promotion.promotionName}
                      </p>
                    </div>
                    <p className="text-sm">
                      HSD: {dayjs(promotion.expireAt).format("DD/MM/YYYY")}
                    </p>
                  </div>
                  <button
                    className="grid place-items-center bg-white h-auto border border-border-color
                   border-l-0 rounded-tr-lg rounded-br-lg hover:bg-primary-color hover:text-white transition-colors px-5
                   ssm:truncate"
                  >
                    Áp dụng
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default PromotionPage;

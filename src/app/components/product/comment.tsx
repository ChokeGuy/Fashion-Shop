import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import { Rating as RatingType } from "@/src/models";
import Avatar from "@mui/material/Avatar";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import CircleLoading from "../Loading";

const Review = ({
  rating,
  totalRatings,
}: {
  rating: RatingType[];
  totalRatings: number;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMoreLoading, setShowMoreLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { replace } = useRouter();
  const [ratingList, setRatingList] = useState<RatingType[]>([]);
  useEffect(() => {
    setLoading(true);
    if (rating && rating.length > 0) {
      setRatingList(rating);
    }
    setLoading(false);
  }, [rating]);

  const handleLoadMoreComment = () => {
    setShowMoreLoading(true);
    const inputParams = new URLSearchParams();
    const size = ratingList.length < totalRatings ? ratingList.length + 3 : 1;

    inputParams.set("size", size.toString());

    replace(`${pathname}?${inputParams.toString()}`, { scroll: false });
    setShowMoreLoading(false);
  };

  const showButton = () => {
    const size = searchParams.get("size");
    if (Number(size) >= totalRatings && ratingList.length == totalRatings) {
      return true;
    } else if (ratingList.length < totalRatings) {
      return true;
    }
    return false;
  };

  if (loading)
    return (
      <div className="w-full h-32 grid place-items-center">
        <CircleLoading />
      </div>
    );

  return (
    <div className="overflow-auto">
      <h3 className="px-2 text-lg leading-[30px] font-semibold ">
        {totalRatings} đánh giá
      </h3>
      {/* <form action="/comments" method="post" className="flex">
        <div className="w-fit mr-1">
          <Image
            className="rounded-full w-[50px] h-[50px]"
            src={user_img2}
            alt="profileImage"
          ></Image>
        </div>
        <div className="flex-1 relative group">
          <input
            className="peer round-md py-2.5 transition-all duration-200 
                    px-5 w-full border-b border-border-color
                    outline-none focus:border-b-[#000] focus:border-b"
            type="text"
            placeholder="Viết phản hồi"
          ></input>
          <div className="peer-focus:block float-right hidden">
            <button
              className="bg-primary-color text-base mt-4 mr-4
            text-center text-white py-[5px] px-[30px] rounded-3xl transition-all duration-200 hover:bg-text-color"
              type="reset"
            >
              Hủy
            </button>
            <button
              className="bg-primary-color text-base mt-4
            text-center text-white py-[5px] px-[30px] rounded-3xl transition-all duration-200 hover:bg-text-color"
              type="submit"
            >
              Gửi
            </button>
          </div>
        </div>
      </form> */}
      <ul>
        {ratingList && ratingList.length > 0 ? (
          ratingList.map((item, index) => {
            return (
              <li
                key={index}
                className={`flex items-start py-4 px-2 ${
                  index < rating.length - 1 && "border-b border-border-color"
                }`}
              >
                <div className="mr-4 w-fit">
                  {item.image ? (
                    <Avatar alt="user-avatar" src={item.image}></Avatar>
                  ) : (
                    <Avatar alt="user-avatar">
                      {item.fullname[0].toUpperCase() || "T"}
                    </Avatar>
                  )}
                </div>
                <article className="flex-1 w-fit">
                  <div className="flex flex-col text-sm">
                    <span className="font-semibold mr-1">{item.fullname}</span>
                    <Rating
                      sx={{
                        paddingRight: "0.5rem",
                        // marginBottom: "0.25rem",
                      }}
                      name="read-only-review-start"
                      value={item.star}
                      readOnly
                    />
                    (
                    {dayjs(new Date(item.createdAt ?? null)).format(
                      "DD/MM/YYYY"
                    )}
                    )
                  </div>
                  <p className="text-base text-text-color font-medium">
                    {item.content}
                  </p>
                  {/* <Like></Like> */}
                </article>
              </li>
            );
          })
        ) : (
          <div className="min-h-[4rem] w-full grid place-content-center text-xl text-primary-color">
            Không có đánh giá nào
          </div>
        )}
      </ul>

      {showButton() && rating && ratingList.length > 0 && (
        <div className="flex items-center justify-center">
          <LoadingButton
            onClick={handleLoadMoreComment}
            type="button"
            size="small"
            className={`mt-2 px-4 py-1 rounded-md
                    bg-primary-color text-white self-end  hover:opacity-70 ${
                      showMoreLoading && "opacity-55"
                    } transition-all`}
            loading={showMoreLoading}
            loadingIndicator={
              <CircularProgress className="text-white" size={16} />
            }
            disabled={showMoreLoading}
            variant="outlined"
          >
            <span className={`${showMoreLoading && "text-primary-color"}`}>
              {ratingList.length < totalRatings ? "Xem thêm" : "Ẩn hết"}
            </span>
          </LoadingButton>
        </div>
      )}
    </div>
  );
};

export default Review;

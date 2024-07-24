import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import React, {
  ChangeEvent,
  Dispatch,
  memo,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Popup from "../Popup";
import ErrorIcon from "@mui/icons-material/Error";
import { OrderItem, Rating as RatingType } from "@/src/models";
import Rating from "@mui/material/Rating";
import Image from "next/image";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { orderApi } from "../../apis/orderApi";
import { showToast } from "@/src/lib/toastify";
import { useAppDispatch } from "@/src/lib/redux/hooks";
import { getAllOrdersAsync } from "@/src/lib/features/order/orderSlice";
import Avatar from "@mui/material/Avatar";
import CircleLoading from "../Loading";
import Link from "next/link";
type Feedback = {
  orderItemId: number;
  content: string;
  star: number;
};
type HoverFeedback = {
  orderItemId: number;
  star: number;
};

const labels: { [index: string]: string } = {
  1: "Tệ",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Tuyệt vời",
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value ?? 5]}`;
}

const FeedBack = memo(
  ({
    isRated,
    orderFeedBackId,
    orderItems,
    setOrderFeedBackId,
    isOpenRatingDialog,
    setIsOpenRatingDialog,
  }: {
    isRated: boolean;
    orderFeedBackId: number;
    setOrderFeedBackId: Dispatch<SetStateAction<number>>;
    orderItems: OrderItem[];
    isOpenRatingDialog: boolean;
    setIsOpenRatingDialog: Dispatch<SetStateAction<boolean>>;
  }) => {
    const [hover, setHover] = useState<HoverFeedback[]>([]);
    const [isRating, setIsRating] = useState(false);
    const [ratingList, setRatingList] = useState<RatingType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
      const getRatingList = async () => {
        setIsLoading(true);
        if (orderFeedBackId !== -1 && isRated) {
          const ratings = await orderApi.getRatingByOrderId(orderFeedBackId);
          setRatingList(ratings?.result || []);
        }
        setIsLoading(false);
      };
      getRatingList();
    }, [isRated, orderFeedBackId]);

    return (
      <Popup
        closeButton={{
          top: "10px",
          right: "10px",
        }}
        open={isOpenRatingDialog}
        onClose={() => {
          setIsOpenRatingDialog(false);
          setTimeout(() => {
            setRatingList([]);
            setOrderFeedBackId(-1);
          }, 100);
        }}
        title={
          isRated ? "Đánh giá của bạn" : "Đánh giá từng sản phẩm trong đơn hàng"
        }
        content={
          isRated ? (
            isLoading ? (
              <div className="grid place-items-center p-4 w-[600px] h-[180px] max-h-[40rem]">
                <CircleLoading />
              </div>
            ) : (
              <div className="max-h-[40rem] overflow-auto">
                <div className="flex flex-col p-4">
                  {ratingList &&
                    ratingList.length > 0 &&
                    ratingList.map((feedback, index) => {
                      return (
                        <div
                          className={`w-full ${
                            index !== ratingList.length - 1
                              ? "border-b border-border-color py-2"
                              : ""
                          }`}
                          key={index}
                        >
                          <div className="flex gap-x-2 flex-col gap-y-1 py-3 text-base text-text-color">
                            <div className="flex gap-x-2">
                              {
                                // Show avatar preview
                                feedback.image ? (
                                  <Avatar
                                    src={feedback.image as string}
                                  ></Avatar>
                                ) : (
                                  <Avatar>
                                    {(feedback.fullname &&
                                      feedback.fullname[0].toUpperCase()) ||
                                      "T"}
                                  </Avatar>
                                )
                              }
                              <Rating
                                name="star"
                                readOnly
                                defaultValue={feedback.star || 5}
                                getLabelText={getLabelText}
                              />
                              <Box sx={{ ml: 0.5 }}>
                                {labels[feedback.star || 5]}
                              </Box>
                            </div>
                            <div className="p-1 flex flex-col gap-y-1">
                              <div>
                                Sản phẩm:{" "}
                                <span className="text-secondary-color">
                                  {feedback.fullname}{" "}
                                </span>
                              </div>
                              <p>Nội dung đánh giá: {feedback.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )
          ) : (
            <Formik<{ feedBackList: Feedback[] }>
              enableReinitialize={true}
              initialValues={{
                feedBackList:
                  orderItems.map((item) => ({
                    orderItemId: item.orderItemId,
                    star: 5,
                    content: "",
                  })) || [],
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors: {
                  feedBackList: string;
                } = { feedBackList: "" };

                if (values.feedBackList.length === 0) {
                  errors.feedBackList = "Vui lòng nhập đầy đủ đánh giá";
                  return errors;
                }
              }}
              onSubmit={async (values, { setFieldValue, setSubmitting }) => {
                setIsRating(true);
                setSubmitting(true);
                const promises = values.feedBackList.map((value) => {
                  return orderApi.ratingOrderItems(
                    {
                      content: value.content,
                      star: value.star ?? 5,
                    },
                    value.orderItemId
                  );
                });

                const result = await Promise.all(promises);
                if (result.some((item) => item?.success === false)) {
                  showToast("Đánh giá thất bại", "error");
                  setSubmitting(false);
                  setIsRating(false);
                  return;
                }
                const response = await orderApi.updateOrderToRated(
                  orderFeedBackId
                );
                if (response?.message === "Exist order item doesn't rating") {
                  showToast("Sản phẩm này không có rating", "error");
                  setSubmitting(false);
                  setIsRating(false);
                  return;
                }
                dispatch(getAllOrdersAsync());
                showToast("Đánh giá thành công", "success");

                setIsOpenRatingDialog(false);
                setSubmitting(false);
                setIsRating(false);
              }}
            >
              {({
                isSubmitting,
                errors,
                submitForm,
                dirty,
                setFieldValue,
                values,
              }) => (
                <>
                  <Form className="flex flex-col gap-y-1 p-4">
                    <ErrorMessage name="feedBackList" component="div">
                      {(msg) => (
                        <div
                          className="flex gap-x-2 text-sm text-red-500 animate-appear
                    "
                        >
                          <ErrorIcon className="size-5" />
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                    {orderItems.map((productItem) => {
                      return (
                        <div className="w-full" key={productItem.orderItemId}>
                          <div className="flex justify-between py-2">
                            <div className="flex gap-x-2">
                              <Image
                                className="outline outline-2 outline-secondary-color w-[6rem] h-[7rem] p-1"
                                src={productItem.image}
                                width={100}
                                height={100}
                                alt={"orderItemImg"}
                              ></Image>
                              <Link
                                href={`/product/${productItem.productId}`}
                                className="text-sm text-secondary-color font-bold hover:underline"
                              >
                                {productItem.productName}
                              </Link>
                            </div>
                          </div>
                          <div className="w-full">
                            <div className="flex gap-x-2 py-2 text-sm items-center">
                              <span className="">Chất lượng đơn hàng</span>
                              <Rating
                                name="star"
                                value={
                                  values.feedBackList.find(
                                    (feedBack) =>
                                      feedBack.orderItemId ==
                                      productItem.orderItemId
                                  )?.star || 5
                                }
                                getLabelText={getLabelText}
                                onChange={(event, newValue) => {
                                  setFieldValue(
                                    "feedBackList",
                                    values.feedBackList.map((item: Feedback) =>
                                      item.orderItemId ===
                                      productItem.orderItemId
                                        ? { ...item, star: newValue }
                                        : item
                                    )
                                  );
                                }}
                                onChangeActive={(event, newHover) => {
                                  setHover((hover: HoverFeedback[]) =>
                                    hover.map((item: HoverFeedback) =>
                                      item.orderItemId ===
                                      productItem.orderItemId
                                        ? { ...item, star: newHover }
                                        : item
                                    )
                                  );
                                }}
                                emptyIcon={
                                  <StarIcon
                                    fontSize="medium"
                                    sx={{ opacity: "0.55" }}
                                  />
                                }
                              />
                              {values.feedBackList.find(
                                (feedBack) =>
                                  feedBack.orderItemId ==
                                  productItem.orderItemId
                              )?.star !== null && (
                                <Box sx={{ ml: 2 }}>
                                  {
                                    labels[
                                      (hover.length > 0 &&
                                      hover.find(
                                        (hover) =>
                                          hover.orderItemId ==
                                          productItem.orderItemId
                                      )?.star !== -1
                                        ? hover.find(
                                            (hover) =>
                                              hover.orderItemId ==
                                              productItem.orderItemId
                                          )?.star ?? 5
                                        : values.feedBackList.find(
                                            (feedBack) =>
                                              feedBack.orderItemId ==
                                              productItem.orderItemId
                                          )?.star ?? 5) || 5
                                    ]
                                  }
                                </Box>
                              )}
                            </div>
                            <div className="flex gap-x-2 py-2 text-lg items-center">
                              <Field>
                                {({ form }: FieldProps) => (
                                  <TextField
                                    type="text"
                                    required
                                    value={
                                      form.values.feedBackList.find(
                                        (feedBack: any) =>
                                          feedBack.orderItemId ==
                                          productItem.orderItemId
                                      )?.content
                                    }
                                    onChange={(e: any) => {
                                      const newValue = e.target.value;
                                      setFieldValue(
                                        "feedBackList",
                                        form.values.feedBackList.map(
                                          (item: Feedback) =>
                                            item.orderItemId ===
                                            productItem.orderItemId
                                              ? { ...item, content: newValue }
                                              : item
                                        )
                                      );
                                    }}
                                    sx={{
                                      background: "white",
                                      borderRadius: "0.25rem",
                                    }}
                                    className="w-full"
                                    inputProps={{
                                      maxLength: 200,
                                    }}
                                    id="filled-multiline-flexible"
                                    placeholder="Nhập nội dung..."
                                    multiline
                                    rows={3}
                                    variant="filled"
                                  />
                                )}
                              </Field>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex gap-x-2 justify-end">
                      <button
                        type="button"
                        className="mt-2 px-4 py-1 rounded-md
              bg-primary-color text-white self-end  hover:opacity-70"
                        onClick={() => {
                          setIsOpenRatingDialog(false);
                        }}
                      >
                        Hủy
                      </button>
                      <LoadingButton
                        type="submit"
                        size="small"
                        className={`mt-2 px-4 py-1 rounded-md
            bg-primary-color text-white self-end  hover:opacity-70 ${
              (!dirty || isRating) && "opacity-55"
            } transition-all`}
                        loading={isSubmitting}
                        loadingIndicator={
                          <CircularProgress className="text-white" size={16} />
                        }
                        disabled={!dirty || isRating}
                        variant="outlined"
                        onClick={submitForm}
                      >
                        <span
                          className={`${isSubmitting && "text-primary-color"}`}
                        >
                          Xác nhận
                        </span>
                      </LoadingButton>
                    </div>
                  </Form>
                </>
              )}
            </Formik>
          )
        }
      ></Popup>
    );
  }
);

export default FeedBack;

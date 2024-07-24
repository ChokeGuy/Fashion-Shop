import Popup from "@/src/app/components/Popup";
import { showToast } from "@/src/lib/toastify";
import {
  AddProductItem,
  KeyString,
  Product,
  ProductItem,
  StyleValue,
  UpdateProductItem,
} from "@/src/models";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import ErrorIcon from "@mui/icons-material/Error";

import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { MenuProps } from "@/src/utilities/multi-select-prop";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Image from "next/image";
import InputFileUpload from "@/src/app/components/FileUploadInput";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { adminProductItemApi } from "@/src/app/apis/admin/productItemApi";
import { adminProductApi } from "@/src/app/apis/admin/productApi";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TablePagination from "@mui/material/TablePagination";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import Scrollbar from "../../../scrollbar";
import TableBody from "@mui/material/TableBody";
import Card from "@mui/material/Card";
import ProductItemTableHead from "../product-item-table-head";
import ProductItemTableRow from "../product-item-table-row";
import { getComparator } from "@/src/utilities/visual";
import { applyProductItemFilter } from "../filter";
import { adminStyleValueApi } from "@/src/app/apis/admin/styleValueApi";

export default function AdminProductItem({
  open,
  onClose,
  productId,
  productName,
  setProducts,
  setTotalProducts,
}: {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  setProducts: Dispatch<SetStateAction<Product[]>>;
  setTotalProducts: Dispatch<SetStateAction<number>>;
}) {
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [totalProductItems, setTotalProductItems] = useState<number>(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState("parentName");

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [image, setImage] = useState<string | File>("");
  const [updateProductItem, setUpdateProductItem] =
    useState<ProductItem | null>(null);
  const [styleValues, setStyleValues] = useState<{
    [index: string]: StyleValue[];
  }>({});
  const [styleValueIds, setStyleValueIds] = useState<{
    [index: string]: number;
  }>({});

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateProductItem, setActivateProductItem] =
    useState<ProductItem | null>(null);

  const quantityFocusRef = useRef<HTMLInputElement | null>(null);
  const priceFocusRef = useRef<HTMLInputElement | null>(null);
  const styleValueFocusRef = useRef<HTMLInputElement | null>(null);
  const imageFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getDatas = async () => {
      const [response, response2] = await Promise.all([
        adminProductApi.getProductById(productId),
        adminProductItemApi.getAllProductItemsByProductId(productId),
      ]);

      if (response?.success) {
        const styleNames = response.result.styleValueNamesByStyleNames;
        Object.keys(styleNames).forEach(async (styleName) => {
          const styleValues =
            await adminStyleValueApi.getStyleValuesByStyleName({
              styleName: styleName,
              page: 0,
              size: 9999,
            });
          if (styleValues?.success) {
            setStyleValues((prev) => ({
              ...prev,
              [styleName]: styleValues.result.content,
            }));
          }
        });
      }
      if (response2?.success) {
        setProductItems(response2?.result.content || []);
        setTotalProductItems(response2?.result.totalElements || 0);
      }
    };
    if (productId !== -1) {
      getDatas();
    }
  }, [productId]);

  const getChangedValues = (values: AddProductItem & KeyString) => {
    const changedValues: AddProductItem & KeyString = {
      productId: productId,
      quantity: Number(values.quantity),
      price: Number(values.price),
    };

    if (image instanceof File) {
      changedValues.image = image;
    }
    if (Object.keys(styleValueIds).length > 0) {
      changedValues.styleValueIds = Object.values(styleValueIds);
    }

    if (updateProductItem) {
      delete changedValues.productId;
      delete changedValues.styleValueIds;
      const updateProductItemForLoop: UpdateProductItem & KeyString = {
        quantity: Number(updateProductItem.quantity),
        price: Number(updateProductItem.price),
      };
      Object.keys(updateProductItemForLoop).forEach((key) => {
        if (updateProductItemForLoop[key] === values[key]) {
          delete changedValues[key];
        }
      });
    }

    return changedValues;
  };

  const handleSort = (event: any, id: string) => {
    const isAsc = orderBy === id && order === "asc";
    if (id !== "") {
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    }
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const rowsPerPage = parseInt(event.target.value, 10);
    setPage(0);
    setRowsPerPage(rowsPerPage);
  };

  const handleChangeProductItemActive = async () => {
    setActivateLoading(true);
    const response = await adminProductItemApi.changeProductItemActivation(
      activateProductItem?.productItemId!
    );
    if (!response?.success) {
      showToast("Thay đổi trạng thái phân loại thất bại", "error");
      setActivateLoading(false);
      return;
    }
    showToast(
      "Thay đổi trạng thái phân loại thành công",
      "success",
      "top-right"
    );
    const response2 = await adminProductItemApi.getAllProductItemsByProductId(
      productId
    );
    setProductItems(response2?.result.content || []);
    setTotalProductItems(response2?.result.totalElements || 0);
    setActivateLoading(false);
    setPage(0);
    setTimeout(() => {
      setActivateProductItem(null);
    }, 100);
    setActivateDialog(false);
  };

  const dataFiltered = applyProductItemFilter({
    inputData: productItems,
    comparator: getComparator(order, orderBy),
  });

  const resetState = () => {
    onClose();
    setTimeout(() => {
      setUpdateProductItem(null);
      setProductItems([]);
      setTotalProductItems(0);
      setStyleValues({});
      setStyleValueIds({});
      setImage("");
    }, 100);
  };

  return (
    <Popup
      open={open}
      onClose={resetState}
      large={true}
      title={
        updateProductItem
          ? "Cập nhật phân loại sản phẩm"
          : "Thêm phân loại sản phẩm mới"
      }
      content={
        <Container sx={{ width: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
            mt={2}
          >
            <Typography
              sx={{
                width: "100%",
                textColor: "#1A4845",
                display: "flex",
                justifyContents: "center",
                alignItems: "center",
                fontSize: "1.25rem",
                fontWeight: "semi-bold",
              }}
            >
              {productName}
            </Typography>
          </Stack>
          <Card>
            <Scrollbar>
              <TableContainer sx={{ overflow: "unset" }}>
                <Table sx={{ minWidth: 800 }}>
                  <ProductItemTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={dataFiltered.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    headLabel={[
                      { id: "productItemId", label: "Mã phân loại sp" },
                      { id: "styleValueByStyles", label: "Phân loại sản phẩm" },
                      { id: "price", label: "Giá" },
                      { id: "promotionalPrice", label: "Giá ưu đãi" },
                      { id: "totalquantity", label: "Số lượng" },
                      { id: "sold", label: "Đã bán" },
                      { id: "status", label: "Giảm giá" },
                      { id: "isActive", label: "Trạng thái" },
                      { id: "" },
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row: ProductItem) => (
                        <ProductItemTableRow
                          key={row.productItemId}
                          productItem={row}
                          setUpdateProductItem={setUpdateProductItem}
                          setActivateDialog={setActivateDialog}
                          setActivateProductItem={setActivateProductItem}
                        />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={totalProductItems}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
          <div className="flex flex-col gap-y-1 items-center justify-center">
            <Formik<AddProductItem>
              enableReinitialize={true}
              initialValues={{
                productId: productId,
                quantity: updateProductItem ? updateProductItem.quantity : "",
                image: updateProductItem ? updateProductItem.image : "",
                price: updateProductItem ? updateProductItem.price : "",
                styleValueIds: [],
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors: Omit<
                  Record<keyof AddProductItem, string>,
                  "productId"
                > = {
                  quantity: "",
                  image: "",
                  price: "",
                  styleValueIds: "",
                };
                if (values.quantity === "") {
                  errors.quantity = "Vui lòng nhập số lượng sản phẩm";
                  quantityFocusRef.current?.focus();
                  return errors;
                }

                if (values.price === "") {
                  errors.price = "Vui lòng nhập giá sản phẩm";
                  priceFocusRef.current?.focus();
                  return errors;
                }

                const keyLength = Object.keys(styleValues);

                if (
                  !updateProductItem &&
                  Object.keys(values.styleValueIds!) < keyLength
                ) {
                  errors.styleValueIds = "Vui lòng chọn đầy đủ thuộc tính";
                  styleValueFocusRef.current?.focus();
                  return errors;
                }

                if (
                  typeof values.image == "string" &&
                  values.image?.includes("res.cloudinary.com")
                ) {
                  return;
                }
                if (values.image === "") {
                  errors.image = "Vui lòng tải ảnh";
                  imageFocusRef.current?.focus();
                  return errors;
                }
                // Validate image
                const file = image as File;
                const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                const maxSize = 2 * 1024 * 1024; // 2MB
                if (!allowedTypes.includes(file.type)) {
                  errors.image = "File phải có định dạng JPEG,JPG,...";
                  imageFocusRef.current?.focus();
                  return errors;
                } else if (file.size > maxSize) {
                  errors.image = "Kích thước file phải nhỏ hơn 2MB";
                  imageFocusRef.current?.focus();
                  return errors;
                }
              }}
              onSubmit={async (values) => {
                setIsSubmitLoading(true);
                const changeValues = getChangedValues(values);
                let response;
                response = updateProductItem
                  ? await adminProductItemApi.updateProductItem(
                      updateProductItem.productItemId,
                      changeValues
                    )
                  : await adminProductItemApi.createNewProductItem(
                      changeValues
                    );
                if (response?.statusCode == 409) {
                  showToast("Phân loại sản phẩm đã tồn tại", "error");
                  setIsSubmitLoading(false);
                  return;
                }
                showToast(
                  `${
                    updateProductItem ? "Cập nhật" : "Tạo"
                  } phân loại sản phẩm thành công`,
                  "success"
                );
                const newProductItems =
                  await adminProductItemApi.getAllProductItemsByProductId(
                    productId
                  );
                setProductItems(
                  newProductItems?.result.content as ProductItem[]
                );
                setTotalProductItems(
                  newProductItems?.result.totalElements as number
                );
                const refreshProduct = await adminProductApi.getAllProducts();
                setProducts(refreshProduct?.result.content || []);
                setTotalProducts(refreshProduct?.result.totalElements || 0);

                if (updateProductItem) {
                  setImage("");
                  setUpdateProductItem(null);
                }

                setIsSubmitLoading(false);
              }}
            >
              {({ values, errors, submitForm, isSubmitting, dirty }) => (
                <Form className="flex flex-col mt-2">
                  <label
                    className="items-center py-1 pb-2 px-0.5 text-sm font-semibold
                      border-b border-border-color hidden"
                    htmlFor={`productId`}
                  >
                    Tên sản phẩm
                  </label>
                  <Field
                    value={productName}
                    disabled={true}
                    readOnly={true}
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${"opacity-55"} transition-all hidden`}
                    type="text"
                    id={`productId`}
                  />
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                      border-b border-border-color"
                    htmlFor={`quantity`}
                  >
                    Số lượng
                  </label>
                  <Field
                    disabled={isSubmitLoading}
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                      isSubmitLoading && "opacity-55"
                    } ${errors.quantity && "border-red-500"} transition-all`}
                    type="text"
                    id={`quantity`}
                    name={"quantity"}
                    innerRef={quantityFocusRef}
                    onKeyPress={(event: {
                      key: string;
                      preventDefault: () => void;
                    }) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                  <ErrorMessage name="quantity" component="div">
                    {(msg) => (
                      <div className="flex gap-x-2 text-sm text-red-500 animate-appear">
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                      border-b border-border-color"
                    htmlFor={`name`}
                  >
                    Giá phân loại sản phẩm
                  </label>
                  <Field
                    disabled={isSubmitLoading}
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                      isSubmitLoading && "opacity-55"
                    } ${errors.price && "border-red-500"} transition-all`}
                    type="text"
                    id={`price`}
                    name={"price"}
                    innerRef={priceFocusRef}
                    onKeyPress={(event: {
                      key: string;
                      preventDefault: () => void;
                    }) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                  <ErrorMessage name="price" component="div">
                    {(msg) => (
                      <div className="flex gap-x-2 text-sm text-red-500 animate-appear">
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>

                  {/* Style select input */}
                  {!updateProductItem &&
                    Object.entries(styleValues).map(([key, styleValueList]) => (
                      <Fragment key={key}>
                        <label
                          className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                          htmlFor={`styleIds`}
                        >
                          {`Giá trị ${key}`}
                        </label>
                        <Field innerRef={styleValueFocusRef}>
                          {({ form }: FieldProps) => (
                            <Select
                              sx={{
                                "& .MuiInputBase-input": {
                                  // borderRadius: "0.375rem!important",
                                  border: `1px solid #6b7280`,
                                  padding: "0.375rem 0.75rem!important",
                                  flex: 1,
                                  fontSize: "14px",
                                  lineHeight: "20px",
                                  transition: "all",
                                  opacity: isSubmitLoading ? 0.55 : 1,
                                },
                                mb: "0.75rem",
                              }}
                              id={`styleValueIds-${key}`}
                              name={`styleValueIds-${key}`}
                              value={
                                form.values.styleValueIds &&
                                form.values.styleValueIds[key]
                                  ? form.values.styleValueIds[key]
                                  : ""
                              }
                              onChange={(
                                event: SelectChangeEvent<
                                  typeof form.values.styleValueIds
                                >
                              ) => {
                                const {
                                  target: { value },
                                } = event;

                                let id: number = -1;
                                if (typeof value === "string") {
                                  const styleValue = styleValues[key].find(
                                    (style_value) => style_value.name === value
                                  );
                                  if (styleValue) {
                                    id = styleValue.styleValueId;
                                  }
                                }
                                form.setFieldValue(
                                  "styleValueIds",
                                  // On autofill we get a stringified value.
                                  {
                                    ...form.values.styleValueIds,
                                    [key]: value,
                                  }
                                );
                                setStyleValueIds({
                                  ...styleValueIds,
                                  [key]: id,
                                });
                              }}
                            >
                              {styleValueList.map((styleValue) => (
                                <MenuItem
                                  key={styleValue.styleValueId}
                                  value={styleValue.name}
                                >
                                  {styleValue.name}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </Field>
                      </Fragment>
                    ))}
                  <ErrorMessage name="styleValueIds" component="div">
                    {(msg) => (
                      <div
                        className="mt-1 flex gap-x-2 text-sm text-red-500 animate-appear
            "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                  {/* Upload image */}
                  {
                    // Show image preview
                    values.image && (
                      <div className="w-full grid place-items-center mt-4">
                        <Image
                          width={100}
                          height={100}
                          className="size-24 rounded-sm border border-text-color"
                          src={values.image as string}
                          alt="cate-image"
                        ></Image>
                      </div>
                    )
                  }
                  <div className="w-full flex items-center justify-center">
                    <Field name="image" innerRef={imageFocusRef}>
                      {({ form }: FieldProps) => (
                        <InputFileUpload
                          name="image"
                          onChange={(event) => {
                            if (event.target.files) {
                              const files = event.target.files;
                              if (files && files.length > 0) {
                                const file = files[0];
                                setImage(file);
                                const reader = new FileReader();

                                reader.onload = (e) => {
                                  if (e.target && e.target.result) {
                                    const imageUrl = e.target.result;
                                    form.setFieldValue("image", imageUrl);
                                  }
                                };

                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                          disabled={isSubmitLoading}
                        />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="image" component="div">
                    {(msg) => (
                      <div
                        className="w-full mt-1 flex items-center justify-center gap-x-2 text-sm text-red-500 animate-appear
            "
                      >
                        <ErrorIcon className="size-5" />
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                  <div className="flex gap-x-2 justify-end w-full mt-4">
                    <button
                      type="button"
                      disabled={isSubmitLoading}
                      className={`mt-2 px-4 py-1 rounded-md w-[7rem]
                    bg-primary-color text-white self-end mr-3 ${
                      isSubmitLoading ? "opacity-55" : "hover:opacity-70"
                    }`}
                      onClick={
                        updateProductItem
                          ? () => {
                              setUpdateProductItem(null);
                              setImage("");
                            }
                          : () => resetState()
                      }
                    >
                      {updateProductItem ? "Quay lại" : "Hủy"}
                    </button>
                    <LoadingButton
                      disabled={!dirty || isSubmitLoading}
                      size="small"
                      type="submit"
                      loading={isSubmitting}
                      loadingIndicator={
                        <CircularProgress
                          sx={{ color: "white", width: 16, height: 16 }}
                          className="text-white"
                          size={16}
                        />
                      }
                      className={`mt-2 px-4 py-1 rounded-md text-white w-[7rem] 
              bg-primary-color  text-base self-end transition-all`}
                      sx={{
                        mt: 2,
                        px: 2,
                        py: 0.45,
                        borderRadius: "0.375rem",
                        color:
                          !dirty || isSubmitLoading
                            ? "#1a4845!important"
                            : "white",
                        width: "7rem",
                        backgroundColor: "#1a4845",
                        fontSize: "15px",
                        fontWeight: "300",
                        alignSelf: "end",
                        transition: "all",
                        opacity: !dirty || isSubmitLoading ? 0.55 : 1,
                        "&:hover": {
                          bgcolor: "#1a4845!important",
                          opacity: !dirty || isSubmitLoading ? 1 : 0.7,
                          color: "#white!important",
                        },
                      }}
                      onClick={submitForm}
                    >
                      <span
                        className={`text-white  ${
                          isSubmitLoading && "!text-primary-color"
                        }`}
                      >
                        {updateProductItem ? "Cập nhật" : "Tạo mới"}
                      </span>
                    </LoadingButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <Popup
            isActivePopup={true}
            padding={true}
            closeButton={{
              top: "-4px",
              right: "12px",
            }}
            open={openActivateDialog}
            onClose={() => {
              setActivateDialog(false);
              setTimeout(() => {
                setActivateProductItem(null);
              }, 100);
            }}
            title={
              activateProductItem?.isActive
                ? "Vô hiệu hóa phân loại này?"
                : "Kích hoạt phân loại này?"
            }
            content={undefined}
            actions={
              <>
                <button
                  type="button"
                  className="mt-2 px-4 py-1 rounded-md w-24
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3"
                  onClick={() => {
                    setActivateDialog(false);
                    setTimeout(() => {
                      setActivateProductItem(null);
                    }, 100);
                  }}
                >
                  Hủy
                </button>
                <LoadingButton
                  sx={{
                    mt: 2,
                    px: 2,
                    py: 0.45,
                    borderRadius: "0.375rem",
                    color: "white!important",
                    width: "7rem",
                    backgroundColor: "#1a4845",
                    fontSize: "15px",
                    fontWeight: "300",
                    alignSelf: "end",
                    transition: "all",
                    opacity: activateLoading ? 0.55 : 1,
                    "&:hover": {
                      bgcolor: "#1a4845!important",
                      opacity: activateLoading ? 1 : 0.7,
                      color: "#white!important",
                    },
                  }}
                  onClick={handleChangeProductItemActive}
                  type="button"
                  size="small"
                  className={`mt-2 px-4 py-1 rounded-md w-24
            bg-primary-color text-white self-end ${
              activateLoading && "opacity-55"
            }  hover:opacity-70`}
                  loading={activateLoading}
                  loadingIndicator={
                    <CircularProgress
                      sx={{ color: "white" }}
                      className="text-white"
                      size={16}
                    />
                  }
                  disabled={activateLoading}
                  variant="outlined"
                >
                  <span
                    className={`${activateLoading && "text-primary-color"}`}
                  >
                    Đồng ý
                  </span>
                </LoadingButton>
              </>
            }
          ></Popup>
        </Container>
      }
    />
  );
}

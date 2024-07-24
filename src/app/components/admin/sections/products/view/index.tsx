"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import Iconify from "../../../iconify";
import Scrollbar from "../../../scrollbar";
import ProductTableRow from "../product-table-row";
import ProductTableHead from "../product-table-head";
import ProductTableToolbar from "../product-table-toolbar";
import { getComparator } from "@/src/utilities/visual";
import {
  AddProduct,
  Brand,
  Category,
  KeyString,
  Product,
  Style,
} from "@/src/models";
import { applyFilter } from "../filter";
import { adminProductApi } from "@/src/app/apis/admin/productApi";
import TableNoData from "../../table-no-data";
import CircleLoading from "@/src/app/components/Loading";
import { debounce } from "lodash";
import Popup from "@/src/app/components/Popup";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import ErrorIcon from "@mui/icons-material/Error";

import InputFileUpload from "@/src/app/components/FileUploadInput";
import { showToast } from "@/src/lib/toastify";
import { LoadingButton } from "@mui/lab";
import Image from "next/image";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { adminCategoryApi } from "@/src/app/apis/admin/categoryApi";
import { adminBrandApi } from "@/src/app/apis/admin/brandApi";
import { adminStyleValueApi } from "@/src/app/apis/admin/styleValueApi";
import { MenuProps } from "@/src/utilities/multi-select-prop";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import AdminProductItem from "./product-item";
//@ts-ignore
import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";
import Editor from "@/src/app/components/Editor";
import AdminTagView from "./tag";
import AdminProductTag from "./tag";
// ----------------------------------------------------------------------

export default function ProductView() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState("productId");
  const [filterName, setFilterName] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [styleIds, setStyleIds] = useState<number[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateProduct, setUpdateProduct] = useState<Product | null>(null);
  const [openProductItemDialog, setOpenProductItemDialog] = useState(false);
  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [productTag, setProductTag] = useState<Product | null>(null);

  const [image, setImage] = useState<string | File>("");

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateProduct, setActivateProduct] = useState<Product | null>(null);

  const nameFocusRef = useRef<HTMLInputElement | null>(null);
  const categoryFocusRef = useRef<HTMLInputElement | null>(null);
  const brandFocusRef = useRef<HTMLInputElement | null>(null);
  const styleFocusRef = useRef<HTMLInputElement | null>(null);
  const imageFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getAllDatas = async () => {
      setIsLoading(true);

      const [
        productsResponse,
        categoriesResponse,
        brandsResponse,
        stylesResponse,
      ] = await Promise.all([
        adminProductApi.getAllProducts(),
        adminCategoryApi.getAllCategories({
          page: 0,
          size: 9999,
        }),
        adminBrandApi.getAllBrands({
          page: 0,
          size: 9999,
        }),
        adminStyleValueApi.getAllStyles({
          page: 0,
          size: 9999,
        }),
      ]);
      const filterCategories = categoriesResponse?.result.content.filter(
        (category) => category.isActive == true
      );
      const filterBrands = brandsResponse?.result.content.filter(
        (brand) => brand.isActive == true
      );
      const filterStyles = stylesResponse?.result.content.filter(
        (brand) => brand.isActive == true
      );
      setProducts(productsResponse?.result.content || []);
      setTotalProducts(productsResponse?.result.totalElements || 0);

      setCategories(filterCategories || []);

      setBrands(filterBrands || []);
      setStyles(filterStyles || []);

      setIsLoading(false);
    };

    getAllDatas();
  }, []);

  const getChangedValues = (values: AddProduct & KeyString) => {
    const changedValues: AddProduct & KeyString = {
      name: values.name,
      brandId: values.brandId,
      categoryId: values.categoryId,
      description: values.description,
      styleIds: styleIds,
    };

    if (image instanceof File) {
      changedValues.image = image;
    }

    if (updateProduct) {
      delete changedValues.styleIds;
      const updateProductForLoop: Product & KeyString = updateProduct;
      Object.keys(updateProductForLoop).forEach((key) => {
        if (updateProductForLoop[key] === values[key]) {
          delete changedValues[key];
        }
      });
    }

    return changedValues;
  };

  const handleChangeProductActive = async () => {
    setActivateLoading(true);
    const response = await adminProductApi.changeProductActivation(
      activateProduct?.productId!
    );
    if (!response?.success) {
      showToast("Thay đổi trạng thái sản phẩm thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetProducts(page, rowsPerPage);
    showToast(
      "Thay đổi trạng thái sản phẩm thành công",
      "success",
      "top-right"
    );
    setActivateLoading(false);
    setTimeout(() => {
      setActivateProduct(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleSort = (event: any, id: string) => {
    const isAsc = orderBy === id && order === "asc";
    if (id !== "") {
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = products.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleResetProducts = async (page: number, rowsPerPage: number) => {
    let result;
    if (!isNaN(Number(filterName)) && filterName !== "") {
      // filterName is a valid number
      result = await adminProductApi.getProductById(+filterName);
      setProducts(result?.result ? [result?.result] : []);
      setTotalProducts(result?.result ? 1 : 0);
      return;
    }
    result = await adminProductApi.getAllProducts({
      page: page,
      size: rowsPerPage,
      productName: filterName,
    });

    if (result?.statusCode != 200) {
      setProducts([]);
      setTotalProducts(0);
      return;
    }
    setProducts(result?.result.content || []);
    setTotalProducts(result?.result.totalElements || 0);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetProducts(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetProducts(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;
      if (!isNaN(Number(value)) && value !== "") {
        // value is a valid number
        result = await adminProductApi.getProductById(+value);
        setProducts(result?.result ? [result?.result] : []);
        setTotalProducts(result?.result ? 1 : 0);
        return;
      }
      result = await adminProductApi.getAllProducts({
        page: page,
        size: rowsPerPage,
        productName: value,
      });

      if (result?.statusCode != 200) {
        setProducts([]);
        setTotalProducts(0);
        return;
      }
      setProducts(result?.result.content || []);
      setTotalProducts(result?.result.totalElements || 0);
    }, 500),
    [page, rowsPerPage]
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    setFilterName(value);
    await handleSearch(value);
  };

  const dataFiltered = applyFilter({
    inputData: products,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  if (isLoading)
    return (
      <div className="w-full h-[80vh] grid place-items-center">
        <CircleLoading />
      </div>
    );

  return (
    <Container>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Sản phẩm</Typography>

        <Button
          onClick={() => {
            setOpenDialog(true);
          }}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Sản phẩm mới
        </Button>
      </Stack>

      <Card>
        <ProductTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <ProductTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "productId", label: "Mã sp" },
                  { id: "name", label: "Tên sản phẩm" },
                  { id: "priceMin", label: "Giá" },
                  { id: "promotionalPriceMin", label: "Giá ưu đãi" },
                  { id: "categoryName", label: "Danh mục" },
                  { id: "brandName", label: "Thương hiệu" },
                  { id: "totalQuantity", label: "Số lượng" },
                  { id: "totalSold", label: "Đã bán" },
                  { id: "status", label: "Giảm giá" },
                  { id: "isActive", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered &&
                  dataFiltered.length > 0 &&
                  dataFiltered.map((row: Product) => (
                    <ProductTableRow
                      key={row.productId}
                      product={row}
                      setUpdateProduct={setUpdateProduct}
                      setProductDetail={setProductDetail}
                      setProductTag={setProductTag}
                      setOpenDialog={setOpenDialog}
                      setOpenProductItemDialog={setOpenProductItemDialog}
                      setOpenTagDialog={setOpenTagDialog}
                      setActivateDialog={setActivateDialog}
                      setActivateProduct={setActivateProduct}
                    />
                  ))}

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={totalProducts}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

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
            setActivateProduct(null);
          }, 100);
        }}
        title={
          activateProduct?.isActive
            ? "Vô hiệu hóa sản phẩm này?"
            : "Kích hoạt sản phẩm này?"
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
                  setActivateProduct(null);
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
              onClick={handleChangeProductActive}
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
              <span className={`${activateLoading && "text-primary-color"}`}>
                Đồng ý
              </span>
            </LoadingButton>
          </>
        }
      ></Popup>

      {/* Product Dialog */}
      <Popup
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setTimeout(() => {
            setUpdateProduct(null);
            setImage("");
          }, 100);
        }}
        title={updateProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<AddProduct>
              initialValues={{
                name: updateProduct ? updateProduct.name : "",
                description: (updateProduct && updateProduct.description) ?? "",
                image: updateProduct ? updateProduct.image : "",
                categoryId: updateProduct ? updateProduct.categoryId : "",
                brandId: updateProduct ? updateProduct.brandId : "",
                styleIds: [],
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors: Omit<
                  Record<keyof AddProduct, string>,
                  "description"
                > = {
                  name: "",
                  image: "",
                  categoryId: "",
                  brandId: "",
                  styleIds: "",
                };
                if (!values.name || values.name.length === 0) {
                  errors.name = "Vui lòng nhập tên sản phẩm";
                  nameFocusRef.current?.focus();
                  return errors;
                }

                if (values.categoryId === "") {
                  errors.categoryId = "Vui lòng chọn danh mục";
                  categoryFocusRef.current?.focus();
                  return errors;
                }

                if (values.brandId === "") {
                  errors.brandId = "Vui lòng chọn thương hiệu";
                  brandFocusRef.current?.focus();
                  return errors;
                }
                if (!updateProduct && values.styleIds?.length === 0) {
                  errors.styleIds = "Vui lòng chọn ít nhất 1 thuộc tính";
                  styleFocusRef.current?.focus();
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
              onSubmit={async (values, { setFieldError }) => {
                setIsSubmitLoading(true);
                const changeValues = getChangedValues(values);
                console.log(changeValues);
                let response;
                response = updateProduct
                  ? await adminProductApi.updateProduct(
                      updateProduct.productId,
                      changeValues
                    )
                  : await adminProductApi.createNewProduct(changeValues);
                if (response?.statusCode == 409) {
                  showToast("Sản phẩm đã tồn tại", "error");
                  setFieldError("name", "Sản phẩm đã tồn tại");
                  setIsLoading(false);
                  setIsSubmitLoading(false);
                  setTimeout(() => {
                    nameFocusRef.current?.focus();
                  });
                  return;
                } else if (!response?.success) {
                  showToast("Có lỗi xảy ra, vui lòng thử lại sau", "error");
                  setIsLoading(false);
                  setIsSubmitLoading(false);
                  return;
                }
                await handleResetProducts(page, rowsPerPage);
                showToast(
                  `${updateProduct ? "Cập nhật" : "Tạo"} sản phẩm thành công`,
                  "success"
                );
                setOpenDialog(false);
                setUpdateProduct(null);
                setIsSubmitLoading(false);
              }}
            >
              {({
                values,
                errors,
                submitForm,
                isSubmitting,
                dirty,
                setFieldValue,
              }) => (
                <Form className="flex flex-col mt-2">
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                          border-b border-border-color"
                    htmlFor={`name`}
                  >
                    Tên sản phẩm
                  </label>
                  <Field
                    disabled={isSubmitLoading}
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                      isSubmitLoading && "opacity-55"
                    } ${errors.name && "border-red-500"} transition-all`}
                    type="text"
                    id={`name`}
                    name={"name"}
                    innerRef={nameFocusRef}
                  />
                  <ErrorMessage name="name" component="div">
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
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                    htmlFor={`name`}
                  >
                    Mô tả
                  </label>
                  <Field
                    className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                      isSubmitLoading && "opacity-55"
                    } transition-all`}
                    name={"description"}
                  >
                    {({ form }: FieldProps) => (
                      // <OutlinedInput
                      //   sx={{
                      //     // borderRadius: "0.375rem!important",
                      //     border: "1px solid #6b7280",
                      //     padding: "0.375rem 0.75rem!important",
                      //     flex: 1,
                      //     fontSize: "14px",
                      //     lineHeight: "20px",
                      //     transition: "all",
                      //     opacity: isSubmitLoading ? 0.55 : 1,
                      //     mb: "0.75rem",
                      //   }}
                      //   inputProps={{ maxLength: 2000 }}
                      //   type="text"
                      //   rows={4}
                      //   multiline
                      //   autoComplete="true"
                      //   id="description"
                      //   name="description"
                      //   value={form.values.description}
                      //   onChange={(event) => {
                      //     form.setFieldValue("description", event.target.value);
                      //   }}
                      //   disabled={isSubmitLoading}
                      // ></OutlinedInput>
                      <Editor
                        fieldName={"description"}
                        content={values.description || ""}
                        setContent={setFieldValue}
                      />
                    )}
                  </Field>
                  {/* This is category select input */}
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                    htmlFor={`categoryId`}
                  >
                    Danh mục
                  </label>
                  <Field name={"categoryId"} innerRef={categoryFocusRef}>
                    {({ form }: FieldProps) => (
                      <Select
                        sx={{
                          "& .MuiInputBase-input": {
                            // borderRadius: "0.375rem!important",
                            border: `1px solid ${
                              errors.categoryId ? "red" : "#6b7280"
                            }`,
                            padding: "0.375rem 0.75rem!important",
                            flex: 1,
                            fontSize: "14px",
                            lineHeight: "20px",
                            transition: "all",
                            opacity: isSubmitLoading ? 0.55 : 1,
                          },
                          mb: "0.75rem",
                        }}
                        id="categoryId"
                        value={form.values.categoryId}
                        name={"categoryId"}
                        onChange={(event) => {
                          form.setFieldValue("categoryId", event.target.value);
                        }}
                        disabled={isSubmitLoading}
                      >
                        {categories.map((cate) => (
                          <MenuItem
                            key={cate.categoryId}
                            value={cate.categoryId}
                          >
                            {cate.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="categoryId" component="div">
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

                  {/* This is brand select input */}
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                    htmlFor={`brandId`}
                  >
                    Thương hiệu
                  </label>
                  <Field
                    className={`${errors.brandId && "border-red-500"}`}
                    name={"brandId"}
                    innerRef={brandFocusRef}
                  >
                    {({ form }: FieldProps) => (
                      <Select
                        sx={{
                          "& .MuiInputBase-input": {
                            // borderRadius: "0.375rem!important",
                            border: `1px solid ${
                              errors.brandId ? "red" : "#6b7280"
                            }`,
                            padding: "0.375rem 0.75rem!important",
                            flex: 1,
                            fontSize: "14px",
                            lineHeight: "20px",
                            transition: "all",
                            opacity: isSubmitLoading ? 0.55 : 1,
                          },
                          mb: "0.75rem",
                        }}
                        id="brandId"
                        value={form.values.brandId}
                        name={"brandId"}
                        onChange={(event) => {
                          const name = event.target.value;
                          form.setFieldValue("brandId", name);
                        }}
                        disabled={isSubmitLoading}
                      >
                        {brands.map((brand) => (
                          <MenuItem key={brand.brandId} value={brand.brandId}>
                            {brand.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="brandId" component="div">
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
                  {/* Style select input */}
                  {!updateProduct && (
                    <>
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                        htmlFor={`styleIds`}
                      >
                        Thuộc tính
                      </label>
                      <Field
                        className={`${errors.styleIds && "border-red-500"}`}
                        name={"styleIds"}
                        innerRef={styleFocusRef}
                      >
                        {({ form }: FieldProps) => (
                          <Select
                            sx={{
                              "& .MuiInputBase-input": {
                                // borderRadius: "0.375rem!important",
                                border: `1px solid ${
                                  errors.styleIds ? "red" : "#6b7280"
                                }`,
                                padding: "0.375rem 0.75rem!important",
                                flex: 1,
                                fontSize: "14px",
                                lineHeight: "20px",
                                transition: "all",
                                opacity: isSubmitLoading ? 0.55 : 1,
                              },
                              mb: "0.75rem",
                            }}
                            id={`styleIds`}
                            multiple
                            name={"styleIds"}
                            value={form.values.styleIds}
                            onChange={(
                              event: SelectChangeEvent<
                                typeof form.values.styleIds
                              >
                            ) => {
                              const {
                                target: { value },
                              } = event;

                              let ids: number[] = [];
                              if (typeof value === "string") {
                                const style = styles.find(
                                  (style) => style.name === value
                                );
                                if (style) {
                                  ids.push(style.styleId);
                                }
                              } else {
                                ids = value
                                  .map((val: string) => {
                                    const style = styles.find(
                                      (style) => style.name === val
                                    );
                                    return style ? style.styleId : "";
                                  })
                                  .filter(Boolean); // Loại bỏ các giá trị rỗng
                              }
                              form.setFieldValue(
                                "styleIds",
                                // On autofill we get a stringified value.
                                typeof value === "string"
                                  ? value.split(",")
                                  : value
                              );
                              setStyleIds(ids);
                            }}
                            // input={<OutlinedInput label={"Thương hiệu"} />}
                            renderValue={(selected: string[]) =>
                              selected.join(", ")
                            }
                            MenuProps={MenuProps}
                          >
                            {styles.map((style) => (
                              <MenuItem key={style.styleId} value={style.name}>
                                <Checkbox
                                  checked={
                                    form.values.styleIds.indexOf(style.name) >
                                    -1
                                  }
                                />
                                <ListItemText primary={style.name} />
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage name="styleIds" component="div">
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
                    </>
                  )}
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
                      onClick={() => {
                        setOpenDialog(false);
                      }}
                    >
                      Hủy
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
                        {updateProduct ? "Cập nhật" : "Tạo mới"}
                      </span>
                    </LoadingButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        }
      />
      <AdminProductItem
        open={openProductItemDialog}
        onClose={() => {
          setOpenProductItemDialog(false);
          setTimeout(() => {
            setProductDetail(null);
          }, 100);
        }}
        setProducts={setProducts}
        setTotalProducts={setTotalProducts}
        productName={productDetail?.name || ""}
        productId={productDetail?.productId || -1}
      />

      <AdminProductTag
        open={openTagDialog}
        onClose={() => {
          setOpenTagDialog(false);
          setTimeout(() => {
            setProductTag(null);
          }, 100);
        }}
        // setProducts={setProducts}
        // setTotalProducts={setTotalProducts}
        // productName={productDetail?.name || ""}
        productId={productTag?.productId || -1}
      />
    </Container>
  );
}

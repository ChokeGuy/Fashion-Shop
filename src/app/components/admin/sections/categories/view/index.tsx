"use client";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import ErrorIcon from "@mui/icons-material/Error";

import Iconify from "../../../iconify";
import Scrollbar from "../../../scrollbar";
import CategoryTableRow from "../category-table-row";
import CategoryTableHead from "../category-table-head";
import CategoryTableToolbar from "../category-table-toolbar";
import { getComparator } from "@/src/utilities/visual";
import { Category, KeyString } from "@/src/models";
import { applyFilter } from "../filter";
import TableNoData from "../../table-no-data";
import Popup from "@/src/app/components/Popup";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import Box from "@mui/material/Box";
import InputFileUpload from "@/src/app/components/FileUploadInput";
import { adminCategoryApi } from "@/src/app/apis/admin/categoryApi";
import { showToast } from "@/src/lib/toastify";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircleLoading from "@/src/app/components/Loading";
import { debounce } from "lodash";
// ----------------------------------------------------------------------

export default function CategoryView() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);

  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [parentUpdateCategories, setParentUpdateCategories] = useState<
    Category[]
  >([]);
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateCategory, setUpdateCategory] = useState<Category | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [image, setImage] = useState<string | File>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("categoryId");

  const [filterName, setFilterName] = useState("");

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateCategory, setActivateCategory] = useState<Category | null>(
    null
  );

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const nameFocusRef = useRef<HTMLInputElement | null>(null);
  const imageFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getAllcategories = async () => {
      setIsLoading(true);

      const [response, response2] = await Promise.all([
        adminCategoryApi.getAllCategories({
          page: 0,
          size: rowsPerPage,
        }),
        adminCategoryApi.getAllCategories({
          page: 0,
          size: 9999,
        }),
      ]);
      const parentCategories =
        response2?.result.content.filter(
          (value) => value.isActive == true && value.parentName == null
        ) || [];

      setCategories(response?.result.content || []);
      setTotalCategories(response?.result.totalElements || 0);
      setParentCategories(parentCategories);
      setIsLoading(false);
    };

    getAllcategories();
  }, []);

  const getChangedValues = (
    values: {
      name?: string;
      parentId?: string;
      imageFile?: File | string;
    } & KeyString
  ) => {
    const changedValues: {
      name?: string;
      parentId?: string;
      imageFile?: File | string;
    } & KeyString = {
      name: values.name,
    };

    if (values.parentId !== "") {
      changedValues.parentId = values.parentId;
    }

    if (image instanceof File) {
      changedValues.imageFile = image;
    }

    if (updateCategory) {
      if (
        values.parentId === getParenIdByParentName(updateCategory.parentName)
      ) {
        delete changedValues.parentId;
      }
      if (values.name === updateCategory.name) {
        delete changedValues.name;
      }
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

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = categories.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleResetCategories = async (page: number, rowsPerPage: number) => {
    let result;
    if (!isNaN(Number(filterName)) && filterName != "") {
      result = await adminCategoryApi.getCategoryById(+filterName);
      setCategories(result?.result ? [result?.result] : []);
      setTotalCategories(result?.result ? 1 : 0);
      return;
    }

    result = await adminCategoryApi.getCategoriesByName(filterName, {
      page: page,
      size: rowsPerPage,
    });
    if (result?.statusCode != 200) {
      setCategories([]);
      setTotalCategories(0);
      return;
    }
    setCategories(result?.result.content || []);
    setTotalCategories(result?.result.totalElements || 0);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetCategories(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetCategories(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleChangeCategoryActive = async () => {
    setActivateLoading(true);
    const response = await adminCategoryApi.changeCategoryActivation(
      activateCategory?.categoryId!
    );
    if (!response?.success) {
      showToast("Thay đổi trạng thái danh mục thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetCategories(page, rowsPerPage);
    showToast(
      "Thay đổi trạng thái danh mục thành công",
      "success",
      "top-right"
    );
    setActivateLoading(false);
    setTimeout(() => {
      setActivateCategory(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;

      if (!isNaN(Number(value)) && value != "") {
        result = await adminCategoryApi.getCategoryById(+value);
        setCategories(result?.result ? [result?.result] : []);
        setTotalCategories(result?.result ? 1 : 0);
        return;
      }

      result = await adminCategoryApi.getCategoriesByName(value, {
        page: 0,
        size: rowsPerPage,
      });
      if (result?.statusCode != 200) {
        setCategories([]);
        setTotalCategories(0);
        return;
      }
      setCategories(result?.result.content || []);
      setTotalCategories(result?.result.totalElements || 0);
    }, 500),
    [page, rowsPerPage]
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    setFilterName(value);
    await handleSearch(value);
  };

  const getParenIdByParentName = (name?: string): string => {
    const id = parentCategories.find((c) => c.name === name);
    return id?.categoryId.toString() || "";
  };

  const getUpdateParenIdByParentName = (name?: string): string => {
    const id = parentUpdateCategories.find((c) => c.name === name);
    return id?.categoryId.toString() || "";
  };

  const dataFiltered = applyFilter({
    inputData: categories,
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
        <Typography variant="h4">Danh mục sản phẩm</Typography>

        <Button
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Danh mục mới
        </Button>
      </Stack>

      <Card>
        <CategoryTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <CategoryTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "categoryId", label: "Id" },
                  { id: "name", label: "Tên danh mục" },
                  { id: "status", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered &&
                  dataFiltered.length > 0 &&
                  dataFiltered.map((row: Category) => (
                    <CategoryTableRow
                      key={row.categoryId}
                      setOpenDialog={setOpenDialog}
                      setUpdateCategory={setUpdateCategory}
                      setActivateDialog={setActivateDialog}
                      setActivateCategory={setActivateCategory}
                      setParentUpdateCategories={setParentUpdateCategories}
                      category={row}
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
          count={totalCategories}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[10, 25, 50]}
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
            setActivateCategory(null);
          }, 100);
        }}
        title={
          activateCategory?.isActive
            ? "Vô hiệu hóa danh mục này?"
            : "Kích hoạt danh mục này?"
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
                  setActivateCategory(null);
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
              onClick={handleChangeCategoryActive}
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

      <Popup
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setTimeout(() => {
            setUpdateCategory(null);
            setImage("");
            setParentUpdateCategories([]);
          }, 100);
        }}
        title={updateCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<
              {
                name?: string;
                parentId?: string;
                imageFile?: File | string;
              } & KeyString
            >
              initialValues={
                updateCategory
                  ? {
                      name: updateCategory.name,
                      parentId: getUpdateParenIdByParentName(
                        updateCategory.parentName
                      ),
                      imageFile: updateCategory.image,
                    }
                  : {
                      name: "",
                      parentId: "",
                      imageFile: "",
                    }
              }
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors: {
                  name?: string;
                  parentId?: string;
                  imageFile?: string | File;
                } & KeyString = {
                  name: "",
                  parentId: "",
                  imageFile: "",
                };
                if (!values.name || values.name.length === 0) {
                  errors.name = "Vui lòng nhập tên danh mục";
                  nameFocusRef.current?.focus();
                  return errors;
                }

                if (
                  typeof values.imageFile == "string" &&
                  values.imageFile?.includes("res.cloudinary.com")
                ) {
                  return;
                }
                if (values.imageFile === "") {
                  errors.imageFile = "Vui lòng tải ảnh";
                  imageFocusRef.current?.focus();
                  return errors;
                }
                // Validate imageFile
                const file = image as File;
                const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                const maxSize = 2 * 1024 * 1024; // 2MB
                if (!allowedTypes.includes(file.type)) {
                  errors.imageFile = "File phải có định dạng JPEG,JPG,...";
                  imageFocusRef.current?.focus();
                  return errors;
                } else if (file.size > maxSize) {
                  errors.imageFile = "Kích thước file phải nhỏ hơn 2MB";
                  imageFocusRef.current?.focus();
                  return errors;
                }
              }}
              onSubmit={async (values, { setFieldError }) => {
                setIsSubmitLoading(true);
                const changeValues = getChangedValues(values);
                let response;
                response = updateCategory
                  ? await adminCategoryApi.updateCategory(
                      updateCategory.categoryId,
                      changeValues
                    )
                  : await adminCategoryApi.createNewCategory(changeValues);
                if (response?.statusCode == 409) {
                  setFieldError("name", "Danh mục đã tồn tại");
                  showToast("Danh mục đã tồn tại", "error");
                  setIsSubmitLoading(false);
                  setTimeout(() => {
                    nameFocusRef.current?.focus();
                  });
                  return;
                }
                await handleResetCategories(page, rowsPerPage);
                showToast(
                  `${updateCategory ? "Cập nhật" : "Tạo"} danh mục thành công`,
                  "success"
                );
                setOpenDialog(false);
                setUpdateCategory(null);
                setIsSubmitLoading(false);
              }}
            >
              {({ values, errors, submitForm, isSubmitting, dirty }) => (
                <Form className="flex flex-col mt-2">
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                    htmlFor={`name`}
                  >
                    Tên danh mục
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
                    htmlFor={`parentId`}
                  >
                    Danh mục cha
                  </label>
                  <Field
                    // className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                    //   isSubmitLoading && "opacity-55"
                    // } transition-all`}
                    name={"parentId"}
                  >
                    {({ form }: FieldProps) => (
                      <Select
                        sx={{
                          "& .MuiInputBase-input": {
                            // borderRadius: "0.375rem!important",
                            border: "1px solid #6b7280",
                            padding: "0.375rem 0.75rem!important",
                            flex: 1,
                            fontSize: "14px",
                            lineHeight: "20px",
                            transition: "all",
                            opacity: isSubmitLoading ? 0.55 : 1,
                          },
                          mb: "0.75rem",
                        }}
                        id="parentId"
                        value={form.values.parentId}
                        name={"parentId"}
                        onChange={(event) => {
                          form.setFieldValue("parentId", event.target.value);
                        }}
                        disabled={isSubmitLoading}
                      >
                        {(updateCategory
                          ? parentUpdateCategories
                          : parentCategories
                        ).map((cate) => (
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
                  <ErrorMessage name="parentId" component="div">
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
                  {
                    // Show image preview
                    values.imageFile && (
                      <div className="w-full grid place-items-center mt-4">
                        <Image
                          width={100}
                          height={100}
                          className="size-24 rounded-sm border border-text-color"
                          src={values.imageFile as string}
                          alt="cate-image"
                        ></Image>
                      </div>
                    )
                  }
                  <div className="w-full flex items-center justify-center">
                    <Field name="imageFile" innerRef={imageFocusRef}>
                      {({ form }: FieldProps) => (
                        <InputFileUpload
                          name="imageFile"
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
                                    form.setFieldValue("imageFile", imageUrl);
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
                  <ErrorMessage name="imageFile" component="div">
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
                        {updateCategory ? "Cập nhật" : "Tạo mới"}
                      </span>
                    </LoadingButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        }
      />
    </Container>
  );
}

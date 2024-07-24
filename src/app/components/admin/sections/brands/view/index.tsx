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

import Iconify from "../../../iconify";
import Scrollbar from "../../../scrollbar";
import BrandTableRow from "../brand-table-row";
import BrandTableHead from "../brand-table-head";
import BrandTableToolbar from "../brand-table-toolbar";
import { emptyRows, getComparator } from "@/src/utilities/visual";
import { AddBrand, Brand, KeyString } from "@/src/models";
import { applyFilter } from "../filter";
import TableEmptyRows from "../../table-empty-rows";
import TableNoData from "../../table-no-data";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import Popup from "@/src/app/components/Popup";
import { showToast } from "@/src/lib/toastify";
import { LoadingButton } from "@mui/lab";
import ErrorIcon from "@mui/icons-material/Error";
import { Select, MenuItem, CircularProgress } from "@mui/material";
import { adminBrandApi } from "@/src/app/apis/admin/brandApi";
import { All_NATIONS } from "@/src/constants/nation";
import CircleLoading from "@/src/app/components/Loading";
import { debounce } from "lodash";
// ----------------------------------------------------------------------

export default function BrandView() {
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateBrand, setUpdateBrand] = useState<Brand | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("brandId");

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateBrand, setActivateBrand] = useState<Brand | null>(null);

  const nameFocusRef = useRef<HTMLInputElement>(null);
  const nationFocusRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const getAllbrands = async () => {
      setIsLoading(true);
      const response = await adminBrandApi.getAllBrands();
      setBrands(response?.result.content || []);
      setTotalBrands(response?.result.totalElements || 0);
      setIsLoading(false);
    };
    getAllbrands();
  }, []);

  const getChangedValues = (values: AddBrand & KeyString) => {
    const changedValues: AddBrand & KeyString = {
      name: values.name,
      nation: values.nation,
    };

    if (updateBrand) {
      const updateBrandForLoop: Brand & KeyString = updateBrand;
      Object.keys(updateBrandForLoop).forEach((key) => {
        if (updateBrandForLoop[key] === values[key]) {
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

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = brands.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleResetBrand = async (page: number, rowsPerPage: number) => {
    let result;
    if (!isNaN(Number(filterName)) && filterName != "") {
      result = await adminBrandApi.getBrandById(+filterName);
      if (result?.statusCode != 200) {
        setBrands([]);
        setTotalBrands(0);
        return;
      }
      setBrands(result?.result ? [result?.result] : []);
      setTotalBrands(result?.result ? 1 : 0);
      return;
    }
    result = await adminBrandApi.getBrandsByName(filterName, {
      page: page,
      size: rowsPerPage,
    });
    if (result?.statusCode != 200) {
      setBrands([]);
      setTotalBrands(0);
      return;
    }
    setBrands(result?.result.content || []);
    setTotalBrands(result?.result.totalElements || 0);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetBrand(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetBrand(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleChangeBrandActive = async () => {
    setActivateLoading(true);
    const response = await adminBrandApi.changeBrandActivation(
      activateBrand?.brandId!
    );
    if (!response?.success) {
      showToast("Thay đổi trạng thái thương hiệu thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetBrand(page, rowsPerPage);
    showToast(
      "Thay đổi trạng thái thương hiệu thành công",
      "success",
      "top-right"
    );
    setActivateLoading(false);
    setTimeout(() => {
      setActivateBrand(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;
      if (!isNaN(Number(value)) && value != "") {
        result = await adminBrandApi.getBrandById(+value);
        if (result?.statusCode != 200) {
          setBrands([]);
          setTotalBrands(0);
          return;
        }
        setBrands(result?.result ? [result?.result] : []);
        setTotalBrands(result?.result ? 1 : 0);
        return;
      }
      result = await adminBrandApi.getBrandsByName(value, {
        page: 0,
        size: rowsPerPage,
      });
      if (result?.statusCode != 200) {
        setBrands([]);
        setTotalBrands(0);
        return;
      }
      setBrands(result?.result.content || []);
      setTotalBrands(result?.result.totalElements || 0);
    }, 500),
    [page, rowsPerPage]
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    await handleSearch(value);
    setFilterName(value);
  };

  const dataFiltered = applyFilter({
    inputData: brands,
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
        <Typography variant="h4">Thương hiệu sản phẩm</Typography>

        <Button
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Thương hiệu mới
        </Button>
      </Stack>

      <Card>
        <BrandTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <BrandTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "brandId", label: "Id" },
                  { id: "name", label: "Tên thương hiệu" },
                  { id: "nation", label: "Quốc gia" },
                  { id: "status", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered &&
                  dataFiltered.length > 0 &&
                  dataFiltered.map((row: Brand) => (
                    <BrandTableRow
                      setOpenDialog={setOpenDialog}
                      setUpdateBrand={setUpdateBrand}
                      key={row.brandId}
                      brand={row}
                      setActivateDialog={setActivateDialog}
                      setActivateBrand={setActivateBrand}
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
          count={totalBrands}
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
            setActivateBrand(null);
          }, 100);
        }}
        title={
          activateBrand?.isActive
            ? "Vô hiệu hóa thương hiệu này?"
            : "Kích hoạt thương hiệu này?"
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
                  setActivateBrand(null);
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
              onClick={handleChangeBrandActive}
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
            setUpdateBrand(null);
          }, 400);
        }}
        title={updateBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<AddBrand & KeyString>
              initialValues={
                updateBrand
                  ? {
                      name: updateBrand.name,
                      nation: updateBrand.nation,
                    }
                  : {
                      name: "",
                      nation: "",
                    }
              }
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors: AddBrand & KeyString = {
                  name: "",
                  nation: "",
                };
                if (!values.name || values.name.length === 0) {
                  errors.name = "Vui lòng nhập tên thương hiệu";
                  nameFocusRef.current?.focus();
                  return errors;
                }
                if (!values.nation || values.nation.length === 0) {
                  errors.name = "Vui lòng chọn quốc gia";
                  nationFocusRef.current?.focus();
                  return errors;
                }
              }}
              onSubmit={async (values, { setFieldError }) => {
                setIsSubmitLoading(true);
                const changeValues = getChangedValues(values);
                let response;
                response = updateBrand
                  ? await adminBrandApi.updateBrand(
                      updateBrand.brandId,
                      changeValues
                    )
                  : await adminBrandApi.createNewBrand(changeValues);
                if (
                  response?.statusCode == 409 ||
                  response?.message === "This name already exist"
                ) {
                  showToast("Thương hiệu đã tồn tại", "error");
                  setFieldError("name", "Thương hiệu này đã tồn tại");
                  setIsSubmitLoading(false);
                  setTimeout(() => {
                    nameFocusRef.current?.focus();
                  });
                  return;
                }
                await handleResetBrand(page, rowsPerPage);
                showToast(
                  `${updateBrand ? "Cập nhật" : "Tạo"} thương hiệu thành công`,
                  "success"
                );
                setOpenDialog(false);
                setTimeout(() => {
                  setUpdateBrand(null);
                }, 100);
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
                    Tên thương hiệu
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
                    htmlFor={`nation`}
                  >
                    Quốc gia
                  </label>
                  <Field name={"nation"} innerRef={nationFocusRef}>
                    {({ form }: FieldProps) => (
                      <Select
                        sx={{
                          "& .MuiInputBase-input": {
                            // borderRadius: "0.375rem!important",
                            border: `1px solid ${
                              errors.nation ? "red" : "#6b7280"
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
                        id="nation"
                        value={form.values.nation}
                        name={"nation"}
                        onChange={(event) => {
                          form.setFieldValue("nation", event.target.value);
                        }}
                        disabled={isSubmitLoading}
                      >
                        {All_NATIONS.map((nation, index) => (
                          <MenuItem key={`${nation}-${index}`} value={nation}>
                            {nation}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="nation" component="div">
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
                        {updateBrand ? "Cập nhật" : "Tạo mới"}
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

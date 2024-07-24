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
import StyleValueTableRow from "../style-value-table-row";
import StyleValueTableHead from "../style-value-table-head";
import StyleValueTableToolbar from "../style-value-table-toolbar";
import { getComparator } from "@/src/utilities/visual";
import { AddStyleValue, KeyString, Style, StyleValue } from "@/src/models";
import { applyFilter } from "../filter";
import TableNoData from "../../table-no-data";
import { adminStyleValueApi } from "@/src/app/apis/admin/styleValueApi";
import Popup from "@/src/app/components/Popup";
import { showToast } from "@/src/lib/toastify";
import { LoadingButton } from "@mui/lab";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import ErrorIcon from "@mui/icons-material/Error";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import CircleLoading from "@/src/app/components/Loading";
import { useSearchParams } from "next/navigation";
import { debounce } from "lodash";

// ----------------------------------------------------------------------

export default function StyleValueView() {
  const [isLoading, setIsLoading] = useState(false);
  const [styleValues, setStyleValues] = useState<StyleValue[]>([]);
  const [totalStyleValues, setTotalStyleValues] = useState(0);
  const [styleName, setStyleName] = useState<string>("");

  const [styles, setStyles] = useState<Style[] | undefined>([]);
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateStyleValue, setUpdateStyleValue] = useState<StyleValue | null>(
    null
  );
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("styleValueId");

  const [filterName, setFilterName] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateStyleValue, setActivateStyleValue] =
    useState<StyleValue | null>(null);

  const nameFocusRef = useRef<HTMLInputElement>(null);
  const styleFocusRef = useRef<HTMLInputElement>(null);
  const styleValueCodeFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getDatas = async () => {
      setIsLoading(true);
      const [styleValuesResponse, stylesResponse] = await Promise.all([
        adminStyleValueApi.getAllStyleValues({
          page: page,
          size: rowsPerPage,
        }),
        adminStyleValueApi.getAllStyles({
          page: 0,
          size: 9999,
        }),
      ]);
      const filterStyles = stylesResponse?.result.content.filter(
        (style) => style.isActive
      );
      setStyleValues(styleValuesResponse?.result.content || []);
      setTotalStyleValues(styleValuesResponse?.result.totalElements || 0);
      setStyles(filterStyles || []);
      setIsLoading(false);
    };

    getDatas();
  }, []);

  const getChangedValues = (values: AddStyleValue & KeyString) => {
    const changedValues: AddStyleValue & KeyString = {
      name: values.name,
      styleId: values.styleId,
      styleValueCode: values.styleValueCode,
    };

    if (updateStyleValue) {
      const updateStyleValueForLoop: AddStyleValue & KeyString =
        updateStyleValue;
      Object.keys(updateStyleValueForLoop).forEach((key) => {
        if (updateStyleValueForLoop[key] === values[key]) {
          delete changedValues[key];
        }
      });
    }
    if (changedValues.styleId !== "1" && changedValues.styleValueCode == "") {
      delete changedValues.styleValueCode;
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
      const newSelecteds = styleValues.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleResetStyleValues = async (
    styleName: string,
    page: number,
    rowsPerPage: number
  ) => {
    let result;
    if (!isNaN(Number(filterName)) && filterName !== "") {
      result = await adminStyleValueApi.getStyleValueById(+filterName);

      setStyleValues(result?.result ? [result?.result] : []);
      setTotalStyleValues(result?.result ? 1 : 0);
      return;
    }
    if (filterName === "") {
      if (styleName && styleName.length > 0) {
        result = await adminStyleValueApi.getStyleValuesByStyleName({
          styleName,
          page: page,
          size: rowsPerPage,
        });
      } else
        result = await adminStyleValueApi.getAllStyleValues({
          page: page,
          size: rowsPerPage,
        });
    } else {
      result = await adminStyleValueApi.getStyleValuesByStyleValueName(
        filterName,
        {
          page: page,
          size: rowsPerPage,
        }
      );
    }
    if (result?.statusCode != 200) {
      setStyleValues([]);
      setTotalStyleValues(0);
      return;
    }
    setStyleValues(result?.result.content || []);
    setTotalStyleValues(result?.result.totalElements || 0);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetStyleValues(styleName, newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetStyleValues(styleName, 0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleChangeStyleValueActive = async () => {
    setActivateLoading(true);
    const response = await adminStyleValueApi.changeStyleValueActivation(
      activateStyleValue?.styleValueId!
    );
    if (
      response?.message ==
      "Cannot deactivate the style value because it is being used by a product item"
    ) {
      showToast(
        "Giá trị này đang được sử dụng trong một phân loại sản phẩm",
        "error"
      );
      setActivateLoading(false);
      return;
    }
    await handleResetStyleValues(styleName, page, rowsPerPage);
    showToast("Thay đổi trạng thái giá trị thành công", "success", "top-right");
    setActivateLoading(false);
    setTimeout(() => {
      setActivateStyleValue(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;
      if (!isNaN(Number(value)) && value !== "") {
        result = await adminStyleValueApi.getStyleValueById(+value);

        setStyleValues(result?.result ? [result?.result] : []);
        setTotalStyleValues(result?.result ? 1 : 0);
        return;
      }
      if (value === "") {
        if (styleName && styleName.length > 0) {
          result = await adminStyleValueApi.getStyleValuesByStyleName({
            styleName,
            page: 0,
            size: rowsPerPage,
          });
        } else
          result = await adminStyleValueApi.getAllStyleValues({
            page: page,
            size: rowsPerPage,
          });
      } else {
        result = await adminStyleValueApi.getStyleValuesByStyleValueName(
          value,
          {
            page: 0,
            size: rowsPerPage,
          }
        );
      }
      if (result?.statusCode != 200) {
        setStyleValues([]);
        setTotalStyleValues(0);
        return;
      }

      setStyleValues(result?.result.content || []);
      setTotalStyleValues(result?.result.totalElements || 0);
    }, 500),
    [page, rowsPerPage, styleName]
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    await handleSearch(value);
    setFilterName(value);
  };

  const dataFiltered = applyFilter({
    inputData: styleValues,
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
        <Typography variant="h4">Giá trị thuộc tính</Typography>

        <Button
          onClick={() => {
            setOpenDialog(true);
          }}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Giá trị mới
        </Button>
      </Stack>

      <Card>
        <StyleValueTableToolbar
          styles={styles ?? []}
          styleName={styleName}
          setStyleName={setStyleName}
          setStyleValues={setStyleValues}
          setTotalStyleValues={setTotalStyleValues}
          setPage={setPage}
          setSize={setRowsPerPage}
          numSelected={selected.length}
          filterName={filterName}
          page={page}
          rowsPerPage={rowsPerPage}
          handleResetStyleValues={(styleName: string) =>
            handleResetStyleValues(styleName, page, rowsPerPage)
          }
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <StyleValueTableHead
                order={order}
                orderBy={orderBy}
                rowCount={styleValues.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "styleValueId", label: "Id" },
                  { id: "name", label: "Tên giá trị" },
                  { id: "styleName", label: "Thuộc tính" },
                  {
                    id: "styleValueCode",
                    label: "Mã màu",
                  },
                  { id: "status", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered.map((row: StyleValue) => (
                  <StyleValueTableRow
                    key={row.styleValueId}
                    styleValue={row}
                    setOpenDialog={setOpenDialog}
                    setUpdateStyleValue={setUpdateStyleValue}
                    setActivateDialog={setActivateDialog}
                    setActivateStyleValue={setActivateStyleValue}
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
          count={totalStyleValues}
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
            setActivateStyleValue(null);
          }, 100);
        }}
        title={
          activateStyleValue?.isActive
            ? "Vô hiệu hóa giá trị này?"
            : "Kích hoạt giá trị này?"
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
                  setActivateStyleValue(null);
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
              onClick={handleChangeStyleValueActive}
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
            setUpdateStyleValue(null);
          }, 400);
        }}
        title={updateStyleValue ? "Cập nhật giá trị" : "Thêm giá trị mới"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<AddStyleValue & KeyString>
              enableReinitialize={true}
              initialValues={{
                name: updateStyleValue ? updateStyleValue.name : "",
                styleId:
                  updateStyleValue && updateStyleValue.styleName === "Color"
                    ? "1"
                    : "",
                styleValueCode: updateStyleValue
                  ? updateStyleValue.styleValueCode
                  : "",
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors = {
                  name: "",
                  styleId: "",
                  styleValueCode: "",
                };
                if (values.name?.length === 0) {
                  errors.name = "Vui lòng nhập giá trị thuộc tính";
                  nameFocusRef.current?.focus();
                  return errors;
                }

                if (!updateStyleValue && values.styleId?.length === 0) {
                  errors.styleId = "Vui lòng chọn thuộc tính";
                  styleFocusRef.current?.focus();
                  return errors;
                }

                if (
                  !updateStyleValue &&
                  values.styleId === "1" &&
                  values.styleValueCode?.length === 0
                ) {
                  errors.styleValueCode = "Vui lòng nhập mã màu";
                  styleValueCodeFocusRef.current?.focus();
                  return errors;
                }
              }}
              onSubmit={async (values, { setFieldError }) => {
                setIsSubmitLoading(true);
                const changeValues = getChangedValues(values);
                let response;
                response = updateStyleValue
                  ? await adminStyleValueApi.updateStyleValue(
                      updateStyleValue.styleValueId,
                      changeValues
                    )
                  : await adminStyleValueApi.createNewStyleValue(changeValues);
                if (
                  response?.statusCode == 409 ||
                  response?.message === "This name already exist"
                ) {
                  showToast("Giá trị này đã tồn tại", "error");
                  setFieldError("name", "Giá trị này này đã tồn tại");
                  setIsSubmitLoading(false);
                  setTimeout(() => {
                    nameFocusRef.current?.focus();
                  });
                  return;
                }
                await handleResetStyleValues(styleName, page, rowsPerPage);
                showToast(
                  `${
                    updateStyleValue ? "Cập nhật" : "Tạo"
                  } giá trị thuộc tính thành công`,
                  "success"
                );
                setOpenDialog(false);
                setTimeout(() => {
                  setUpdateStyleValue(null);
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
                    Tên giá trị thuộc tính
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
                  {values.styleId === "1" && (
                    <>
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                        htmlFor={`styleValueCode`}
                      >
                        Mã màu
                      </label>
                      <Field
                        disabled={isSubmitLoading}
                        className={`rounded-md px-3 py-1.5 flex-1 mb-3 text-sm ${
                          isSubmitLoading && "opacity-55"
                        } ${
                          errors.styleValueCode && "border-red-500"
                        } transition-all`}
                        type="text"
                        id={`styleValueCode`}
                        name={"styleValueCode"}
                        innerRef={styleValueCodeFocusRef}
                      />
                      <ErrorMessage name="styleValueCode" component="div">
                        {(msg) => (
                          <div className="flex gap-x-2 text-sm text-red-500 animate-appear">
                            <ErrorIcon className="size-5" />
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                    </>
                  )}
                  {!updateStyleValue && (
                    <>
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                        htmlFor={`styleId`}
                      >
                        Thuộc tính
                      </label>
                      <Field name={"styleId"} innerRef={styleFocusRef}>
                        {({ form }: FieldProps) => (
                          <Select
                            sx={{
                              "& .MuiInputBase-input": {
                                // borderRadius: "0.375rem!important",
                                border: `1px solid ${
                                  errors.styleId ? "red" : "#6b7280"
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
                            id="styleId"
                            value={form.values.styleId}
                            name={"styleId"}
                            onChange={(event) => {
                              console.log(event.target.value);
                              form.setFieldValue("styleValueCode", "");
                              form.setFieldValue("styleId", event.target.value);
                            }}
                            disabled={isSubmitLoading}
                          >
                            {styles &&
                              styles.length > 0 &&
                              styles.map((style) => (
                                <MenuItem
                                  key={style.styleId}
                                  value={style.styleId.toString()}
                                >
                                  {style.name}
                                </MenuItem>
                              ))}
                          </Select>
                        )}
                      </Field>
                      <ErrorMessage name="styleId" component="div">
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
                        {updateStyleValue ? "Cập nhật" : "Tạo mới"}
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

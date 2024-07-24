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
import StyleTableRow from "../style-table-row";
import StyleTableHead from "../style-table-head";
import StyleTableToolbar from "../style-table-toolbar";
import { emptyRows, getComparator } from "@/src/utilities/visual";
import { KeyString, Style } from "@/src/models";
import { applyFilter } from "../filter";
import TableNoData from "../../table-no-data";
import LoadingButton from "@mui/lab/LoadingButton";
import { ErrorMessage, Field, Form, Formik } from "formik";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from "@mui/icons-material/Error";
import Popup from "@/src/app/components/Popup";
import { adminStyleValueApi } from "@/src/app/apis/admin/styleValueApi";
import { showToast } from "@/src/lib/toastify";
import CircleLoading from "@/src/app/components/Loading";
import { debounce } from "lodash";

// ----------------------------------------------------------------------

export default function StyleView() {
  const [isLoading, setIsLoading] = useState(false);
  const [styles, setStyles] = useState<Style[]>([]);
  const [totalStyles, setTotalStyles] = useState(0);
  const [page, setPage] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [updateStyle, setUpdateStyle] = useState<Style | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("styleId");

  const [filterName, setFilterName] = useState("");

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateStyle, setActivateStyle] = useState<Style | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const nameFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getAllstyles = async () => {
      setIsLoading(true);
      const response = await adminStyleValueApi.getAllStyles();
      setStyles(response?.result.content || []);
      setTotalStyles(response?.result.totalElements || 0);
      setIsLoading(false);
    };
    getAllstyles();
  }, []);

  const getChangedValues = (values: { name: string } & KeyString) => {
    const changedValues: { name: string } & KeyString = {
      name: values.name,
    };

    if (updateStyle) {
      const updateStyleForLoop: { name: string } & KeyString = updateStyle;
      Object.keys(updateStyleForLoop).forEach((key) => {
        if (updateStyleForLoop[key] === values[key]) {
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
      const newSelecteds = styles.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  const handleResetStyles = async (page: number, rowsPerPage: number) => {
    let result;
    if (!isNaN(Number(filterName)) && filterName !== "") {
      result = await adminStyleValueApi.getStyleById(+filterName);

      setStyles(result?.result ? [result?.result] : []);
      setTotalStyles(result?.result ? 1 : 0);
      return;
    }

    result = await adminStyleValueApi.getStylesByName(filterName, {
      page: page,
      size: rowsPerPage,
    });
    if (result?.statusCode != 200) {
      setStyles([]);
      setTotalStyles(0);
      return;
    }
    setStyles(result?.result.content || []);
    setTotalStyles(result?.result.totalElements || 0);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetStyles(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetStyles(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleChangeStyleActive = async () => {
    setActivateLoading(true);
    const response = await adminStyleValueApi.changeStyleActivation(
      activateStyle?.styleId!
    );
    if (
      response?.message ==
      "Cannot deactivate the style because it is being used by a product"
    ) {
      showToast("Thuộc tính này đang được sử dụng trong một sản phẩm", "error");
      setActivateLoading(false);
      return;
    }
    if (!response?.success) {
      showToast("Thay đổi trạng thái thuộc tính thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetStyles(page, rowsPerPage);
    showToast(
      "Thay đổi trạng thái thuộc tính thành công",
      "success",
      "top-right"
    );
    setActivateLoading(false);
    setTimeout(() => {
      setActivateStyle(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;
      if (!isNaN(Number(value)) && value !== "") {
        result = await adminStyleValueApi.getStyleById(+value);

        setStyles(result?.result ? [result?.result] : []);
        setTotalStyles(result?.result ? 1 : 0);
        return;
      }

      result = await adminStyleValueApi.getStylesByName(value, {
        page: 0,
        size: rowsPerPage,
      });
      if (result?.statusCode != 200) {
        setStyles([]);
        setTotalStyles(0);
        return;
      }
      setStyles(result?.result.content || []);
      setTotalStyles(result?.result.totalElements || 0);
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
    inputData: styles,
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
        <Typography variant="h4">Thuộc tính sản phẩm</Typography>

        <Button
          onClick={() => {
            setOpenDialog(true);
          }}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Thuộc tính mới
        </Button>
      </Stack>

      <Card>
        <StyleTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <StyleTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "styleId", label: "Id" },
                  { id: "name", label: "Tên thuộc tính" },
                  { id: "status", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered.map((row: Style) => (
                  <StyleTableRow
                    key={row.styleId}
                    style={row}
                    setOpenDialog={setOpenDialog}
                    setUpdateStyle={setUpdateStyle}
                    setActivateDialog={setActivateDialog}
                    setActivateStyle={setActivateStyle}
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
          count={totalStyles}
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
            setActivateStyle(null);
          }, 100);
        }}
        title={
          activateStyle?.isActive
            ? "Vô hiệu hóa thuộc tính này?"
            : "Kích hoạt thuộc tính này?"
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
                  setActivateStyle(null);
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
              onClick={handleChangeStyleActive}
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
            setUpdateStyle(null);
          }, 400);
        }}
        title={updateStyle ? "Cập nhật thuộc tính" : "Thêm thuộc tính mới"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<{ name: string }>
              initialValues={{
                name: updateStyle ? updateStyle.name : "",
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors = {
                  name: "",
                };
                if (!values.name || values.name.length === 0) {
                  errors.name = "Vui lòng nhập tên thuộc tính";
                  nameFocusRef.current?.focus();
                  return errors;
                }
              }}
              onSubmit={async (values, { setFieldError }) => {
                setIsSubmitLoading(true);
                const changeValues = getChangedValues(values);
                let response;
                response = updateStyle
                  ? await adminStyleValueApi.updateStyle(
                      updateStyle.styleId,
                      changeValues
                    )
                  : await adminStyleValueApi.createNewStyle(changeValues);
                if (
                  response?.statusCode == 409 ||
                  response?.message === "This name already exist"
                ) {
                  showToast("Thuộc tính đã tồn tại", "error");
                  setFieldError("name", "Thuộc tính này đã tồn tại");
                  setIsSubmitLoading(false);
                  setTimeout(() => {
                    nameFocusRef.current?.focus();
                  });
                  return;
                }
                await handleResetStyles(page, rowsPerPage);
                showToast(
                  `${updateStyle ? "Cập nhật" : "Tạo"} thuộc tính thành công`,
                  "success"
                );
                setOpenDialog(false);
                setTimeout(() => {
                  setUpdateStyle(null);
                }, 100);
                setIsSubmitLoading(false);
              }}
            >
              {({ errors, submitForm, isSubmitting, dirty }) => (
                <Form className="flex flex-col mt-2">
                  <label
                    className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold
                              border-b border-border-color"
                    htmlFor={`name`}
                  >
                    Tên thuộc tính
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
                        {updateStyle ? "Cập nhật" : "Tạo mới"}
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

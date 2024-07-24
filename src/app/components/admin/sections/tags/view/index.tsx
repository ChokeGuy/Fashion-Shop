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
import TagTableRow from "../tag-table-row";
import TagTableHead from "../tag-table-head";
import TagTableToolbar from "../tag-table-toolbar";
import { emptyRows, getComparator } from "@/src/utilities/visual";
import { KeyString, Tag } from "@/src/models";
import { applyFilter } from "../filter";
import TableNoData from "../../table-no-data";
import LoadingButton from "@mui/lab/LoadingButton";
import { ErrorMessage, Field, Form, Formik } from "formik";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from "@mui/icons-material/Error";
import Popup from "@/src/app/components/Popup";
import { showToast } from "@/src/lib/toastify";
import CircleLoading from "@/src/app/components/Loading";
import { debounce } from "lodash";
import { adminTagApi } from "@/src/app/apis/admin/tagApi";

// ----------------------------------------------------------------------

export default function TagView() {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [totalTags, setTotalTags] = useState(0);
  const [page, setPage] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [updateTag, setUpdateTag] = useState<Tag | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("tagId");

  const [filterName, setFilterName] = useState("");

  const [openDeleteTagDialog, setDeleteTagDialog] = useState(false);
  const [deleteTagLoading, setDeleteTagLoading] = useState(false);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const nameFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getAlltags = async () => {
      setIsLoading(true);
      const response = await adminTagApi.getAllTags();
      setTags(response?.result.content || []);
      setTotalTags(response?.result.totalElements || 0);
      setIsLoading(false);
    };
    getAlltags();
  }, []);

  const getChangedValues = (values: { name: string } & KeyString) => {
    const changedValues: { name: string } & KeyString = {
      name: values.name,
    };

    if (updateTag) {
      const updateTagForLoop: { name: string } & KeyString = updateTag;
      Object.keys(updateTagForLoop).forEach((key) => {
        if (updateTagForLoop[key] === values[key]) {
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
      const newSelecteds = tags.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleResetTags = async (page: number, rowsPerPage: number) => {
    let result;
    if (!isNaN(Number(filterName)) && filterName !== "") {
      result = await adminTagApi.getTagById(+filterName);
      setTags(result?.result ? [result?.result] : []);
      setTotalTags(result?.result ? 1 : 0);
      return;
    }

    result = await adminTagApi.getAllTags(filterName, {
      page: page,
      size: rowsPerPage,
    });
    setTags(result?.result.content || []);
    setTotalTags(result?.result.totalElements || 0);
  };
  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetTags(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetTags(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;
      if (!isNaN(Number(value)) && value !== "") {
        result = await adminTagApi.getTagById(+value);
        setTags(result?.result ? [result?.result] : []);
        setTotalTags(result?.result ? 1 : 0);
        return;
      }

      result = await adminTagApi.getAllTags(value, {
        page: page,
        size: rowsPerPage,
      });
      setTags(result?.result.content || []);
      setTotalTags(result?.result.totalElements || 0);
    }, 500),
    [page, rowsPerPage]
  );

  const handleDeleteTag = async () => {
    setDeleteTagLoading(true);
    if (deleteTag) {
      const response = await adminTagApi.deleteTag(deleteTag?.tagId);
      if (response?.success) {
        await handleResetTags(page, rowsPerPage);
        showToast("Xoá nhãn thành công", "success");
      } else {
        showToast("Xoá nhãn thất bại", "error");
        setDeleteTagLoading(false);
        return;
      }
    }
    setDeleteTagDialog(false);
    setTimeout(() => {
      setDeleteTag(null);
    }, 100);
    setDeleteTagLoading(false);
  };

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    setPage(0);
    await handleSearch(value);
    setFilterName(value);
  };

  const dataFiltered = applyFilter({
    inputData: tags,
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
        <Typography variant="h4">Nhãn sản phẩm</Typography>

        <Button
          onClick={() => {
            setOpenDialog(true);
          }}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Nhãn mới
        </Button>
      </Stack>

      <Card>
        <TagTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <TagTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "tagId", label: "Id" },
                  { id: "name", label: "Tên nhãn" },
                  // { id: "status", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered.map((row: Tag) => (
                  <TagTableRow
                    key={row.tagId}
                    tag={row}
                    setOpenDialog={setOpenDialog}
                    setUpdateTag={setUpdateTag}
                    setDeleteTagDialog={setDeleteTagDialog}
                    setDeleteTag={setDeleteTag}
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
          count={totalTags}
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
        open={openDeleteTagDialog}
        onClose={() => {
          setDeleteTagDialog(false);
          setTimeout(() => {
            setDeleteTag(null);
          }, 100);
        }}
        title={"Xác nhận xóa nhãn này?"}
        content={undefined}
        actions={
          <>
            <button
              type="button"
              className="mt-2 px-4 py-1 rounded-md w-24
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3"
              onClick={() => {
                setDeleteTagDialog(false);
                setTimeout(() => {
                  setDeleteTag(null);
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
                opacity: deleteTagLoading ? 0.55 : 1,
                "&:hover": {
                  bgcolor: "#1a4845!important",
                  opacity: deleteTagLoading ? 1 : 0.7,
                  color: "#white!important",
                },
              }}
              onClick={handleDeleteTag}
              type="button"
              size="small"
              className={`mt-2 px-4 py-1 rounded-md w-24
            bg-primary-color text-white self-end ${
              deleteTagLoading && "opacity-55"
            }  hover:opacity-70`}
              loading={deleteTagLoading}
              loadingIndicator={
                <CircularProgress
                  sx={{ color: "white" }}
                  className="text-white"
                  size={16}
                />
              }
              disabled={deleteTagLoading}
              variant="outlined"
            >
              <span className={`${deleteTagLoading && "text-primary-color"}`}>
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
            setUpdateTag(null);
          }, 400);
        }}
        title={updateTag ? "Cập nhật nhãn" : "Thêm nhãn mới"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<{ name: string }>
              initialValues={{
                name: updateTag ? updateTag.name : "",
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors = {
                  name: "",
                };
                if (!values.name || values.name.length === 0) {
                  errors.name = "Vui lòng nhập tên nhãn";
                  nameFocusRef.current?.focus();
                  return errors;
                }
              }}
              onSubmit={async (values, { setFieldError }) => {
                setIsSubmitLoading(true);
                const changeValues = getChangedValues(values);
                let response;
                response = updateTag
                  ? await adminTagApi.updateTag(updateTag.tagId, changeValues)
                  : await adminTagApi.createNewTag(changeValues);
                if (
                  response?.statusCode == 409 ||
                  response?.message === "This tag name is already in use"
                ) {
                  showToast("Nhãn đã tồn tại", "error");
                  setFieldError("name", "Nhãn này đã tồn tại");
                  setIsSubmitLoading(false);
                  setTimeout(() => {
                    nameFocusRef.current?.focus();
                  });
                  return;
                }
                await handleResetTags(page, rowsPerPage);
                showToast(
                  `${updateTag ? "Cập nhật" : "Tạo"} nhãn thành công`,
                  "success"
                );
                setOpenDialog(false);
                setTimeout(() => {
                  setUpdateTag(null);
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
                    Tên nhãn
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
                        {updateTag ? "Cập nhật" : "Tạo mới"}
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

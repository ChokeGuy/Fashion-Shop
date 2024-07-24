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
import { getComparator } from "@/src/utilities/visual";
import { KeyString, Tag } from "@/src/models";
import { applyTagFilter } from "../filter";
import TableNoData from "../../table-no-data";
import LoadingButton from "@mui/lab/LoadingButton";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from "@mui/icons-material/Error";
import Popup from "@/src/app/components/Popup";
import { showToast } from "@/src/lib/toastify";
import CircleLoading from "@/src/app/components/Loading";
import { debounce } from "lodash";
import { adminTagApi } from "@/src/app/apis/admin/tagApi";
import TagTableRow from "../tag-table-row";
import TagTableHead from "../tag-table-head";
import TagTableToolbar from "../tag-table-toolbar";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

// ----------------------------------------------------------------------

export default function AdminProductTag({
  open,
  onClose,
  productId,
}: {
  open: boolean;
  onClose: () => void;
  productId: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagList, setTagList] = useState<Tag[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [tagId, setTagId] = useState(-1);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("tagId");

  const [filterName, setFilterName] = useState("");

  const nameFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getAllTagsById = async () => {
      setIsLoading(true);
      const response = await adminTagApi.getAllTagsForProduct(productId);
      setTags(response?.result || []);
      setIsLoading(false);
    };
    const getAllTags = async () => {
      setIsLoading(true);
      const response = await adminTagApi.getAllTags("", {
        page: 0,
        size: 9999,
      });
      setTagList(response?.result.content || []);
      setIsLoading(false);
    };
    if (productId !== -1) {
      getAllTagsById();
    }
    getAllTags();
  }, [productId]);

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

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;
      if (!isNaN(Number(value)) && value !== "") {
        result = await adminTagApi.getTagById(+value);
        setTags(result?.result ? [result?.result] : []);
        return;
      }

      result = await adminTagApi.getAllTags(value);
      setTags(result?.result.content || []);
    }, 500),
    []
  );

  const handleFilterByName = async (event: { target: { value: string } }) => {
    const value = event.target.value;
    await handleSearch(value);
    setFilterName(value);
  };

  const handleDeleteTag = async () => {
    setIsDeleteLoading(true);
    const response = await adminTagApi.removeTagForProduct({
      productId: productId,
      tagId: tagId,
    });
    if (response?.statusCode !== 200) {
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
      setIsDeleteLoading(false);
      return;
    }
    const refreshTags = await adminTagApi.getAllTagsForProduct(productId);
    setFilterName("");
    setTags(refreshTags?.result || []);
    showToast(`Xóa nhãn thành công`, "success");
    setOpenDeleteDialog(false);
    setIsDeleteLoading(false);
  };

  const resetState = () => {
    onClose();
    setTimeout(() => {
      setTags([]);
    }, 100);
  };

  const dataFiltered = applyTagFilter({
    inputData: tags,
    comparator: getComparator(order, orderBy),
  });

  const notFound = !dataFiltered.length && !!filterName;

  if (isLoading)
    return (
      <div className="w-full h-[80vh] grid place-items-center">
        <CircleLoading />
      </div>
    );

  return (
    <Popup
      open={open}
      onClose={resetState}
      // large={true}
      title={"Quản lý nhãn sản phẩm"}
      content={
        <Container>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ paddingY: 4 }}
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
              Gắn nhãn
            </Button>
          </Stack>

          <Card>
            <TagTableToolbar
              numSelected={selected.length}
              filterName={filterName}
              onFilterName={handleFilterByName}
            />

            <Scrollbar>
              <TableContainer sx={{ overflow: "hidden" }}>
                <Table sx={{ width: 540 }}>
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
                      { id: "" },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered.map((row: Tag) => (
                      <TagTableRow
                        key={row.tagId}
                        tag={row}
                        setTagId={setTagId}
                        setOpenDeleteDialog={setOpenDeleteDialog}
                      />
                    ))}

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Card>

          <Popup
            isActivePopup={true}
            padding={true}
            closeButton={{
              top: "-4px",
              right: "12px",
            }}
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setTagId(-1);
            }}
            title={"Xác nhận xóa nhãn sản phẩm?"}
            content={undefined}
            actions={
              <>
                <button
                  type="button"
                  className="mt-2 px-4 py-1 rounded-md w-24
                      bg-primary-color text-white self-end  hover:opacity-70 mr-3"
                  onClick={() => {
                    setOpenDeleteDialog(false);
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
                    opacity: isDeleteLoading ? 0.55 : 1,
                    "&:hover": {
                      bgcolor: "#1a4845!important",
                      opacity: isDeleteLoading ? 1 : 0.7,
                      color: "#white!important",
                    },
                  }}
                  onClick={handleDeleteTag}
                  type="button"
                  size="small"
                  className={`mt-2 px-4 py-1 rounded-md w-24
            bg-primary-color text-white self-end ${
              isDeleteLoading && "opacity-55"
            }  hover:opacity-70`}
                  loading={isDeleteLoading}
                  loadingIndicator={
                    <CircularProgress
                      sx={{ color: "white" }}
                      className="text-white"
                      size={16}
                    />
                  }
                  disabled={isDeleteLoading}
                  variant="outlined"
                >
                  <span
                    className={`${isDeleteLoading && "text-primary-color"}`}
                  >
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
            }}
            title={"Gắn nhãn sản phẩm"}
            content={
              <div className="flex flex-col gap-y-1">
                <Formik<{ name: string }>
                  initialValues={{
                    name: "",
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
                    } else if (
                      tagList.findIndex(
                        (value) => value.name === values.name
                      ) == -1
                    ) {
                      errors.name = "Không tìm thấy nhãn này";
                      nameFocusRef.current?.focus();
                      return errors;
                    }
                  }}
                  onSubmit={async (values, { setFieldError }) => {
                    setIsSubmitLoading(true);
                    let response;
                    response = await adminTagApi.addTagForProduct({
                      productId: productId,
                      tagId: tagList.find((value) => value.name === values.name)
                        ?.tagId!,
                    });
                    if (
                      response?.statusCode == 409 ||
                      response?.message === "Product already has this tag"
                    ) {
                      setFieldError("name", "Nhãn này đã được gắn");
                      setIsSubmitLoading(false);
                      setTimeout(() => {
                        nameFocusRef.current?.focus();
                      });
                      return;
                    } else if (response?.statusCode !== 200) {
                      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
                      setIsSubmitLoading(false);
                      return;
                    }
                    const refreshTags = await adminTagApi.getAllTagsForProduct(
                      productId
                    );
                    setFilterName("");
                    setTags(refreshTags?.result || []);
                    showToast(`Gắn nhãn thành công`, "success");
                    setOpenDialog(false);
                    setIsSubmitLoading(false);
                  }}
                >
                  {({
                    errors,
                    submitForm,
                    isSubmitting,
                    dirty,
                    values,
                    setFieldValue,
                  }) => (
                    <Form className="flex flex-col mt-2">
                      <label
                        className="flex items-center py-1 pb-2 px-0.5 text-sm font-semibold"
                        htmlFor={`name`}
                      >
                        Tên nhãn
                      </label>
                      <Field
                        disabled={isSubmitLoading}
                        innerRef={nameFocusRef}
                        name="name"
                      >
                        {({ form }: FieldProps) => (
                          <Autocomplete
                            noOptionsText="Không tìm thấy nhãn nào"
                            sx={{
                              width: "100%",
                              "& input": {
                                height: "8px!important",
                                padding: "0.375rem 0.75rem!important",
                                borderRadius: "0.375rem!important",
                                fontSize: "0.875rem!important",
                                lineHeight: "1.25rem!important",
                                opacity: isSubmitLoading
                                  ? "0.55!important"
                                  : "",
                              },
                            }}
                            isOptionEqualToValue={(option, value) =>
                              value == undefined ||
                              value == "" ||
                              option === value
                            }
                            disabled={isSubmitLoading}
                            value={values.name || ""}
                            onChange={(_event, newName) => {
                              setFieldValue("name", newName);
                            }}
                            options={tagList.map((tag) => tag.name)}
                            renderInput={(params) => (
                              <TextField
                                placeholder="Nhãn sản phẩm"
                                {...params}
                              />
                            )}
                            renderOption={(props, option) => {
                              return (
                                <li {...props} key={option}>
                                  <div className="px-2 py-1 text-sm whitespace-nowrap text-black w-full hover:opacity-55 transition-opacity">
                                    {option}
                                  </div>
                                </li>
                              );
                            }}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="name" component="div">
                        {(msg) => (
                          <div
                            className="flex gap-x-2 text-sm text-red-500 animate-appear mt-1
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
                            Gắn
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
      }
    ></Popup>
  );
}

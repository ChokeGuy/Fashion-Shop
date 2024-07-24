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
import BannerTableRow from "../banner-table-row";
import BannerTableHead from "../banner-table-head";
import BannerTableToolbar from "../banner-table-toolbar";
import { emptyRows, getComparator } from "@/src/utilities/visual";
import { Banner } from "@/src/models";
import TableNoData from "../../table-no-data";
import { adminBannerApi } from "@/src/app/apis/admin/bannerApi";
import CircleLoading from "@/src/app/components/Loading";
import LoadingButton from "@mui/lab/LoadingButton";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import ErrorIcon from "@mui/icons-material/Error";
import CircularProgress from "@mui/material/CircularProgress";
import Popup from "@/src/app/components/Popup";
import { showToast } from "@/src/lib/toastify";
import Image from "next/image";
import InputFileUpload from "@/src/app/components/FileUploadInput";
import { debounce } from "lodash";
import { applyFilter } from "../filter";

// ----------------------------------------------------------------------

export default function BannerView() {
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [totalBanners, setTotalBanners] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [image, setImage] = useState<string | File>("");

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selected, setSelected] = useState<string[]>([]);

  const [orderBy, setOrderBy] = useState("bannerId");

  const [filterName, setFilterName] = useState("");

  const [openActivateDialog, setActivateDialog] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateBanner, setActivateBanner] = useState<Banner | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const imageFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getAllBanners = async () => {
      const response = await adminBannerApi.getAllBanners();
      setBanners(response?.result.content || []);
      setTotalBanners(response?.result.totalElements || 0);
    };
    getAllBanners();
  }, []);

  const handleSort = (event: any, id: string) => {
    const isAsc = orderBy === id && order === "asc";
    if (id !== "") {
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event: { target: { checked: any } }) => {
    if (event.target.checked) {
      const newSelecteds = banners.map((n) => n.bannerId.toString());
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = async (_event: any, newPage: number) => {
    await handleResetBanner(newPage, rowsPerPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event: {
    target: { value: string };
  }) => {
    const newRowsPerPage = Number(event.target.value);
    await handleResetBanner(0, newRowsPerPage);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
  };

  const handleChangeBannerActive = async () => {
    setActivateLoading(true);
    const response = await adminBannerApi.changeBannerActivation(
      activateBanner?.bannerId!
    );
    if (!response?.success) {
      showToast("Thay đổi trạng thái banner thất bại", "error");
      setActivateLoading(false);
      return;
    }
    await handleResetBanner(page, rowsPerPage);
    showToast("Thay đổi trạng thái banner thành công", "success", "top-right");
    setActivateLoading(false);
    setTimeout(() => {
      setActivateBanner(null);
    }, 100);
    setActivateDialog(false);
  };

  const handleResetBanner = async (page: number, rowsPerPage: number) => {
    let result;
    if (!isNaN(Number(filterName)) && filterName != "") {
      result = await adminBannerApi.getBannerById(+filterName);
      if (result?.statusCode != 200) {
        setBanners([]);
        setTotalBanners(0);
        return;
      }
      setBanners(result?.result ? [result?.result] : []);
      setTotalBanners(result?.result ? 1 : 0);
      return;
    }
    result = await adminBannerApi.getAllBanners({
      page: page,
      size: rowsPerPage,
    });
    setBanners(result?.result.content || []);
    setTotalBanners(result?.result.totalElements || 0);
  };

  const handleSearch = useCallback(
    debounce(async (value: string) => {
      let result;
      if (!isNaN(Number(value)) && value != "") {
        result = await adminBannerApi.getBannerById(+value);
        if (result?.statusCode != 200) {
          setBanners([]);
          setTotalBanners(0);
          return;
        }
        setBanners(result?.result ? [result?.result] : []);
        setTotalBanners(result?.result ? 1 : 0);
        return;
      }
      result = await adminBannerApi.getAllBanners({
        page: page,
        size: rowsPerPage,
      });
      setBanners(result?.result.content || []);
      setTotalBanners(result?.result.totalElements || 0);
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
    inputData: banners,
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
        <Typography variant="h4">Banner quảng cáo</Typography>

        <Button
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: "#1A4845" }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Banner mới
        </Button>
      </Stack>

      <Card>
        <BannerTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <BannerTableHead
                order={order}
                orderBy={orderBy}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: "bannerId", label: "Id" },
                  { id: "name", label: "Ảnh banner" },
                  { id: "status", label: "Trạng thái" },
                  { id: "" },
                ]}
              />
              <TableBody>
                {dataFiltered.map((row: Banner) => (
                  <BannerTableRow
                    key={row.bannerId}
                    banner={row}
                    setActivateDialog={setActivateDialog}
                    setActivateBanner={setActivateBanner}
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
          count={totalBanners}
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
            setActivateBanner(null);
          }, 100);
        }}
        title={
          activateBanner?.isActive
            ? "Vô hiệu hóa banner này?"
            : "Kích hoạt banner này?"
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
                  setActivateBanner(null);
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
              onClick={handleChangeBannerActive}
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
            setImage("");
          }, 100);
        }}
        title={"Thêm banner mới"}
        content={
          <div className="flex flex-col gap-y-1">
            <Formik<{ image: string | File }>
              initialValues={{
                image: "",
              }}
              validateOnBlur={false}
              validateOnChange={false}
              validate={(values) => {
                const errors: { image: string | File } = {
                  image: "",
                };
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
                let updloadImage: File | string = values.image;
                if (image instanceof File) {
                  updloadImage = image;
                }

                const response = await adminBannerApi.createBanner({
                  image: updloadImage,
                });
                if (response?.statusCode == 409) {
                  showToast("Banner đã tồn tại", "error");
                  setFieldError("image", "Banner đã tồn tại");
                  setIsLoading(false);
                  setTimeout(() => {
                    imageFocusRef.current?.focus();
                  });
                  return;
                }
                showToast(`Tạo banner thành công`, "success");
                await handleResetBanner(page, rowsPerPage);
                setOpenDialog(false);
                setImage("");
                setIsSubmitLoading(false);
              }}
            >
              {({ values, submitForm, isSubmitting, dirty }) => (
                <Form className="flex flex-col mt-2">
                  <label
                    className="flex justify-center items-center py-1 px-0.5 text-sm font-semibold"
                    htmlFor={`image`}
                  >
                    Ảnh Banner
                  </label>
                  {
                    // Show image preview
                    values.image && (
                      <div className="w-full grid place-items-center mt-2">
                        <Image
                          width={100}
                          height={100}
                          className="size-24 rounded-sm border border-text-color object-cover object-center"
                          src={values.image as string}
                          alt="banner-image"
                        ></Image>
                      </div>
                    )
                  }
                  {/* Upload image */}
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
                        Tạo mới
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

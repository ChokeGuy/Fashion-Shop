import React, { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Collapse from "@mui/material/Collapse";
import { Category } from "@/src/models/category";
import Radio from "@mui/material/Radio";
import { useRouter, useSearchParams } from "next/navigation";
import { StyleValue } from "@/src/models";
import FormGroup from "@mui/material/FormGroup";
import RadioGroup from "@mui/material/RadioGroup";
import Checkbox from "@mui/material/Checkbox";

const CategoryRadioboxes = ({
  categories,
  setLoading,
}: {
  categories: Category[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<string>("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(false);
    if (!searchParams.get("categoryName")) {
      setSelected("");
    }
  }, [searchParams]);

  const filterChange = (value: string) => {
    const inputParams = new URLSearchParams(searchParams);
    if (value) {
      // if (inputParams.get("keyword")) {
      //   inputParams.delete("keyword");
      // }
      inputParams.set("categoryName", value);
    } else {
      inputParams.delete("categoryName");
    }
    push(`/product?${inputParams.toString()}`, { scroll: false });
    setLoading(true);

    // window.scrollTo(370, 275);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelected(value as string);
    filterChange(value);
  };
  const handleCollapse = (id: string) => {
    setOpen({ ...open, [id]: !open[id] });
  };

  return (
    <FormControl component="fieldset">
      <RadioGroup value={selected} onChange={handleSelectChange}>
        {categories.map((category) => (
          <div
            className="w-full text-left -translate-x-0.5 relative"
            key={category.categoryId}
          >
            <FormControlLabel
              value={category.name}
              control={<Radio />}
              label={<span className="ml-2 text-sm">{category.name}</span>}
            />
            {category.children && (
              <button
                className="absolute right-0 top-0.5"
                onClick={() => handleCollapse(category.categoryId.toString())}
              >
                {open[category.categoryId] ? (
                  <RemoveIcon className="text-xl" />
                ) : (
                  <AddIcon className="text-xl" />
                )}
              </button>
            )}
            <Collapse className="my-1" in={open[category.categoryId] || false}>
              {category.children?.map((child) => (
                <FormControlLabel
                  value={child.name}
                  key={child.categoryId}
                  control={<Radio />}
                  label={<span className="ml-2 text-sm">{child.name}</span>}
                  style={{ marginLeft: "30px" }}
                />
              ))}
            </Collapse>
          </div>
        ))}
      </RadioGroup>
    </FormControl>
  );
};

const ColorCheckboxes = ({
  colors,
  setLoading,
}: {
  colors: StyleValue[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { push } = useRouter();
  const [showAll, setShowAll] = useState(false);
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(false);
    if (!searchParams.get("colors")) {
      setSelected({});
    }
  }, [searchParams]);

  const filterChange = (value: string[]) => {
    const inputParams = new URLSearchParams(searchParams);
    if (value.length > 0) {
      if (
        // inputParams.get("keyword") ||
        inputParams.get("page") ||
        inputParams.get("sizePerPage")
      ) {
        // inputParams.delete("keyword");
        inputParams.delete("page");
        inputParams.delete("sizePerPage");
      }
      const colorNames = value.join(", ");
      inputParams.set("colors", colorNames);
    } else {
      inputParams.delete("colors");
    }
    push(`/product?${inputParams.toString()}`, { scroll: false });

    setLoading(true);
    window.scrollTo(370, 275);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = {
      ...selected,
      [event.target.name]: event.target.checked,
    };
    filterChange(
      Object.entries(newSelected)
        .filter(([_key, value]) => value)
        .map(([key]) => key)
    );
    setSelected(newSelected);
  };

  return (
    <FormControl component="fieldset">
      <FormGroup className="space-y-2" onChange={handleSelectChange}>
        {colors.slice(0, 6).map((color) => (
          <div key={color.styleValueId} className="flex gap-x-2 items-center">
            <FormControlLabel
              control={
                <Checkbox
                  className="text-center"
                  checked={selected[color.name] || false}
                  name={color.name}
                />
              }
              label={
                <div className="ml-2 flex items-end">
                  <div
                    className={`size-6 rounded-full ${
                      color.styleValueCode === "#FFFFFF" &&
                      "border border-border-color"
                    }`}
                    style={{ backgroundColor: `${color.styleValueCode}` }}
                  ></div>
                  <span className="text-sm ml-2">{color.name}</span>
                </div>
              }
            />
          </div>
        ))}
        <Collapse in={showAll}>
          {colors.slice(7, colors.length).map((color) => (
            <div key={color.styleValueId} className="flex gap-x-2 items-center">
              <FormControlLabel
                control={
                  <Checkbox
                    className="text-center"
                    checked={selected[color.name] || false}
                    name={color.name}
                  />
                }
                label={
                  <div className="ml-2 flex items-end">
                    <div
                      className="size-6 rounded-full border border-primary-color"
                      style={{ backgroundColor: `${color.styleValueCode}` }}
                    ></div>
                    <span className="text-sm ml-2">{color.name}</span>
                  </div>
                }
              />
            </div>
          ))}
        </Collapse>
        <button
          className="mt-4 flex hover:bg-primary-color hover:text-white
             uppercase text-sm text-primary-color transition-all
            border border-primary-color w-fit px-2 py-1 rounded-sm"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Ẩn Màu sắc" : "Xem thêm"}
        </button>
      </FormGroup>
    </FormControl>
  );
};

const SizeRadioboxes = ({
  sizes,
  setLoading,
}: {
  sizes: StyleValue[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(false);
    if (!searchParams.get("sizes")) {
      setSelected({});
    }
  }, [searchParams]);

  const filterChange = (value: string[]) => {
    const inputParams = new URLSearchParams(searchParams);
    if (value.length > 0) {
      if (
        // inputParams.get("keyword") ||
        inputParams.get("page") ||
        inputParams.get("sizePerPage")
      ) {
        // inputParams.delete("keyword");
        inputParams.delete("page");
        inputParams.delete("sizePerPage");
      }
      const colorNames = value.join(", ");
      inputParams.set("sizes", colorNames);
    } else {
      inputParams.delete("sizes");
    }
    push(`/product?${inputParams.toString()}`, { scroll: false });
    setLoading(true);

    window.scrollTo(370, 275);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = {
      ...selected,
      [event.target.name]: event.target.checked,
    };
    filterChange(
      Object.entries(newSelected)
        .filter(([_key, value]) => value)
        .map(([key]) => key)
    );
    setSelected(newSelected);
  };

  return (
    <FormControl component="fieldset">
      <FormGroup className="space-y-2" onChange={handleSelectChange}>
        {sizes.slice(0, 6).map((size) => (
          <div key={size.styleValueId} className="flex gap-x-2 items-center">
            <FormControlLabel
              control={
                <Checkbox
                  className="text-center"
                  checked={selected[size.name] || false}
                  name={size.name}
                />
              }
              label={
                <div className="ml-2 flex items-end">
                  <span className="text-sm ml-2">{size.name}</span>
                </div>
              }
            />
          </div>
        ))}
        <Collapse in={showAll}>
          {sizes.slice(7, sizes.length).map((size) => (
            <div key={size.styleValueId} className="flex gap-x-2 items-center">
              <FormControlLabel
                control={
                  <Checkbox
                    className="text-center"
                    checked={selected[size.name] || false}
                    name={size.name}
                  />
                }
                label={
                  <div className="ml-2 flex items-end">
                    <span className="text-sm ml-2">{size.name}</span>
                  </div>
                }
              />
            </div>
          ))}
        </Collapse>
        <button
          className="mt-4 flex hover:bg-primary-color hover:text-white
             uppercase text-sm text-primary-color transition-all
            border border-primary-color w-fit px-2 py-1 rounded-sm"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Ẩn Kích Thước" : "Xem thêm"}
        </button>
      </FormGroup>
    </FormControl>
  );
};
export {
  CategoryRadioboxes as CategoryFilter,
  ColorCheckboxes as ColorFilter,
  SizeRadioboxes as SizeFilter,
};

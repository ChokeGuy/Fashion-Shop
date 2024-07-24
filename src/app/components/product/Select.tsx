import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React, { ReactNode, useState } from "react";

type itemsSelectProps = {
  display: string;
  items: {
    label: string;
    value: number;
  }[];
  sizePerPage?: number;
  sortBy?: number;
  handleChangeSelect?: (
    event: SelectChangeEvent<number>,
    child: ReactNode
  ) => void;
};

const ItemsSelect = ({
  display,
  items,
  sizePerPage,
  sortBy,
  handleChangeSelect,
}: itemsSelectProps) => {
  return (
    <div className="flex items-center gap-x-2">
      <span className="text-left font-medium max-sm:hidden">{display} </span>
      <FormControl className="text-sm">
        <Select
          className="font-semibold "
          value={sizePerPage || sortBy}
          onChange={handleChangeSelect}
        >
          {items &&
            items.length > 0 &&
            items.map((item, index) => (
              <MenuItem
                key={index}
                className="text-sm px-1 lg:p-1 w-full"
                value={item.value}
              >
                <span
                  className={`text-sm leading-6 mr-7 ${
                    item.value <= 4 ? "w-[6.8rem]" : ""
                  } block truncate`}
                >
                  {item.label}
                </span>
              </MenuItem>
            ))}
        </Select>
      </FormControl>{" "}
    </div>
  );
};

export default ItemsSelect;

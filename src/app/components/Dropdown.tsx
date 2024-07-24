import React, { memo, useState } from "react";
type DropdownProps = {
  hoverChildren: React.ReactNode;
  children: React.ReactNode;
  isLogin?: boolean;
  isCart?: boolean;
};

const Dropdown = memo(
  ({
    hoverChildren,
    children,
    isLogin = false,
    isCart = false,
  }: DropdownProps) => {
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    return (
      <>
        <div
          className={`relative cursor-pointer after:absolute 
        after:content-[''] after:right-0 ${
          isLogin
            ? "after:w-8 after:-bottom-3.5 after:h-[14px]"
            : "after:left-0  after:top-5 after:ssm:h-3 after:lg:h-[38px]"
        }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {hoverChildren}
        </div>
        {isHovering && !isLogin && (
          <div
            className="absolute bg-white border border-border-color p-4 lg:top-[84px] 
            md:top-[100px] ssm:-translate-x-14 sm:-translate-x-6 md:-translate-x-0 ssm:top-[96px]
            z-10 ssm:w-[154px] sm:w-40 md:w-44 animate-fadeOut shadow-md
            flex flex-col gap-y-2"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {children}
          </div>
        )}
        {isHovering && isLogin && (
          <div
            className={`absolute cursor-pointer bg-white border border-border-color p-4 lg:top-[68px] sm:top-[60px] z-10 ${
              isCart
                ? "w-[340px] -translate-x-80 pt-0 max-h-128 overflow-auto"
                : "w-44 -translate-x-36"
            } animate-fadeOut shadow-md flex flex-col gap-y-2`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {children}
          </div>
        )}
      </>
    );
  }
);

export default Dropdown;

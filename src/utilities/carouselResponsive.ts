const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1290 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1290, min: 640 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 2,
  },
};
const responsive2 = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 640 },
    items: 3,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1290 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1290, min: 640 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 2,
  },
};

const responsive3 = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 640 },
    items: 1,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1290 },
    items: 1,
  },
  tablet: {
    breakpoint: { max: 1290, min: 640 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
  },
};

const responsive4 = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1290 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1290, min: 640 },
    items: 4,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 4,
  },
};

const responsiveForAccessories = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1290 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1290, min: 640 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 2,
  },
};

//Show image in carousel base on item color
const customResponsive = (amount: number) => {
  return {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: amount,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1290 },
      items: amount,
    },
    tablet: {
      breakpoint: { max: 1290, min: 640 },
      items: amount,
    },
    mobile: {
      breakpoint: { max: 640, min: 0 },
      items: 0,
    },
  };
};

const responsive8 = {
  desktop: {
    breakpoint: { max: 3000, min: 1230 },
    items: 8,
  },
  tablet: {
    breakpoint: { max: 1229, min: 800 },
    items: 4,
  },
  mobile: {
    breakpoint: { max: 800, min: 0 },
    items: 3,
  },
};

export {
  responsive,
  responsive2,
  responsive3,
  responsive4,
  responsive8,
  responsiveForAccessories,
  customResponsive,
};

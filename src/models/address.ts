type Address = {
  predictions: Prediction[];
  executed_time: number;
  executed_time_all: number;
  status: string;
};

type Prediction = {
  description: string;
  matched_substrings: any[];
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: any[];
  has_children: boolean;
  display_type: string;
  score: number;
  plus_code: {
    compound_code: string;
    global_code: string;
  };
};

type ForwardGeocoding = {
  plus_code: {
    compound_code: string;
    global_code: string;
  };
  results: {
    address_components: {
      long_name: string;
      short_name: string;
    }[];
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    reference: string;
    plus_code: {
      compound_code: string;
      global_code: string;
    };
    types: any[];
  }[];
  status: string;
};

type Cordinate = {
  lat: number;
  lng: number;
};

type Distance = {
  rows: {
    elements: {
      status: string;
      duration: {
        text: string;
        value: number;
      };
      distance: {
        text: string;
        value: number;
      };
    }[];
  }[];
};

type CreateAddress = {
  addressId: number;
  phone: string | null;
  recipientName: string | null;
  detail: string;
  defaultAddress: boolean;
};

type CreateAddressResponse = CreateAddress;

export type {
  Address,
  Prediction,
  ForwardGeocoding,
  Cordinate,
  Distance,
  CreateAddress,
  CreateAddressResponse,
};

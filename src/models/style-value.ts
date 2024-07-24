type Style = {
  styleId: number;
  name: string;
  isActive: boolean;
};

type StyleValue = {
  styleValueId: number;
  name: string;
  styleName: string;
  styleValueCode: string;
  isActive?: boolean;
};

type AddStyleValue = {
  name?: string;
  styleId?: string;
  styleValueCode?: string;
};

type AddStyleValueRequest = AddStyleValue;
type StyleResponse = Style;
type StyleValueResponse = StyleValue;
export type {
  StyleValue,
  StyleValueResponse,
  Style,
  StyleResponse,
  AddStyleValue,
  AddStyleValueRequest,
};

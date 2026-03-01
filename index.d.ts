import ClayConfig from "./src/scripts/lib/clay-config";

type FilterScalar<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | null ? T[K] : never;
};

export declare type ComponentTypes =
  | "section"
  | "color"
  | "footer"
  | "heading"
  | "input"
  | "select"
  | "submit"
  | "text"
  | "toggle"
  | "radiogroup"
  | "checkboxgroup"
  | "button"
  | "slider";

export declare type Capabilities =
  | "PLATFORM_APLITE"
  | "NOT_PLATFORM_APLITE"
  | "PLATFORM_BASALT"
  | "NOT_PLATFORM_BASALT"
  | "PLATFORM_CHALK"
  | "NOT_PLATFORM_CHALK"
  | "PLATFORM_DIORITE"
  | "NOT_PLATFORM_DIORITE"
  | "PLATFORM_EMERY"
  | "NOT_PLATFORM_EMERY"
  | "PLATFORM_FLINT"
  | "NOT_PLATFORM_FLINT"
  | "PLATFORM_GABBRO"
  | "NOT_PLATFORM_GABBRO"
  | "BW"
  | "NOT_BW"
  | "COLOR"
  | "NOT_COLOR"
  | "MICROPHONE"
  | "NOT_MICROPHONE"
  | "SMARTSTRAP"
  | "NOT_SMARTSTRAP"
  | "SMARTSTRAP_POWER"
  | "NOT_SMARTSTRAP_POWER"
  | "HEALTH"
  | "NOT_HEALTH"
  | "RECT"
  | "NOT_RECT"
  | "ROUND"
  | "NOT_ROUND"
  | "DISPLAY_144x168"
  | "NOT_DISPLAY_144x168"
  | "DISPLAY_180x180_ROUND"
  | "NOT_DISPLAY_180x180_ROUND"
  | "DISPLAY_200x228"
  | "NOT_DISPLAY_200x228";

export declare interface BaseComponent {
  type: ComponentTypes;
}

export declare interface PebbleAttributes {
  id?: string;
  capabilities?: Capabilities[];
  group?: string;
  messageKey?: string;
}

export declare interface Option<T extends string> {
  label: string;
  value: T;
}

export declare interface OptionGroup<
  T extends string,
  O extends Option<T> = Option<T>,
> {
  label: string;
  value: O[];
}

export declare interface SectionComponent extends BaseComponent {
  type: "section";
  items: Block[];
  capabilities?: Capabilities[];
}

export declare interface HeadingComponent
  extends BaseComponent, PebbleAttributes {
  type: "heading";
  defaultValue: string;
  size?: 1 | 2 | 3 | 4 | 5 | 6;
}

export declare interface TextComponent extends BaseComponent, PebbleAttributes {
  type: "text";
  defaultValue: string;
}

export declare interface InputComponent
  extends BaseComponent, PebbleAttributes {
  type: "input";
  label: string;
  attributes?: Partial<FilterScalar<HTMLInputElement>>;
  defaultValue?: string;
  description?: string;
}

export declare interface ToggleComponent
  extends BaseComponent, PebbleAttributes {
  type: "toggle";
  label: string;
  defaultValue?: boolean;
  description?: string;
}

export declare interface SelectComponent<T extends string>
  extends BaseComponent, PebbleAttributes {
  type: "select";
  label: string;
  options: (Option<T> | OptionGroup<T>)[];
  attributes?: Partial<FilterScalar<HTMLSelectElement>>;
  defaultValue?: T;
  description?: string;
}

export declare interface ColorComponent
  extends BaseComponent, PebbleAttributes {
  type: "color";
  label: string;
  allowGray?: boolean;
  defaultValue?: number | string;
  description?: string;
  layout?: "COLOR" | "GRAY" | "BLACK_WHITE" | (string | false)[][];
  sunlight?: boolean;
}

export declare interface RadioGroupComponent<T extends string>
  extends BaseComponent, PebbleAttributes {
  type: "radiogroup";
  label: string;
  options: Option<T>[];
  defaultValue?: T;
  description?: string;
}

export declare interface CheckboxComponent
  extends BaseComponent, PebbleAttributes {
  type: "checkboxgroup";
  // TODO: I think there's a way to type check that defaultValue and options are the same length?
  defaultValue: boolean[];
  label: string;
  options: string[];
  description?: string;
}

export declare interface ButtonComponent extends BaseComponent {
  type: "button";
  id?: string;
  capabilities?: Capabilities[];
  defaultValue?: string;
  description?: string;
  group?: string;
  primary?: boolean;
}

export declare interface SliderComponent
  extends BaseComponent, PebbleAttributes {
  type: "slider";
  label: string;
  min: number;
  max: number;
  defaultValue?: number;
  description?: string;
  step?: number;
}

export declare interface SubmitComponent
  extends BaseComponent, PebbleAttributes {
  type: "submit";
  defaultValue: string;
  id?: string;
  capabilities?: Capabilities[];
  group?: string;
}

export declare type Block =
  | SectionComponent
  | HeadingComponent
  | TextComponent
  | InputComponent
  | ToggleComponent
  | SelectComponent<string>
  | ColorComponent
  | RadioGroupComponent<string>
  | CheckboxComponent
  | ButtonComponent
  | SliderComponent
  | SubmitComponent;

export declare type Config = Block[];

export default interface ClayOptions<M extends object = {}> {
  autoHandleEvents: boolean;
  userData: M;
}

// TODO: mock type for minified?
export declare function CustomFunction<M extends object = {}>(
  this: ClayConfig & { meta: { userData: M } },
  minified: any,
): void;

export declare class Clay<M extends object = {}> {
  constructor(
    config: Config,
    customFn: typeof CustomFunction<M>,
    options: ClayOptions<M>,
  );
  version: string;
  config: Config;
  customFn: typeof CustomFunction<M>;
  /**
   * This will only be populated in the showConfiguration event handler.
   */
  meta: {
    userData: M;
    watchToken: string;
    accountToken: string;
    activeWatchInfo: string;
  };
}

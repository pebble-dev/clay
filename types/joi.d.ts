declare module 'joi' {
  interface JoiSchema {
    required(): JoiSchema;
    optional(): JoiSchema;
    unknown(allow?: boolean): JoiSchema;
    valid(...values: unknown[]): JoiSchema;
    keys(schema: Record<string, JoiSchema>): JoiSchema;
    try(...schemas: JoiSchema[]): JoiSchema;
  }

  interface Joi {
    object(): JoiSchema;
    string(): JoiSchema;
    func(): JoiSchema;
    alternatives(): JoiSchema;
    assert(value: unknown, schema: JoiSchema): void;
  }

  const joi: Joi;
  export = joi;
}

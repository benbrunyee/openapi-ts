import type { IRMediaType } from '../../../ir/mediaType';
import {
  isMediaTypeFileLike,
  mediaTypeToIrMediaType,
} from '../../../ir/mediaType';
import type {
  ReferenceObject,
  ResponseObject,
  SchemaObject,
} from '../types/spec';

interface Content {
  mediaType: string;
  schema: SchemaObject | ReferenceObject | undefined;
  type: IRMediaType | undefined;
}

export const contentToSchema = ({
  content,
}: {
  content: Content;
}): SchemaObject | undefined => {
  const { mediaType, schema } = content;

  if (schema && '$ref' in schema) {
    return {
      allOf: [{ ...schema }],
    };
  }

  if (!schema) {
    if (isMediaTypeFileLike({ mediaType })) {
      return {
        format: 'binary',
        type: 'string',
      };
    }
    return;
  }

  if (
    schema.type === 'string' &&
    !schema.format &&
    isMediaTypeFileLike({ mediaType })
  ) {
    return {
      ...schema,
      format: 'binary',
    };
  }

  return schema;
};

export const mediaTypeObjects = ({
  mimeTypes,
  response,
}: {
  mimeTypes: ReadonlyArray<string> | undefined;
  response: Pick<ResponseObject, 'schema'>;
}): ReadonlyArray<Content> => {
  const objects: Array<Content> = [];

  for (const mediaType of mimeTypes ?? []) {
    objects.push({
      mediaType,
      schema: response.schema,
      type: mediaTypeToIrMediaType({ mediaType }),
    });
  }

  return objects;
};

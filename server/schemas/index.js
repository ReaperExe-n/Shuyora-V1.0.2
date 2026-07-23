import { z } from 'zod';

// Base generic schema to allow empty body/query/params if not strictly specified
const baseSchema = {
  body: z.any().optional(),
  query: z.any().optional(),
  params: z.any().optional(),
};

export const authSchema = z.object({
  ...baseSchema,
  body: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z.string().min(6).max(100)
  })
});

export const searchSchema = z.object({
  ...baseSchema,
  query: z.object({
    q: z.string().min(1).max(100)
  })
});

export const idParamSchema = z.object({
  ...baseSchema,
  params: z.object({
    id: z.string().min(1)
  })
});

export const animeIdParamSchema = z.object({
  ...baseSchema,
  params: z.object({
    animeId: z.string().min(1)
  })
});

export const proxySchema = z.object({
  ...baseSchema,
  query: z.object({
    url: z.string().url(),
    referer: z.string().url().optional().or(z.string().min(1).optional())
  })
});

export const reviewSchema = z.object({
  ...baseSchema,
  body: z.object({
    animeId: z.string().min(1),
    author: z.string().min(3).max(50),
    rating: z.number().min(1).max(5),
    text: z.string().min(5).max(1000)
  })
});

export const oauthCallbackSchema = z.object({
  ...baseSchema,
  query: z.object({
    code: z.string().min(1)
  })
});

// For /watch/* where the wildcard parameter is params[0]
export const watchSchema = z.object({
  ...baseSchema,
  params: z.record(z.string().min(1)), // To loosely validate params[0] while strictly requiring it
  query: z.any() // Query is flexible depending on provider
});

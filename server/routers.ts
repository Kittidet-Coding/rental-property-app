import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getProperties, getPropertyById, getPropertyImages, createProperty, updateProperty, deleteProperty, toggleFavorite, getUserFavorites, isFavorite, getStatistics } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  properties: router({
    search: publicProcedure
      .input(
        z.object({
          city: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          beds: z.number().optional(),
          baths: z.number().optional(),
          type: z.string().optional(),
          limit: z.number().optional().default(20),
          offset: z.number().optional().default(0),
        })
      )
      .query(async ({ input }) => {
        const results = await getProperties(input);
        return results;
      }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const property = await getPropertyById(input);
        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
        }
        const images = await getPropertyImages(input);
        return { ...property, images };
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          price: z.number(),
          currency: z.string().optional().default("HUF"),
          beds: z.number(),
          baths: z.number(),
          sqm: z.number().optional(),
          address: z.string(),
          city: z.string(),
          country: z.string(),
          zipCode: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          type: z.string(),
          petFriendly: z.boolean().optional().default(false),
          parking: z.boolean().optional().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const property = await createProperty({
          ...input,
          ownerId: ctx.user.id,
        });
        return property;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          beds: z.number().optional(),
          baths: z.number().optional(),
          sqm: z.number().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          zipCode: z.string().optional(),
          petFriendly: z.boolean().optional(),
          parking: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const property = await getPropertyById(input.id);
        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
        }
        if (property.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only update your own properties" });
        }
        const { id, ...updateData } = input;
        await updateProperty(id, updateData);
        return getPropertyById(id);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        const property = await getPropertyById(input);
        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Property not found" });
        }
        if (property.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own properties" });
        }
        await deleteProperty(input);
        return { success: true };
      }),
  }),

  favorites: router({
    toggle: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        return toggleFavorite(ctx.user.id, input);
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserFavorites(ctx.user.id);
    }),

    isFavorite: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        return isFavorite(ctx.user.id, input);
      }),
  }),

  statistics: router({
    getStats: publicProcedure.query(async () => {
      return getStatistics();
    }),
  }),
});

export type AppRouter = typeof appRouter;

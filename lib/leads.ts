import { z } from "zod";

export const leadSchema = z.object({
  email: z.string().email("Укажи корректный email"),
  tgUsername: z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, ""))
    .optional()
    .or(z.literal("")),
  source: z.string().trim().optional(),
  utmSource: z.string().trim().optional(),
  utmMedium: z.string().trim().optional(),
  utmCampaign: z.string().trim().optional(),
  consentEmail: z.boolean().refine((value) => value, "Нужно согласие на рассылку"),
  consentTerms: z.boolean().refine((value) => value, "Нужно принять условия")
});

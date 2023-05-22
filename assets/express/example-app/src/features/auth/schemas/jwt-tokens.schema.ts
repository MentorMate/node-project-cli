import { z } from 'zod';

/**
 * Possible tokens: id_token, access_token, refresh_token
 * see: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export const jwtTokensSchema = z
  .object({
    idToken: z.string(),
  })
  .openapi({ ref: 'JwtTokens' });

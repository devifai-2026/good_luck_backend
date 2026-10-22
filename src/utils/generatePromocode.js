import AffiliateMarketer from "../models/affiliateMarketer/affiliateMarketer.model.js";
import { Astrologer } from "../models/astrologer/astroler.model.js";

// Promo codes are shared between Affiliate Marketers and Astrologers (both are
// looked up by the same code when buying an ad subscription), so a new code
// must be unique across BOTH collections — otherwise two promoters can end up
// with the same code and only one of them ever gets the commission.
const generateUniquePromoCode = async () => {
  let promoCode;
  let isUnique = false;

  while (!isUnique) {
    promoCode = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit number
    const [existingAffiliate, existingAstrologer] = await Promise.all([
      AffiliateMarketer.exists({ promo_code: String(promoCode) }),
      Astrologer.exists({ promo_code: promoCode }),
    ]);
    if (!existingAffiliate && !existingAstrologer) {
      isUnique = true;
    }
  }

  return promoCode;
};


export default generateUniquePromoCode;

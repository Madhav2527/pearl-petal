import { Product, Supplier } from "../lib/types";
import { calculateSellingPrice } from "../lib/pricing-engine";

export const SEED_SUPPLIERS: Supplier[] = [];

// Base catalog starts empty - merchant will add live products via Quick Add by Link in /admin/products
const RAW_PRODUCTS: Array<Omit<Product, "selling_price" | "created_at" | "updated_at">> = [
  {
    "id": "prod-nail-1894032",
    "sku": "PP-NAIL-4032",
    "name": "French Manicure Artificial Nails",
    "slug": "french-manicure-artificial-nails-1894032",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with French Manicure Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 195,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": true,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-1894032-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/74b33cb8b37a400ba72cca17f00d39a5_w1440_q90.webp",
        "alt_text": "French Manicure Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-1894032-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/11651ea86fe54ad7947ad85a1d2926fd_w1440_q90.webp",
        "alt_text": "French Manicure Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-1894032-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/65ae22f12975460b928d04cff9623961_w1440_q90.webp",
        "alt_text": "French Manicure Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-1894032-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/deac2ef892004f24b5ea9f911cbb9451_w1440_q90.webp",
        "alt_text": "French Manicure Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-1894032-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/281019603eac44e09b463dd0afae93e7_w1440_q90.webp",
        "alt_text": "French Manicure Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/french-manicure-artificial-nails-1894032",
    "source_url": "https://www.savana.com/details/french-manicure-artificial-nails-1894032"
  },
  {
    "id": "prod-nail-2429022",
    "sku": "PP-NAIL-9022",
    "name": "Metal Detail Artificial Nails",
    "slug": "metal-detail-artificial-nails-2429022",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Metal Detail Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 290,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": true,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-2429022-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/9dc2b0dfe6bf4375b207800269e4e85e_w1440_q90.webp",
        "alt_text": "Metal Detail Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2429022-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/6ed33b8551f74c6bb45aa9aba94e4010_w1440_q90.webp",
        "alt_text": "Metal Detail Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2429022-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/d883ff0cf6bf4b98a7c4f65b652af776_w1440_q90.webp",
        "alt_text": "Metal Detail Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2429022-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/ca3835c26c4449fc840222b1638bfbdf_w1440_q90.webp",
        "alt_text": "Metal Detail Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/metal-detail-artificial-nails-2429022",
    "source_url": "https://www.savana.com/details/metal-detail-artificial-nails-2429022"
  },
  {
    "id": "prod-nail-1860062",
    "sku": "PP-NAIL-0062",
    "name": "Champagne Glaze Artificial Nails",
    "slug": "champagne-glaze-artificial-nails-1860062",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Champagne Glaze Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 190,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": false,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-1860062-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/f9d4de55c7f041f2bce4c7e806ffbedd_w1440_q90.webp",
        "alt_text": "Champagne Glaze Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-1860062-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/65b99491da5a42799aae6396c6e41148_w1440_q90.webp",
        "alt_text": "Champagne Glaze Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-1860062-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/68e2e0bc0d6c4a27b0e806943082217e_w1440_q90.webp",
        "alt_text": "Champagne Glaze Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-1860062-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/2182df97a2d4472db9a24418cacfe2a3_w1440_q90.webp",
        "alt_text": "Champagne Glaze Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-1860062-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/c40bad9dc0ab4941b0fd356a181ca6ad_w1440_q90.webp",
        "alt_text": "Champagne Glaze Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/artificial-nails-1860062",
    "source_url": "https://www.savana.com/details/artificial-nails-1860062"
  },
  {
    "id": "prod-nail-2273562",
    "sku": "PP-NAIL-3562",
    "name": "Sunset Multicolor Artificial Nails",
    "slug": "sunset-multicolor-artificial-nails-2273562",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Sunset Multicolor Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 195,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": false,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-2273562-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/e45e137e09ee4816b81a453075789104_w1440_q90.webp",
        "alt_text": "Sunset Multicolor Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2273562-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/32349219a1b648a9abe381856a3f133a_w1440_q90.webp",
        "alt_text": "Sunset Multicolor Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2273562-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/9413244cd2ac444ba62764b61484f0f6_w1440_q90.webp",
        "alt_text": "Sunset Multicolor Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2273562-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/97b1d0000a88455ea05d4f51a77cadf1_w1440_q90.webp",
        "alt_text": "Sunset Multicolor Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-2273562-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/3e756cb0d94b4808a52ac73566600bbd_w1440_q90.webp",
        "alt_text": "Sunset Multicolor Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/artificial-nails-2273562",
    "source_url": "https://www.savana.com/details/artificial-nails-2273562"
  },
  {
    "id": "prod-nail-2214482",
    "sku": "PP-NAIL-4482",
    "name": "Glitter Artificial Nails",
    "slug": "glitter-artificial-nails-2214482",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Glitter Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 188,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": true,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-2214482-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/bd26ebdbb0a84933842e9daafadbf2b9_w1440_q90.webp",
        "alt_text": "Glitter Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2214482-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/81b1b714990a449fab80e520bf298514_w1440_q90.webp",
        "alt_text": "Glitter Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2214482-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/6afc06a3705440dfb96d34a3dc57c738_w1440_q90.webp",
        "alt_text": "Glitter Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2214482-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/eb21901dbf30493194c07203857eba0b_w1440_q90.webp",
        "alt_text": "Glitter Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-2214482-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/85682cca681a45209910df12b7eba183_w1440_q90.webp",
        "alt_text": "Glitter Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/glitter-artificial-nails-2214482",
    "source_url": "https://www.savana.com/details/glitter-artificial-nails-2214482"
  },
  {
    "id": "prod-nail-1943882",
    "sku": "PP-NAIL-3882",
    "name": "Heart Artificial Nails",
    "slug": "heart-artificial-nails-1943882",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Heart Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 95,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": false,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-1943882-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/823d5e9799d04c8fb5563578bdef6318_w1440_q90.webp",
        "alt_text": "Heart Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-1943882-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/9086f78768c14f6cb80ab49deebbe329_w1440_q90.webp",
        "alt_text": "Heart Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-1943882-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/c95bed7781f742baa96a11073b7c05b5_w1440_q90.webp",
        "alt_text": "Heart Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-1943882-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/74de50b4a9714a67bc0fa4593089d262_w1440_q90.webp",
        "alt_text": "Heart Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/heart-artificial-nails-1943882",
    "source_url": "https://www.savana.com/details/heart-artificial-nails-1943882"
  },
  {
    "id": "prod-nail-1999472",
    "sku": "PP-NAIL-9472",
    "name": "Bare Minimalist Nude Artificial Nails",
    "slug": "bare-minimalist-nude-artificial-nails-1999472",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Bare Minimalist Nude Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 95,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": false,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-1999472-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/07f1ff4dde574c80b1cdd8d75df241e3_w1440_q90.webp",
        "alt_text": "Bare Minimalist Nude Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-1999472-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/9d5c1c2fa44c4366a0abdce4077fe4c7_w1440_q90.webp",
        "alt_text": "Bare Minimalist Nude Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-1999472-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/8cec08ddfba64b34a3d51f1b45561609_w1440_q90.webp",
        "alt_text": "Bare Minimalist Nude Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-1999472-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/82a5c9be70504536b85255b107aae43e_w1440_q90.webp",
        "alt_text": "Bare Minimalist Nude Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-1999472-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/d51721c61f224bbcbc827d620fd2752b_w1440_q90.webp",
        "alt_text": "Bare Minimalist Nude Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/artificial-nails-1999472",
    "source_url": "https://www.savana.com/details/artificial-nails-1999472"
  },
  {
    "id": "prod-nail-2292392",
    "sku": "PP-NAIL-2392",
    "name": "Flowers Artificial Nails",
    "slug": "flowers-artificial-nails-2292392",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Flowers Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 142,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": false,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-2292392-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/64f238be976142c2adeade1f94d4efc0_w1440_q90.webp",
        "alt_text": "Flowers Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2292392-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/693f506ac7754808813c4c052dff7403_w1440_q90.webp",
        "alt_text": "Flowers Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2292392-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/46fa5191c3014b7c8e16760466f4f8cc_w1440_q90.webp",
        "alt_text": "Flowers Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2292392-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/7e09d6df5f154cafbe9c6298c6c2236c_w1440_q90.webp",
        "alt_text": "Flowers Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-2292392-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/57a5af8537b9458ab69b8c95ec0808b8_w1440_q90.webp",
        "alt_text": "Flowers Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/flowers-artificial-nails-2292392",
    "source_url": "https://www.savana.com/details/flowers-artificial-nails-2292392"
  },
  {
    "id": "prod-nail-2178552",
    "sku": "PP-NAIL-8552",
    "name": "120pcs Artificial Nails",
    "slug": "120pcs-artificial-nails-2178552",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with 120pcs Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 195,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": false,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-2178552-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/57c3b0aa00ab42db8a714804fa23fae9_w1440_q90.webp",
        "alt_text": "120pcs Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2178552-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/48768a0637914a039fa2359fa8f43a88_w1440_q90.webp",
        "alt_text": "120pcs Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2178552-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/05e7fc70efc645da98de6c63c30add1f_w1440_q90.webp",
        "alt_text": "120pcs Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2178552-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/c8de77b3119348799037cf506ac0b9d9_w1440_q90.webp",
        "alt_text": "120pcs Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-2178552-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/790d9993fcd24b4a9b3b6761cc4c6586_w1440_q90.webp",
        "alt_text": "120pcs Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/120pcs-artificial-nails-2178552",
    "source_url": "https://www.savana.com/details/120pcs-artificial-nails-2178552"
  },
  {
    "id": "prod-nail-2166052",
    "sku": "PP-NAIL-6052",
    "name": "96pcs Artificial Nails",
    "slug": "96pcs-artificial-nails-2166052",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with 96pcs Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 145,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": false,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-2166052-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/60c9f6f7af134f61b7708b6dec882195_w1440_q90.webp",
        "alt_text": "96pcs Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2166052-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/21038d77012240acafd137a14d6a297c_w1440_q90.webp",
        "alt_text": "96pcs Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2166052-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/a5b7a0d69d43456cb3a4d52880cb13a4_w1440_q90.webp",
        "alt_text": "96pcs Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2166052-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/f97a88b0a46043c1b06377eca0e31de6_w1440_q90.webp",
        "alt_text": "96pcs Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-2166052-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/276d6b8b418b4f258fbe09f3d405b209_w1440_q90.webp",
        "alt_text": "96pcs Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/96pcs-artificial-nails-2166052",
    "source_url": "https://www.savana.com/details/96pcs-artificial-nails-2166052"
  },
  {
    "id": "prod-nail-2394202",
    "sku": "PP-NAIL-4202",
    "name": "Bow Artificial Nails",
    "slug": "bow-artificial-nails-2394202",
    "category": "press-on-nails",
    "subcategory": "press-on-nails",
    "description": "Elevate your manicure with Bow Artificial Nails. Reusable, salon-quality press-on artificial nails crafted for instant, high-gloss perfection without UV lamps or nail damage. Includes full set with adhesive tabs and prep accessories.",
    "supplier_cost": 95,
    "custom_markup": null,
    "stock": 25,
    "is_featured": true,
    "is_bestseller": true,
    "is_new": true,
    "is_visible": true,
    "images": [
      {
        "id": "img-2394202-1",
        "image_url": "https://img101.mfrcdn.com/goods-pic/d0ae30ed26a7469e82db8dc44a5a072f_w1440_q90.webp",
        "alt_text": "Bow Artificial Nails - View 1",
        "display_order": 1,
        "is_primary": true
      },
      {
        "id": "img-2394202-2",
        "image_url": "https://img101.mfrcdn.com/goods-pic/f942f4dd26e94d8ea7bb840f2dffacb3_w1440_q90.webp",
        "alt_text": "Bow Artificial Nails - View 2",
        "display_order": 2,
        "is_primary": false
      },
      {
        "id": "img-2394202-3",
        "image_url": "https://img101.mfrcdn.com/goods-pic/8c319a9f663c4da183b57477f5db1dfd_w1440_q90.webp",
        "alt_text": "Bow Artificial Nails - View 3",
        "display_order": 3,
        "is_primary": false
      },
      {
        "id": "img-2394202-4",
        "image_url": "https://img101.mfrcdn.com/goods-pic/99226fd364d54af4863d35dea3ac9612_w1440_q90.webp",
        "alt_text": "Bow Artificial Nails - View 4",
        "display_order": 4,
        "is_primary": false
      },
      {
        "id": "img-2394202-5",
        "image_url": "https://img101.mfrcdn.com/goods-pic/3e1f9cabc58c4551af53f4962b117378_w1440_q90.webp",
        "alt_text": "Bow Artificial Nails - View 5",
        "display_order": 5,
        "is_primary": false
      }
    ],
    "variants": [],
    "tags": [
      "press-on-nails",
      "nail art",
      "artificial nails",
      "salon glaze",
      "manicure",
      "genz aesthetic"
    ],
    "product_link": "https://www.savana.com/details/bow-artificial-nails-2394202",
    "source_url": "https://www.savana.com/details/bow-artificial-nails-2394202"
  }
];

// Dynamically compute selling_price = supplier_cost + 50 (or default markup)
export const SEED_PRODUCTS: Product[] = RAW_PRODUCTS.map((item) => ({
  ...item,
  selling_price: calculateSellingPrice(item.supplier_cost, item.custom_markup || 50),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export const CATEGORIES_DATA = [
  {
    id: "press-on-nails",
    name: "Press-On Nails & Nail Art",
    slug: "press-on-nails",
    description: "Salon-quality reusable press-on nails, glazed French manicures, and aesthetic nail charms for instant perfection.",
    image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "press-on-nails", name: "Press-On Nails", slug: "press-on-nails" },
      { id: "nail-art-stickers", name: "Nail Stickers & Charms", slug: "nail-art-stickers" },
      { id: "nail-accessories", name: "Nail Kits & Glue", slug: "nail-accessories" },
    ],
  },
  {
    id: "hair-accessories",
    name: "Hair Accessories",
    slug: "hair-accessories",
    description: "Italian cellulose acetate claw clips, double-faced French velvet ribbons, mulberry silk scrunchies, and padded headbands.",
    image_url: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "claw-clips", name: "Claw Clips", slug: "claw-clips" },
      { id: "hair-pins-clips", name: "Hair Clips & Barrettes", slug: "hair-pins-clips" },
      { id: "hair-bows", name: "Hair Bows & Ribbons", slug: "hair-bows" },
      { id: "scrunchies", name: "Silk Scrunchies", slug: "scrunchies" },
      { id: "headbands", name: "Headbands & Hairbands", slug: "headbands" },
    ],
  },
  {
    id: "jewellery",
    name: "Jewellery",
    slug: "jewellery",
    description: "Heirloom-grade freshwater pearls, delicate chains, waterproof rings, and 18k gold vermeil adornments crafted for daily grace.",
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "earrings", name: "Earrings", slug: "earrings" },
      { id: "necklaces", name: "Necklaces & Chokers", slug: "necklaces" },
      { id: "bracelets", name: "Bracelets & Bangles", slug: "bracelets" },
      { id: "rings", name: "Rings", slug: "rings" },
      { id: "anklets", name: "Anklets", slug: "anklets" },
      { id: "body-jewellery", name: "Body & Waist Jewellery", slug: "body-jewellery" },
    ],
  },
  {
    id: "everyday-essentials",
    name: "Everyday Essentials",
    slug: "everyday-essentials",
    description: "Handcrafted beaded phone charms, keychain straps, trinket dishes, and petite treasures to elevate your daily routine.",
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "phone-charms", name: "Phone Charms & Straps", slug: "phone-charms" },
      { id: "keychains", name: "Keychain & Bag Charms", slug: "keychains" },
      { id: "trinket-dishes", name: "Jewelry Dishes & Trays", slug: "trinket-dishes" },
    ],
  },
  {
    id: "bags-pouches",
    name: "Bags & Pouches",
    slug: "bags-pouches",
    description: "Aesthetic vanity cases, velvet pouches, and petite shoulder bags for your everyday essentials.",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "pouches", name: "Vanity & Makeup Pouches", slug: "pouches" },
      { id: "mini-bags", name: "Mini Shoulder Bags", slug: "mini-bags" },
      { id: "tote-bags", name: "Aesthetic Totes", slug: "tote-bags" },
    ],
  },
  {
    id: "eyewear",
    name: "Sunglasses & Eyewear",
    slug: "eyewear",
    description: "Chic cat-eye, retro oval, and classic aesthetic sunglasses paired with beaded and pearl chains.",
    image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "sunglasses", name: "Aesthetic Sunglasses", slug: "sunglasses" },
      { id: "sunglass-chains", name: "Pearl & Gold Eyewear Chains", slug: "sunglass-chains" },
    ],
  },
  {
    id: "beauty-vanity",
    name: "Beauty & Vanity",
    slug: "beauty-vanity",
    description: "Ornate vintage-inspired compact mirrors and pocket hair brushes for touch-ups on the go.",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "compact-mirrors", name: "Compact Mirrors", slug: "compact-mirrors" },
      { id: "hair-brushes", name: "Pocket Brushes & Combs", slug: "hair-brushes" },
    ],
  },
  {
    id: "gifts",
    name: "Gifts & Hampers",
    slug: "gifts",
    description: "Thoughtfully curated boutique gift boxes with custom handwritten cards and luxury drawer packaging.",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    subcategories: [
      { id: "gift-sets", name: "Gift Sets & Hampers", slug: "gift-sets" },
      { id: "keepsake-boxes", name: "Keepsake Jewelry Boxes", slug: "keepsake-boxes" },
    ],
  },
];

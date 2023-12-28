import React from "react";
import { PageProps } from "./../../../.next/types/app/layout";
import { getProductById } from "@/lib/actions";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

type Props = {
  params: { id: string };
};

const ProductDetails = async ({ params }: Props) => {
  const product = await getProductById(params.id);
  if (!product) redirect("/");

  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        {/* image part */}
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto"
          />
        </div>
        {/* data part */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>
              <Link
                href={product.url}
                target="_blank"
                className="text-base opacity-50"
              >
                Visit Product
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <Image
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  height={20}
                  width={20}
                />
                <p className="text-base font-semibold text-[#d46F77]">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="p-2 bg-white-200 rounded-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

import ProductDetailPage from "@/features/products/ProductDetailPage";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ProductDetailPage productId={params.id} />;
}